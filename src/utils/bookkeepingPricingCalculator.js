import { serviceValuesBookkeeping } from '../constants/bookkeepingServicesValues';
import { applyPriceOverrides } from './priceOverrides';

// Base bookkeeping pricing modifier value (default hourly rate: $100/hr)
const BASE_BOOKKEEPING_PRICING_MODIFIER = 100;

/**
 * Calculates the pricing multiplier based on the bookkeeping pricing modifier
 * @param {number} pricingModifier - The pricing modifier value (default 100)
 * @returns {number} The multiplier to apply to prices
 */
const getPricingMultiplier = (pricingModifier) => {
  if (pricingModifier === undefined || pricingModifier === null) {
    return 1; // No adjustment
  }
  return pricingModifier / BASE_BOOKKEEPING_PRICING_MODIFIER;
};

/**
 * Helper to get total employee count from payroll responses (q4 salaried + q5 timesheet)
 */
const getTotalEmployeeCount = (responses) => {
  let total = 0;
  
  // Count salaried employees (q4)
  if (responses.q4 && typeof responses.q4 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q4;
    total += (parseInt(weekly, 10) || 0);
    total += (parseInt(fortnightly, 10) || 0);
    total += (parseInt(monthly, 10) || 0);
  }
  
  // Count timesheet employees (q5)
  if (responses.q5 && typeof responses.q5 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q5;
    total += (parseInt(weekly, 10) || 0);
    total += (parseInt(fortnightly, 10) || 0);
    total += (parseInt(monthly, 10) || 0);
  }
  
  return total;
};

/**
 * Calculates total monthly pricing based on bookkeeping question responses
 * Based on Bookkeeping Pricing Calculator v11 CSV structure
 * Formula: Base Rate × Units × Frequency / 12 × Multiplier = Monthly Fee
 * 
 * @param {Object} responses - Question responses from BookkeepingQuestions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 100)
 * @returns {number} Total monthly cost
 */
export const calculateBookkeepingMonthlyPrice = (responses, pricingModifier = 100) => {
  return _calculateBookkeepingMonthlyPriceRaw(responses, pricingModifier);
};

