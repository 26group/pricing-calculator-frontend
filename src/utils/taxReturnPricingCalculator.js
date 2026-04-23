// Tax Return Pricing Calculator — rebuilt from scratch against
// "Tax return ONLY Pricing Calculator v1.xlsx — Copy of Accounting Price List.csv"
//
// ID convention aligned with the rebuilt questions file:
//   q1                       Individual Tax Returns (count)
//   q2 + q2_{dividends|interest|managedFunds|rentalProperty}   Income Items
//   q3 + q3_{cgtShares|cgtProperty|balancingAdj}               Capital Gains
//   q4 + q4_{noGst|withGst}                                    Business Schedules
//   q5 + q5_{standard|motorLogBook|motorCPK}                   Deductions
//   q6 + q6_frequency        BAS
//   q7 + q7_suppliers        TPAR
//   q8 + q8_count            Workers Compensation
//   q9_salary + q9_salaryCounts{weekly,fortnightly,monthly,quarterly,annual}
//   q9_timesheet + q9_timesheetCounts{...}
//   q10 + q10_frequency      Super Prep & Lodgement
//   q11 + q11_frequency      STP Reporting
//   q12                      LSL Construction
//   q13                      Tax Planning
//   q14                      Tax Structuring (yes/no — once-off)
//   q15                      Annual Tax Meeting (yes/no)
//   q16                      Advice Meeting (yes/no)
//   q17                      ATO Payment Plans (none/basic/hardship — once-off)
//   q18                      Xero Setup (yes/no — once-off)
//   q19                      Xero Training (none/basic/everyday/advanced — once-off)
//   q20                      Xero Support (none/basic/everyday/advanced)
//   q21 + q21_taxServices + q21_payroll   Prior Year Lodgements (yes/no · count per group)
//   q22 + q22_count          Amended Returns (once-off)
//   q23                      Return Not Necessary (yes/no)
//   q24                      Final Return (yes/no)
//
// Pricing model:
//   monthly price (all tiers) = annualAmount / 12 × multiplier
//   once-off = true once-offs (q14, q17, q18, q19, q21, q22) + Upfront=YES
//              recurring services at FULL annual amount × multiplier
//   Upfront=NO items (Support Services, Xero Support q20) are NOT in once-off.

import { serviceValuesTaxReturn } from '../constants/taxReturnServicesValues';

const BASE_PRICING_MODIFIER = 200;

const mult = (pricingModifier) => {
  if (pricingModifier === undefined || pricingModifier === null) return 1;
  return pricingModifier / BASE_PRICING_MODIFIER;
};

const int0 = (x) => Math.max(parseInt(x, 10) || 0, 0);

const FREQ_MAP = { weekly: 52, fortnightly: 26, monthly: 12, quarterly: 4, annual: 1 };

