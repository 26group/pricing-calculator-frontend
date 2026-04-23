import { serviceValuesTaxReturn } from '../constants/taxReturnServicesValues';

// Base pricing modifier value (same as accounting — $200/hr AHR)
const BASE_PRICING_MODIFIER = 200;

const getPricingMultiplier = (pricingModifier) => {
  if (pricingModifier === undefined || pricingModifier === null) return 1;
  return pricingModifier / BASE_PRICING_MODIFIER;
};

// ─── Helper: add annual service / 12 ────────────────────────────────────────
const addAnnual = (total, annualRate, multiplier) =>
  total + (annualRate / 12) * multiplier;

// ─── Helper: add BAS (rate × freq / 12) ─────────────────────────────────────
const addBas = (total, ratePerReturn, frequency, multiplier) =>
  total + (ratePerReturn * frequency / 12) * multiplier;

// ─── Helper: add payroll (rate × employees × freq / 12) ──────────────────────
const addPayroll = (total, ratePerEmployee, count, frequency, multiplier) =>
  total + (ratePerEmployee * count * frequency / 12) * multiplier;

// ─── Helper: add super (annualRate × freq / 12) ───────────────────────────────
const addSuper = (total, annualRate, frequency, multiplier) =>
  total + (annualRate * frequency / 12) * multiplier;