const _calculateBookkeepingMonthlyPriceRaw = (responses, pricingModifier = 100) => {
  let total = 0;
  const values = serviceValuesBookkeeping;
  const multiplier = getPricingMultiplier(pricingModifier);

  // Q1: Revenue segment - used for tier lookups (micro, small, medium, large, enterprise)
  // No direct pricing, determines EOFY tier

  // Q2: Accounting system - once-off fee handled in once-off calculation
  // No monthly fee

  // ========================================
  // Q3: PAYROLL SERVICES
  // ========================================
  
  // Q4: Salaried Employees - Rate × Units × Frequency / 12
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q4 && typeof responses.q4 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q4;
    const salaried = values.payrollServices.salaried;

    // Weekly: $10 × employees × 52 / 12
    const weeklyCount = parseInt(weekly, 10) || 0;
    if (weeklyCount > 0) {
      total += (salaried.weekly.ratePerEmployee * weeklyCount * salaried.weekly.frequency) / 12;
    }

    // Fortnightly: $10 × employees × 26 / 12
    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    if (fortnightlyCount > 0) {
      total += (salaried.fortnightly.ratePerEmployee * fortnightlyCount * salaried.fortnightly.frequency) / 12;
    }

    // Monthly: $10 × employees × 12 / 12
    const monthlyCount = parseInt(monthly, 10) || 0;
    if (monthlyCount > 0) {
      total += (salaried.monthly.ratePerEmployee * monthlyCount * salaried.monthly.frequency) / 12;
    }
  }

  // Q5: Timesheet Employees - Rate × Units × Frequency / 12
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q5 && typeof responses.q5 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q5;
    const timesheet = values.payrollServices.timesheet;

    // Weekly: $15 × employees × 52 / 12
    const weeklyCount = parseInt(weekly, 10) || 0;
    if (weeklyCount > 0) {
      total += (timesheet.weekly.ratePerEmployee * weeklyCount * timesheet.weekly.frequency) / 12;
    }

    // Fortnightly: $20 × employees × 26 / 12
    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    if (fortnightlyCount > 0) {
      total += (timesheet.fortnightly.ratePerEmployee * fortnightlyCount * timesheet.fortnightly.frequency) / 12;
    }

    // Monthly: $25 × employees × 12 / 12
    const monthlyCount = parseInt(monthly, 10) || 0;
    if (monthlyCount > 0) {
      total += (timesheet.monthly.ratePerEmployee * monthlyCount * timesheet.monthly.frequency) / 12;
    }
  }

  // Q6: Super Prep & Lodgement - Rate × Employees × Frequency / 12
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q6 && responses.q6 !== 'no') {
    const superLodge = values.payrollServices.superLodgement;
    const employeeCount = parseInt(responses.q6a, 10) || 0;

    if (responses.q6 === 'weekly') {
      total += (superLodge.weekly.ratePerEmployee * employeeCount * superLodge.weekly.frequency) / 12;
    } else if (responses.q6 === 'fortnightly') {
      total += (superLodge.fortnightly.ratePerEmployee * employeeCount * superLodge.fortnightly.frequency) / 12;
    } else if (responses.q6 === 'quarterly') {
      // $5 × employees × 4 / 12
      total += (superLodge.quarterly.ratePerEmployee * employeeCount * superLodge.quarterly.frequency) / 12;
    } else if (responses.q6 === 'monthly') {
      // $7 × employees × 12 / 12
      total += (superLodge.monthly.ratePerEmployee * employeeCount * superLodge.monthly.frequency) / 12;
    }
  }

  // Q7: STP Reporting - Rate × Employees × Frequency / 12
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q7 && responses.q7 !== 'no') {
    const stp = values.payrollServices.stpReporting;
    const employeeCount = parseInt(responses.q7a, 10) || 0;

    if (responses.q7 === 'weekly') {
      // $2.50 × employees × 52 / 12
      total += (stp.weekly.ratePerEmployee * employeeCount * stp.weekly.frequency) / 12;
    } else if (responses.q7 === 'fortnightly') {
      // $2.50 × employees × 26 / 12
      total += (stp.fortnightly.ratePerEmployee * employeeCount * stp.fortnightly.frequency) / 12;
    } else if (responses.q7 === 'monthly') {
      // $2.50 × employees × 12 / 12
      total += (stp.monthly.ratePerEmployee * employeeCount * stp.monthly.frequency) / 12;
    }
  }

  // Q8: Workers Compensation - $150 × units × 1 / 12 (yearly converted to monthly)
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q8 === 'yes') {
    const workersComp = values.payrollServices.workersComp;
    // Use the number of lodgements (default to 1 if not specified)
    const lodgementCount = responses.q8a ? parseInt(responses.q8a, 10) || 1 : 1;
    total += (workersComp.ratePerLodgement * lodgementCount * workersComp.frequency) / 12;
  }

  // ========================================
  // Q9-11: BOOKKEEPING - TRANSACTIONS & PAYABLES
  // ========================================

  // Q9: Single Line Bank & Credit Card Transactions
  if (responses.q9) {
    const transactions = values.bookkeepingServices.singleLineTransactions;
    
    switch (responses.q9) {
      case 'upTo50':
        // Up to 50: $3.00 × 50 per month ($150)
        total += transactions.upTo50.ratePerUnit * transactions.upTo50.maxUnits;
        break;
      case 'upTo100':
        // Up to 100: $2.25 × 100 per month
        total += transactions.upTo100.ratePerUnit * transactions.upTo100.maxUnits;
        break;
      case 'upTo200':
        // 101-200: $2.00 × 200 per month
        total += transactions.upTo200.ratePerUnit * transactions.upTo200.maxUnits;
        break;
      case 'upTo400':
        // 201-400: $1.50 × 400 per month
        total += transactions.upTo400.ratePerUnit * transactions.upTo400.maxUnits;
        break;
      case 'over400':
        // 400+: Include cost of 201-400 tier ($1.50 × 400) + extra transactions at $1.10
        total += transactions.upTo400.ratePerUnit * transactions.upTo400.maxUnits;
        if (responses.q9a) {
          const extraTransactions = parseInt(responses.q9a, 10) || 0;
          total += transactions.over400.ratePerUnit * extraTransactions;
        }
        break;
    }
  }

  // Q10: Multi-Line Transactions - # invoices × avg lines × $1.50
  if (responses.q10 && typeof responses.q10 === 'object') {
    const { invoices = '', avgLines = '' } = responses.q10;
    const invoiceCount = parseInt(invoices, 10) || 0;
    const avgLineCount = parseInt(avgLines, 10) || 0;
    
    if (invoiceCount > 0 && avgLineCount > 0) {
      total += values.bookkeepingServices.multiLineTransactions.ratePerLine * invoiceCount * avgLineCount;
    }
  }

  // Q11: Accounts Payable Management
  if (responses.q11 && responses.q11 !== 'no') {
    const ap = values.bookkeepingServices.accountsPayable;

    switch (responses.q11) {
      case 'upTo10':
        // Up to 10: $2.50 × 10 suppliers per month ($25)
        total += ap.upTo10.ratePerSupplier * ap.upTo10.maxSuppliers;
        break;
      case 'upTo20':
        // Up to 20: $2.00 × 20 suppliers per month
        total += ap.upTo20.ratePerSupplier * ap.upTo20.maxSuppliers;
        break;
      case 'upTo50':
        // Up to 50: $1.50 × 50 suppliers per month
        total += ap.upTo50.ratePerSupplier * ap.upTo50.maxSuppliers;
        break;
      case 'extra':
        // 50+: Base 50 at $1.50 + extra at $1.00
        total += ap.upTo50.ratePerSupplier * ap.upTo50.maxSuppliers;
        if (responses.q11a) {
          const extraSuppliers = parseInt(responses.q11a, 10) || 0;
          total += ap.extra.ratePerSupplier * extraSuppliers;
        }
        break;
    }
  }

  // ========================================
  // Q12-13: COMPLIANCE LODGEMENTS (annual, converted to monthly)
  // ========================================

  // Q12: TPAR - $1.50 per report
  if (responses.q12 === 'yes') {
    const tpar = values.complianceLodgements.tpar;
    // Use the number of TPAR reports (default to 1 if not specified)
    const tparCount = responses.q12a ? parseInt(responses.q12a, 10) || 1 : 1;
    total += tpar.ratePerReport * tparCount;
  }

  // Q13: LSL Construction - $20 per lodgement
  if (responses.q13 === 'yes') {
    const lsl = values.complianceLodgements.lslConstruction;
    // Use the number of lodgements (default to 1 if not specified)
    const lslCount = responses.q13a ? parseInt(responses.q13a, 10) || 1 : 1;
    total += lsl.ratePerLodgement * lslCount;
  }

  // ========================================
  // Q14-16: ACCOUNTS RECEIVABLE
  // ========================================

  // Q14: Single Line AR Invoices
  if (responses.q14 && responses.q14 !== 'no') {
    const ar = values.accountsReceivable.singleLineInvoices;

    switch (responses.q14) {
      case 'upTo10':
        // Up to 10: $3.50 × 10 per month ($35)
        total += ar.upTo10.ratePerInvoice * ar.upTo10.maxInvoices;
        break;
      case 'upTo20':
        // Up to 20: $3.00 × 20 per month
        total += ar.upTo20.ratePerInvoice * ar.upTo20.maxInvoices;
        break;
      case 'upTo50':
        // 21-50: $2.75 × 50 per month
        total += ar.upTo50.ratePerInvoice * ar.upTo50.maxInvoices;
        break;
      case 'upTo75':
        // 51-75: $2.50 × 75 per month
        total += ar.upTo75.ratePerInvoice * ar.upTo75.maxInvoices;
        break;
      case 'over75':
        // 75+: Base 75 at $2.00 + extra at $2.00
        total += ar.over75.ratePerInvoice * 75;
        if (responses.q14a) {
          const extraInvoices = parseInt(responses.q14a, 10) || 0;
          total += ar.over75.ratePerInvoice * extraInvoices;
        }
        break;
    }
  }

  // Q15: Multi-Line AR Invoices - # invoices × avg lines × $1.00
  if (responses.q14 && responses.q14 !== 'no' && responses.q15 && typeof responses.q15 === 'object') {
    const { invoices = '', avgLines = '' } = responses.q15;
    const invoiceCount = parseInt(invoices, 10) || 0;
    const avgLineCount = parseInt(avgLines, 10) || 0;
    
    if (invoiceCount > 0 && avgLineCount > 0) {
      total += values.accountsReceivable.multiLineInvoices.ratePerLine * invoiceCount * avgLineCount;
    }
  }

  // Q16: Debtor Management
  if (responses.q14 && responses.q14 !== 'no' && responses.q16 && responses.q16 !== 'no') {
    const dm = values.accountsReceivable.debtorManagement;

    switch (responses.q16) {
      case 'upTo10':
        total += dm.upTo10.ratePerDebtor * dm.upTo10.maxDebtors;
        break;
      case 'upTo20':
        // Up to 20: $5.00 × 20 per month
        total += dm.upTo20.ratePerDebtor * dm.upTo20.maxDebtors;
        break;
      case 'upTo50':
        // 21-50: $4.00 × 50 per month
        total += dm.upTo50.ratePerDebtor * dm.upTo50.maxDebtors;
        break;
      case 'extra':
        // 50+: Base 50 at $4.00 + extra at $3.00
        total += dm.upTo50.ratePerDebtor * dm.upTo50.maxDebtors;
        if (responses.q16a) {
          const extraDebtors = parseInt(responses.q16a, 10) || 0;
          total += dm.extra.ratePerDebtor * extraDebtors;
        }
        break;
    }
  }

  // ========================================
  // Q17-18: REPORTING
  // ========================================

  // Q17: Financial Reporting - Monthly fee
  if (responses.q17 && responses.q17 !== 'no') {
    const fr = values.financialReporting;

    if (responses.q17 === 'monthly') {
      // $72/month
      total += fr.monthly.rate;
    } else if (responses.q17 === 'quarterly') {
      // $36/month
      total += fr.quarterly.rate;
    }
  }

  // Q18: Management Meetings - Monthly fee
  if (responses.q18 && responses.q18 !== 'no') {
    const mm = values.managementMeetings;

    if (responses.q18 === 'monthly') {
      // $225 monthly fee
      total += mm.monthly.rate;
    } else if (responses.q18 === 'quarterly') {
      // $100 monthly fee
      total += mm.quarterly.rate;
    }
  }

  // ========================================
  // Q19: COMPLIANCE SERVICES (BAS/IAS)
  // ========================================
  if (responses.q19 && typeof responses.q19 === 'object') {
    const cs = values.complianceServices;

    // BAS Quarterly: $60 monthly fee
    if (responses.q19.basQuarterly) {
      total += cs.basQuarterly.rate;
    }

    // BAS Monthly: $120 monthly fee
    if (responses.q19.basMonthly) {
      total += cs.basMonthly.rate;
    }

    // IAS: $64 monthly fee
    if (responses.q19.ias) {
      total += cs.ias.rate;
    }
  }

  // ========================================
  // Q24: PAYROLL TAX RETURN - rate × units / 12
  // ========================================
  if (responses.q24 === 'yes') {
    const payrollTaxReturn = values.complianceServices.payrollTaxReturn;
    const lodgementCount = responses.q24a ? parseInt(responses.q24a, 10) || 1 : 1;
    total += payrollTaxReturn.rate * lodgementCount / 12;
  }

  // ========================================
  // Q20: SUPPORT
  // ========================================
  if (responses.q20) {
    const support = values.support;

    if (responses.q20 === 'emailOnly') {
      total += support.emailOnly.monthly;
    } else if (responses.q20 === 'emailPhoneTeamCsm') {
      total += support.emailPhoneTeamCsm.monthly;
    } else if (responses.q20 === 'emailPhoneCsmOwner') {
      total += support.emailPhoneCsmOwner.monthly;
    }
  }

  // ========================================
  // Q21: EOFY - Monthly fee
  // ========================================
  if (responses.q21 && responses.q21 !== 'no') {
    const eofy = values.eofyProcess;

    if (responses.q21 === 'microSmall') {
      // $49.50 monthly fee
      total += eofy.microSmall.rate;
    } else if (responses.q21 === 'mediumLarge') {
      // $89.50 monthly fee
      total += eofy.mediumLarge.rate;
    }
  }

  // ========================================
  // Q26: Ongoing Accounting Software Support and Training (monthly sessions)
  // ========================================
  if (responses.q26 === 'yes' && responses.q26a && typeof responses.q26a === 'object') {
    const ast = values.accountingSoftwareSetupTraining;
    const sessions30 = parseInt(responses.q26a.sessions30min, 10) || 0;
    const sessions60 = parseInt(responses.q26a.sessions60min, 10) || 0;
    total += ast.ongoing30min.ratePerSession * sessions30;
    total += ast.ongoing60min.ratePerSession * sessions60;
  }

  // ========================================
  // Q27: POS Integration (monthly) - multi-select
  // ========================================
  if (responses.q27 && typeof responses.q27 === 'object') {
    const ast = values.accountingSoftwareSetupTraining;
    if (responses.q27.importReview) total += ast.posImportReview.monthly;
    if (responses.q27.monthlyReconciliation) total += ast.posReconciliation.monthly;
    if (responses.q27.monthlyDownloadRework) total += ast.posDownloadRework.monthly;
  }

  // Q22: Rescue/Cleanup - once-off, handled separately

  // Q28: Accounting Software Disbursement - pass-through monthly fee
  if (responses.q28 && responses.q28 !== 'no' && responses.q28 !== '') {
    const disbursementFee = parseFloat(responses.q28_price) || 0;
    if (disbursementFee > 0) total += disbursementFee;
  }

  // Q29: Other Disbursements - pass-through monthly fees
  if (Array.isArray(responses.q29)) {
    responses.q29.forEach((row) => {
      const fee = parseFloat(row && row.price) || 0;
      if (fee > 0) total += fee;
    });
  }

  // Apply pricing modifier and round to 2 decimal places
  return Math.round(total * multiplier * 100) / 100;
};

