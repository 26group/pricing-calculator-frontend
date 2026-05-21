import { serviceValuesAccounting } from '../constants/accountingServicesValues';

// Base pricing modifier value (center of slider)
const BASE_PRICING_MODIFIER = 200;

/**
 * Calculates the pricing multiplier based on the pricing modifier
 * @param {number} pricingModifier - The pricing modifier value (default 200)
 * @returns {number} The multiplier to apply to prices
 */
const getPricingMultiplier = (pricingModifier) => {
  if (pricingModifier === undefined || pricingModifier === null) {
    return 1; // No adjustment
  }
  return pricingModifier / BASE_PRICING_MODIFIER;
};

/**
 * Calculates Bronze package pricing
 * Bronze includes: Tax Services (no SMSF/FBT), Payroll (no Payroll Tax), 
 * Xero Training, Financial Statements for Tax, Team/Email Support, Corporate Secretarial
 * @param {Object} responses - Question responses from Questions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 200)
 * @returns {number} Bronze tier monthly cost
 */
export const calculateComplianceOnlyPrice = (responses, pricingModifier = 200) => {
  let total = 0;
  const multiplier = getPricingMultiplier(pricingModifier);

  // Helper function to get segment for service lookup
  const getSegment = (originalSegment) => {
    if (['micro', 'small', 'medium', 'large'].includes(originalSegment)) {
      return originalSegment;
    }
    if (originalSegment === 'enterprise') {
      return 'large';
    }
    return null;
  };

  const segment = getSegment(responses.q1);

  // ==================== TAX SERVICES (Bronze: YES for Individual, Business, BAS, IAS, TPAR) ====================
  
  // q2: Number of individual returns - YES in Bronze
  if (responses.q2 && responses.q2 !== '') {
    const individualCount = parseInt(responses.q2, 10);
    if (!isNaN(individualCount) && individualCount > 0) {
      const individualReturn = serviceValuesAccounting.taxServices.individualReturns.all;
      if (individualReturn) {
        total += individualReturn.monthly * individualCount;
      }
    }
  }

  // q2b: Individual return extras (per-item summary toggle)
  if (responses.q2b && typeof responses.q2b === 'object') {
    const extras = serviceValuesAccounting.taxServices.individualReturnExtras;

    Object.entries(responses.q2b).forEach(([extraKey, value]) => {
      if (extraKey === 'none' || extraKey === 'returnNotNecessary' || !value) return;

      const extraPricing = extras[extraKey];
      if (!extraPricing) return;

      const isSummaryShape = typeof value === 'object' && value !== null && 'count' in value;
      const rawCount = isSummaryShape ? value.count : value;
      const summaryType = isSummaryShape ? value.summary : null;

      const pricingTier = extraPricing.all || (summaryType && extraPricing[summaryType]);
      if (!pricingTier) return;

      if (typeof rawCount === 'boolean' && rawCount === true) {
        total += pricingTier.monthly;
      } else {
        const quantity = parseInt(rawCount, 10);
        if (!isNaN(quantity) && quantity > 0) {
          total += pricingTier.monthly * quantity;
        }
      }
    });
  }

  // q3: Number of business entities - YES in Bronze
  if (responses.q3 && responses.q3 !== '' && segment) {
    const businessCount = parseInt(responses.q3, 10);
    if (!isNaN(businessCount) && businessCount > 0) {
      const businessReturn = serviceValuesAccounting.taxServices.businessReturns[segment];
      if (businessReturn) {
        total += businessReturn.monthly * businessCount;
      }
    }
  }

  // q3b: Number of NON trading business entities - YES in Bronze
  if (responses.q3b && responses.q3b !== '' && segment) {
    const nonTradingCount = parseInt(responses.q3b, 10);
    if (!isNaN(nonTradingCount) && nonTradingCount > 0) {
      const nonTradingReturn = serviceValuesAccounting.taxServices.nonTradingReturns?.[segment];
      if (nonTradingReturn) {
        total += nonTradingReturn.monthly * nonTradingCount;
      }
    }
  }

  // q4: SMSF - NO in Bronze (excluded)
  // q5: FBT return - NO in Bronze (excluded)

  // q6: BAS (quarterly or monthly) - YES in Bronze
  if (responses.q6 && responses.q6 !== 'no' && segment) {
    const basService = serviceValuesAccounting.taxServices.bas[segment];
    const basEntities = Math.max(1, parseInt(responses.q6_entities, 10) || 1);
    if (basService) {
      if (responses.q6 === 'quarterly') {
        total += (basService.quarterlyMonthly || basService.monthly) * basEntities;
      } else if (responses.q6 === 'monthly') {
        total += (basService.monthlyMonthly || basService.monthly) * basEntities;
      }
    }
  }

  // q7: IAS - YES in Bronze
  if (responses.q7 === 'yes' && segment) {
    const iasService = serviceValuesAccounting.taxServices.ias[segment];
    const iasEntities = Math.max(1, parseInt(responses.q7_entities, 10) || 1);
    if (iasService) {
      total += iasService.monthly * iasEntities;
    }
  }

  // q8: TPAR (number of suppliers) - YES in Bronze
  if (responses.q8 && segment) {
    const supplierCount = parseInt(responses.q8, 10);
    if (!isNaN(supplierCount) && supplierCount > 0) {
      const tparService = serviceValuesAccounting.taxServices.tpar?.[segment];
      if (tparService) {
        total += tparService.monthly * supplierCount;
      }
    }
  }

  // ==================== SUPPORT SERVICES ====================
  // Bronze: add Team support fee when any support option is selected
  if (responses.q24 && responses.q24 !== '' && responses.q24 !== 'no' && segment) {
    const teamSupport = serviceValuesAccounting.support.emailOnlyTeam?.[segment];
    if (teamSupport) {
      total += teamSupport.monthly;
    }
  }

  // ==================== PAYROLL SERVICES (Bronze: YES for Workers Comp, Processing, Super, STP, LSL; NO for Payroll Tax) ====================

  // q9: Workers compensation - YES in Bronze
  if (responses.q9 === 'yes' && segment) {
    const workersCompService = serviceValuesAccounting.payrollServices.workersCompensation?.[segment];
    if (workersCompService) {
      total += workersCompService.monthly;
    }
  }

  // q10a: Salary employees - YES in Bronze
  if (responses.q10a && typeof responses.q10a === 'object' && segment) {
    const { salaryWeekly = 0, salaryFortnightly = 0, salaryMonthly = 0 } = responses.q10a;
    const weeklyCount = parseInt(salaryWeekly, 10) || 0;
    const fortnightlyCount = parseInt(salaryFortnightly, 10) || 0;
    const monthlyCount = parseInt(salaryMonthly, 10) || 0;

    const totalSalaried = weeklyCount + fortnightlyCount + monthlyCount;
    if (totalSalaried > 0) {
      const payrollProcessing = serviceValuesAccounting.payrollServices.payrollProcessing?.salary;
      if (payrollProcessing) {
        const weeklyMonthly = weeklyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly) * (52/12);
        const fortnightlyMonthly = fortnightlyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly) * (26/12);
        const monthlyMonthly = monthlyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly);
        total += weeklyMonthly + fortnightlyMonthly + monthlyMonthly;
      }
    }
  }

  // q10b: Timesheet employees - YES in Bronze
  if (responses.q10b && typeof responses.q10b === 'object' && segment) {
    const { timesheetWeekly = 0, timesheetFortnightly = 0, timesheetMonthly = 0 } = responses.q10b;
    const weeklyCount = parseInt(timesheetWeekly, 10) || 0;
    const fortnightlyCount = parseInt(timesheetFortnightly, 10) || 0;
    const monthlyCount = parseInt(timesheetMonthly, 10) || 0;

    const totalTimesheet = weeklyCount + fortnightlyCount + monthlyCount;
    if (totalTimesheet > 0) {
      const payrollProcessing = serviceValuesAccounting.payrollServices.payrollProcessing?.timesheets;
      if (payrollProcessing) {
        const weeklyMonthly = weeklyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly) * (52/12);
        const fortnightlyMonthly = fortnightlyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly) * (26/12);
        const monthlyMonthly = monthlyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly);
        total += weeklyMonthly + fortnightlyMonthly + monthlyMonthly;
      }
    }
  }

  // q11: Payroll tax returns - NO in Bronze (excluded)

  // q12: Superannuation lodgement - YES in Bronze
  if (responses.q12 && responses.q12 !== 'no' && segment) {
    const superService = serviceValuesAccounting.payrollServices.superPrepAndLodgement?.[segment];
    if (superService) {
      if (responses.q12 === 'weekly') {
        total += superService.weeklyMonthly || superService.monthly;
      } else if (responses.q12 === 'fortnightly') {
        total += superService.fortnightlyMonthly || superService.monthly;
      } else if (responses.q12 === 'quarterly') {
        total += superService.quarterlyMonthly || superService.monthly;
      } else if (responses.q12 === 'monthly') {
        total += superService.monthlyMonthly || superService.monthly;
      }
    }
  }

  // q13: Single Touch Payroll - YES in Bronze
  if (responses.q13 && responses.q13 !== 'no' && segment) {
    const stpService = serviceValuesAccounting.payrollServices.stpReporting?.[segment];
    if (stpService) {
      if (responses.q13 === 'weekly') {
        total += stpService.weeklyMonthly || stpService.monthly;
      } else if (responses.q13 === 'fortnightly') {
        total += stpService.fortnightlyMonthly || stpService.monthly;
      } else if (responses.q13 === 'monthly') {
        total += stpService.monthlyMonthly || stpService.monthly;
      }
    }
  }

  // q13b: Payroll Reconciliation and STP Reporting - YES in Bronze
  if (responses.q13b === 'yes' && segment) {
    const reconcService = serviceValuesAccounting.payrollServices.payrollReconciliation?.[segment];
    if (reconcService) {
      total += reconcService.monthly;
    }
  }

  // q14: Long service leave (LSL Construction Reporting) - YES in Bronze
  if (responses.q14 === 'yes' && segment) {
    const lslService = serviceValuesAccounting.payrollServices.lslReporting?.[segment];
    if (lslService) {
      total += lslService.monthly;
    }
  }

  // ==================== ADVISORY SERVICES (Bronze: YES for Xero Training; NO for Tax Planning) ====================

  // q15: Tax planning - NO in Bronze (excluded)

  // q17b: Ongoing Xero Training - YES in Bronze
  if (responses.q17b === 'yes' && segment) {
    const ongoingXeroTraining = serviceValuesAccounting.advisoryServices?.ongoingXeroTraining?.[segment];
    if (ongoingXeroTraining) {
      total += ongoingXeroTraining.monthly || 0;
    }
  }

  // ==================== REPORTING (Bronze: YES for FS Tax; NO for Management FS) ====================

  // q18: Financial statements for tax - YES in Bronze
  if (responses.q18 && responses.q18 !== '' && segment) {
    const fsCount = parseInt(responses.q18, 10);
    if (!isNaN(fsCount) && fsCount > 0) {
      const fsService = serviceValuesAccounting.reporting.financialStatementsTax?.[segment];
      if (fsService) {
        total += fsService.monthly * fsCount;
      }
    }
  }

  // q19: Statutory financial statements - excluded from Bronze
  // q20: Management financial statements - NO in Bronze (excluded)

  // ==================== MEETINGS (Bronze: Annual Tax Meetings YES, others NO) ====================
  // q21, q23: Excluded from Bronze
  // q22: Annual tax meetings - YES in Bronze (if selected)
  if (responses.q22 === 'yes' && segment) {
    const annualService = serviceValuesAccounting.meetings.annualTaxMeetings?.[segment];
    if (annualService) {
      total += annualService.monthly;
    }
  }

  // ==================== CORPORATE SECRETARIAL (Bronze: YES) ====================

  // q25: ASIC company secretarial work - YES in Bronze
  if (responses.q25) {
    if (Array.isArray(responses.q25)) {
      if (responses.q25.includes('annualReturns')) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        const asicCount = Math.max(1, parseInt(responses.q25b, 10) || 1);
        if (asicService) {
          total += asicService.monthly * asicCount;
        }
      }
    } else if (typeof responses.q25 === 'object' && responses.q25 !== null) {
      if (responses.q25.annualReturns) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        const asicCount = Math.max(1, parseInt(responses.q25b, 10) || 1);
        if (asicService) {
          total += asicService.monthly * asicCount;
        }
      }
    } else if (responses.q25 !== '' && responses.q25 !== 'no') {
      if (responses.q25 === 'annualReturns' || responses.q25 === 'yes') {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        const asicCount = Math.max(1, parseInt(responses.q25b, 10) || 1);
        if (asicService) {
          total += asicService.monthly * asicCount;
        }
      }
    }
  }

  // q28: Accounting Software Disbursement - pass-through monthly fee
  if (responses.q28 && responses.q28 !== 'no' && responses.q28 !== '') {
    const disbursementFee = parseFloat(responses.q28_price) || 0;
    if (disbursementFee > 0) {
      total += disbursementFee;
    }
  }

  // q29: Other Disbursements - pass-through monthly fees (array of {description, price})
  if (Array.isArray(responses.q29)) {
    responses.q29.forEach((row) => {
      const fee = parseFloat(row && row.price) || 0;
      if (fee > 0) total += fee;
    });
  }

  // Apply pricing modifier
  return Math.round(total * multiplier * 100) / 100;
};