// ─────────────────────────────────────────────────────────────────────────────
// BRONZE
// Includes: individual returns, income items (excl. rental property),
//   CGT shares (NO property/balancing), deductions, workers comp,
//   annual tax meeting, team support
// Excludes: rental property, CGT property/balancing, business schedules,
//   BAS, TPAR, payroll, super, STP, LSL, tax planning, advice meeting,
//   xero, ATO plans, xero support
// ─────────────────────────────────────────────────────────────────────────────
export const calculateTaxReturnBronzePrice = (responses, pricingModifier = 200) => {
  let total = 0;
  const v = serviceValuesTaxReturn;
  const m = getPricingMultiplier(pricingModifier);

  // Q1: Individual Returns
  const returnCount = parseInt(responses.q1, 10) || 0;
  if (returnCount > 0) {
    total = addAnnual(total, v.individualReturns.annualRate * returnCount, m);
  }

  // Q2: Income Items — delivery method on q2, counts on q2a/q2b/q2c (Bronze=YES, rental=NO)
  const delivery2 = responses.q2;
  if (delivery2 && delivery2 !== 'none') {
    [['q2a', 'dividends'], ['q2b', 'interest'], ['q2c', 'managedFunds']].forEach(([countId, key]) => {
      const count = Math.max(parseInt(responses[countId], 10) || 0, 0);
      if (count > 0) {
        const svc = v.incomeItems[key][delivery2];
        if (svc) total = addAnnual(total, svc.annualRate * count, m);
      }
    });
  }

  // Q2d: Rental Property — Bronze = NO

  // Q6: CGT Shares (Bronze=YES)
  if (responses.q6 && responses.q6 !== 'none') {
    const svc = v.capitalGains.cgtShares[responses.q6];
    const count = Math.max(parseInt(responses.q6_count, 10) || 1, 1);
    if (svc) total = addAnnual(total, svc.annualRate * count, m);
  }

  // Q7–Q8: CGT Property, Balancing Adj — Bronze = NO

  // Q9–Q10: Business Schedules — Bronze = NO

  // Q11–Q13: Deductions (Bronze=YES) (q11 is parent with delivery, q11_count/q12_count/q13_count are children)
  const bronzeDeductionDelivery = responses.q11;
  if (bronzeDeductionDelivery && bronzeDeductionDelivery !== 'none') {
    // Q11_count: Deductions — more than 3 standard expenses
    const deductCount = Math.max(parseInt(responses.q11_count, 10) || 0, 0);
    if (deductCount > 0) {
      const svc = v.deductions.moreThan3Standard[bronzeDeductionDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * deductCount, m);
    }
    // Q12_count: Motor Vehicle — log book method
    const logBookCount = Math.max(parseInt(responses.q12_count, 10) || 0, 0);
    if (logBookCount > 0) {
      const svc = v.deductions.motorVehicleLogBook[bronzeDeductionDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * logBookCount, m);
    }
    // Q13_count: Motor Vehicle — Cents per kilometre method
    const cpkCount = Math.max(parseInt(responses.q13_count, 10) || 0, 0);
    if (cpkCount > 0) {
      const svc = v.deductions.motorVehicleCPK[bronzeDeductionDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * cpkCount, m);
    }
  }

  // Q14: BAS — Bronze = NO
  // Q15: TPAR — Bronze = NO

  // Q16: Workers Comp (Bronze=YES)
  if (responses.q16 && responses.q16 !== 'none') {
    const svc = v.workersComp[responses.q16];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q17–Q21: Payroll, Super, STP, LSL — Bronze = NO

  // Q22: Tax Planning — Bronze = NO
  // Q23: Tax Structuring — once-off only

  // Q24: Annual Tax Meeting (Bronze=YES)
  if (responses.q24 === 'yes') {
    total = addAnnual(total, v.annualTaxMeeting.annualRate, m);
  }

  // Q25: Advice Meeting — Bronze = NO

  // Support: Bronze = Team ($20/mo)
  total += v.supportServices.team.monthly * m;

  // Q28: Xero Support — Bronze = NO

  return total;
};

// ─────────────────────────────────────────────────────────────────────────────
// SILVER — all applicable items; support = CSM
// ─────────────────────────────────────────────────────────────────────────────
export const calculateTaxReturnSilverPrice = (responses, pricingModifier = 200) => {
  let total = 0;
  const v = serviceValuesTaxReturn;
  const m = getPricingMultiplier(pricingModifier);

  // Q1: Individual Returns
  const returnCount = parseInt(responses.q1, 10) || 0;
  if (returnCount > 0) {
    total = addAnnual(total, v.individualReturns.annualRate * returnCount, m);
  }

  // Q2a–Q2d: Income Items — delivery method on q2, counts on q2a/q2b/q2c/q2d
  const delivery2 = responses.q2;
  if (delivery2 && delivery2 !== 'none') {
    [['q2a', 'dividends'], ['q2b', 'interest'], ['q2c', 'managedFunds'], ['q2d', 'rentalProperty']].forEach(([countId, key]) => {
      const count = Math.max(parseInt(responses[countId], 10) || 0, 0);
      if (count > 0) {
        const svc = v.incomeItems[key][delivery2];
        if (svc) total = addAnnual(total, svc.annualRate * count, m);
      }
    });
  }

  // Q6–Q8: Capital Gains (q6 is parent with delivery, q6_count/q7_count/q8_count are children)
  const cgtDelivery = responses.q6;
  if (cgtDelivery && cgtDelivery !== 'none') {
    // Q6_count: CGT — Shares and equities
    const sharesCount = Math.max(parseInt(responses.q6_count, 10) || 0, 0);
    if (sharesCount > 0) {
      const svc = v.capitalGains.cgtShares[cgtDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * sharesCount, m);
    }
    // Q7_count: CGT — Property sales
    const propertyCount = Math.max(parseInt(responses.q7_count, 10) || 0, 0);
    if (propertyCount > 0) {
      const svc = v.capitalGains.cgtProperty[cgtDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * propertyCount, m);
    }
    // Q8_count: Balancing adjustment — sale of business asset
    const balancingCount = Math.max(parseInt(responses.q8_count, 10) || 0, 0);
    if (balancingCount > 0) {
      const svc = v.capitalGains.balancingAdj[cgtDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * balancingCount, m);
    }
  }

  // Q9–Q10: Business Schedules (q9 is parent with delivery, q9_count and q10_count are children)
  const businessDelivery = responses.q9;
  if (businessDelivery && businessDelivery !== 'none') {
    // Q9_count: Business Schedule — no GST
    const noGstCount = Math.max(parseInt(responses.q9_count, 10) || 0, 0);
    if (noGstCount > 0) {
      const svc = v.businessSchedules.noGst[businessDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * noGstCount, m);
    }
    // Q10_count: Business Schedule — with GST
    const withGstCount = Math.max(parseInt(responses.q10_count, 10) || 0, 0);
    if (withGstCount > 0) {
      const svc = v.businessSchedules.withGst[businessDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * withGstCount, m);
    }
  }

  // Q11–Q13: Deductions (q11 is parent with delivery, q11_count/q12_count/q13_count are children)
  const deductionDelivery = responses.q11;
  if (deductionDelivery && deductionDelivery !== 'none') {
    // Q11_count: Deductions — more than 3 standard expenses
    const deductCount = Math.max(parseInt(responses.q11_count, 10) || 0, 0);
    if (deductCount > 0) {
      const svc = v.deductions.moreThan3Standard[deductionDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * deductCount, m);
    }
    // Q12_count: Motor Vehicle — log book method
    const logBookCount = Math.max(parseInt(responses.q12_count, 10) || 0, 0);
    if (logBookCount > 0) {
      const svc = v.deductions.motorVehicleLogBook[deductionDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * logBookCount, m);
    }
    // Q13_count: Motor Vehicle — Cents per kilometre method
    const cpkCount = Math.max(parseInt(responses.q13_count, 10) || 0, 0);
    if (cpkCount > 0) {
      const svc = v.deductions.motorVehicleCPK[deductionDelivery];
      if (svc) total = addAnnual(total, svc.annualRate * cpkCount, m);
    }
  }

  // Q14: BAS
  if (responses.q14 && responses.q14 !== 'none') {
    const freq = responses.q14a || 'quarterly';
    const frequency = freq === 'quarterly' ? 4 : 1;
    const svc = v.bas[responses.q14][freq];
    if (svc) total = addBas(total, svc.ratePerReturn, frequency, m);
  }

  // Q15: TPAR
  if (responses.q15 && responses.q15 !== 'none') {
    const svc = v.tpar[responses.q15];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q16: Workers Comp
  if (responses.q16 && responses.q16 !== 'none') {
    const svc = v.workersComp[responses.q16];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q17: Payroll Salary
  const salaryDeliverySilver = responses.q17;
  if (salaryDeliverySilver && responses.q17delivery && typeof responses.q17delivery === 'object') {
    const { weekly = '', fortnightly = '', monthly = '', annual = '' } = responses.q17delivery;
    const salaryValues = v.payrollSalary[salaryDeliverySilver];
    if (salaryValues) {
      const wc = parseInt(weekly, 10) || 0;
      if (wc > 0) total = addPayroll(total, salaryValues.weekly.ratePerEmployee, wc, salaryValues.weekly.frequency, m);
      const fc = parseInt(fortnightly, 10) || 0;
      if (fc > 0) total = addPayroll(total, salaryValues.fortnightly.ratePerEmployee, fc, salaryValues.fortnightly.frequency, m);
      const mc = parseInt(monthly, 10) || 0;
      if (mc > 0) total = addPayroll(total, salaryValues.monthly.ratePerEmployee, mc, salaryValues.monthly.frequency, m);
      const ac = parseInt(annual, 10) || 0;
      if (ac > 0) total = addPayroll(total, salaryValues.annual.ratePerEmployee, ac, salaryValues.annual.frequency, m);
    }
  }

  // Q18: Payroll Timesheet
  const timesheetDeliverySilver = responses.q18delivery;
  if (timesheetDeliverySilver && responses.q18 && typeof responses.q18 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q18;
    const tsValues = v.payrollTimesheet[timesheetDeliverySilver];
    if (tsValues) {
      const wc = parseInt(weekly, 10) || 0;
      if (wc > 0) total = addPayroll(total, tsValues.weekly.ratePerEmployee, wc, tsValues.weekly.frequency, m);
      const fc = parseInt(fortnightly, 10) || 0;
      if (fc > 0) total = addPayroll(total, tsValues.fortnightly.ratePerEmployee, fc, tsValues.fortnightly.frequency, m);
      const mc = parseInt(monthly, 10) || 0;
      if (mc > 0) total = addPayroll(total, tsValues.monthly.ratePerEmployee, mc, tsValues.monthly.frequency, m);
    }
  }

  // Q19: Super Prep & Lodgement
  if (responses.q19 && responses.q19 !== 'none' && responses.q19delivery) {
    const freqMap = { weekly: 52, fortnightly: 26, monthly: 12, quarterly: 4, annual: 1 };
    const freq = freqMap[responses.q19] || 1;
    const svc = v.superPrepLodgement[responses.q19delivery];
    if (svc && svc[responses.q19]) {
      total = addSuper(total, svc[responses.q19].annualRate, freq, m);
    }
  }

  // Q20: STP Reporting
  if (responses.q20 && responses.q20 !== 'none') {
    const svc = v.stpReporting[responses.q20];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q21: LSL Construction
  if (responses.q21 && responses.q21 !== 'none') {
    const svc = v.lslConstruction[responses.q21];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q22: Tax Planning
  if (responses.q22 && responses.q22 !== 'none') {
    const svc = v.taxPlanning[responses.q22];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q23: Tax Structuring — once-off only, not in monthly

  // Q24: Annual Tax Meeting
  if (responses.q24 === 'yes') {
    total = addAnnual(total, v.annualTaxMeeting.annualRate, m);
  }

  // Q25: Advice Meeting
  if (responses.q25 === 'yes') {
    total = addAnnual(total, v.adviceMeeting.annualRate, m);
  }

  // Support: Silver = CSM ($40/mo)
  total += v.supportServices.csm.monthly * m;

  // Q28: Xero Support (Silver = basic/everyday)
  if (responses.q28 && responses.q28 !== 'none' && responses.q28 !== 'advanced') {
    const svc = v.xeroSupport[responses.q28];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  return total;
};

// ─────────────────────────────────────────────────────────────────────────────
// GOLD — all items including advanced xero support; support = Owner
// ─────────────────────────────────────────────────────────────────────────────
export const calculateTaxReturnGoldPrice = (responses, pricingModifier = 200) => {
  let total = 0;
  const v = serviceValuesTaxReturn;
  const m = getPricingMultiplier(pricingModifier);

  // Q1: Individual Returns
  const returnCount = parseInt(responses.q1, 10) || 0;
  if (returnCount > 0) {
    total = addAnnual(total, v.individualReturns.annualRate * returnCount, m);
  }

  // Q2a–Q2d: Income Items — delivery method on q2, counts on q2a/q2b/q2c/q2d
  const delivery2Gold = responses.q2;
  if (delivery2Gold && delivery2Gold !== 'none') {
    [['q2a', 'dividends'], ['q2b', 'interest'], ['q2c', 'managedFunds'], ['q2d', 'rentalProperty']].forEach(([countId, key]) => {
      const count = Math.max(parseInt(responses[countId], 10) || 0, 0);
      if (count > 0) {
        const svc = v.incomeItems[key][delivery2Gold];
        if (svc) total = addAnnual(total, svc.annualRate * count, m);
      }
    });
  }

  // Q6–Q8: Capital Gains (q6 is parent with delivery, q6_count/q7_count/q8_count are children)
  const cgtDeliveryGold = responses.q6;
  if (cgtDeliveryGold && cgtDeliveryGold !== 'none') {
    // Q6_count: CGT — Shares and equities
    const sharesCountGold = Math.max(parseInt(responses.q6_count, 10) || 0, 0);
    if (sharesCountGold > 0) {
      const svc = v.capitalGains.cgtShares[cgtDeliveryGold];
      if (svc) total = addAnnual(total, svc.annualRate * sharesCountGold, m);
    }
    // Q7_count: CGT — Property sales
    const propertyCountGold = Math.max(parseInt(responses.q7_count, 10) || 0, 0);
    if (propertyCountGold > 0) {
      const svc = v.capitalGains.cgtProperty[cgtDeliveryGold];
      if (svc) total = addAnnual(total, svc.annualRate * propertyCountGold, m);
    }
    // Q8_count: Balancing adjustment — sale of business asset
    const balancingCountGold = Math.max(parseInt(responses.q8_count, 10) || 0, 0);
    if (balancingCountGold > 0) {
      const svc = v.capitalGains.balancingAdj[cgtDeliveryGold];
      if (svc) total = addAnnual(total, svc.annualRate * balancingCountGold, m);
    }
  }

  // Q9–Q10: Business Schedules (q9 is parent with delivery, q9_count and q10_count are children)
  const businessDeliveryGold = responses.q9;
  if (businessDeliveryGold && businessDeliveryGold !== 'none') {
    // Q9_count: Business Schedule — no GST
    const noGstCountGold = Math.max(parseInt(responses.q9_count, 10) || 0, 0);
    if (noGstCountGold > 0) {
      const svc = v.businessSchedules.noGst[businessDeliveryGold];
      if (svc) total = addAnnual(total, svc.annualRate * noGstCountGold, m);
    }
    // Q10_count: Business Schedule — with GST
    const withGstCountGold = Math.max(parseInt(responses.q10_count, 10) || 0, 0);
    if (withGstCountGold > 0) {
      const svc = v.businessSchedules.withGst[businessDeliveryGold];
      if (svc) total = addAnnual(total, svc.annualRate * withGstCountGold, m);
    }
  }

  // Q11–Q13: Deductions (q11 is parent with delivery, q11_count/q12_count/q13_count are children)
  const deductionDeliveryGold = responses.q11;
  if (deductionDeliveryGold && deductionDeliveryGold !== 'none') {
    // Q11_count: Deductions — more than 3 standard expenses
    const deductCountGold = Math.max(parseInt(responses.q11_count, 10) || 0, 0);
    if (deductCountGold > 0) {
      const svc = v.deductions.moreThan3Standard[deductionDeliveryGold];
      if (svc) total = addAnnual(total, svc.annualRate * deductCountGold, m);
    }
    // Q12_count: Motor Vehicle — log book method
    const logBookCountGold = Math.max(parseInt(responses.q12_count, 10) || 0, 0);
    if (logBookCountGold > 0) {
      const svc = v.deductions.motorVehicleLogBook[deductionDeliveryGold];
      if (svc) total = addAnnual(total, svc.annualRate * logBookCountGold, m);
    }
    // Q13_count: Motor Vehicle — Cents per kilometre method
    const cpkCountGold = Math.max(parseInt(responses.q13_count, 10) || 0, 0);
    if (cpkCountGold > 0) {
      const svc = v.deductions.motorVehicleCPK[deductionDeliveryGold];
      if (svc) total = addAnnual(total, svc.annualRate * cpkCountGold, m);
    }
  }

  // Q14: BAS
  if (responses.q14 && responses.q14 !== 'none') {
    const freq = responses.q14a || 'quarterly';
    const frequency = freq === 'quarterly' ? 4 : 1;
    const svc = v.bas[responses.q14][freq];
    if (svc) total = addBas(total, svc.ratePerReturn, frequency, m);
  }

  // Q15: TPAR
  if (responses.q15 && responses.q15 !== 'none') {
    const svc = v.tpar[responses.q15];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q16: Workers Comp
  if (responses.q16 && responses.q16 !== 'none') {
    const svc = v.workersComp[responses.q16];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q17: Payroll Salary
  const salaryDelivery = responses.q17;
  if (salaryDelivery && responses.q17delivery && typeof responses.q17delivery === 'object') {
    const { weekly = '', fortnightly = '', monthly = '', annual = '' } = responses.q17delivery;
    const salaryValues = v.payrollSalary[salaryDelivery];
    if (salaryValues) {
      const wc = parseInt(weekly, 10) || 0;
      if (wc > 0) total = addPayroll(total, salaryValues.weekly.ratePerEmployee, wc, salaryValues.weekly.frequency, m);
      const fc = parseInt(fortnightly, 10) || 0;
      if (fc > 0) total = addPayroll(total, salaryValues.fortnightly.ratePerEmployee, fc, salaryValues.fortnightly.frequency, m);
      const mc = parseInt(monthly, 10) || 0;
      if (mc > 0) total = addPayroll(total, salaryValues.monthly.ratePerEmployee, mc, salaryValues.monthly.frequency, m);
      const ac = parseInt(annual, 10) || 0;
      if (ac > 0) total = addPayroll(total, salaryValues.annual.ratePerEmployee, ac, salaryValues.annual.frequency, m);
    }
  }

  // Q18: Payroll Timesheet
  const timesheetDelivery = responses.q18delivery;
  if (timesheetDelivery && responses.q18 && typeof responses.q18 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q18;
    const tsValues = v.payrollTimesheet[timesheetDelivery];
    if (tsValues) {
      const wc = parseInt(weekly, 10) || 0;
      if (wc > 0) total = addPayroll(total, tsValues.weekly.ratePerEmployee, wc, tsValues.weekly.frequency, m);
      const fc = parseInt(fortnightly, 10) || 0;
      if (fc > 0) total = addPayroll(total, tsValues.fortnightly.ratePerEmployee, fc, tsValues.fortnightly.frequency, m);
      const mc = parseInt(monthly, 10) || 0;
      if (mc > 0) total = addPayroll(total, tsValues.monthly.ratePerEmployee, mc, tsValues.monthly.frequency, m);
    }
  }

  // Q19: Super Prep & Lodgement
  if (responses.q19 && responses.q19 !== 'none' && responses.q19delivery) {
    const freqMap = { weekly: 52, fortnightly: 26, monthly: 12, quarterly: 4, annual: 1 };
    const freq = freqMap[responses.q19] || 1;
    const svc = v.superPrepLodgement[responses.q19delivery];
    if (svc && svc[responses.q19]) {
      total = addSuper(total, svc[responses.q19].annualRate, freq, m);
    }
  }

  // Q20: STP Reporting
  if (responses.q20 && responses.q20 !== 'none') {
    const svc = v.stpReporting[responses.q20];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q21: LSL Construction
  if (responses.q21 && responses.q21 !== 'none') {
    const svc = v.lslConstruction[responses.q21];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q22: Tax Planning
  if (responses.q22 && responses.q22 !== 'none') {
    const svc = v.taxPlanning[responses.q22];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  // Q24: Annual Tax Meeting
  if (responses.q24 === 'yes') {
    total = addAnnual(total, v.annualTaxMeeting.annualRate, m);
  }

  // Q25: Advice Meeting
  if (responses.q25 === 'yes') {
    total = addAnnual(total, v.adviceMeeting.annualRate, m);
  }

  // Support: Gold = Owner ($60/mo)
  total += v.supportServices.owner.monthly * m;

  // Q28: Xero Support (Gold = all levels including advanced)
  if (responses.q28 && responses.q28 !== 'none') {
    const svc = v.xeroSupport[responses.q28];
    if (svc) total = addAnnual(total, svc.annualRate, m);
  }

  return total;
};

// ─────────────────────────────────────────────────────────────────────────────
// ONCE-OFF FEE
// Includes: Tax Structuring, ATO Payment Plans, Xero Setup, Xero Training,
//   Prior Year Lodgements, Amendments, Return Not Necessary, Final Return
// ─────────────────────────────────────────────────────────────────────────────
export const calculateTaxReturnOnceOffFee = (responses, pricingModifier = 200) => {
  let total = 0;
  const v = serviceValuesTaxReturn;
  const m = getPricingMultiplier(pricingModifier);

  // Q23: Tax Structuring Advice
  if (responses.q23 === 'yes') {
    total += v.taxStructuring.onceOff * m;
  }

  // Q26: Xero Setup
  if (responses.q26 === 'yes') {
    total += v.xeroSetup.onceOff * m;
  }

  // Q27: Xero Training
  if (responses.q27 && responses.q27 !== 'none') {
    const svc = v.xeroTraining[responses.q27];
    if (svc) total += svc.onceOff * m;
  }

  // Q29: ATO Payment Plans
  if (responses.q29 && responses.q29 !== 'none') {
    const svc = v.atoPaymentPlans[responses.q29];
    if (svc) total += svc.onceOff * m;
  }

  // Q30: Prior Year Lodgements
  const priorYearCount = parseInt(responses.q30, 10) || 0;
  if (priorYearCount > 0) {
    total += v.priorYearLodgements.ratePerReturn * priorYearCount * m;
  }

  // Q31: Amended Returns
  if (responses.q31 && responses.q31 !== 'none') {
    const svc = v.amendedReturns[responses.q31];
    if (svc) total += svc.onceOff * m;
  }

  return total;
};

// ─────────────────────────────────────────────────────────────────────────────
// ONCE-OFF BREAKDOWN (array of { label, amount } for display)
// ─────────────────────────────────────────────────────────────────────────────
export const getTaxReturnOnceOffBreakdown = (responses, pricingModifier = 200) => {
  const v = serviceValuesTaxReturn;
  const m = getPricingMultiplier(pricingModifier);
  const items = [];

  if (responses.q23 === 'yes') {
    items.push({ label: v.taxStructuring.inclusion, amount: v.taxStructuring.onceOff * m });
  }
  if (responses.q26 === 'yes') {
    items.push({ label: v.xeroSetup.inclusion, amount: v.xeroSetup.onceOff * m });
  }
  if (responses.q27 && responses.q27 !== 'none') {
    const svc = v.xeroTraining[responses.q27];
    if (svc) items.push({ label: svc.inclusion, amount: svc.onceOff * m });
  }
  if (responses.q29 && responses.q29 !== 'none') {
    const svc = v.atoPaymentPlans[responses.q29];
    if (svc) items.push({ label: svc.inclusion, amount: svc.onceOff * m });
  }
  const priorYearCount = parseInt(responses.q30, 10) || 0;
  if (priorYearCount > 0) {
    items.push({
      label: `${v.priorYearLodgements.inclusion}`,
      amount: v.priorYearLodgements.ratePerReturn * priorYearCount * m,
    });
  }
  if (responses.q31 && responses.q31 !== 'none') {
    const svc = v.amendedReturns[responses.q31];
    if (svc) items.push({ label: svc.inclusion, amount: svc.onceOff * m });
  }

  return items;
};
// ─────────────────────────────────────────────────────────────────────────────
// UPFRONT ANNUAL PAYMENT (for services marked "Upfront = YES" in CSV)
// Customer can choose to pay the full annual amount upfront instead of monthly
// This includes all recurring services except Support Services (Upfront = NO)
// ─────────────────────────────────────────────────────────────────────────────
export const calculateTaxReturnUpfrontAnnualFee = (responses, pricingModifier = 200) => {
  let total = 0;
  const v = serviceValuesTaxReturn;
  const m = getPricingMultiplier(pricingModifier);

  // Q1: Individual Returns (Upfront = YES)
  const returnCount = parseInt(responses.q1, 10) || 0;
  if (returnCount > 0) {
    total += v.individualReturns.annualRate * returnCount * m;
  }

  // Q2: Income Items (Upfront = YES for all)
  const delivery2 = responses.q2;
  if (delivery2 && delivery2 !== 'none') {
    [['q2a', 'dividends'], ['q2b', 'interest'], ['q2c', 'managedFunds'], ['q2d', 'rentalProperty']].forEach(([countId, key]) => {
      const count = Math.max(parseInt(responses[countId], 10) || 0, 0);
      if (count > 0) {
        const svc = v.incomeItems[key][delivery2];
        if (svc) total += svc.annualRate * count * m;
      }
    });
  }

  // Q6-Q8: Capital Gains (Upfront = YES for all) (q6 is parent with delivery, q6_count/q7_count/q8_count are children)
  const cgtDeliveryUpfront = responses.q6;
  if (cgtDeliveryUpfront && cgtDeliveryUpfront !== 'none') {
    // Q6_count: CGT — Shares and equities
    const sharesCountUpfront = Math.max(parseInt(responses.q6_count, 10) || 0, 0);
    if (sharesCountUpfront > 0) {
      const svc = v.capitalGains.cgtShares[cgtDeliveryUpfront];
      if (svc) total += svc.annualRate * sharesCountUpfront * m;
    }
    // Q7_count: CGT — Property sales
    const propertyCountUpfront = Math.max(parseInt(responses.q7_count, 10) || 0, 0);
    if (propertyCountUpfront > 0) {
      const svc = v.capitalGains.cgtProperty[cgtDeliveryUpfront];
      if (svc) total += svc.annualRate * propertyCountUpfront * m;
    }
    // Q8_count: Balancing adjustment — sale of business asset
    const balancingCountUpfront = Math.max(parseInt(responses.q8_count, 10) || 0, 0);
    if (balancingCountUpfront > 0) {
      const svc = v.capitalGains.balancingAdj[cgtDeliveryUpfront];
      if (svc) total += svc.annualRate * balancingCountUpfront * m;
    }
  }

  // Q9-Q10: Business Schedules (Upfront = YES) (q9 is parent with delivery, q9_count and q10_count are children)
  const businessDeliveryUpfront = responses.q9;
  if (businessDeliveryUpfront && businessDeliveryUpfront !== 'none') {
    // Q9_count: Business Schedule — no GST
    const noGstCountUpfront = Math.max(parseInt(responses.q9_count, 10) || 0, 0);
    if (noGstCountUpfront > 0) {
      const svc = v.businessSchedules.noGst[businessDeliveryUpfront];
      if (svc) total += svc.annualRate * noGstCountUpfront * m;
    }
    // Q10_count: Business Schedule — with GST
    const withGstCountUpfront = Math.max(parseInt(responses.q10_count, 10) || 0, 0);
    if (withGstCountUpfront > 0) {
      const svc = v.businessSchedules.withGst[businessDeliveryUpfront];
      if (svc) total += svc.annualRate * withGstCountUpfront * m;
    }
  }

  // Q11-Q13: Deductions (Upfront = YES) (q11 is parent with delivery, q11_count/q12_count/q13_count are children)
  const deductionDeliveryUpfront = responses.q11;
  if (deductionDeliveryUpfront && deductionDeliveryUpfront !== 'none') {
    // Q11_count: Deductions — more than 3 standard expenses
    const deductCountUpfront = Math.max(parseInt(responses.q11_count, 10) || 0, 0);
    if (deductCountUpfront > 0) {
      const svc = v.deductions.moreThan3Standard[deductionDeliveryUpfront];
      if (svc) total += svc.annualRate * deductCountUpfront * m;
    }
    // Q12_count: Motor Vehicle — log book method
    const logBookCountUpfront = Math.max(parseInt(responses.q12_count, 10) || 0, 0);
    if (logBookCountUpfront > 0) {
      const svc = v.deductions.motorVehicleLogBook[deductionDeliveryUpfront];
      if (svc) total += svc.annualRate * logBookCountUpfront * m;
    }
    // Q13_count: Motor Vehicle — Cents per kilometre method
    const cpkCountUpfront = Math.max(parseInt(responses.q13_count, 10) || 0, 0);
    if (cpkCountUpfront > 0) {
      const svc = v.deductions.motorVehicleCPK[deductionDeliveryUpfront];
      if (svc) total += svc.annualRate * cpkCountUpfront * m;
    }
  }

  // Q14: BAS (Upfront = YES) - rate × frequency
  if (responses.q14 && responses.q14 !== 'none' && responses.q14a) {
    const frequency = responses.q14a; // 'quarterly' or 'annual'
    const delivery = responses.q14; // 'byClient' or 'byFirm'
    const svc = v.bas[delivery]?.[frequency];
    if (svc) total += svc.ratePerReturn * svc.frequency * m;
  }

  // Q15: TPAR (Upfront = YES)
  if (responses.q15 && responses.q15 !== 'none') {
    const svc = v.tpar[responses.q15];
    if (svc) total += svc.annualRate * m;
  }

  // Q16: Workers Comp (Upfront = YES)
  if (responses.q16 && responses.q16 !== 'none') {
    const svc = v.workersComp[responses.q16];
    if (svc) total += svc.annualRate * m;
  }

  // Q17: Payroll Salary (Upfront = YES)
  const salaryDelivery = responses.q17;
  if (salaryDelivery && salaryDelivery !== 'none' && responses.q17delivery) {
    const { weekly = '', fortnightly = '', monthly = '', annual = '' } = responses.q17delivery || {};
    const salaryValues = v.payrollSalary[salaryDelivery];
    if (salaryValues) {
      const wc = parseInt(weekly, 10) || 0;
      if (wc > 0) total += salaryValues.weekly.ratePerEmployee * wc * salaryValues.weekly.frequency * m;
      const fc = parseInt(fortnightly, 10) || 0;
      if (fc > 0) total += salaryValues.fortnightly.ratePerEmployee * fc * salaryValues.fortnightly.frequency * m;
      const mc = parseInt(monthly, 10) || 0;
      if (mc > 0) total += salaryValues.monthly.ratePerEmployee * mc * salaryValues.monthly.frequency * m;
      const ac = parseInt(annual, 10) || 0;
      if (ac > 0) total += salaryValues.annual.ratePerEmployee * ac * salaryValues.annual.frequency * m;
    }
  }

  // Q18: Payroll Timesheet (Upfront = YES)
  const timesheetDelivery = responses.q18delivery;
  if (timesheetDelivery && responses.q18) {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q18 || {};
    const timesheetValues = v.payrollTimesheet[timesheetDelivery];
    if (timesheetValues) {
      const wc = parseInt(weekly, 10) || 0;
      if (wc > 0) total += timesheetValues.weekly.ratePerEmployee * wc * timesheetValues.weekly.frequency * m;
      const fc = parseInt(fortnightly, 10) || 0;
      if (fc > 0) total += timesheetValues.fortnightly.ratePerEmployee * fc * timesheetValues.fortnightly.frequency * m;
      const mc = parseInt(monthly, 10) || 0;
      if (mc > 0) total += timesheetValues.monthly.ratePerEmployee * mc * timesheetValues.monthly.frequency * m;
    }
  }

  // Q19: Super Prep & Lodgement (Upfront = YES)
  const superDelivery = responses.q19delivery;
  const superFrequency = responses.q19;
  if (superDelivery && superDelivery !== 'none' && superFrequency && superFrequency !== 'none') {
    const svc = v.superPrepLodgement[superDelivery]?.[superFrequency];
    if (svc) total += svc.annualRate * svc.frequency * m;
  }

  // Q20: STP Reporting (Upfront = YES)
  if (responses.q20 && responses.q20 !== 'none') {
    const svc = v.stpReporting[responses.q20];
    if (svc) total += svc.annualRate * m;
  }

  // Q21: LSL Construction (Upfront = YES)
  if (responses.q21 && responses.q21 !== 'none') {
    const svc = v.lslConstruction[responses.q21];
    if (svc) total += svc.annualRate * m;
  }

  // Q22: Tax Planning (Upfront = YES)
  if (responses.q22 && responses.q22 !== 'none') {
    const svc = v.taxPlanning[responses.q22];
    if (svc) total += svc.annualRate * m;
  }

  // Q23: Tax Structuring - already handled in calculateTaxReturnOnceOffFee (true once-off)
  // Q24: Annual Tax Meeting (Upfront = YES)
  if (responses.q24 === 'yes') {
    total += v.annualTaxMeeting.annualRate * m;
  }

  // Q25: Advice Meeting (Upfront = YES)
  if (responses.q25 === 'yes') {
    total += v.adviceMeeting.annualRate * m;
  }

  // Q32: Return Not Necessary (Upfront = YES)
  if (responses.q32 === 'yes') {
    total += v.returnNotNecessary.ratePerClient * m;
  }

  // Q33: Final Return (Upfront = YES)
  if (responses.q33 === 'yes') {
    total += v.finalReturn.ratePerClient * m;
  }

  // Support Services (Q17, Q18, Q19) have Upfront = NO, so they are NOT included here

  // Q28: Xero Support has Upfront = NO, so NOT included here

  return total;
};

// ─────────────────────────────────────────────────────────────────────────────
// UPFRONT ANNUAL BREAKDOWN (array of { label, amount } for display)
// ─────────────────────────────────────────────────────────────────────────────
export const getTaxReturnUpfrontAnnualBreakdown = (responses, pricingModifier = 200) => {
  const v = serviceValuesTaxReturn;
  const m = getPricingMultiplier(pricingModifier);
  const items = [];

  // Q1: Individual Returns
  const returnCount = parseInt(responses.q1, 10) || 0;
  if (returnCount > 0) {
    items.push({
      label: `${v.individualReturns.inclusion}`,
      amount: v.individualReturns.annualRate * returnCount * m,
    });
  }

  // Q2: Income Items
  const delivery2 = responses.q2;
  if (delivery2 && delivery2 !== 'none') {
    [['q2a', 'dividends'], ['q2b', 'interest'], ['q2c', 'managedFunds'], ['q2d', 'rentalProperty']].forEach(([countId, key]) => {
      const count = Math.max(parseInt(responses[countId], 10) || 0, 0);
      if (count > 0) {
        const svc = v.incomeItems[key][delivery2];
        if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * count * m });
      }
    });
  }

  // Q6-Q8: Capital Gains (q6 is parent with delivery, q6_count/q7_count/q8_count are children)
  const cgtDeliveryBreakdown = responses.q6;
  if (cgtDeliveryBreakdown && cgtDeliveryBreakdown !== 'none') {
    // Q6_count: CGT — Shares and equities
    const sharesCountBreakdown = Math.max(parseInt(responses.q6_count, 10) || 0, 0);
    if (sharesCountBreakdown > 0) {
      const svc = v.capitalGains.cgtShares[cgtDeliveryBreakdown];
      if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * sharesCountBreakdown * m });
    }
    // Q7_count: CGT — Property sales
    const propertyCountBreakdown = Math.max(parseInt(responses.q7_count, 10) || 0, 0);
    if (propertyCountBreakdown > 0) {
      const svc = v.capitalGains.cgtProperty[cgtDeliveryBreakdown];
      if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * propertyCountBreakdown * m });
    }
    // Q8_count: Balancing adjustment — sale of business asset
    const balancingCountBreakdown = Math.max(parseInt(responses.q8_count, 10) || 0, 0);
    if (balancingCountBreakdown > 0) {
      const svc = v.capitalGains.balancingAdj[cgtDeliveryBreakdown];
      if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * balancingCountBreakdown * m });
    }
  }

  // Q9-Q10: Business Schedules (q9 is parent with delivery, q9_count and q10_count are children)
  const businessDeliveryBreakdown = responses.q9;
  if (businessDeliveryBreakdown && businessDeliveryBreakdown !== 'none') {
    // Q9_count: Business Schedule — no GST
    const noGstCountBreakdown = Math.max(parseInt(responses.q9_count, 10) || 0, 0);
    if (noGstCountBreakdown > 0) {
      const svc = v.businessSchedules.noGst[businessDeliveryBreakdown];
      if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * noGstCountBreakdown * m });
    }
    // Q10_count: Business Schedule — with GST
    const withGstCountBreakdown = Math.max(parseInt(responses.q10_count, 10) || 0, 0);
    if (withGstCountBreakdown > 0) {
      const svc = v.businessSchedules.withGst[businessDeliveryBreakdown];
      if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * withGstCountBreakdown * m });
    }
  }

  // Q11-Q13: Deductions (q11 is parent with delivery, q11_count/q12_count/q13_count are children)
  const deductionDeliveryBreakdown = responses.q11;
  if (deductionDeliveryBreakdown && deductionDeliveryBreakdown !== 'none') {
    // Q11_count: Deductions — more than 3 standard expenses
    const deductCountBreakdown = Math.max(parseInt(responses.q11_count, 10) || 0, 0);
    if (deductCountBreakdown > 0) {
      const svc = v.deductions.moreThan3Standard[deductionDeliveryBreakdown];
      if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * deductCountBreakdown * m });
    }
    // Q12_count: Motor Vehicle — log book method
    const logBookCountBreakdown = Math.max(parseInt(responses.q12_count, 10) || 0, 0);
    if (logBookCountBreakdown > 0) {
      const svc = v.deductions.motorVehicleLogBook[deductionDeliveryBreakdown];
      if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * logBookCountBreakdown * m });
    }
    // Q13_count: Motor Vehicle — Cents per kilometre method
    const cpkCountBreakdown = Math.max(parseInt(responses.q13_count, 10) || 0, 0);
    if (cpkCountBreakdown > 0) {
      const svc = v.deductions.motorVehicleCPK[deductionDeliveryBreakdown];
      if (svc) items.push({ label: `${svc.inclusion}`, amount: svc.annualRate * cpkCountBreakdown * m });
    }
  }

  // Q14: BAS
  if (responses.q14 && responses.q14 !== 'none' && responses.q14a) {
    const frequency = responses.q14a;
    const delivery = responses.q14;
    const svc = v.bas[delivery]?.[frequency];
    if (svc) items.push({ label: svc.inclusion, amount: svc.ratePerReturn * svc.frequency * m });
  }

  // Q15: TPAR
  if (responses.q15 && responses.q15 !== 'none') {
    const svc = v.tpar[responses.q15];
    if (svc) items.push({ label: svc.inclusion, amount: svc.annualRate * m });
  }

  // Q16: Workers Comp
  if (responses.q16 && responses.q16 !== 'none') {
    const svc = v.workersComp[responses.q16];
    if (svc) items.push({ label: svc.inclusion, amount: svc.annualRate * m });
  }

  // Q17: Payroll Salary
  const salaryDeliveryBreakdown = responses.q17;
  if (salaryDeliveryBreakdown && salaryDeliveryBreakdown !== 'none' && responses.q17delivery) {
    const { weekly = '', fortnightly = '', monthly = '', annual = '' } = responses.q17delivery || {};
    const salaryValues = v.payrollSalary[salaryDeliveryBreakdown];
    if (salaryValues) {
      const wc = parseInt(weekly, 10) || 0;
      if (wc > 0) items.push({ label: `${salaryValues.weekly.inclusion}`, amount: salaryValues.weekly.ratePerEmployee * wc * salaryValues.weekly.frequency * m });
      const fc = parseInt(fortnightly, 10) || 0;
      if (fc > 0) items.push({ label: `${salaryValues.fortnightly.inclusion}`, amount: salaryValues.fortnightly.ratePerEmployee * fc * salaryValues.fortnightly.frequency * m });
      const mc = parseInt(monthly, 10) || 0;
      if (mc > 0) items.push({ label: `${salaryValues.monthly.inclusion}`, amount: salaryValues.monthly.ratePerEmployee * mc * salaryValues.monthly.frequency * m });
      const ac = parseInt(annual, 10) || 0;
      if (ac > 0) items.push({ label: `${salaryValues.annual.inclusion}`, amount: salaryValues.annual.ratePerEmployee * ac * salaryValues.annual.frequency * m });
    }
  }

  // Q18: Payroll Timesheet
  const timesheetDeliveryBreakdown = responses.q18delivery;
  if (timesheetDeliveryBreakdown && timesheetDeliveryBreakdown !== 'none' && responses.q18 && typeof responses.q18 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q18 || {};
    const timesheetValues = v.payrollTimesheet[timesheetDeliveryBreakdown];
    if (timesheetValues) {
      const wc = parseInt(weekly, 10) || 0;
      if (wc > 0) items.push({ label: `${timesheetValues.weekly.inclusion}`, amount: timesheetValues.weekly.ratePerEmployee * wc * timesheetValues.weekly.frequency * m });
      const fc = parseInt(fortnightly, 10) || 0;
      if (fc > 0) items.push({ label: `${timesheetValues.fortnightly.inclusion}`, amount: timesheetValues.fortnightly.ratePerEmployee * fc * timesheetValues.fortnightly.frequency * m });
      const mc = parseInt(monthly, 10) || 0;
      if (mc > 0) items.push({ label: `${timesheetValues.monthly.inclusion}`, amount: timesheetValues.monthly.ratePerEmployee * mc * timesheetValues.monthly.frequency * m });
    }
  }

  // Q19: Super Prep & Lodgement
  const superDeliveryBreakdown = responses.q19delivery;
  const superFrequencyBreakdown = responses.q19;
  if (superDeliveryBreakdown && superDeliveryBreakdown !== 'none' && superFrequencyBreakdown && superFrequencyBreakdown !== 'none') {
    const svc = v.superPrepLodgement[superDeliveryBreakdown]?.[superFrequencyBreakdown];
    if (svc) items.push({ label: svc.inclusion, amount: svc.annualRate * svc.frequency * m });
  }

  // Q20: STP Reporting
  if (responses.q20 && responses.q20 !== 'none') {
    const svc = v.stpReporting[responses.q20];
    if (svc) items.push({ label: svc.inclusion, amount: svc.annualRate * m });
  }

  // Q21: LSL Construction
  if (responses.q21 && responses.q21 !== 'none') {
    const svc = v.lslConstruction[responses.q21];
    if (svc) items.push({ label: svc.inclusion, amount: svc.annualRate * m });
  }

  // Q22: Tax Planning
  if (responses.q22 && responses.q22 !== 'none') {
    const svc = v.taxPlanning[responses.q22];
    if (svc) items.push({ label: svc.inclusion, amount: svc.annualRate * m });
  }

  // Q24: Annual Tax Meeting
  if (responses.q24 === 'yes') {
    items.push({ label: v.annualTaxMeeting.inclusion, amount: v.annualTaxMeeting.annualRate * m });
  }

  // Q25: Advice Meeting
  if (responses.q25 === 'yes') {
    items.push({ label: v.adviceMeeting.inclusion, amount: v.adviceMeeting.annualRate * m });
  }

  // Q32: Return Not Necessary (Upfront = YES)
  if (responses.q32 === 'yes') {
    items.push({ label: v.returnNotNecessary.inclusion, amount: v.returnNotNecessary.ratePerClient * m });
  }

  // Q33: Final Return (Upfront = YES)
  if (responses.q33 === 'yes') {
    items.push({ label: v.finalReturn.inclusion, amount: v.finalReturn.ratePerClient * m });
  }

  return items;
};