/**
 * Calculates total once-off fee based on bookkeeping question responses
 * @param {Object} responses - Question responses from BookkeepingQuestions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 100)
 * @returns {number} Total once-off fee
 */
const _calculateBookkeepingOnceOffFeeRaw = (responses, pricingModifier = 100) => {
  let total = 0;
  const values = serviceValuesBookkeeping;
  const multiplier = getPricingMultiplier(pricingModifier);

  // Q2: Accounting System Setup - $1000 once-off
  if (responses.q2 === 'no') {
    total += values.setupServices.accountingSoftwareSetup.onceOff;
  }

  // Q3: Payroll System Setup - $50 × # employees once-off
  if (responses.q3 === 'yesSetup' && responses.q3a) {
    const employeeCount = parseInt(responses.q3a, 10) || 0;
    total += values.payrollServices.payrollSetup.perEmployee * employeeCount;
  }

  // Q22: Rescue/Cleanup Work - Monthly package × # months
  if (responses.q22 === 'yes' && responses.q22a) {
    const monthsCount = parseInt(responses.q22a, 10) || 0;
    if (monthsCount > 0) {
      // Calculate monthly total for cleanup (already includes modifier)
      const monthlyTotal = calculateBookkeepingMonthlyPrice(responses, pricingModifier);
      total += monthlyTotal * monthsCount;
    }
  }

  // Q25: Accounting Software Setup (once-off)
  if (responses.q25 === 'yes') {
    const ast = values.accountingSoftwareSetupTraining;
    total += ast.setup.onceOff;
  }

  // Q25b: Accounting Software Training Sessions (once-off)
  if (responses.q25b && responses.q25b !== 'no') {
    const ast = values.accountingSoftwareSetupTraining;
    const count = parseInt(responses.q25c, 10) || 0;
    if (responses.q25b === 'basic') {
      total += ast.basicSession.ratePerSession * count;
    } else if (responses.q25b === 'intermediate') {
      total += ast.intermediateSession.ratePerSession * count;
    } else if (responses.q25b === 'advanced') {
      total += ast.advancedSession.ratePerSession * count;
    }
  }

  // Apply pricing modifier and round to 2 decimal places
  return Math.round(total * multiplier * 100) / 100;
};

/**
 * Returns a breakdown of once-off fee items with labels and amounts
 * @param {Object} responses - Question responses from BookkeepingQuestions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 100)
 * @returns {Array} Array of objects with { label, amount } for each once-off item
 */
export const getBookkeepingOnceOffBreakdown = (responses, pricingModifier = 100) => {
  const items = [];
  const values = serviceValuesBookkeeping;
  const multiplier = getPricingMultiplier(pricingModifier);

  // Q2: Accounting System Setup - $1000 once-off
  if (responses.q2 === 'no') {
    const amount = Math.round(values.setupServices.accountingSoftwareSetup.onceOff * multiplier * 100) / 100;
    items.push({
      label: 'Accounting Software Setup',
      amount,
    });
  }

  // Q3: Payroll System Setup - $50 × # employees once-off
  if (responses.q3 === 'yesSetup' && responses.q3a) {
    const employeeCount = parseInt(responses.q3a, 10) || 0;
    if (employeeCount > 0) {
      const amount = Math.round(values.payrollServices.payrollSetup.perEmployee * employeeCount * multiplier * 100) / 100;
      items.push({
        label: `Payroll System Setup (${employeeCount} employees)`,
        amount,
      });
    }
  }

  // Q22: Rescue/Cleanup Work - Monthly package × # months
  if (responses.q22 === 'yes' && responses.q22a) {
    const monthsCount = parseInt(responses.q22a, 10) || 0;
    if (monthsCount > 0) {
      const monthlyTotal = calculateBookkeepingMonthlyPrice(responses, pricingModifier);
      const amount = Math.round(monthlyTotal * monthsCount * 100) / 100;
      items.push({
        label: `Rescue/Cleanup Work (${monthsCount} months)`,
        amount,
      });
    }
  }

  // Q25: Accounting Software Setup (once-off)
  if (responses.q25 === 'yes') {
    const ast = values.accountingSoftwareSetupTraining;
    const amount = Math.round(ast.setup.onceOff * multiplier * 100) / 100;
    items.push({ label: 'Accounting Software Setup', amount });
  }

  // Q25b: Accounting Software Training Sessions (once-off)
  if (responses.q25b && responses.q25b !== 'no') {
    const ast = values.accountingSoftwareSetupTraining;
    const count = parseInt(responses.q25c, 10) || 0;
    if (count > 0) {
      let rate = 0;
      let label = '';
      if (responses.q25b === 'basic') {
        rate = ast.basicSession.ratePerSession;
        label = `Online Basic Training Sessions (${count} × 30 min)`;
      } else if (responses.q25b === 'intermediate') {
        rate = ast.intermediateSession.ratePerSession;
        label = `Online Intermediate Training Sessions (${count} × 45 min)`;
      } else if (responses.q25b === 'advanced') {
        rate = ast.advancedSession.ratePerSession;
        label = `Online Advanced Training Sessions (${count} × 60 min)`;
      }
      if (rate > 0) {
        const amount = Math.round(rate * count * multiplier * 100) / 100;
        items.push({ label, amount });
      }
    }
  }

  return items;
};

