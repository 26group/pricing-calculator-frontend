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
    return 1;
  }
  return pricingModifier / BASE_PRICING_MODIFIER;
};

/**
 * Calculates Gold package monthly pricing
 * Gold is like Silver (based on user selections) but with:
 * 1. Principal/Owner support always included
 * 2. Client Service Manager always included  
 * 3. Management FS, Review Meetings, Business Meetings at Monthly frequency (if selected)
 * @param {Object} responses - Question responses from Questions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 200)
 * @returns {number} Gold tier monthly cost
 */
export const calculateGoldMonthlyPricing = (responses, pricingModifier = 200) => {
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

  const segment = getSegment(responses?.q1);
  if (!segment) {
    return 0;
  }

  // ==================== TAX SERVICES ====================
  
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

  // q2a/q2b: Individual return extras
  if (responses.q2a && responses.q2b && typeof responses.q2b === 'object') {
    const summaryType = responses.q2a;
    const extras = serviceValuesAccounting.taxServices.individualReturnExtras;
    
    Object.entries(responses.q2b).forEach(([extraKey, value]) => {
      if (extraKey === 'none' || extraKey === 'returnNotNecessary' || !value) return;
      
      const extraPricing = extras[extraKey];
      if (extraPricing) {
        // Business schedules use 'all' key instead of providedByClient/preparedByFirm
        const pricingTier = extraPricing.all || extraPricing[summaryType];
        if (pricingTier) {
          if (typeof value === 'boolean' && value === true) {
            total += pricingTier.monthly;
          } else {
            const quantity = parseInt(value, 10);
            if (!isNaN(quantity) && quantity > 0) {
              total += pricingTier.monthly * quantity;
            }
          }
        }
      }
    });
  }

  // q3: Number of business entities
  if (responses.q3 && responses.q3 !== '') {
    const businessCount = parseInt(responses.q3, 10);
    if (!isNaN(businessCount) && businessCount > 0) {
      const businessReturn = serviceValuesAccounting.taxServices.businessReturns[segment];
      if (businessReturn) {
        total += businessReturn.monthly * businessCount;
      }
    }
  }

  // q4: SMSF
  if (responses.q4 === 'yes') {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q4a: SMSF audit and tax return
  if (responses.q4a === 'yes') {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q5: FBT return
  if (responses.q5 === 'yes') {
    const fbtService = serviceValuesAccounting.taxServices.fbtReturns?.[segment];
    if (fbtService) {
      total += fbtService.monthly;
    }
  }

  // q6: BAS
  if (responses.q6 && responses.q6 !== 'no') {
    const basService = serviceValuesAccounting.taxServices.bas[segment];
    if (basService) {
      if (responses.q6 === 'quarterly') {
        total += basService.quarterlyMonthly || basService.monthly;
      } else if (responses.q6 === 'monthly') {
        total += basService.monthlyMonthly || basService.monthly;
      }
    }
  }

  // q7: IAS
  if (responses.q7 === 'yes') {
    const iasService = serviceValuesAccounting.taxServices.ias[segment];
    if (iasService) {
      total += iasService.monthly;
    }
  }

  // q8: TPAR
  if (responses.q8) {
    const supplierCount = parseInt(responses.q8, 10);
    if (!isNaN(supplierCount) && supplierCount > 0) {
      const tparService = serviceValuesAccounting.taxServices.tpar?.[segment];
      if (tparService) {
        total += tparService.monthly * supplierCount;
      }
    }
  }

  // ==================== PAYROLL SERVICES ====================

  // q9: Workers compensation
  if (responses.q9 === 'yes') {
    const workersCompService = serviceValuesAccounting.payrollServices.workersCompensation?.[segment];
    if (workersCompService) {
      total += workersCompService.monthly;
    }
  }

  // q10a: Salary employees
  if (responses.q10a && typeof responses.q10a === 'object') {
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

  // q10b: Timesheet employees
  if (responses.q10b && typeof responses.q10b === 'object') {
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

  // q11: Payroll tax returns
  if (responses.q11 === 'yes') {
    const payrollTaxService = serviceValuesAccounting.payrollServices.payrollTaxReturns?.[segment];
    if (payrollTaxService) {
      total += payrollTaxService.monthly;
    }
  }

  // q12: Superannuation lodgement
  if (responses.q12 && responses.q12 !== 'no') {
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

  // q13: Single Touch Payroll
  if (responses.q13 && responses.q13 !== 'no') {
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

  // q14: Long service leave
  if (responses.q14 === 'yes') {
    const lslService = serviceValuesAccounting.payrollServices.lslReporting?.[segment];
    if (lslService) {
      total += lslService.monthly;
    }
  }

  // ==================== ADVISORY SERVICES ====================

  // q15: Tax planning
  if (responses.q15 === 'yes') {
    const taxPlanningService = serviceValuesAccounting.advisoryServices.taxPlanningReview?.[segment];
    if (taxPlanningService) {
      total += taxPlanningService.monthly;
    }
  }

  // q17b: Ongoing Xero Training
  if (responses.q17b === 'yes') {
    const ongoingXeroTraining = serviceValuesAccounting.advisoryServices?.ongoingXeroTraining?.[segment];
    if (ongoingXeroTraining) {
      total += ongoingXeroTraining.monthly || 0;
    }
  }

  // ==================== REPORTING ====================

  // q18: Financial statements for tax
  if (responses.q18 === 'yes') {
    const fsService = serviceValuesAccounting.reporting.financialStatementsTax?.[segment];
    if (fsService) {
      total += fsService.monthly;
    }
  }

  // q19: Statutory financial statements
  if (responses.q19 === 'yes') {
    const statutoryService = serviceValuesAccounting.reporting.statutoryFinancialStatements?.[segment];
    if (statutoryService) {
      total += statutoryService.monthly;
    }
  }

  // q20: Management financial statements - GOLD USES MONTHLY FREQUENCY (if selected)
  if (responses.q20 && responses.q20 !== 'no') {
    const mfsService = serviceValuesAccounting.reporting.managementFinancialStatements?.[segment];
    if (mfsService) {
      // Gold always uses monthly rate when this service is selected
      total += mfsService.monthlyMonthly || mfsService.monthly;
    }
  }

  // ==================== MEETINGS ====================

  // q21: Review the Numbers meetings - GOLD USES MONTHLY FREQUENCY (if selected)
  if (responses.q21 && responses.q21 !== 'no') {
    const reviewService = serviceValuesAccounting.meetings.reviewNumbers?.[segment];
    if (reviewService) {
      // Gold always uses monthly rate when this service is selected
      total += reviewService.monthlyMonthly || reviewService.monthly;
    }
  }

  // q22: Annual tax meetings
  if (responses.q22 === 'yes') {
    const annualService = serviceValuesAccounting.meetings.annualTaxMeetings?.[segment];
    if (annualService) {
      total += annualService.monthly;
    }
  }

  // q23: Business Meetings - GOLD USES MONTHLY FREQUENCY (if selected)
  if (responses.q23 && responses.q23 !== 'no') {
    const businessMeetings = serviceValuesAccounting.meetings.businessMeetings?.[segment];
    if (businessMeetings) {
      // Gold always uses monthly rate when this service is selected
      total += businessMeetings.monthlyMonthly || businessMeetings.monthly;
    }
  }

  // ==================== SUPPORT SERVICES ====================
  // Gold: If support selected (q24 is not 'no'), hardcode to Email & Phone - CSM & Owner
  if (responses.q24 && responses.q24 !== 'no') {
    // Client Service Manager support
    const csmSupport = serviceValuesAccounting.support.clientServiceManager?.[segment];
    if (csmSupport) {
      total += csmSupport.monthly;
    }
    // Principal/Owner support
    const ownerSupport = serviceValuesAccounting.support.principalOwner?.[segment];
    if (ownerSupport) {
      total += ownerSupport.monthly;
    }
  }

  // ==================== CORPORATE SECRETARIAL ====================

  // q25: ASIC company secretarial work
  if (responses.q25) {
    if (Array.isArray(responses.q25)) {
      if (responses.q25.includes('annualReturns')) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.monthly;
        }
      }
    } else if (typeof responses.q25 === 'object' && responses.q25 !== null) {
      if (responses.q25.annualReturns) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.monthly;
        }
      }
    } else if (responses.q25 !== '' && responses.q25 !== 'no') {
      if (responses.q25 === 'annualReturns' || responses.q25 === 'yes') {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.monthly;
        }
      }
    }
  }

  // Apply pricing modifier
  return Math.round(total * multiplier * 100) / 100;
};

/**
 * Calculates Silver package monthly pricing
 * Silver is based on user selections but with:
 * 1. Client Service Manager always included (hard-coded for Silver)
 * 2. Management FS, Review Meetings, Business Meetings at Quarterly frequency (if selected)
 * @param {Object} responses - Question responses from Questions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 200)
 * @returns {number} Silver tier monthly cost
 */
export const calculateSilverMonthlyPricing = (responses, pricingModifier = 200) => {
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

  const segment = getSegment(responses?.q1);
  if (!segment) {
    return 0;
  }

  // ==================== TAX SERVICES ====================
  
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

  // q2a/q2b: Individual return extras
  if (responses.q2a && responses.q2b && typeof responses.q2b === 'object') {
    const summaryType = responses.q2a;
    const extras = serviceValuesAccounting.taxServices.individualReturnExtras;
    
    Object.entries(responses.q2b).forEach(([extraKey, value]) => {
      if (extraKey === 'none' || extraKey === 'returnNotNecessary' || !value) return;
      
      const extraPricing = extras[extraKey];
      if (extraPricing) {
        // Business schedules use 'all' key instead of providedByClient/preparedByFirm
        const pricingTier = extraPricing.all || extraPricing[summaryType];
        if (pricingTier) {
          if (typeof value === 'boolean' && value === true) {
            total += pricingTier.monthly;
          } else {
            const quantity = parseInt(value, 10);
            if (!isNaN(quantity) && quantity > 0) {
              total += pricingTier.monthly * quantity;
            }
          }
        }
      }
    });
  }

  // q3: Number of business entities
  if (responses.q3 && responses.q3 !== '') {
    const businessCount = parseInt(responses.q3, 10);
    if (!isNaN(businessCount) && businessCount > 0) {
      const businessReturn = serviceValuesAccounting.taxServices.businessReturns[segment];
      if (businessReturn) {
        total += businessReturn.monthly * businessCount;
      }
    }
  }

  // q4: SMSF
  if (responses.q4 === 'yes') {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q4a: SMSF audit and tax return
  if (responses.q4a === 'yes') {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q5: FBT return
  if (responses.q5 === 'yes') {
    const fbtService = serviceValuesAccounting.taxServices.fbtReturns?.[segment];
    if (fbtService) {
      total += fbtService.monthly;
    }
  }

  // q6: BAS
  if (responses.q6 && responses.q6 !== 'no') {
    const basService = serviceValuesAccounting.taxServices.bas[segment];
    if (basService) {
      if (responses.q6 === 'quarterly') {
        total += basService.quarterlyMonthly || basService.monthly;
      } else if (responses.q6 === 'monthly') {
        total += basService.monthlyMonthly || basService.monthly;
      }
    }
  }

  // q7: IAS
  if (responses.q7 === 'yes') {
    const iasService = serviceValuesAccounting.taxServices.ias[segment];
    if (iasService) {
      total += iasService.monthly;
    }
  }

  // q8: TPAR
  if (responses.q8) {
    const supplierCount = parseInt(responses.q8, 10);
    if (!isNaN(supplierCount) && supplierCount > 0) {
      const tparService = serviceValuesAccounting.taxServices.tpar?.[segment];
      if (tparService) {
        total += tparService.monthly * supplierCount;
      }
    }
  }

  // ==================== PAYROLL SERVICES ====================

  // q9: Workers compensation
  if (responses.q9 === 'yes') {
    const workersCompService = serviceValuesAccounting.payrollServices.workersCompensation?.[segment];
    if (workersCompService) {
      total += workersCompService.monthly;
    }
  }

  // q10a: Salary employees
  if (responses.q10a && typeof responses.q10a === 'object') {
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

  // q10b: Timesheet employees
  if (responses.q10b && typeof responses.q10b === 'object') {
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

  // q11: Payroll tax returns
  if (responses.q11 === 'yes') {
    const payrollTaxService = serviceValuesAccounting.payrollServices.payrollTaxReturns?.[segment];
    if (payrollTaxService) {
      total += payrollTaxService.monthly;
    }
  }

  // q12: Superannuation lodgement
  if (responses.q12 && responses.q12 !== 'no') {
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

  // q13: Single Touch Payroll
  if (responses.q13 && responses.q13 !== 'no') {
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

  // q14: Long service leave
  if (responses.q14 === 'yes') {
    const lslService = serviceValuesAccounting.payrollServices.lslReporting?.[segment];
    if (lslService) {
      total += lslService.monthly;
    }
  }

  // ==================== ADVISORY SERVICES ====================

  // q15: Tax planning
  if (responses.q15 === 'yes') {
    const taxPlanningService = serviceValuesAccounting.advisoryServices.taxPlanningReview?.[segment];
    if (taxPlanningService) {
      total += taxPlanningService.monthly;
    }
  }

  // q17b: Ongoing Xero Training
  if (responses.q17b === 'yes') {
    const ongoingXeroTraining = serviceValuesAccounting.advisoryServices?.ongoingXeroTraining?.[segment];
    if (ongoingXeroTraining) {
      total += ongoingXeroTraining.monthly || 0;
    }
  }

  // ==================== REPORTING ====================

  // q18: Financial statements for tax
  if (responses.q18 === 'yes') {
    const fsService = serviceValuesAccounting.reporting.financialStatementsTax?.[segment];
    if (fsService) {
      total += fsService.monthly;
    }
  }

  // q19: Statutory financial statements
  if (responses.q19 === 'yes') {
    const statutoryService = serviceValuesAccounting.reporting.statutoryFinancialStatements?.[segment];
    if (statutoryService) {
      total += statutoryService.monthly;
    }
  }

  // q20: Management financial statements - SILVER USES QUARTERLY FREQUENCY (if selected)
  if (responses.q20 && responses.q20 !== 'no') {
    const mfsService = serviceValuesAccounting.reporting.managementFinancialStatements?.[segment];
    if (mfsService) {
      // Silver always uses quarterly rate when this service is selected
      total += mfsService.quarterlyMonthly || mfsService.monthly;
    }
  }

  // ==================== MEETINGS ====================

  // q21: Review the Numbers meetings - SILVER USES QUARTERLY FREQUENCY (if selected)
  if (responses.q21 && responses.q21 !== 'no') {
    const reviewService = serviceValuesAccounting.meetings.reviewNumbers?.[segment];
    if (reviewService) {
      // Silver always uses quarterly rate when this service is selected
      total += reviewService.quarterlyMonthly || reviewService.monthly;
    }
  }

  // q22: Annual tax meetings
  if (responses.q22 === 'yes') {
    const annualService = serviceValuesAccounting.meetings.annualTaxMeetings?.[segment];
    if (annualService) {
      total += annualService.monthly;
    }
  }

  // q23: Business Meetings - SILVER USES QUARTERLY FREQUENCY (if selected)
  if (responses.q23 && responses.q23 !== 'no') {
    const businessMeetings = serviceValuesAccounting.meetings.businessMeetings?.[segment];
    if (businessMeetings) {
      // Silver always uses quarterly rate when this service is selected
      total += businessMeetings.quarterlyMonthly || businessMeetings.monthly;
    }
  }

  // ==================== SUPPORT SERVICES ====================
  // Silver: If support selected (q24 is not 'no'), hardcode to Email & Phone - Team & CSM
  if (responses.q24 && responses.q24 !== 'no') {
    // Team support
    const teamSupport = serviceValuesAccounting.support.emailOnlyTeam?.[segment];
    if (teamSupport) {
      total += teamSupport.monthly;
    }
    // Client Service Manager support
    const csmSupport = serviceValuesAccounting.support.clientServiceManager?.[segment];
    if (csmSupport) {
      total += csmSupport.monthly;
    }
  }

  // ==================== CORPORATE SECRETARIAL ====================

  // q25: ASIC company secretarial work
  if (responses.q25) {
    if (Array.isArray(responses.q25)) {
      if (responses.q25.includes('annualReturns')) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.monthly;
        }
      }
    } else if (typeof responses.q25 === 'object' && responses.q25 !== null) {
      if (responses.q25.annualReturns) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.monthly;
        }
      }
    } else if (responses.q25 !== '' && responses.q25 !== 'no') {
      if (responses.q25 === 'annualReturns' || responses.q25 === 'yes') {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.monthly;
        }
      }
    }
  }

  // Apply pricing modifier
  return Math.round(total * multiplier * 100) / 100;
};