/**
 * Calculates total monthly pricing based on question responses
 * NEW QUESTION MAPPING (Accounting Price List v3):
 * q1: Revenue segment
 * q2: Individual returns count, q2a: Summary type, q2b: Extras
 * q3: Business entities
 * q4: SMSF yes/no, q4a: SMSF audit
 * q5: FBT return
 * q6: BAS frequency (quarterly/monthly/no)
 * q7: IAS yes/no
 * q8: TPAR (number of suppliers)
 * q9: Workers Compensation
 * q10: Run payroll, q10a: Salary employees, q10b: Timesheet employees
 * q11: Payroll Tax (medium/large only)
 * q12: Super lodgement
 * q13: STP
 * q14: LSL
 * q15: Tax Planning
 * q16: Tax Structuring
 * q17: Xero Setup, q17a: Xero Training
 * q18: Financial Statements
 * q19: Statutory FS (large only)
 * q20: Management FS
 * q21: Review Numbers meetings
 * q22: Annual Tax Meetings
 * q23: Business Meetings
 * q24: Support level
 * q25: ASIC
 * q26: ATO Payment Plans
 * q27: Prior Year Lodgements
 * @param {Object} responses - Question responses from Questions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 200)
 * @returns {number} Total monthly cost
 */
export const calculateTotalMonthlyPrice = (responses, pricingModifier = 200) => {
  let total = 0;
  const multiplier = getPricingMultiplier(pricingModifier);

  // Helper function to get segment for service lookup
  const getSegment = (originalSegment) => {
    if (['micro', 'small', 'medium', 'large'].includes(originalSegment)) {
      return originalSegment;
    }
    if (originalSegment === 'enterprise') {
      return 'large';
    }
    return null;
  };

  const segment = getSegment(responses.q1);

  // q2: Number of individual returns
  if (responses.q2 && responses.q2 !== '') {
    const individualCount = parseInt(responses.q2, 10);
    if (!isNaN(individualCount) && individualCount > 0) {
      const individualReturn = serviceValuesAccounting.taxServices.individualReturns.all;
      if (individualReturn) {
        total += individualReturn.monthly * individualCount;
      }
    }
  }

  // q2b: Individual return extras (per-item summary toggle)
  if (responses.q2b && typeof responses.q2b === 'object') {
    const extras = serviceValuesAccounting.taxServices.individualReturnExtras;

    Object.entries(responses.q2b).forEach(([extraKey, value]) => {
      // Skip 'none' button, empty values, and returnNotNecessary (handled in once-off fees)
      if (extraKey === 'none' || extraKey === 'returnNotNecessary' || !value) return;

      const extraPricing = extras[extraKey];
      if (!extraPricing) return;

      const isSummaryShape = typeof value === 'object' && value !== null && 'count' in value;
      const rawCount = isSummaryShape ? value.count : value;
      const summaryType = isSummaryShape ? value.summary : null;

      const pricingTier = extraPricing.all || (summaryType && extraPricing[summaryType]);
      if (!pricingTier) return;

      if (typeof rawCount === 'boolean' && rawCount === true) {
        total += pricingTier.monthly;
      } else {
        const quantity = parseInt(rawCount, 10);
        if (!isNaN(quantity) && quantity > 0) {
          total += pricingTier.monthly * quantity;
        }
      }
    });
  }

  // q3: Number of business entities
  if (responses.q3 && responses.q3 !== '' && segment) {
    const businessCount = parseInt(responses.q3, 10);
    if (!isNaN(businessCount) && businessCount > 0) {
      // Business returns pricing per entity
      const businessReturn = serviceValuesAccounting.taxServices.businessReturns[segment];
      if (businessReturn) {
        total += businessReturn.monthly * businessCount;
      }
    }
  }

  // q3b: Number of NON trading business entities
  if (responses.q3b && responses.q3b !== '' && segment) {
    const nonTradingCount = parseInt(responses.q3b, 10);
    if (!isNaN(nonTradingCount) && nonTradingCount > 0) {
      const nonTradingReturn = serviceValuesAccounting.taxServices.nonTradingReturns?.[segment];
      if (nonTradingReturn) {
        total += nonTradingReturn.monthly * nonTradingCount;
      }
    }
  }

  // q4: SMSF
  if (responses.q4 === 'yes' && segment) {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q4a: SMSF audit and tax return
  if (responses.q4a === 'yes' && segment) {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q5: FBT return
  if (responses.q5 && responses.q5 !== '' && segment) {
    const fbtCount = parseInt(responses.q5, 10);
    if (!isNaN(fbtCount) && fbtCount > 0) {
      const fbtService = serviceValuesAccounting.taxServices.fbtReturns?.[segment];
      if (fbtService) {
        total += fbtService.monthly * fbtCount;
      }
    }
  }

  // q6: BAS (quarterly or monthly)
  if (responses.q6 && responses.q6 !== 'no' && segment) {
    const basService = serviceValuesAccounting.taxServices.bas[segment];
    const basEntities = Math.max(1, parseInt(responses.q6_entities, 10) || 1);
    if (basService) {
      // Use the appropriate monthly rate based on frequency
      if (responses.q6 === 'quarterly') {
        total += (basService.quarterlyMonthly || basService.monthly) * basEntities;
      } else if (responses.q6 === 'monthly') {
        total += (basService.monthlyMonthly || basService.monthly) * basEntities;
      }
    }
  }

  // q7: IAS
  if (responses.q7 === 'yes' && segment) {
    const iasService = serviceValuesAccounting.taxServices.ias[segment];
    const iasEntities = Math.max(1, parseInt(responses.q7_entities, 10) || 1);
    if (iasService) {
      total += iasService.monthly * iasEntities;
    }
  }

  // q8: TPAR (number of suppliers)
  if (responses.q8 && segment) {
    const supplierCount = parseInt(responses.q8, 10);
    if (!isNaN(supplierCount) && supplierCount > 0) {
      const tparService = serviceValuesAccounting.taxServices.tpar?.[segment];
      if (tparService) {
        // TPAR pricing is per supplier
        total += tparService.monthly * supplierCount;
      }
    }
  }

  // q9: Workers compensation
  if (responses.q9 === 'yes' && segment) {
    const workersCompService = serviceValuesAccounting.payrollServices.workersCompensation?.[segment];
    if (workersCompService) {
      total += workersCompService.monthly;
    }
  }

  // q10a: Salary employees
  if (responses.q10a && typeof responses.q10a === 'object' && segment) {
    const { salaryWeekly = 0, salaryFortnightly = 0, salaryMonthly = 0 } = responses.q10a;
    const weeklyCount = parseInt(salaryWeekly, 10) || 0;
    const fortnightlyCount = parseInt(salaryFortnightly, 10) || 0;
    const monthlyCount = parseInt(salaryMonthly, 10) || 0;

    const totalSalaried = weeklyCount + fortnightlyCount + monthlyCount;
    if (totalSalaried > 0) {
      const payrollProcessing = serviceValuesAccounting.payrollServices.payrollProcessing?.salary;
      if (payrollProcessing) {
        // Apply frequency multiplier: weekly=52/12, fortnightly=26/12, monthly=1
        const weeklyMonthly = weeklyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly) * (52/12);
        const fortnightlyMonthly = fortnightlyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly) * (26/12);
        const monthlyMonthly = monthlyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly);
        total += weeklyMonthly + fortnightlyMonthly + monthlyMonthly;
      }
    }
  }

  // q10b: Timesheet employees
  if (responses.q10b && typeof responses.q10b === 'object' && segment) {
    const { timesheetWeekly = 0, timesheetFortnightly = 0, timesheetMonthly = 0 } = responses.q10b;
    const weeklyCount = parseInt(timesheetWeekly, 10) || 0;
    const fortnightlyCount = parseInt(timesheetFortnightly, 10) || 0;
    const monthlyCount = parseInt(timesheetMonthly, 10) || 0;

    const totalTimesheet = weeklyCount + fortnightlyCount + monthlyCount;
    if (totalTimesheet > 0) {
      const payrollProcessing = serviceValuesAccounting.payrollServices.payrollProcessing?.timesheets;
      if (payrollProcessing) {
        // Apply frequency multiplier: weekly=52/12, fortnightly=26/12, monthly=1
        const weeklyMonthly = weeklyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly) * (52/12);
        const fortnightlyMonthly = fortnightlyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly) * (26/12);
        const monthlyMonthly = monthlyCount * (payrollProcessing.perEmployee || payrollProcessing.monthly);
        total += weeklyMonthly + fortnightlyMonthly + monthlyMonthly;
      }
    }
  }

  // q11: Payroll tax returns (medium/large only)
  if (responses.q11 === 'yes' && segment) {
    const payrollTaxService = serviceValuesAccounting.payrollServices.payrollTaxReturns?.[segment];
    if (payrollTaxService) {
      total += payrollTaxService.monthly;
    }
  }

  // q12: Superannuation lodgement
  if (responses.q12 && responses.q12 !== 'no' && segment) {
    const superService = serviceValuesAccounting.payrollServices.superPrepAndLodgement?.[segment];
    if (superService) {
      // Use frequency-based rate
      if (responses.q12 === 'weekly') {
        total += superService.weeklyMonthly || superService.monthly;
      } else if (responses.q12 === 'fortnightly') {
        total += superService.fortnightlyMonthly || superService.monthly;
      } else if (responses.q12 === 'quarterly') {
        total += superService.quarterlyMonthly || superService.monthly;
      } else if (responses.q12 === 'monthly') {
        total += superService.monthlyMonthly || superService.monthly;
      }
    }
  }

  // q13: Single Touch Payroll
  if (responses.q13 && responses.q13 !== 'no' && segment) {
    const stpService = serviceValuesAccounting.payrollServices.stpReporting?.[segment];
    if (stpService) {
      // Use frequency-based rate
      if (responses.q13 === 'weekly') {
        total += stpService.weeklyMonthly || stpService.monthly;
      } else if (responses.q13 === 'fortnightly') {
        total += stpService.fortnightlyMonthly || stpService.monthly;
      } else if (responses.q13 === 'monthly') {
        total += stpService.monthlyMonthly || stpService.monthly;
      }
    }
  }

  // q13b: Payroll Reconciliation and STP Reporting
  if (responses.q13b === 'yes' && segment) {
    const reconcService = serviceValuesAccounting.payrollServices.payrollReconciliation?.[segment];
    if (reconcService) {
      total += reconcService.monthly;
    }
  }

  // q14: Long service leave (LSL Construction Reporting)
  if (responses.q14 === 'yes' && segment) {
    const lslService = serviceValuesAccounting.payrollServices.lslReporting?.[segment];
    if (lslService) {
      total += lslService.monthly;
    }
  }

  // q15: Tax planning
  if (responses.q15 === 'yes' && segment) {
    const taxPlanningService = serviceValuesAccounting.advisoryServices.taxPlanningReview?.[segment];
    if (taxPlanningService) {
      total += taxPlanningService.monthly;
    }
  }

  // q16: Tax structuring - once-off only, no monthly component
  // (handled in calculateTotalOnceOffFee)

  // q17: Xero Setup - once-off only, no monthly component
  // (handled in calculateTotalOnceOffFee)

  // q17b: Ongoing Xero Training (monthly fee)
  if (responses.q17b === 'yes' && segment) {
    const ongoingXeroTraining = serviceValuesAccounting.advisoryServices?.ongoingXeroTraining?.[segment];
    if (ongoingXeroTraining) {
      total += ongoingXeroTraining.monthly || 0;
    }
  }

  // q18: Financial statements
  if (responses.q18 && responses.q18 !== '' && segment) {
    const fsCount = parseInt(responses.q18, 10);
    if (!isNaN(fsCount) && fsCount > 0) {
      const fsService = serviceValuesAccounting.reporting.financialStatementsTax?.[segment];
      if (fsService) {
        total += fsService.monthly * fsCount;
      }
    }
  }

  // q19: Statutory financial statements (large only)
  if (responses.q19 === 'yes' && segment) {
    const statutoryService = serviceValuesAccounting.reporting.statutoryFinancialStatements?.[segment];
    if (statutoryService) {
      total += statutoryService.monthly;
    }
  }

  // q20: Management financial statements
  if (responses.q20 && responses.q20 !== 'no' && segment) {
    const mfsService = serviceValuesAccounting.reporting.managementFinancialStatements?.[segment];
    if (mfsService) {
      // Use quarterly or monthly rate based on selection
      if (responses.q20 === 'quarterly') {
        total += mfsService.quarterlyMonthly || mfsService.monthly;
      } else if (responses.q20 === 'monthly') {
        total += mfsService.monthlyMonthly || mfsService.monthly;
      }
    }
  }

  // q21: Review the Numbers meetings
  if (responses.q21 && responses.q21 !== 'no' && segment) {
    const reviewService = serviceValuesAccounting.meetings.reviewNumbers?.[segment];
    if (reviewService) {
      // Use quarterly or monthly rate based on selection
      if (responses.q21 === 'quarterly') {
        total += reviewService.quarterlyMonthly || reviewService.monthly;
      } else if (responses.q21 === 'monthly') {
        total += reviewService.monthlyMonthly || reviewService.monthly;
      }
    }
  }

  // q22: Annual tax meetings
  if (responses.q22 === 'yes' && segment) {
    const annualService = serviceValuesAccounting.meetings.annualTaxMeetings?.[segment];
    if (annualService) {
      total += annualService.monthly;
    }
  }

  // q23: Business Meetings
  if (responses.q23 && responses.q23 !== 'no' && segment) {
    const businessMeetings = serviceValuesAccounting.meetings.businessMeetings?.[segment];
    if (businessMeetings) {
      // Use quarterly or monthly rate based on selection
      if (responses.q23 === 'quarterly') {
        total += businessMeetings.quarterlyMonthly || businessMeetings.monthly;
      } else if (responses.q23 === 'biannually') {
        total += businessMeetings.biannuallyMonthly || businessMeetings.monthly;
      } else if (responses.q23 === 'monthly') {
        total += businessMeetings.monthlyMonthly || businessMeetings.monthly;
      }
    }
  }

  // q24: Support level (each tier applies its corresponding fee when any option is selected)
  if (responses.q24 && responses.q24 !== '' && responses.q24 !== 'no' && segment) {
    const teamSupport = serviceValuesAccounting.support.emailOnlyTeam?.[segment];
    if (teamSupport) {
      total += teamSupport.monthly;
    }
  }

  // q25: ASIC company secretarial work
  if (responses.q25) {
    // Handle array format (multiRadio - can select multiple)
    if (Array.isArray(responses.q25)) {
      if (responses.q25.includes('annualReturns')) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        const asicCount = Math.max(1, parseInt(responses.q25b, 10) || 1);
        if (asicService) {
          total += asicService.monthly * asicCount;
        }
      }
      // formLodgements is handled in calculateTotalOnceOffFee
    }
    // Handle old object format for backward compatibility
    else if (typeof responses.q25 === 'object' && responses.q25 !== null) {
      if (responses.q25.annualReturns) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        const asicCount = Math.max(1, parseInt(responses.q25b, 10) || 1);
        if (asicService) {
          total += asicService.monthly * asicCount;
        }
      }
      // formLodgements is handled in calculateTotalOnceOffFee
    } 
    // Handle old string format for backward compatibility
    else if (responses.q25 !== '' && responses.q25 !== 'no') {
      if (responses.q25 === 'annualReturns') {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        const asicCount = Math.max(1, parseInt(responses.q25b, 10) || 1);
        if (asicService) {
          total += asicService.monthly * asicCount;
        }
      }
      // detailChanges/formLodgements handled in calculateTotalOnceOffFee
    }
  }

  // q26: ATO payment plans (changed from q25b) - once-off only, no monthly
  // (handled in calculateTotalOnceOffFee)

  // q28: Accounting Software Disbursement - pass-through monthly fee
  if (responses.q28 && responses.q28 !== 'no' && responses.q28 !== '') {
    const disbursementFee = parseFloat(responses.q28_price) || 0;
    if (disbursementFee > 0) {
      total += disbursementFee;
    }
  }

  // q29: Other Disbursements - pass-through monthly fees (array of {description, price})
  if (Array.isArray(responses.q29)) {
    responses.q29.forEach((row) => {
      const fee = parseFloat(row && row.price) || 0;
      if (fee > 0) total += fee;
    });
  }

  const adjustedTotal = Math.round(total * multiplier * 100) / 100;
  return adjustedTotal; // Round to 2 decimal places with pricing modifier applied
};