/**
 * Calculates Bronze package pricing for bookkeeping
 * Bronze is hard-coded to include essential services only:
 * - Transactions (if selected)
 * - Team/Email Support only
 * - BAS/IAS (if selected)
 * Does NOT include: CSM/Owner Support, Management Meetings, Financial Reporting (Monthly), Debtor Management
 * @param {Object} responses - Question responses from BookkeepingQuestions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 100)
 * @returns {number} Bronze tier monthly cost
 */
const _calculateBookkeepingBronzePriceRaw = (responses, pricingModifier = 100) => {
  let total = 0;
  const values = serviceValuesBookkeeping;
  const multiplier = getPricingMultiplier(pricingModifier);

  // PAYROLL SERVICES (if selected) - YES
  // Q4: Salaried Employees - YES
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q4 && typeof responses.q4 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q4;
    const salaried = values.payrollServices.salaried;

    const weeklyCount = parseInt(weekly, 10) || 0;
    if (weeklyCount > 0) {
      total += (salaried.weekly.ratePerEmployee * weeklyCount * salaried.weekly.frequency) / 12;
    }

    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    if (fortnightlyCount > 0) {
      total += (salaried.fortnightly.ratePerEmployee * fortnightlyCount * salaried.fortnightly.frequency) / 12;
    }

    const monthlyCount = parseInt(monthly, 10) || 0;
    if (monthlyCount > 0) {
      total += (salaried.monthly.ratePerEmployee * monthlyCount * salaried.monthly.frequency) / 12;
    }
  }

  // Q5: Timesheet Employees - YES
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q5 && typeof responses.q5 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q5;
    const timesheet = values.payrollServices.timesheet;

    const weeklyCount = parseInt(weekly, 10) || 0;
    if (weeklyCount > 0) {
      total += (timesheet.weekly.ratePerEmployee * weeklyCount * timesheet.weekly.frequency) / 12;
    }

    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    if (fortnightlyCount > 0) {
      total += (timesheet.fortnightly.ratePerEmployee * fortnightlyCount * timesheet.fortnightly.frequency) / 12;
    }

    const monthlyCount = parseInt(monthly, 10) || 0;
    if (monthlyCount > 0) {
      total += (timesheet.monthly.ratePerEmployee * monthlyCount * timesheet.monthly.frequency) / 12;
    }
  }

  // Q6: Super Prep & Lodgement - YES
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q6 && responses.q6 !== 'no') {
    const superLodge = values.payrollServices.superLodgement;
    const employeeCount = parseInt(responses.q6a, 10) || 0;

    if (responses.q6 === 'weekly') {
      total += (superLodge.weekly.ratePerEmployee * employeeCount * superLodge.weekly.frequency) / 12;
    } else if (responses.q6 === 'fortnightly') {
      total += (superLodge.fortnightly.ratePerEmployee * employeeCount * superLodge.fortnightly.frequency) / 12;
    } else if (responses.q6 === 'quarterly') {
      total += (superLodge.quarterly.ratePerEmployee * employeeCount * superLodge.quarterly.frequency) / 12;
    } else if (responses.q6 === 'monthly') {
      total += (superLodge.monthly.ratePerEmployee * employeeCount * superLodge.monthly.frequency) / 12;
    }
  }

  // Q7: STP Reporting - YES
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q7 && responses.q7 !== 'no') {
    const stp = values.payrollServices.stpReporting;
    const employeeCount = parseInt(responses.q7a, 10) || 0;

    if (responses.q7 === 'weekly') {
      total += (stp.weekly.ratePerEmployee * employeeCount * stp.weekly.frequency) / 12;
    } else if (responses.q7 === 'fortnightly') {
      total += (stp.fortnightly.ratePerEmployee * employeeCount * stp.fortnightly.frequency) / 12;
    } else if (responses.q7 === 'monthly') {
      total += (stp.monthly.ratePerEmployee * employeeCount * stp.monthly.frequency) / 12;
    }
  }

  // Q8: Workers Compensation - NO (excluded from Bronze)

  // BOOKKEEPING - TRANSACTIONS
  // Q9: Single Line Bank & Credit Card Transactions - YES
  if (responses.q9 && responses.q9 !== 'no') {
    const transactions = values.bookkeepingServices.singleLineTransactions;
    
    switch (responses.q9) {
      case 'upTo50':
        total += transactions.upTo50.ratePerUnit * transactions.upTo50.maxUnits;
        break;
      case 'upTo100':
        total += transactions.upTo100.ratePerUnit * transactions.upTo100.maxUnits;
        break;
      case 'upTo200':
        total += transactions.upTo200.ratePerUnit * transactions.upTo200.maxUnits;
        break;
      case 'upTo400':
        total += transactions.upTo400.ratePerUnit * transactions.upTo400.maxUnits;
        break;
      case 'over400':
        total += transactions.upTo400.ratePerUnit * transactions.upTo400.maxUnits;
        if (responses.q9a) {
          const extraTransactions = parseInt(responses.q9a, 10) || 0;
          total += transactions.over400.ratePerUnit * extraTransactions;
        }
        break;
    }
  }

  // Q10: Multi-Line Transactions - NO (excluded from Bronze)

  // Q11: Accounts Payable - NO (excluded from Bronze)

  // Q12: TPAR - NO (excluded from Bronze)

  // Q13: LSL Construction - NO (excluded from Bronze)

  // Q14: Accounts Receivable - Single Line AR Invoices - YES
  if (responses.q14 && responses.q14 !== 'no') {
    const ar = values.accountsReceivable.singleLineInvoices;

    switch (responses.q14) {
      case 'upTo10':
        total += ar.upTo10.ratePerInvoice * ar.upTo10.maxInvoices;
        break;
      case 'upTo20':
        total += ar.upTo20.ratePerInvoice * ar.upTo20.maxInvoices;
        break;
      case 'upTo50':
        total += ar.upTo50.ratePerInvoice * ar.upTo50.maxInvoices;
        break;
      case 'upTo75':
        total += ar.upTo75.ratePerInvoice * ar.upTo75.maxInvoices;
        break;
      case 'over75':
        total += ar.over75.ratePerInvoice * 75;
        if (responses.q14a) {
          const extraInvoices = parseInt(responses.q14a, 10) || 0;
          total += ar.over75.ratePerInvoice * extraInvoices;
        }
        break;
    }
  }

  // Q15: Multi-Line AR Invoices - NO (excluded from Bronze)

  // Q16: Debtor Management - NO (excluded from Bronze)

  // Q17: Financial Reporting - NO (excluded from Bronze)

  // Q18: Management Meetings - NO (excluded from Bronze)

  // Q19: BAS/IAS Compliance - BAS Quarterly only (YES), BAS Monthly (NO), IAS (NO)
  if (responses.q19 && typeof responses.q19 === 'object') {
    const cs = values.complianceServices;

    // Only BAS Quarterly is included in Bronze
    if (responses.q19.basQuarterly) {
      total += cs.basQuarterly.rate;
    }

    // BAS Monthly - NO (excluded from Bronze)
    // IAS - NO (excluded from Bronze)
  }

  // Q24: Payroll Tax Return - YES (included in Bronze)
  if (responses.q24 === 'yes') {
    const payrollTaxReturn = values.complianceServices.payrollTaxReturn;
    const lodgementCount = responses.q24a ? parseInt(responses.q24a, 10) || 1 : 1;
    total += payrollTaxReturn.rate * lodgementCount / 12;
  }

  // Q20: Support - Bronze adds Team/Email price when any support option selected
  if (responses.q20 && responses.q20 !== '' && responses.q20 !== 'no') {
    total += values.support.emailOnly.monthly;
  }

  // Q21: EOFY - Micro & Small only (YES), Medium & Large (NO)
  if (responses.q21 === 'microSmall') {
    const eofy = values.eofyProcess;
    total += eofy.microSmall.rate;
  }
  // Medium & Large excluded from Bronze

  // Q26: Ongoing Accounting Software Support and Training (monthly sessions)
  if (responses.q26 === 'yes' && responses.q26a && typeof responses.q26a === 'object') {
    const ast = values.accountingSoftwareSetupTraining;
    const sessions30 = parseInt(responses.q26a.sessions30min, 10) || 0;
    const sessions60 = parseInt(responses.q26a.sessions60min, 10) || 0;
    total += ast.ongoing30min.ratePerSession * sessions30;
    total += ast.ongoing60min.ratePerSession * sessions60;
  }

  // Q27: POS Integration (monthly) - multi-select
  if (responses.q27 && typeof responses.q27 === 'object') {
    const ast = values.accountingSoftwareSetupTraining;
    if (responses.q27.importReview) total += ast.posImportReview.monthly;
    if (responses.q27.monthlyReconciliation) total += ast.posReconciliation.monthly;
    if (responses.q27.monthlyDownloadRework) total += ast.posDownloadRework.monthly;
  }

  // Q28: Accounting Software Disbursement - pass-through monthly fee
  if (responses.q28 && responses.q28 !== 'no' && responses.q28 !== '') {
    const disbursementFee = parseFloat(responses.q28_price) || 0;
    if (disbursementFee > 0) total += disbursementFee;
  }

  // Q29: Other Disbursements - pass-through monthly fees
  if (Array.isArray(responses.q29)) {
    responses.q29.forEach((row) => {
      const fee = parseFloat(row && row.price) || 0;
      if (fee > 0) total += fee;
    });
  }

  return Math.round(total * multiplier * 100) / 100;
};