// ─────────────────────────────────────────────────────────────────────────────
// Build a flat list of every billable service the client has selected, with
// its annual amount (BEFORE multiplier and BEFORE tier filtering) and tier /
// once-off / upfront flags. A single source of truth the four exported
// functions filter and aggregate.
//
//   tiers       : array of which monthly tiers this service is included in
//                 ('bronze' | 'silver' | 'gold')
//   onceOff     : true → amount is a pure one-time fee (never monthly)
//   upfrontYes  : true → CSV flags this service Upfront=YES; included in the
//                 once-off total at full annual amount
//   amount      : annual (recurring) or full one-off amount (before multiplier)
//   label       : pretty label for breakdown display
// ─────────────────────────────────────────────────────────────────────────────
const buildLineItems = (responses) => {
  const v = serviceValuesTaxReturn;
  const r = responses || {};
  const items = [];

  const push = (label, amount, { tiers = [], onceOff = false, upfrontYes = true } = {}) => {
    if (!amount || amount <= 0) return;
    items.push({ label, amount, tiers, onceOff, upfrontYes });
  };

  const ALL_TIERS = ['bronze', 'silver', 'gold'];
  const SILVER_GOLD = ['silver', 'gold'];
  const GOLD_ONLY = ['gold'];

  // ── Q1: Individual Returns (Bronze/Silver/Gold) ────────────────────────
  {
    const n = int0(r.q1);
    if (n > 0) {
      push(`Individual Tax Returns (x${n})`, v.individualReturns.annualRate * n, { tiers: ALL_TIERS });
      const wp = r.q1_workpaper;
      if (wp === 'byClient' || wp === 'byFirm') {
        const w = v.individualReturns.workpaper[wp];
        push(`${w.inclusion} (x${n})`, w.annualRate * n, { tiers: ALL_TIERS });
      }
    }
  }

  // ── Q2: Income Items ───────────────────────────────────────────────────
  {
    const d = r.q2;
    if (d && d !== 'none') {
      const entries = [
        ['q2_dividends',      'dividends',      ALL_TIERS],
        ['q2_interest',       'interest',       ALL_TIERS],
        ['q2_managedFunds',   'managedFunds',   ALL_TIERS],
        ['q2_rentalProperty', 'rentalProperty', SILVER_GOLD], // CSV: Bronze=NO for rental
      ];
      entries.forEach(([fieldId, key, tiers]) => {
        const n = int0(r[fieldId]);
        if (n > 0) {
          const svc = v.incomeItems[key]?.[d];
          if (svc) push(`${svc.inclusion} (x${n})`, svc.annualRate * n, { tiers });
        }
      });
    }
  }

  // ── Q3: Capital Gains ──────────────────────────────────────────────────
  {
    const d = r.q3;
    if (d && d !== 'none') {
      const entries = [
        ['q3_cgtShares',     'cgtShares',     ALL_TIERS],     // Bronze=YES
        ['q3_cgtProperty',   'cgtProperty',   SILVER_GOLD],   // Bronze=NO
        ['q3_balancingAdj',  'balancingAdj',  SILVER_GOLD],   // Bronze=NO
      ];
      entries.forEach(([fieldId, key, tiers]) => {
        const n = int0(r[fieldId]);
        if (n > 0) {
          const svc = v.capitalGains[key]?.[d];
          if (svc) push(`${svc.inclusion} (x${n})`, svc.annualRate * n, { tiers });
        }
      });
    }
  }

  // ── Q4: Business Schedules (Silver/Gold) ───────────────────────────────
  {
    const d = r.q4;
    if (d && d !== 'none') {
      const entries = [
        ['q4_noGst',   'noGst'],
        ['q4_withGst', 'withGst'],
      ];
      entries.forEach(([fieldId, key]) => {
        const n = int0(r[fieldId]);
        if (n > 0) {
          const svc = v.businessSchedules[key]?.[d];
          if (svc) push(`${svc.inclusion} (x${n})`, svc.annualRate * n, { tiers: SILVER_GOLD });
        }
      });
    }
  }

  // ── Q5: Deductions (Bronze/Silver/Gold) ────────────────────────────────
  {
    const d = r.q5;
    if (d && d !== 'none') {
      const entries = [
        ['q5_standard',      'moreThan3Standard'],
        ['q5_motorLogBook',  'motorVehicleLogBook'],
        ['q5_motorCPK',      'motorVehicleCPK'],
      ];
      entries.forEach(([fieldId, key]) => {
        const n = int0(r[fieldId]);
        if (n > 0) {
          const svc = v.deductions[key]?.[d];
          if (svc) push(`${svc.inclusion} (x${n})`, svc.annualRate * n, { tiers: ALL_TIERS });
        }
      });
    }
  }

  // ── Q6: BAS (Silver/Gold) ──────────────────────────────────────────────
  {
    const d = r.q6;
    const freq = r.q6_frequency;
    if (d && d !== 'none' && freq) {
      const svc = v.bas?.[d]?.[freq];
      if (svc) {
        const annual = svc.ratePerReturn * svc.frequency;
        push(svc.inclusion, annual, { tiers: SILVER_GOLD });
      }
    }
  }

  // ── Q7: TPAR (Silver/Gold) ─────────────────────────────────────────────
  {
    const d = r.q7;
    if (d && d !== 'none') {
      const n = Math.max(int0(r.q7_suppliers), 1);
      const svc = v.tpar?.[d];
      if (svc) push(n > 1 ? `${svc.inclusion} (x${n})` : svc.inclusion, svc.annualRate * n, { tiers: SILVER_GOLD });
    }
  }

  // ── Q8: Workers Comp (Bronze/Silver/Gold) ──────────────────────────────
  {
    const d = r.q8;
    if (d && d !== 'none') {
      const n = Math.max(int0(r.q8_count), 1);
      const svc = v.workersComp?.[d];
      if (svc) push(n > 1 ? `${svc.inclusion} (x${n})` : svc.inclusion, svc.annualRate * n, { tiers: ALL_TIERS });
    }
  }

  // ── Q9: Payroll Processing — Salary ONLY / Timesheet ONLY (Silver/Gold) ─
  const pushPayroll = (deliveryKey, countsKey, ratesNode) => {
    const d = r[deliveryKey];
    const counts = r[countsKey];
    if (!d || d === 'none' || !counts || typeof counts !== 'object') return;
    const rates = ratesNode?.[d];
    if (!rates) return;
    Object.keys(FREQ_MAP).forEach((freqKey) => {
      if (!rates[freqKey]) return;
      const n = int0(counts[freqKey]);
      if (n === 0) return;
      const annual = rates[freqKey].ratePerEmployee * n * rates[freqKey].frequency;
      push(`${rates[freqKey].inclusion} (x${n})`, annual, { tiers: SILVER_GOLD });
    });
  };
  pushPayroll('q9_salary',    'q9_salaryCounts',    v.payrollSalary);
  pushPayroll('q9_timesheet', 'q9_timesheetCounts', v.payrollTimesheet);

  // ── Q10: Super Prep & Lodgement (Silver/Gold) ──────────────────────────
  {
    const d = r.q10;
    const freq = r.q10_frequency;
    if (d && d !== 'none' && freq) {
      const svc = v.superPrepLodgement?.[d]?.[freq];
      if (svc) push(svc.inclusion, svc.annualRate * svc.frequency, { tiers: SILVER_GOLD });
    }
  }

  // ── Q11: STP Reporting (Silver/Gold) ───────────────────────────────────
  {
    const d = r.q11;
    const freq = r.q11_frequency;
    if (d && d !== 'none' && freq) {
      const svc = v.stpReporting?.[d]?.[freq];
      if (svc) push(svc.inclusion, svc.annualRate, { tiers: SILVER_GOLD });
    }
  }

  // ── Q12: LSL Construction (Silver/Gold) ────────────────────────────────
  {
    const d = r.q12;
    if (d && d !== 'none') {
      const svc = v.lslConstruction?.[d];
      if (svc) push(svc.inclusion, svc.annualRate, { tiers: SILVER_GOLD });
    }
  }

  // ── Q13: Tax Planning (Silver/Gold) ────────────────────────────────────
  {
    const d = r.q13;
    if (d && d !== 'none') {
      const svc = v.taxPlanning?.[d];
      if (svc) push(svc.inclusion, svc.annualRate, { tiers: SILVER_GOLD });
    }
  }

  // ── Q14: Tax Structuring (true once-off) ───────────────────────────────
  if (r.q14 === 'yes') {
    push(v.taxStructuring.inclusion, v.taxStructuring.onceOff, { tiers: [], onceOff: true });
  }

  // ── Q15: Annual Tax Meeting (Bronze/Silver/Gold) ───────────────────────
  if (r.q15 === 'yes') {
    push(v.annualTaxMeeting.inclusion, v.annualTaxMeeting.annualRate, { tiers: ALL_TIERS });
  }

  // ── Q16: Advice Meeting (Silver/Gold) ──────────────────────────────────
  if (r.q16 === 'yes') {
    push(v.adviceMeeting.inclusion, v.adviceMeeting.annualRate, { tiers: SILVER_GOLD });
  }

  // ── Q17: ATO Payment Plans (true once-off) ─────────────────────────────
  if (r.q17 && r.q17 !== 'none') {
    const svc = v.atoPaymentPlans?.[r.q17];
    if (svc) push(svc.inclusion, svc.onceOff, { tiers: [], onceOff: true });
  }

  // ── Q18: Xero Setup (true once-off) ────────────────────────────────────
  if (r.q18 === 'yes') {
    push(v.xeroSetup.inclusion, v.xeroSetup.onceOff, { tiers: [], onceOff: true });
  }

  // ── Q19: Xero Training (true once-off) ─────────────────────────────────
  if (r.q19 && r.q19 !== 'none') {
    const svc = v.xeroTraining?.[r.q19];
    if (svc) push(svc.inclusion, svc.onceOff, { tiers: [], onceOff: true });
  }

  // ── Q20: Xero Support (Silver gets basic/everyday, Gold gets all) ──────
  //         Upfront = NO per CSV — NOT added to once-off
  if (r.q20 && r.q20 !== 'none') {
    const svc = v.xeroSupport?.[r.q20];
    if (svc) {
      const tiers = r.q20 === 'advanced' ? GOLD_ONLY : SILVER_GOLD;
      push(svc.inclusion, svc.annualRate, { tiers, upfrontYes: false });
    }
  }

  // ── Q21: Prior Year Lodgements (true once-off · $200/return) ────────────
  if (r.q21 === 'yes') {
    const rate = v.priorYearLodgements.ratePerReturn;
    const taxN = int0(r.q21_taxServices);
    const payN = int0(r.q21_payroll);
    if (taxN > 0) push(`Prior Year Lodgements — Tax Services (x${taxN})`, rate * taxN, { tiers: [], onceOff: true });
    if (payN > 0) push(`Prior Year Lodgements — Payroll Services (x${payN})`, rate * payN, { tiers: [], onceOff: true });
  }

  // ── Q22: Amended Returns (true once-off) ───────────────────────────────
  if (r.q22 && r.q22 !== 'none') {
    const svc = v.amendedReturns?.[r.q22];
    const n = Math.max(int0(r.q22_count), 1);
    if (svc) push(n > 1 ? `${svc.inclusion} (x${n})` : svc.inclusion, svc.onceOff * n, { tiers: [], onceOff: true });
  }

  // ── Q23: Return Not Necessary (CSV: Bronze/Silver/Gold = NO, Upfront=YES) ─
  //   Not in any monthly tier — included in once-off only.
  if (r.q23 === 'yes') {
    const n = Math.max(int0(r.q1), 1);
    push(`${v.returnNotNecessary.inclusion} (x${n})`, v.returnNotNecessary.ratePerClient * n, { tiers: [] });
  }

  // ── Q24: Final Return (CSV: Bronze/Silver/Gold = NO, Upfront=YES) ──────
  //   Not in any monthly tier — included in once-off only.
  if (r.q24 === 'yes') {
    const n = Math.max(int0(r.q1), 1);
    push(`${v.finalReturn.inclusion} (x${n})`, v.finalReturn.ratePerClient * n, { tiers: [] });
  }

  return items;
};