/**
 * Calculates total once-off (yearly) fees based on question responses
 * NEW QUESTION MAPPING (Accounting Price List v3):
 * q16: Tax Structuring (once-off)
 * q17: Xero Setup (once-off), q17a: Xero Training
 * q26: ATO Payment Plans
 * q27: Prior Year Lodgements
 * @param {Object} responses - Question responses from Questions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 200)
 * @returns {number} Total once-off fee
 */
export const calculateTotalOnceOffFee = (responses, pricingModifier = 200) => {
  let total = 0;
  const multiplier = getPricingMultiplier(pricingModifier);

  // Helper function to get segment for service lookup
  const getSegment = (originalSegment) => {
    if (['micro', 'small', 'medium', 'large'].includes(originalSegment)) {
      return originalSegment;
    }
    if (originalSegment === 'enterprise') {
      return 'large';
    }
    return null;
  };

  const segment = getSegment(responses.q1);

  // q16: Tax structuring (once-off)
  if (responses.q16 === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.taxStructuringAdvice) {
    const taxStructuring = serviceValuesAccounting.advisoryServices.taxStructuringAdvice[segment];
    if (taxStructuring) {
      total += taxStructuring.onceOff || taxStructuring.yearly;
    }
  }

  // q17: Xero Setup (once-off)
  if (responses.q17 === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.xeroSetup) {
    const xeroSetup = serviceValuesAccounting.advisoryServices.xeroSetup[segment];
    if (xeroSetup) {
      total += xeroSetup.onceOff || xeroSetup.yearly;
    }
  }

  // q17a: Xero Training (once-off)
  if (responses.q17a === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.xeroTraining) {
    const xeroTraining = serviceValuesAccounting.advisoryServices.xeroTraining[segment];
    if (xeroTraining) {
      total += xeroTraining.onceOff || xeroTraining.yearly;
    }
  }

  // q26: ATO payment plans (once-off setup fee)
  if (responses.q26 && responses.q26 !== '' && responses.q26 !== 'no') {
    let atoPlan = null;
    if (responses.q26 === 'basic') {
      atoPlan = serviceValuesAccounting.atoPaymentPlans?.basic;
    } else if (responses.q26 === 'hardship') {
      atoPlan = serviceValuesAccounting.atoPaymentPlans?.hardship;
    }
    if (atoPlan) {
      total += atoPlan.onceOff || 0;
    }
  }

  // q2b: Return not necessary (once-off fee from individual return extras)
  if (responses.q2b && typeof responses.q2b === 'object' && responses.q2b.returnNotNecessary) {
    const count = parseInt(responses.q2b.returnNotNecessary, 10);
    const returnNotNecessary = serviceValuesAccounting.taxServices?.individualReturnExtras?.returnNotNecessary;
    if (!isNaN(count) && count > 0 && returnNotNecessary?.onceOff) {
      total += returnNotNecessary.onceOff * count;
    }
  }

  // q25: ASIC Form Lodgements (once-off) - multiplied by quantity from q25a
  if (responses.q25) {
    const asicService = serviceValuesAccounting.corporateSecretarial?.asicFormsLodgements;
    if (asicService) {
      // Get the count from q25a (default to 1 if not specified)
      const lodgementCount = responses.q25a ? parseInt(responses.q25a, 10) || 1 : 1;
      
      if (Array.isArray(responses.q25) && responses.q25.includes('formLodgements')) {
        total += (asicService.onceOff || 0) * lodgementCount;
      } else if (typeof responses.q25 === 'object' && responses.q25 !== null && responses.q25.formLodgements) {
        total += (asicService.onceOff || 0) * lodgementCount;
      } else if (responses.q25 === 'detailChanges') {
        total += (asicService.onceOff || 0) * lodgementCount;
      }
    }
  }

  // q27: Prior year lodgements (multiple return types)
  // Uses annual rate from original service × number of returns × 1.5 multiplier as once-off fee
  if (responses.q27 && typeof responses.q27 === 'object' && segment) {
    const PRIOR_YEAR_MULTIPLIER = 1.5;

    // Business returns (uses taxServices.businessReturns)
    if (responses.q27.businessReturns) {
      const count = parseInt(responses.q27.businessReturns, 10);
      const service = serviceValuesAccounting.taxServices?.businessReturns?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // Individual returns (flat rate for all segments)
    if (responses.q27.individuals) {
      const count = parseInt(responses.q27.individuals, 10);
      const service = serviceValuesAccounting.taxServices?.individualReturns?.all;
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // BAS returns (uses perReturn, assuming 4 returns per year for annual calculation)
    if (responses.q27.bas) {
      const count = parseInt(responses.q27.bas, 10);
      const service = serviceValuesAccounting.taxServices?.bas?.[segment];
      if (!isNaN(count) && count > 0 && service?.perReturn) {
        // perReturn × 4 (quarterly) = yearly rate
        total += (service.perReturn * 4) * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // SMSF
    if (responses.q27.smsf) {
      const count = parseInt(responses.q27.smsf, 10);
      const service = serviceValuesAccounting.taxServices?.smsf?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // IAS returns (uses perReturn, assuming 8 returns per year)
    if (responses.q27.ias) {
      const count = parseInt(responses.q27.ias, 10);
      const service = serviceValuesAccounting.taxServices?.ias?.[segment];
      if (!isNaN(count) && count > 0 && service?.perReturn) {
        // perReturn × 8 = yearly rate
        total += (service.perReturn * 8) * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // FBT returns
    if (responses.q27.fbt) {
      const count = parseInt(responses.q27.fbt, 10);
      const service = serviceValuesAccounting.taxServices?.fbtReturns?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // TPAR
    if (responses.q27.tpar) {
      const count = parseInt(responses.q27.tpar, 10);
      const service = serviceValuesAccounting.taxServices?.tpar?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // Workers Compensation
    if (responses.q27.workersComp) {
      const count = parseInt(responses.q27.workersComp, 10);
      const service = serviceValuesAccounting.payrollServices?.workersCompensation?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // Super Prep and Lodgement (uses perLodgement, assuming 4 lodgements per year)
    if (responses.q27.superLodgement) {
      const count = parseInt(responses.q27.superLodgement, 10);
      const service = serviceValuesAccounting.payrollServices?.superPrepAndLodgement?.[segment];
      if (!isNaN(count) && count > 0 && service?.perLodgement) {
        // perLodgement × 4 (quarterly) = yearly rate
        total += (service.perLodgement * 4) * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // STP EOY Reporting (uses perReport × 12 for yearly, or just use monthly × 12)
    if (responses.q27.stpEoy) {
      const count = parseInt(responses.q27.stpEoy, 10);
      const service = serviceValuesAccounting.payrollServices?.stpReporting?.[segment];
      if (!isNaN(count) && count > 0 && service?.perReport) {
        // For EOY, use perReport as annual rate (it's a single annual report)
        total += service.perReport * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // LSL Forms (uses lslReporting)
    if (responses.q27.lslForms) {
      const count = parseInt(responses.q27.lslForms, 10);
      const service = serviceValuesAccounting.payrollServices?.lslReporting?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // Payroll Tax Returns (medium/large only)
    if (responses.q27.payrollTax && ['medium', 'large'].includes(segment)) {
      const count = parseInt(responses.q27.payrollTax, 10);
      const service = serviceValuesAccounting.payrollServices?.payrollTaxReturns?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

    // ASIC (flat rate)
    if (responses.q27.asic) {
      const count = parseInt(responses.q27.asic, 10);
      const service = serviceValuesAccounting.corporateSecretarial?.asicAnnualReturn;
      if (!isNaN(count) && count > 0 && service?.yearly) {
        total += service.yearly * count * PRIOR_YEAR_MULTIPLIER;
      }
    }

  }

  return Math.round(total * multiplier * 100) / 100; // Round to 2 decimal places with pricing modifier applied
};

/**
 * Returns a breakdown of once-off fee items with labels and amounts for accounting
 * @param {Object} responses - Question responses
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 200)
 * @returns {Array} Array of objects with { label, amount } for each once-off item
 */
export const getAccountingOnceOffBreakdown = (responses, pricingModifier = 200) => {
  const items = [];
  const multiplier = getPricingMultiplier(pricingModifier);

  const getSegment = (originalSegment) => {
    if (['micro', 'small', 'medium', 'large'].includes(originalSegment)) {
      return originalSegment;
    }
    if (originalSegment === 'enterprise') {
      return 'large';
    }
    return null;
  };

  const segment = getSegment(responses.q1);

  // q16: Tax structuring (once-off)
  if (responses.q16 === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.taxStructuringAdvice) {
    const taxStructuring = serviceValuesAccounting.advisoryServices.taxStructuringAdvice[segment];
    if (taxStructuring) {
      const amount = Math.round((taxStructuring.onceOff || taxStructuring.yearly) * multiplier * 100) / 100;
      items.push({
        label: 'Tax Structuring Advice',
        amount,
      });
    }
  }

  // q17: Xero Setup (once-off)
  if (responses.q17 === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.xeroSetup) {
    const xeroSetup = serviceValuesAccounting.advisoryServices.xeroSetup[segment];
    if (xeroSetup) {
      const amount = Math.round((xeroSetup.onceOff || xeroSetup.yearly) * multiplier * 100) / 100;
      items.push({
        label: 'Xero Setup',
        amount,
      });
    }
  }

  // q17a: Xero Training (once-off)
  if (responses.q17a === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.xeroTraining) {
    const xeroTraining = serviceValuesAccounting.advisoryServices.xeroTraining[segment];
    if (xeroTraining) {
      const amount = Math.round((xeroTraining.onceOff || xeroTraining.yearly) * multiplier * 100) / 100;
      items.push({
        label: 'Xero Training',
        amount,
      });
    }
  }

  // q26: ATO payment plans (once-off setup fee)
  if (responses.q26 && responses.q26 !== '' && responses.q26 !== 'no') {
    let atoPlan = null;
    let planLabel = '';
    if (responses.q26 === 'basic') {
      atoPlan = serviceValuesAccounting.atoPaymentPlans?.basic;
      planLabel = 'ATO Payment Plan (Basic)';
    } else if (responses.q26 === 'hardship') {
      atoPlan = serviceValuesAccounting.atoPaymentPlans?.hardship;
      planLabel = 'ATO Payment Plan (Hardship)';
    }
    if (atoPlan && atoPlan.onceOff) {
      const amount = Math.round(atoPlan.onceOff * multiplier * 100) / 100;
      items.push({
        label: planLabel,
        amount,
      });
    }
  }

  // q2b: Return not necessary (once-off fee from individual return extras)
  if (responses.q2b && typeof responses.q2b === 'object' && responses.q2b.returnNotNecessary) {
    const count = parseInt(responses.q2b.returnNotNecessary, 10);
    const returnNotNecessary = serviceValuesAccounting.taxServices?.individualReturnExtras?.returnNotNecessary;
    if (!isNaN(count) && count > 0 && returnNotNecessary?.onceOff) {
      const amount = Math.round(returnNotNecessary.onceOff * count * multiplier * 100) / 100;
      items.push({
        label: `Return Not Necessary (${count} returns)`,
        amount,
      });
    }
  }

  // q25: ASIC Form Lodgements (once-off)
  if (responses.q25) {
    const asicService = serviceValuesAccounting.corporateSecretarial?.asicFormsLodgements;
    if (asicService) {
      const lodgementCount = responses.q25a ? parseInt(responses.q25a, 10) || 1 : 1;
      let hasFormLodgements = false;
      
      if (Array.isArray(responses.q25) && responses.q25.includes('formLodgements')) {
        hasFormLodgements = true;
      } else if (typeof responses.q25 === 'object' && responses.q25 !== null && responses.q25.formLodgements) {
        hasFormLodgements = true;
      } else if (responses.q25 === 'detailChanges') {
        hasFormLodgements = true;
      }

      if (hasFormLodgements) {
        const amount = Math.round((asicService.onceOff || 0) * lodgementCount * multiplier * 100) / 100;
        items.push({
          label: `ASIC Form Lodgements (${lodgementCount})`,
          amount,
        });
      }
    }
  }

  // q27: Prior year lodgements (multiple return types)
  if (responses.q27 && typeof responses.q27 === 'object' && segment) {
    const PRIOR_YEAR_MULTIPLIER = 1.5;

    if (responses.q27.businessReturns) {
      const count = parseInt(responses.q27.businessReturns, 10);
      const service = serviceValuesAccounting.taxServices?.businessReturns?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year Business Returns (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.individuals) {
      const count = parseInt(responses.q27.individuals, 10);
      const service = serviceValuesAccounting.taxServices?.individualReturns?.all;
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year Individual Returns (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.bas) {
      const count = parseInt(responses.q27.bas, 10);
      const service = serviceValuesAccounting.taxServices?.bas?.[segment];
      if (!isNaN(count) && count > 0 && service?.perReturn) {
        const amount = Math.round((service.perReturn * 4) * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year BAS Returns (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.smsf) {
      const count = parseInt(responses.q27.smsf, 10);
      const service = serviceValuesAccounting.taxServices?.smsf?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year SMSF Returns (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.ias) {
      const count = parseInt(responses.q27.ias, 10);
      const service = serviceValuesAccounting.taxServices?.ias?.[segment];
      if (!isNaN(count) && count > 0 && service?.perReturn) {
        const amount = Math.round((service.perReturn * 8) * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year IAS Returns (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.fbt) {
      const count = parseInt(responses.q27.fbt, 10);
      const service = serviceValuesAccounting.taxServices?.fbtReturns?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year FBT Returns (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.tpar) {
      const count = parseInt(responses.q27.tpar, 10);
      const service = serviceValuesAccounting.taxServices?.tpar?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year TPAR Returns (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.workersComp) {
      const count = parseInt(responses.q27.workersComp, 10);
      const service = serviceValuesAccounting.payrollServices?.workersCompensation?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year Workers Comp (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.superLodgement) {
      const count = parseInt(responses.q27.superLodgement, 10);
      const service = serviceValuesAccounting.payrollServices?.superPrepAndLodgement?.[segment];
      if (!isNaN(count) && count > 0 && service?.perLodgement) {
        const amount = Math.round((service.perLodgement * 4) * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year Super Lodgements (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.stpEoy) {
      const count = parseInt(responses.q27.stpEoy, 10);
      const service = serviceValuesAccounting.payrollServices?.stpReporting?.[segment];
      if (!isNaN(count) && count > 0 && service?.perReport) {
        const amount = Math.round(service.perReport * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year STP EOY Reporting (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.lslForms) {
      const count = parseInt(responses.q27.lslForms, 10);
      const service = serviceValuesAccounting.payrollServices?.lslReporting?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year LSL Forms (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.payrollTax && ['medium', 'large'].includes(segment)) {
      const count = parseInt(responses.q27.payrollTax, 10);
      const service = serviceValuesAccounting.payrollServices?.payrollTaxReturns?.[segment];
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year Payroll Tax Returns (${count})`,
          amount,
        });
      }
    }

    if (responses.q27.asic) {
      const count = parseInt(responses.q27.asic, 10);
      const service = serviceValuesAccounting.corporateSecretarial?.asicAnnualReturn;
      if (!isNaN(count) && count > 0 && service?.yearly) {
        const amount = Math.round(service.yearly * count * PRIOR_YEAR_MULTIPLIER * multiplier * 100) / 100;
        items.push({
          label: `Prior Year ASIC Returns (${count})`,
          amount,
        });
      }
    }
  }

  return items;
};