/**
 * Calculates Silver package pricing for bookkeeping
 * Silver is based on user selections but with:
 * 1. Client Service Manager always included (hard-coded for Silver)
 * 2. Financial Reporting uses Quarterly frequency (if selected)
 * 3. Management Meetings uses Quarterly frequency (if selected)
 * @param {Object} responses - Question responses from BookkeepingQuestions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 100)
 * @returns {number} Silver tier monthly cost
 */
const _calculateBookkeepingSilverPriceRaw = (responses, pricingModifier = 100) => {
  let total = 0;
  const values = serviceValuesBookkeeping;
  const multiplier = getPricingMultiplier(pricingModifier);

  // All services based on user selection (same as base calculation)

  // PAYROLL SERVICES
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q4 && typeof responses.q4 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q4;
    const salaried = values.payrollServices.salaried;

    const weeklyCount = parseInt(weekly, 10) || 0;
    if (weeklyCount > 0) {
      total += (salaried.weekly.ratePerEmployee * weeklyCount * salaried.weekly.frequency) / 12;
    }

    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    if (fortnightlyCount > 0) {
      total += (salaried.fortnightly.ratePerEmployee * fortnightlyCount * salaried.fortnightly.frequency) / 12;
    }

    const monthlyCount = parseInt(monthly, 10) || 0;
    if (monthlyCount > 0) {
      total += (salaried.monthly.ratePerEmployee * monthlyCount * salaried.monthly.frequency) / 12;
    }
  }

  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q5 && typeof responses.q5 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q5;
    const timesheet = values.payrollServices.timesheet;

    const weeklyCount = parseInt(weekly, 10) || 0;
    if (weeklyCount > 0) {
      total += (timesheet.weekly.ratePerEmployee * weeklyCount * timesheet.weekly.frequency) / 12;
    }

    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    if (fortnightlyCount > 0) {
      total += (timesheet.fortnightly.ratePerEmployee * fortnightlyCount * timesheet.fortnightly.frequency) / 12;
    }

    const monthlyCount = parseInt(monthly, 10) || 0;
    if (monthlyCount > 0) {
      total += (timesheet.monthly.ratePerEmployee * monthlyCount * timesheet.monthly.frequency) / 12;
    }
  }

  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q6 && responses.q6 !== 'no') {
    const superLodge = values.payrollServices.superLodgement;
    const employeeCount = parseInt(responses.q6a, 10) || 0;

    if (responses.q6 === 'weekly') {
      total += (superLodge.weekly.ratePerEmployee * employeeCount * superLodge.weekly.frequency) / 12;
    } else if (responses.q6 === 'fortnightly') {
      total += (superLodge.fortnightly.ratePerEmployee * employeeCount * superLodge.fortnightly.frequency) / 12;
    } else if (responses.q6 === 'quarterly') {
      total += (superLodge.quarterly.ratePerEmployee * employeeCount * superLodge.quarterly.frequency) / 12;
    } else if (responses.q6 === 'monthly') {
      total += (superLodge.monthly.ratePerEmployee * employeeCount * superLodge.monthly.frequency) / 12;
    }
  }

  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q7 && responses.q7 !== 'no') {
    const stp = values.payrollServices.stpReporting;
    const employeeCount = parseInt(responses.q7a, 10) || 0;

    if (responses.q7 === 'weekly') {
      total += (stp.weekly.ratePerEmployee * employeeCount * stp.weekly.frequency) / 12;
    } else if (responses.q7 === 'fortnightly') {
      total += (stp.fortnightly.ratePerEmployee * employeeCount * stp.fortnightly.frequency) / 12;
    } else if (responses.q7 === 'monthly') {
      total += (stp.monthly.ratePerEmployee * employeeCount * stp.monthly.frequency) / 12;
    }
  }

  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q8 === 'yes') {
    const workersComp = values.payrollServices.workersComp;
    const lodgementCount = responses.q8a ? parseInt(responses.q8a, 10) || 1 : 1;
    total += (workersComp.ratePerLodgement * lodgementCount * workersComp.frequency) / 12;
  }

  // BOOKKEEPING - TRANSACTIONS
  if (responses.q9 && responses.q9 !== 'no') {
    const transactions = values.bookkeepingServices.singleLineTransactions;
    
    switch (responses.q9) {
      case 'upTo50':
        total += transactions.upTo50.ratePerUnit * transactions.upTo50.maxUnits;
        break;
      case 'upTo100':
        total += transactions.upTo100.ratePerUnit * transactions.upTo100.maxUnits;
        break;
      case 'upTo200':
        total += transactions.upTo200.ratePerUnit * transactions.upTo200.maxUnits;
        break;
      case 'upTo400':
        total += transactions.upTo400.ratePerUnit * transactions.upTo400.maxUnits;
        break;
      case 'over400':
        total += transactions.upTo400.ratePerUnit * transactions.upTo400.maxUnits;
        if (responses.q9a) {
          const extraTransactions = parseInt(responses.q9a, 10) || 0;
          total += transactions.over400.ratePerUnit * extraTransactions;
        }
        break;
    }
  }

  if (responses.q10 && typeof responses.q10 === 'object') {
    const { invoices = '', avgLines = '' } = responses.q10;
    const invoiceCount = parseInt(invoices, 10) || 0;
    const avgLineCount = parseInt(avgLines, 10) || 0;
    
    if (invoiceCount > 0 && avgLineCount > 0) {
      total += values.bookkeepingServices.multiLineTransactions.ratePerLine * invoiceCount * avgLineCount;
    }
  }

  if (responses.q11 && responses.q11 !== 'no') {
    const ap = values.bookkeepingServices.accountsPayable;

    switch (responses.q11) {
      case 'upTo10':
        total += ap.upTo10.ratePerSupplier * ap.upTo10.maxSuppliers;
        break;
      case 'upTo20':
        total += ap.upTo20.ratePerSupplier * ap.upTo20.maxSuppliers;
        break;
      case 'upTo50':
        total += ap.upTo50.ratePerSupplier * ap.upTo50.maxSuppliers;
        break;
      case 'extra':
        total += ap.upTo50.ratePerSupplier * ap.upTo50.maxSuppliers;
        if (responses.q11a) {
          const extraSuppliers = parseInt(responses.q11a, 10) || 0;
          total += ap.extra.ratePerSupplier * extraSuppliers;
        }
        break;
    }
  }

  // COMPLIANCE LODGEMENTS
  if (responses.q12 === 'yes') {
    const tpar = values.complianceLodgements.tpar;
    const tparCount = responses.q12a ? parseInt(responses.q12a, 10) || 1 : 1;
    total += tpar.ratePerReport * tparCount;
  }

  if (responses.q13 === 'yes') {
    const lsl = values.complianceLodgements.lslConstruction;
    const lslCount = responses.q13a ? parseInt(responses.q13a, 10) || 1 : 1;
    total += lsl.ratePerLodgement * lslCount;
  }

  // ACCOUNTS RECEIVABLE
  if (responses.q14 && responses.q14 !== 'no') {
    const ar = values.accountsReceivable.singleLineInvoices;

    switch (responses.q14) {
      case 'upTo10':
        total += ar.upTo10.ratePerInvoice * ar.upTo10.maxInvoices;
        break;
      case 'upTo20':
        total += ar.upTo20.ratePerInvoice * ar.upTo20.maxInvoices;
        break;
      case 'upTo50':
        total += ar.upTo50.ratePerInvoice * ar.upTo50.maxInvoices;
        break;
      case 'upTo75':
        total += ar.upTo75.ratePerInvoice * ar.upTo75.maxInvoices;
        break;
      case 'over75':
        total += ar.over75.ratePerInvoice * 75;
        if (responses.q14a) {
          const extraInvoices = parseInt(responses.q14a, 10) || 0;
          total += ar.over75.ratePerInvoice * extraInvoices;
        }
        break;
    }
  }

  if (responses.q14 && responses.q14 !== 'no' && responses.q15 && typeof responses.q15 === 'object') {
    const { invoices = '', avgLines = '' } = responses.q15;
    const invoiceCount = parseInt(invoices, 10) || 0;
    const avgLineCount = parseInt(avgLines, 10) || 0;
    
    if (invoiceCount > 0 && avgLineCount > 0) {
      total += values.accountsReceivable.multiLineInvoices.ratePerLine * invoiceCount * avgLineCount;
    }
  }

  // Q16: Debtor Management (if selected)
  if (responses.q16 && responses.q16 !== 'no') {
    const dm = values.accountsReceivable.debtorManagement;

    switch (responses.q16) {
      case 'upTo10':
        total += dm.upTo10.ratePerDebtor * dm.upTo10.maxDebtors;
        break;
      case 'upTo20':
        total += dm.upTo20.ratePerDebtor * dm.upTo20.maxDebtors;
        break;
      case 'upTo50':
        total += dm.upTo50.ratePerDebtor * dm.upTo50.maxDebtors;
        break;
      case 'extra':
        total += dm.upTo50.ratePerDebtor * dm.upTo50.maxDebtors;
        if (responses.q16a) {
          const extraDebtors = parseInt(responses.q16a, 10) || 0;
          total += dm.extra.ratePerDebtor * extraDebtors;
        }
        break;
    }
  }

  // Q17: Financial Reporting - SILVER uses Quarterly (if selected)
  if (responses.q17 && responses.q17 !== 'no') {
    const fr = values.financialReporting;
    // Silver always uses quarterly rate when this service is selected
    total += fr.quarterly.rate;
  }

  // Q18: Management Meetings - SILVER uses Quarterly (if selected)
  if (responses.q18 && responses.q18 !== 'no') {
    const mm = values.managementMeetings;
    // Silver always uses quarterly rate when this service is selected
    total += mm.quarterly.rate;
  }

  // Q19: Compliance Services
  if (responses.q19 && typeof responses.q19 === 'object') {
    const cs = values.complianceServices;

    if (responses.q19.basQuarterly) {
      total += cs.basQuarterly.rate;
    }

    if (responses.q19.basMonthly) {
      total += cs.basMonthly.rate;
    }

    if (responses.q19.ias) {
      total += cs.ias.rate;
    }
  }

  // Q24: Payroll Tax Return - rate × units / 12
  if (responses.q24 === 'yes') {
    const payrollTaxReturn = values.complianceServices.payrollTaxReturn;
    const lodgementCount = responses.q24a ? parseInt(responses.q24a, 10) || 1 : 1;
    total += payrollTaxReturn.rate * lodgementCount / 12;
  }

  // Q20: Support - Silver adds CSM price when any support option selected
  if (responses.q20 && responses.q20 !== '' && responses.q20 !== 'no') {
    total += values.support.emailPhoneTeamCsm.monthly;
  }

  // Q21: EOFY
  if (responses.q21 && responses.q21 !== 'no') {
    const eofy = values.eofyProcess;

    if (responses.q21 === 'microSmall') {
      total += eofy.microSmall.rate;
    } else if (responses.q21 === 'mediumLarge') {
      total += eofy.mediumLarge.rate;
    }
  }

  // Q26: Ongoing Accounting Software Support and Training (monthly sessions)
  if (responses.q26 === 'yes' && responses.q26a && typeof responses.q26a === 'object') {
    const ast = values.accountingSoftwareSetupTraining;
    const sessions30 = parseInt(responses.q26a.sessions30min, 10) || 0;
    const sessions60 = parseInt(responses.q26a.sessions60min, 10) || 0;
    total += ast.ongoing30min.ratePerSession * sessions30;
    total += ast.ongoing60min.ratePerSession * sessions60;
  }

  // Q27: POS Integration (monthly) - multi-select
  if (responses.q27 && typeof responses.q27 === 'object') {
    const ast = values.accountingSoftwareSetupTraining;
    if (responses.q27.importReview) total += ast.posImportReview.monthly;
    if (responses.q27.monthlyReconciliation) total += ast.posReconciliation.monthly;
    if (responses.q27.monthlyDownloadRework) total += ast.posDownloadRework.monthly;
  }

  // Q28: Accounting Software Disbursement - pass-through monthly fee
  if (responses.q28 && responses.q28 !== 'no' && responses.q28 !== '') {
    const disbursementFee = parseFloat(responses.q28_price) || 0;
    if (disbursementFee > 0) total += disbursementFee;
  }

  // Q29: Other Disbursements - pass-through monthly fees
  if (Array.isArray(responses.q29)) {
    responses.q29.forEach((row) => {
      const fee = parseFloat(row && row.price) || 0;
      if (fee > 0) total += fee;
    });
  }

  return Math.round(total * multiplier * 100) / 100;
};

