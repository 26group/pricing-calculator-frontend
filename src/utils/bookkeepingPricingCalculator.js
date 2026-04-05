import { serviceValuesBookkeeping } from '../constants/bookkeepingServicesValues';

// Base pricing modifier value for bookkeeping (center of slider: $100/hr)
const BASE_PRICING_MODIFIER = 100;

/**
 * Calculates the pricing multiplier based on the bookkeeping pricing modifier
 * @param {number} pricingModifier - The bookkeeping pricing modifier value (default 100)
 * @returns {number} The multiplier to apply to prices
 */
const getPricingMultiplier = (pricingModifier) => {
  if (pricingModifier === undefined || pricingModifier === null) {
    return 1; // No adjustment
  }
  return pricingModifier / BASE_PRICING_MODIFIER;
};

/**
 * Calculates total monthly pricing based on bookkeeping question responses
 * Based on Bookkeeping Pricing Calculator v4 CSV structure
 * @param {Object} responses - Question responses from BookkeepingQuestions.js
 * @param {number} pricingModifier - Optional bookkeeping pricing modifier from organisation (default 100)
 * @returns {number} Total monthly cost
 */
export const calculateBookkeepingMonthlyPrice = (responses, pricingModifier = 100) => {
  let total = 0;
  const multiplier = getPricingMultiplier(pricingModifier);

  console.log('calculateBookkeepingMonthlyPrice called with responses:', responses, 'pricingModifier:', pricingModifier, 'multiplier:', multiplier);

  // Helper function to get segment for service lookup
  const getSegment = (originalSegment) => {
    if (['micro', 'small', 'medium', 'large'].includes(originalSegment)) {
      return originalSegment;
    }
    if (originalSegment === 'enterprise') {
      return 'large'; // Treat enterprise as Large
    }
    return 'micro'; // Default to micro if unknown
  };

  const segment = getSegment(responses.q1);

  // Q1: Revenue segment - used for lookups (micro, small, medium, large, enterprise)
  // No direct pricing, but affects other question pricing tiers

  // Q2: Accounting system in place
  // q2 = 'no' triggers once-off setup fee (handled in once-off calculation)
  // No monthly fee for setup

  // Q3: Run payroll?
  // q3 = 'yesSetup' triggers once-off payroll setup fee (handled in once-off calculation)
  // Payroll processing fees calculated in Q4 and Q5

  // Q4: Salaried employees - Monthly calculation based on CSV formula
  // Formula: rate × # employees × runs/year ÷ 12
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q4 && typeof responses.q4 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q4;
    const weeklyCount = parseInt(weekly, 10) || 0;
    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    const monthlyCount = parseInt(monthly, 10) || 0;

    const payroll = serviceValuesBookkeeping.payrollServices;

    // Weekly salaried: rate × employees × 52 ÷ 12
    if (weeklyCount > 0 && payroll.salariedWeekly) {
      total += (payroll.salariedWeekly.perEmployeePerRun * weeklyCount * payroll.salariedWeekly.runsPerYear) / 12;
    }
    // Fortnightly salaried: rate × employees × 26 ÷ 12
    if (fortnightlyCount > 0 && payroll.salariedFortnightly) {
      total += (payroll.salariedFortnightly.perEmployeePerRun * fortnightlyCount * payroll.salariedFortnightly.runsPerYear) / 12;
    }
    // Monthly salaried: rate × employees × 12 ÷ 12
    if (monthlyCount > 0 && payroll.salariedMonthly) {
      total += (payroll.salariedMonthly.perEmployeePerRun * monthlyCount * payroll.salariedMonthly.runsPerYear) / 12;
    }
  }

  // Q5: Timesheet employees - Monthly calculation based on CSV formula
  if ((responses.q3 === 'yes' || responses.q3 === 'yesSetup') && responses.q5 && typeof responses.q5 === 'object') {
    const { weekly = '', fortnightly = '', monthly = '' } = responses.q5;
    const weeklyCount = parseInt(weekly, 10) || 0;
    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    const monthlyCount = parseInt(monthly, 10) || 0;

    const payroll = serviceValuesBookkeeping.payrollServices;

    // Weekly timesheet: rate × employees × 52 ÷ 12
    if (weeklyCount > 0 && payroll.timesheetWeekly) {
      total += (payroll.timesheetWeekly.perEmployeePerRun * weeklyCount * payroll.timesheetWeekly.runsPerYear) / 12;
    }
    // Fortnightly timesheet: rate × employees × 26 ÷ 12
    if (fortnightlyCount > 0 && payroll.timesheetFortnightly) {
      total += (payroll.timesheetFortnightly.perEmployeePerRun * fortnightlyCount * payroll.timesheetFortnightly.runsPerYear) / 12;
    }
    // Monthly timesheet: rate × employees × 12 ÷ 12
    if (monthlyCount > 0 && payroll.timesheetMonthly) {
      total += (payroll.timesheetMonthly.perEmployeePerRun * monthlyCount * payroll.timesheetMonthly.runsPerYear) / 12;
    }
  }

  // Q6: Transactions per month
  const bookkeeping = serviceValuesBookkeeping.bookkeepingServices;
  if (responses.q6) {
    switch (responses.q6) {
      case 'under100':
        if (bookkeeping.under100Transactions) {
          total += bookkeeping.under100Transactions.monthly;
        }
        break;
      case '101to200':
        if (bookkeeping.transactions101to200) {
          total += bookkeeping.transactions101to200.monthly;
        }
        break;
      case '201to400':
        if (bookkeeping.transactions201to400) {
          total += bookkeeping.transactions201to400.monthly;
        }
        break;
      case 'over400':
        // For 400+ transactions, calculate per-transaction rate × volume ÷ 12
        if (responses.q6a && bookkeeping.transactionsOver400) {
          const transactionCount = parseInt(responses.q6a, 10) || 400;
          total += (bookkeeping.transactionsOver400.perTransaction * transactionCount) / 12;
        } else if (bookkeeping.transactionsOver400) {
          // Default to 400 transactions if no count specified
          total += (bookkeeping.transactionsOver400.perTransaction * 400) / 12;
        }
        break;
      default:
        break;
    }
  }

  // Q7: Accounts Payable (Payables) management
  const payables = serviceValuesBookkeeping.accountsPayable;
  if (responses.q7 && responses.q7 !== 'no') {
    if (responses.q7 === 'under20' && payables.under20SingleLine) {
      total += payables.under20SingleLine.monthly;
    } else if (responses.q7 === '20to50' && payables.under50SingleLine) {
      total += payables.under50SingleLine.monthly;
      // Add extra transactions if specified
      if (responses.q7a && payables.extraTransaction) {
        const extraCount = parseInt(responses.q7a, 10) || 0;
        total += payables.extraTransaction.each * extraCount;
      }
    }
    // Add multi-line invoice extra lines
    if (responses.q7b && payables.extraMultiLine) {
      const extraLines = parseInt(responses.q7b, 10) || 0;
      total += payables.extraMultiLine.each * extraLines;
    }
  }

  // Q8: TPAR - yearly fee divided by 12 for monthly
  // Handled in once-off calculation (yearly report)

  // Q9: Accounts Receivable (Receivables) management
  const receivables = serviceValuesBookkeeping.accountsReceivable;
  if (responses.q9 && responses.q9 !== 'no') {
    if (responses.q9 === 'under20' && receivables.under20SingleLine) {
      total += receivables.under20SingleLine.monthly;
    } else if (responses.q9 === '20to50' && receivables.under50SingleLine) {
      total += receivables.under50SingleLine.monthly;
      // Add extra transactions if specified
      if (responses.q9a && receivables.extraTransaction) {
        const extraCount = parseInt(responses.q9a, 10) || 0;
        total += receivables.extraTransaction.each * extraCount;
      }
    }
    // Add multi-line invoice extra lines
    if (responses.q9b && receivables.extraMultiLine) {
      const extraLines = parseInt(responses.q9b, 10) || 0;
      total += receivables.extraMultiLine.each * extraLines;
    }
    // Add debtor management
    if (responses.q9c && receivables.debtorManagement) {
      const debtorCount = parseInt(responses.q9c, 10) || 0;
      total += receivables.debtorManagement.each * debtorCount;
    }
  }

  // Q10: Financial Reporting (Management Reports)
  const reports = serviceValuesBookkeeping.managementReports;
  if (responses.q10 && responses.q10 !== 'no') {
    if (responses.q10 === 'monthly' && reports.monthly) {
      total += reports.monthly.monthly;
    } else if (responses.q10 === 'quarterly' && reports.quarterly) {
      total += reports.quarterly.monthly;
    }
  }

  // Q11: Management Meetings
  const meetings = serviceValuesBookkeeping.managementMeetings;
  if (responses.q11 && responses.q11 !== 'no') {
    if (responses.q11 === 'monthly' && meetings.monthly) {
      total += meetings.monthly.monthly;
    } else if (responses.q11 === 'quarterly' && meetings.quarterly) {
      total += meetings.quarterly.monthly;
    }
  }

  // Q12: Compliance Lodgement Services (BAS/IAS) - now checkbox, can select multiple
  const compliance = serviceValuesBookkeeping.complianceServices;
  if (responses.q12 && typeof responses.q12 === 'object') {
    // BAS Quarterly - tiered by revenue segment
    if (responses.q12.basQuarterly && compliance.basQuarterly) {
      const basQuarterly = compliance.basQuarterly[segment];
      if (basQuarterly) {
        total += basQuarterly.monthly;
      }
    }
    // BAS Monthly
    if (responses.q12.basMonthly && compliance.basMonthly) {
      total += compliance.basMonthly.monthly;
    }
    // IAS Monthly
    if (responses.q12.iasMonthly && compliance.iasMonthly) {
      total += compliance.iasMonthly.monthly;
    }
  } else if (responses.q12 && typeof responses.q12 === 'string') {
    // Legacy single-select support
    if (responses.q12 === 'basQuarterly' && compliance.basQuarterly) {
      const basQuarterly = compliance.basQuarterly[segment];
      if (basQuarterly) {
        total += basQuarterly.monthly;
      }
    } else if (responses.q12 === 'basMonthly' && compliance.basMonthly) {
      total += compliance.basMonthly.monthly;
    } else if (responses.q12 === 'iasMonthly' && compliance.iasMonthly) {
      total += compliance.iasMonthly.monthly;
    }
  }

  // Q13: Support Level
  const support = serviceValuesBookkeeping.support;
  if (responses.q13) {
    if (responses.q13 === 'emailOnly' && support.emailOnly) {
      total += support.emailOnly.monthly;
    } else if (responses.q13 === 'emailPhoneTeamCsm' && support.emailPhoneTeamCsm) {
      total += support.emailPhoneTeamCsm.monthly;
    } else if (responses.q13 === 'emailPhoneCsmOwner' && support.emailPhoneCsmOwner) {
      total += support.emailPhoneCsmOwner.monthly;
    }
  }

  // Q14: EOFY Process & Workpapers
  const eofy = serviceValuesBookkeeping.eofy;
  if (responses.q14 && responses.q14 !== 'no') {
    if (responses.q14 === 'microSmall' && eofy.microSmall) {
      total += eofy.microSmall.monthly;
    } else if (responses.q14 === 'mediumLarge' && eofy.mediumLarge) {
      total += eofy.mediumLarge.monthly;
    }
  }

  // Q15: Cleanup work - once-off, handled in once-off calculation

  console.log('calculateBookkeepingMonthlyPrice total (before multiplier):', total, 'multiplier:', multiplier);
  const adjustedTotal = Math.round(total * multiplier * 100) / 100;
  console.log('calculateBookkeepingMonthlyPrice returning:', adjustedTotal);
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

  console.log('calculateBookkeepingOnceOffFee called with responses:', responses);

  const setup = serviceValuesBookkeeping.setupServices;
  const additional = serviceValuesBookkeeping.additionalServices;

  // Q2: Accounting system setup (once-off)
  if (responses.q2 === 'no' && setup.accountingSoftwareSetup) {
    total += setup.accountingSoftwareSetup.onceOff;
  }

  // Q3: Payroll system setup (once-off per employee)
  if (responses.q3 === 'yesSetup' && responses.q3a && setup.payrollSetupPerEmployee) {
    const employeeCount = parseInt(responses.q3a, 10) || 0;
    total += setup.payrollSetupPerEmployee.onceOff * employeeCount;
  }

  // Q8: TPAR - yearly per report
  const tpar = serviceValuesBookkeeping.tpar;
  if (responses.q8 === 'yes' && responses.q8a && tpar.perReport) {
    const reportCount = parseInt(responses.q8a, 10) || 0;
    total += tpar.perReport.yearly * reportCount;
  }

  // Q15: Cleanup/Rescue work - total monthly package × number of months
  if (responses.q15 === 'yes' && responses.q15a) {
    const monthsCount = parseInt(responses.q15a, 10) || 0;
    if (monthsCount > 0) {
      // Calculate the monthly total to use as base for cleanup
      const monthlyTotal = calculateBookkeepingMonthlyPrice(responses, 100); // Use base rate for cleanup calculation
      total += monthlyTotal * monthsCount;
    }
  }

  console.log('calculateBookkeepingOnceOffFee total (before multiplier):', total, 'multiplier:', multiplier);
  const adjustedTotal = Math.round(total * multiplier * 100) / 100;
  console.log('calculateBookkeepingOnceOffFee returning:', adjustedTotal);
  return adjustedTotal;
};
