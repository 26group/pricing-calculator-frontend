import { serviceValuesBookkeeping } from '../constants/bookkeepingServicesValues';

// Base pricing modifier value for bookkeeping (center of slider: $100/hr)
const BASE_PRICING_MODIFIER = 100;

/**
 * Calculates the pricing multiplier based on the bookkeeping pricing modifier
 * Default multiplier from CSV is 1.2x
 * @param {number} pricingModifier - The bookkeeping pricing modifier value (default 100)
 * @returns {number} The multiplier to apply to prices
 */
const getPricingMultiplier = (pricingModifier) => {
  if (pricingModifier === undefined || pricingModifier === null) {
    return 1.2; // Default multiplier from CSV
  }
  return (pricingModifier / BASE_PRICING_MODIFIER) * 1.2;
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
 * @param {number} pricingModifier - Optional bookkeeping pricing modifier from organisation (default 100)
 * @returns {number} Total monthly cost
 */
export const calculateBookkeepingMonthlyPrice = (responses, pricingModifier = 100) => {
  let total = 0;
  const multiplier = getPricingMultiplier(pricingModifier);
  const values = serviceValuesBookkeeping;

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
    const employeeCount = getTotalEmployeeCount(responses);

    if (responses.q6 === 'quarterly') {
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
    const employeeCount = getTotalEmployeeCount(responses);

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

  // Q8: Workers Compensation - $150 × 1 / 12 (yearly converted to monthly)
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q8 === 'yes') {
    const workersComp = values.payrollServices.workersComp;
    total += (workersComp.ratePerLodgement * workersComp.frequency) / 12;
  }

  // ========================================
  // Q9-11: BOOKKEEPING - TRANSACTIONS & PAYABLES
  // ========================================

  // Q9: Single Line Bank & Credit Card Transactions
  if (responses.q9) {
    const transactions = values.bookkeepingServices.singleLineTransactions;
    
    switch (responses.q9) {
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
        // 400+: Base 400 at $1.10 + extra transactions at $1.10
        total += transactions.over400.ratePerUnit * 400;
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

  // Q12: TPAR - $15 × 1 / 12
  if (responses.q12 === 'yes') {
    const tpar = values.complianceLodgements.tpar;
    total += (tpar.ratePerReport * tpar.frequency) / 12;
  }

  // Q13: LSL Construction - $200 × 1 / 12
  if (responses.q13 === 'yes') {
    const lsl = values.complianceLodgements.lslConstruction;
    total += (lsl.ratePerLodgement * lsl.frequency) / 12;
  }

  // ========================================
  // Q14-16: ACCOUNTS RECEIVABLE
  // ========================================

  // Q14: Single Line AR Invoices
  if (responses.q14 && responses.q14 !== 'no') {
    const ar = values.accountsReceivable.singleLineInvoices;

    switch (responses.q14) {
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

  // Q17: Financial Reporting - Rate × Frequency / 12
  if (responses.q17 && responses.q17 !== 'no') {
    const fr = values.financialReporting;

    if (responses.q17 === 'monthly') {
      // $60 × 12 / 12
      total += (fr.monthly.rate * fr.monthly.frequency) / 12;
    } else if (responses.q17 === 'quarterly') {
      // $90 × 4 / 12
      total += (fr.quarterly.rate * fr.quarterly.frequency) / 12;
    }
  }

  // Q18: Management Meetings - Rate × Frequency / 12
  if (responses.q18 && responses.q18 !== 'no') {
    const mm = values.managementMeetings;

    if (responses.q18 === 'monthly') {
      // $200 × 12 / 12
      total += (mm.monthly.rate * mm.monthly.frequency) / 12;
    } else if (responses.q18 === 'quarterly') {
      // $250 × 4 / 12
      total += (mm.quarterly.rate * mm.quarterly.frequency) / 12;
    }
  }

  // ========================================
  // Q19: COMPLIANCE SERVICES (BAS/IAS)
  // ========================================
  if (responses.q19 && typeof responses.q19 === 'object') {
    const cs = values.complianceServices;

    // BAS Quarterly: $150 × 4 / 12
    if (responses.q19.basQuarterly) {
      total += (cs.basQuarterly.rate * cs.basQuarterly.frequency) / 12;
    }

    // BAS Monthly: $100 × 12 / 12
    if (responses.q19.basMonthly) {
      total += (cs.basMonthly.rate * cs.basMonthly.frequency) / 12;
    }

    // IAS: $80 × 8 / 12
    if (responses.q19.ias) {
      total += (cs.ias.rate * cs.ias.frequency) / 12;
    }
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
  // Q21: EOFY (annual, converted to monthly)
  // ========================================
  if (responses.q21 && responses.q21 !== 'no') {
    const eofy = values.eofyProcess;

    if (responses.q21 === 'microSmall') {
      // $495 / 12 = ~$41.25/month (using provided monthly value)
      total += eofy.microSmall.monthly;
    } else if (responses.q21 === 'mediumLarge') {
      // $895 / 12 = ~$74.58/month (using provided monthly value)
      total += eofy.mediumLarge.monthly;
    }
  }

  // Q22: Rescue/Cleanup - once-off, handled separately
  // Q23: Additional Services - once-off, handled separately

  // Apply multiplier and round to 2 decimal places
  const adjustedTotal = Math.round(total * multiplier * 100) / 100;
  return adjustedTotal;
};

/**
 * Calculates total once-off fee based on bookkeeping question responses
 * @param {Object} responses - Question responses from BookkeepingQuestions.js
 * @param {number} pricingModifier - Optional bookkeeping pricing modifier from organisation (default 100)
 * @returns {number} Total once-off fee
 */
export const calculateBookkeepingOnceOffFee = (responses, pricingModifier = 100) => {
  let total = 0;
  const multiplier = getPricingMultiplier(pricingModifier);
  const values = serviceValuesBookkeeping;

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
      // Calculate monthly total at base rate for cleanup
      const monthlyTotal = calculateBookkeepingMonthlyPrice(responses, 100);
      total += monthlyTotal * monthsCount;
    }
  }

  // Q23: Additional Once-Off Services
  if (responses.q23 && typeof responses.q23 === 'object') {
    const additional = values.additionalServices;

    // Accounting Software Setup - $1000
    if (responses.q23.accountingSoftwareSetup) {
      total += additional.accountingSoftwareSetup.onceOff;
    }

    // 1 × Online Training - $99
    if (responses.q23.onlineTraining1Session) {
      total += additional.onlineTraining1Session.onceOff;
    }

    // 3 × Online Training - $250
    if (responses.q23.onlineTraining3Sessions) {
      total += additional.onlineTraining3Sessions.onceOff;
    }
  }

  // Apply multiplier and round to 2 decimal places
  const adjustedTotal = Math.round(total * multiplier * 100) / 100;
  return adjustedTotal;
};