/**
 * Calculates Gold package pricing for bookkeeping
 * Gold is based on user selections but with:
 * 1. Principal/Owner support always included (hard-coded for Gold)
 * 2. Client Service Manager always included (hard-coded for Gold)
 * 3. Financial Reporting uses Monthly frequency (if selected)
 * 4. Management Meetings uses Monthly frequency (if selected)
 * @param {Object} responses - Question responses from BookkeepingQuestions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 100)
 * @returns {number} Gold tier monthly cost
 */
const _calculateBookkeepingGoldPriceRaw = (responses, pricingModifier = 100) => {
  let total = 0;
  const values = serviceValuesBookkeeping;
  const multiplier = getPricingMultiplier(pricingModifier);

  // All services based on user selection

  // PAYROLL SERVICES
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q4 && typeof responses.q4 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q4;
    const salaried = values.payrollServices.salaried;

    const weeklyCount = parseInt(weekly, 10) || 0;
    if (weeklyCount > 0) {
      total += (salaried.weekly.ratePerEmployee * weeklyCount * salaried.weekly.frequency) / 12;
    }

    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    if (fortnightlyCount > 0) {
      total += (salaried.fortnightly.ratePerEmployee * fortnightlyCount * salaried.fortnightly.frequency) / 12;
    }

    const monthlyCount = parseInt(monthly, 10) || 0;
    if (monthlyCount > 0) {
      total += (salaried.monthly.ratePerEmployee * monthlyCount * salaried.monthly.frequency) / 12;
    }
  }

  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q5 && typeof responses.q5 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q5;
    const timesheet = values.payrollServices.timesheet;

    const weeklyCount = parseInt(weekly, 10) || 0;
    if (weeklyCount > 0) {
      total += (timesheet.weekly.ratePerEmployee * weeklyCount * timesheet.weekly.frequency) / 12;
    }

    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    if (fortnightlyCount > 0) {
      total += (timesheet.fortnightly.ratePerEmployee * fortnightlyCount * timesheet.fortnightly.frequency) / 12;
    }

    const monthlyCount = parseInt(monthly, 10) || 0;
    if (monthlyCount > 0) {
      total += (timesheet.monthly.ratePerEmployee * monthlyCount * timesheet.monthly.frequency) / 12;
    }
  }

  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q6 && responses.q6 !== 'no') {
    const superLodge = values.payrollServices.superLodgement;
    const employeeCount = parseInt(responses.q6a, 10) || 0;

    if (responses.q6 === 'weekly') {
      total += (superLodge.weekly.ratePerEmployee * employeeCount * superLodge.weekly.frequency) / 12;
    } else if (responses.q6 === 'fortnightly') {
      total += (superLodge.fortnightly.ratePerEmployee * employeeCount * superLodge.fortnightly.frequency) / 12;
    } else if (responses.q6 === 'quarterly') {
      total += (superLodge.quarterly.ratePerEmployee * employeeCount * superLodge.quarterly.frequency) / 12;
    } else if (responses.q6 === 'monthly') {
      total += (superLodge.monthly.ratePerEmployee * employeeCount * superLodge.monthly.frequency) / 12;
    }
  }

  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q7 && responses.q7 !== 'no') {
    const stp = values.payrollServices.stpReporting;
    const employeeCount = parseInt(responses.q7a, 10) || 0;

    if (responses.q7 === 'weekly') {
      total += (stp.weekly.ratePerEmployee * employeeCount * stp.weekly.frequency) / 12;
    } else if (responses.q7 === 'fortnightly') {
      total += (stp.fortnightly.ratePerEmployee * employeeCount * stp.fortnightly.frequency) / 12;
    } else if (responses.q7 === 'monthly') {
      total += (stp.monthly.ratePerEmployee * employeeCount * stp.monthly.frequency) / 12;
    }
  }

  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q8 === 'yes') {
    const workersComp = values.payrollServices.workersComp;
    const lodgementCount = responses.q8a ? parseInt(responses.q8a, 10) || 1 : 1;
    total += (workersComp.ratePerLodgement * lodgementCount * workersComp.frequency) / 12;
  }

  // BOOKKEEPING - TRANSACTIONS
  if (responses.q9 && responses.q9 !== 'no') {
    const transactions = values.bookkeepingServices.singleLineTransactions;
    
    switch (responses.q9) {
      case 'upTo100':
        total += transactions.upTo100.ratePerUnit * transactions.upTo100.maxUnits;
        break;
      case 'upTo200':
        total += transactions.upTo200.ratePerUnit * transactions.upTo200.maxUnits;
        break;
      case 'upTo400':
        total += transactions.upTo400.ratePerUnit * transactions.upTo400.maxUnits;
        break;
      case 'over400':
        total += transactions.upTo400.ratePerUnit * transactions.upTo400.maxUnits;
        if (responses.q9a) {
          const extraTransactions = parseInt(responses.q9a, 10) || 0;
          total += transactions.over400.ratePerUnit * extraTransactions;
        }
        break;
    }
  }

  if (responses.q10 && typeof responses.q10 === 'object') {
    const { invoices = '', avgLines = '' } = responses.q10;
    const invoiceCount = parseInt(invoices, 10) || 0;
    const avgLineCount = parseInt(avgLines, 10) || 0;
    
    if (invoiceCount > 0 && avgLineCount > 0) {
      total += values.bookkeepingServices.multiLineTransactions.ratePerLine * invoiceCount * avgLineCount;
    }
  }

  if (responses.q11 && responses.q11 !== 'no') {
    const ap = values.bookkeepingServices.accountsPayable;

    switch (responses.q11) {
      case 'upTo10':
        total += ap.upTo10.ratePerSupplier * ap.upTo10.maxSuppliers;
        break;
      case 'upTo20':
        total += ap.upTo20.ratePerSupplier * ap.upTo20.maxSuppliers;
        break;
      case 'upTo50':
        total += ap.upTo50.ratePerSupplier * ap.upTo50.maxSuppliers;
        break;
      case 'extra':
        total += ap.upTo50.ratePerSupplier * ap.upTo50.maxSuppliers;
        if (responses.q11a) {
          const extraSuppliers = parseInt(responses.q11a, 10) || 0;
          total += ap.extra.ratePerSupplier * extraSuppliers;
        }
        break;
    }
  }

  // COMPLIANCE LODGEMENTS
  if (responses.q12 === 'yes') {
    const tpar = values.complianceLodgements.tpar;
    const tparCount = responses.q12a ? parseInt(responses.q12a, 10) || 1 : 1;
    total += tpar.ratePerReport * tparCount;
  }

  if (responses.q13 === 'yes') {
    const lsl = values.complianceLodgements.lslConstruction;
    const lslCount = responses.q13a ? parseInt(responses.q13a, 10) || 1 : 1;
    total += lsl.ratePerLodgement * lslCount;
  }

  // ACCOUNTS RECEIVABLE
  if (responses.q14 && responses.q14 !== 'no') {
    const ar = values.accountsReceivable.singleLineInvoices;

    switch (responses.q14) {
      case 'upTo20':
        total += ar.upTo20.ratePerInvoice * ar.upTo20.maxInvoices;
        break;
      case 'upTo50':
        total += ar.upTo50.ratePerInvoice * ar.upTo50.maxInvoices;
        break;
      case 'upTo75':
        total += ar.upTo75.ratePerInvoice * ar.upTo75.maxInvoices;
        break;
      case 'over75':
        total += ar.over75.ratePerInvoice * 75;
        if (responses.q14a) {
          const extraInvoices = parseInt(responses.q14a, 10) || 0;
          total += ar.over75.ratePerInvoice * extraInvoices;
        }
        break;
    }
  }

  if (responses.q14 && responses.q14 !== 'no' && responses.q15 && typeof responses.q15 === 'object') {
    const { invoices = '', avgLines = '' } = responses.q15;
    const invoiceCount = parseInt(invoices, 10) || 0;
    const avgLineCount = parseInt(avgLines, 10) || 0;
    
    if (invoiceCount > 0 && avgLineCount > 0) {
      total += values.accountsReceivable.multiLineInvoices.ratePerLine * invoiceCount * avgLineCount;
    }
  }

  // Q16: Debtor Management (if selected)
  if (responses.q16 && responses.q16 !== 'no') {
    const dm = values.accountsReceivable.debtorManagement;

    switch (responses.q16) {
      case 'upTo10':
        total += dm.upTo10.ratePerDebtor * dm.upTo10.maxDebtors;
        break;
      case 'upTo20':
        total += dm.upTo20.ratePerDebtor * dm.upTo20.maxDebtors;
        break;
      case 'upTo50':
        total += dm.upTo50.ratePerDebtor * dm.upTo50.maxDebtors;
        break;
      case 'extra':
        total += dm.upTo50.ratePerDebtor * dm.upTo50.maxDebtors;
        if (responses.q16a) {
          const extraDebtors = parseInt(responses.q16a, 10) || 0;
          total += dm.extra.ratePerDebtor * extraDebtors;
        }
        break;
    }
  }

  // Q17: Financial Reporting - GOLD uses Monthly (if selected)
  if (responses.q17 && responses.q17 !== 'no') {
    const fr = values.financialReporting;
    // Gold always uses monthly rate when this service is selected
    total += fr.monthly.rate;
  }

  // Q18: Management Meetings - GOLD uses Monthly (if selected)
  if (responses.q18 && responses.q18 !== 'no') {
    const mm = values.managementMeetings;
    // Gold always uses monthly rate when this service is selected
    total += mm.monthly.rate;
  }

  // Q19: Compliance Services
  if (responses.q19 && typeof responses.q19 === 'object') {
    const cs = values.complianceServices;

    if (responses.q19.basQuarterly) {
      total += cs.basQuarterly.rate;
    }

    if (responses.q19.basMonthly) {
      total += cs.basMonthly.rate;
    }

    if (responses.q19.ias) {
      total += cs.ias.rate;
    }
  }

  // Q24: Payroll Tax Return - rate × units / 12
  if (responses.q24 === 'yes') {
    const payrollTaxReturn = values.complianceServices.payrollTaxReturn;
    const lodgementCount = responses.q24a ? parseInt(responses.q24a, 10) || 1 : 1;
    total += payrollTaxReturn.rate * lodgementCount / 12;
  }

  // Q20: Support - Gold adds Owner/Partner price when any support option selected
  if (responses.q20 && responses.q20 !== '' && responses.q20 !== 'no') {
    total += values.support.emailPhoneCsmOwner.monthly;
  }

  // Q21: EOFY
  if (responses.q21 && responses.q21 !== 'no') {
    const eofy = values.eofyProcess;

    if (responses.q21 === 'microSmall') {
      total += eofy.microSmall.rate;
    } else if (responses.q21 === 'mediumLarge') {
      total += eofy.mediumLarge.rate;
    }
  }

  // Q26: Ongoing Accounting Software Support and Training (monthly sessions)
  if (responses.q26 === 'yes' && responses.q26a && typeof responses.q26a === 'object') {
    const ast = values.accountingSoftwareSetupTraining;
    const sessions30 = parseInt(responses.q26a.sessions30min, 10) || 0;
    const sessions60 = parseInt(responses.q26a.sessions60min, 10) || 0;
    total += ast.ongoing30min.ratePerSession * sessions30;
    total += ast.ongoing60min.ratePerSession * sessions60;
  }

  // Q27: POS Integration (monthly) - multi-select
  if (responses.q27 && typeof responses.q27 === 'object') {
    const ast = values.accountingSoftwareSetupTraining;
    if (responses.q27.importReview) total += ast.posImportReview.monthly;
    if (responses.q27.monthlyReconciliation) total += ast.posReconciliation.monthly;
    if (responses.q27.monthlyDownloadRework) total += ast.posDownloadRework.monthly;
  }

  // Q28: Accounting Software Disbursement - pass-through monthly fee
  if (responses.q28 && responses.q28 !== 'no' && responses.q28 !== '') {
    const disbursementFee = parseFloat(responses.q28_price) || 0;
    if (disbursementFee > 0) total += disbursementFee;
  }

  // Q29: Other Disbursements - pass-through monthly fees
  if (Array.isArray(responses.q29)) {
    responses.q29.forEach((row) => {
      const fee = parseFloat(row && row.price) || 0;
      if (fee > 0) total += fee;
    });
  }

  return Math.round(total * multiplier * 100) / 100;
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-question override system
//
// Bookkeeping's calculator is large and interleaved, so instead of tagging
// every `total += X` line with a question ID, we compute per-question
// contributions via a diff strategy: run the raw calculator once with the
// question's response fields cleared and take the delta from the baseline.
//
// A "question's fields" are: the key itself AND any keys starting with `${qId}_`.
// This safely clears q3 + q3_setup + q3_price without touching q30.
// ─────────────────────────────────────────────────────────────────────────────
const clearQuestionFields = (responses, questionId) => {
  if (!responses || !questionId) return responses;
  const cleared = { ...responses };
  const prefix = `${questionId}_`;
  Object.keys(cleared).forEach((k) => {
    // A key belongs to this question if it exactly matches the ID, starts
    // with `${qId}_` (e.g. q3_setup, q3_price), or starts with `${qId}`
    // followed by a letter (e.g. q3a, q6a, q25b). The letter-follow rule
    // catches sub-question IDs used in bookkeeping/accounting question
    // trees while still keeping q3 distinct from q30/q31.
    const isOwnedByQuestion =
      k === questionId
      || k.startsWith(prefix)
      || (k.length > questionId.length
          && k.startsWith(questionId)
          && /[a-zA-Z]/.test(k.charAt(questionId.length)));
    if (isOwnedByQuestion) {
      cleared[k] = Array.isArray(cleared[k]) ? [] : typeof cleared[k] === 'object' && cleared[k] !== null ? {} : '';
    }
  });
  return cleared;
};