// ─────────────────────────────────────────────────────────────────────────────
// Monthly tier totals
// ─────────────────────────────────────────────────────────────────────────────
const tierMonthly = (responses, tier, pricingModifier) => {
  const m = mult(pricingModifier);
  const items = buildLineItems(responses);
  let total = 0;
  items.forEach((it) => {
    if (it.onceOff) return;
    if (!it.tiers.includes(tier)) return;
    total += (it.amount / 12) * m;
  });
  // Support Services (hard-coded by tier — Upfront=NO, monthly-only)
  const v = serviceValuesTaxReturn;
  const support = tier === 'bronze'
    ? v.supportServices.team.monthly
    : tier === 'silver'
      ? v.supportServices.csm.monthly
      : v.supportServices.owner.monthly;
  total += support * m;
  return total;
};

export const calculateTaxReturnBronzePrice = (responses, pricingModifier = 200) =>
  tierMonthly(responses, 'bronze', pricingModifier);

export const calculateTaxReturnSilverPrice = (responses, pricingModifier = 200) =>
  tierMonthly(responses, 'silver', pricingModifier);

export const calculateTaxReturnGoldPrice = (responses, pricingModifier = 200) =>
  tierMonthly(responses, 'gold',   pricingModifier);

// ─────────────────────────────────────────────────────────────────────────────
// Once-off total = every true one-off service (full amount) + every
// Upfront=YES recurring service at FULL annual amount.
// ─────────────────────────────────────────────────────────────────────────────
export const calculateTaxReturnOnceOffFee = (responses, pricingModifier = 200) => {
  const m = mult(pricingModifier);
  const items = buildLineItems(responses);
  let total = 0;
  items.forEach((it) => {
    if (it.onceOff) {
      total += it.amount * m;
    } else if (it.upfrontYes) {
      total += it.amount * m;
    }
  });
  return total;
};

// Breakdown for UI display — split into "true once-offs" and "upfront annual"
export const getTaxReturnOnceOffBreakdown = (responses, pricingModifier = 200) => {
  const m = mult(pricingModifier);
  return buildLineItems(responses)
    .filter((it) => it.onceOff)
    .map((it) => ({ label: it.label, amount: it.amount * m }));
};

export const calculateTaxReturnUpfrontAnnualFee = (responses, pricingModifier = 200) => {
  const m = mult(pricingModifier);
  return buildLineItems(responses)
    .filter((it) => !it.onceOff && it.upfrontYes)
    .reduce((sum, it) => sum + it.amount * m, 0);
};

export const getTaxReturnUpfrontAnnualBreakdown = (responses, pricingModifier = 200) => {
  const m = mult(pricingModifier);
  return buildLineItems(responses)
    .filter((it) => !it.onceOff && it.upfrontYes)
    .map((it) => ({ label: it.label, amount: it.amount * m }));
};