const diffContribution = (rawFn, responses, pricingModifier, questionId) => {
  const baseline = rawFn(responses, pricingModifier);
  const withoutQ = rawFn(clearQuestionFields(responses, questionId), pricingModifier);
  const delta = baseline - withoutQ;
  return Math.round(delta * 100) / 100;
};

const applyBookkeepingOverrides = (rawFn, responses, pricingModifier, kind) => {
  const baseTotal = rawFn(responses, pricingModifier);
  const overrides = responses?._priceOverrides?.[kind] || {};
  const overrideIds = Object.keys(overrides);
  if (overrideIds.length === 0) return baseTotal;

  // Build a per-question contributions map for this tier via diff.
  const contribs = {};
  overrideIds.forEach((qId) => {
    contribs[qId] = diffContribution(rawFn, responses, pricingModifier, qId);
  });
  return applyPriceOverrides(baseTotal, contribs, responses, kind);
};

// Public wrappers ────────────────────────────────────────────────────────────
export const calculateBookkeepingBronzePrice = (responses, pricingModifier = 100) =>
  applyBookkeepingOverrides(_calculateBookkeepingBronzePriceRaw, responses, pricingModifier, 'monthly');

export const calculateBookkeepingSilverPrice = (responses, pricingModifier = 100) =>
  applyBookkeepingOverrides(_calculateBookkeepingSilverPriceRaw, responses, pricingModifier, 'monthly');

export const calculateBookkeepingGoldPrice = (responses, pricingModifier = 100) =>
  applyBookkeepingOverrides(_calculateBookkeepingGoldPriceRaw, responses, pricingModifier, 'monthly');

export const calculateBookkeepingOnceOffFee = (responses, pricingModifier = 100) =>
  applyBookkeepingOverrides(_calculateBookkeepingOnceOffFeeRaw, responses, pricingModifier, 'onceOff');

// Per-question monthly contribution for the questions-page UI. Uses the Silver
// tier as the primary tier for display; if Silver contributes nothing (e.g.
// question is Bronze-only or Gold-only), falls back to whichever tier has
// the largest non-zero contribution.
export const getBookkeepingQuestionMonthlyContribution = (questionId, responses, pricingModifier = 100) => {
  if (!questionId) return 0;
  const silver = diffContribution(_calculateBookkeepingSilverPriceRaw, responses, pricingModifier, questionId);
  if (silver > 0) return silver;
  const gold = diffContribution(_calculateBookkeepingGoldPriceRaw, responses, pricingModifier, questionId);
  if (gold > 0) return gold;
  const bronze = diffContribution(_calculateBookkeepingBronzePriceRaw, responses, pricingModifier, questionId);
  return Math.max(0, bronze);
};

export const getBookkeepingQuestionOnceOffContribution = (questionId, responses, pricingModifier = 100) => {
  if (!questionId) return 0;
  return Math.max(0, diffContribution(_calculateBookkeepingOnceOffFeeRaw, responses, pricingModifier, questionId));
};
