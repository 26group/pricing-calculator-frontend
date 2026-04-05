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
 * Calculates total monthly pricing based on question responses
 * @param {Object} responses - Question responses from Questions.js
 * @param {number} pricingModifier - Optional pricing modifier from organisation (default 200)
 * @returns {number} Total monthly cost
 */
export const calculateTotalMonthlyPrice = (responses, pricingModifier = 200) => {
  let total = 0;
  const multiplier = getPricingMultiplier(pricingModifier);

  console.log('calculateTotalMonthlyPrice called with responses:', responses, 'pricingModifier:', pricingModifier, 'multiplier:', multiplier);

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

  // q1: Revenue segment - used for lookups
  // q2: Accounting system - not directly a service cost
  // q2a: Set up system - not directly a service cost
  // q2b: Information method - not directly a service cost
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

  // q4: Number of individual returns
  if (responses.q4 && responses.q4 !== '') {
    const individualCount = parseInt(responses.q4, 10);
    if (!isNaN(individualCount) && individualCount > 0) {
      const individualReturn = serviceValuesAccounting.taxServices.individualReturns.all;
      if (individualReturn) {
        total += individualReturn.monthly * individualCount;
      }
    }
  }

  // q4a/q4b: Individual return extras (based on q4a selection)
  if (responses.q4a && responses.q4b && typeof responses.q4b === 'object') {
    const summaryType = responses.q4a; // 'providedByClient' or 'preparedByFirm'
    const extras = serviceValuesAccounting.taxServices.individualReturnExtras;
    
    Object.entries(responses.q4b).forEach(([extraKey, value]) => {
      // Skip 'none' button and empty values
      if (extraKey === 'none' || !value) return;
      
      const extraPricing = extras[extraKey];
      if (extraPricing && extraPricing[summaryType]) {
        // For checkbox (deductionsMoreThan3Standard), value is true/false
        if (typeof value === 'boolean' && value === true) {
          total += extraPricing[summaryType].monthly;
        } else {
          // For number inputs, multiply by quantity
          const quantity = parseInt(value, 10);
          if (!isNaN(quantity) && quantity > 0) {
            total += extraPricing[summaryType].monthly * quantity;
          }
        }
      }
    });
  }

  // q5: SMSF
  if (responses.q5 === 'yes' && segment) {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q5a: SMSF audit and tax return
  if (responses.q5a === 'yes' && segment) {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q6: BAS/IAS
  console.log('DEBUG q6:', responses.q6, 'segment:', segment);
  if (responses.q6 && segment) {
    // Handle new object format { bas: 'basQuarterly'|'basMonthly', ias: 'iasMonthly'|undefined, no: 'no'|undefined }
    if (typeof responses.q6 === 'object' && responses.q6 !== null) {
      console.log('DEBUG q6 is object, no:', responses.q6.no, 'bas:', responses.q6.bas, 'ias:', responses.q6.ias);
      // Skip BAS/IAS pricing if "No" is selected
      if (responses.q6.no === 'no') {
        console.log('DEBUG q6 "No" is selected - skipping BAS/IAS pricing');
      } else {
        console.log('DEBUG q6.no is not set, checking bas/ias');
        if (responses.q6.bas === 'basQuarterly' || responses.q6.bas === 'basMonthly') {
          const basService = serviceValuesAccounting.taxServices.bas[segment];
          console.log('DEBUG BAS service found:', basService);
          if (basService) {
            console.log('DEBUG Adding BAS monthly:', basService.monthly);
            total += basService.monthly;
          }
        }
        if (responses.q6.ias === 'iasMonthly') {
          const iasService = serviceValuesAccounting.taxServices.ias[segment];
          if (iasService) {
            total += iasService.monthly;
          }
        }
      }
    } else if (responses.q6 !== '' && responses.q6 !== 'no') {
      // Handle old string format for backward compatibility
      if (responses.q6 === 'basQuarterly' || responses.q6 === 'basMonthly') {
        const basService = serviceValuesAccounting.taxServices.bas[segment];
        if (basService) {
          total += basService.monthly;
        }
      } else if (responses.q6 === 'iasMonthly') {
        const iasService = serviceValuesAccounting.taxServices.ias[segment];
        if (iasService) {
          total += iasService.monthly;
        }
      }
    }
  }

  // q7: Run payroll - not directly a service cost
  // q7a: Payroll processing - not directly mapped (varies by employee count)
  // q8: Salaried employees
  if (responses.q8 && typeof responses.q8 === 'object' && segment) {
    const { weekly = 0, fortnightly = 0, monthly = 0 } = responses.q8;
    const weeklyCount = parseInt(weekly, 10) || 0;
    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    const monthlyCount = parseInt(monthly, 10) || 0;

    const totalSalaried = weeklyCount + fortnightlyCount + monthlyCount;
    if (totalSalaried > 0) {
      const payrollProcessing = serviceValuesAccounting.payrollServices.payrollProcessing?.salary;
      if (payrollProcessing) {
        total += payrollProcessing.monthly * totalSalaried;
      }
    }
  }

  // q9: Timesheet employees
  if (responses.q9 && typeof responses.q9 === 'object' && segment) {
    const { weekly = 0, fortnightly = 0, monthly = 0 } = responses.q9;
    const weeklyCount = parseInt(weekly, 10) || 0;
    const fortnightlyCount = parseInt(fortnightly, 10) || 0;
    const monthlyCount = parseInt(monthly, 10) || 0;

    const totalTimesheet = weeklyCount + fortnightlyCount + monthlyCount;
    if (totalTimesheet > 0) {
      const payrollProcessing = serviceValuesAccounting.payrollServices.payrollProcessing?.timesheets;
      if (payrollProcessing) {
        total += payrollProcessing.monthly * totalTimesheet;
      }
    }
  }

  // q10: Single Touch Payroll
  if (responses.q10 && responses.q10 !== 'no' && segment) {
    const stpService = serviceValuesAccounting.payrollServices.stpReporting?.[segment];
    if (stpService) {
      total += stpService.monthly;
    }
  }

  // q11: Superannuation lodgement
  if (responses.q11 && responses.q11 !== 'no' && segment) {
    const superService = serviceValuesAccounting.payrollServices.superPrepAndLodgement?.[segment];
    if (superService) {
      total += superService.monthly;
    }
  }

  // q12: Payroll tax returns
  if (responses.q12 === 'yes' && segment) {
    const payrollTaxService = serviceValuesAccounting.payrollServices.payrollTaxReturns?.[segment];
    if (payrollTaxService) {
      total += payrollTaxService.monthly;
    }
  }

  // q13: Workers compensation
  if (responses.q13 === 'yes' && segment) {
    const workersCompService = serviceValuesAccounting.payrollServices.workersCompensation?.[segment];
    if (workersCompService) {
      total += workersCompService.monthly;
    }
  }

  // q14: Long service leave - not directly mapped in accountingServicesValues
  // q15: TPAR
  if (responses.q15 === 'yes' && segment) {
    const tparService = serviceValuesAccounting.taxServices.tpar?.[segment];
    if (tparService) {
      total += tparService.monthly;
    }
  }

  // q16: FBT return
  if (responses.q16 === 'yes' && segment) {
    const fbtService = serviceValuesAccounting.taxServices.fbtReturns?.[segment];
    if (fbtService) {
      total += fbtService.monthly;
    }
  }

  // q17: Tax planning
  if (responses.q17 === 'yes' && segment) {
    const taxPlanningService = serviceValuesAccounting.advisoryServices.taxPlanningReview?.[segment];
    if (taxPlanningService) {
      total += taxPlanningService.monthly;
    }
  }

  // q18: Tax structuring
  if (responses.q18 === 'yes' && segment) {
    const taxStructuringService = serviceValuesAccounting.advisoryServices.taxStructuringAdvice?.[segment];
    if (taxStructuringService) {
      total += taxStructuringService.monthly;
    }
  }

  // q19: Financial statements
  if (responses.q19 === 'yes' && segment) {
    const fsService = serviceValuesAccounting.reporting.financialStatementsTax?.[segment];
    if (fsService) {
      total += fsService.monthly;
    }
  }

  // q20: Statutory financial statements
  if (responses.q20 === 'yes' && segment) {
    const statutoryService = serviceValuesAccounting.reporting.statutoryFinancialStatements?.[segment];
    if (statutoryService) {
      total += statutoryService.monthly;
    }
  }

  // q21: Management financial statements
  if (responses.q21 && responses.q21 !== 'no' && segment) {
    const mfsService = serviceValuesAccounting.reporting.managementFinancialStatements?.[segment];
    if (mfsService) {
      total += mfsService.monthly;
    }
  }

  // q22: Review the Numbers meetings
  if (responses.q22 && responses.q22 !== 'no' && segment) {
    const reviewService = serviceValuesAccounting.meetings.reviewNumbers?.[segment];
    if (reviewService) {
      total += reviewService.monthly;
    }
  }

  // q23: Annual tax meetings
  if (responses.q23 === 'yes' && segment) {
    const annualService = serviceValuesAccounting.meetings.annualTaxMeetings?.[segment];
    if (annualService) {
      total += annualService.monthly;
    }
  }

  // q24: Support level
  if (responses.q24 && responses.q24 !== '' && segment) {
    if (responses.q24 === 'emailTeam' || responses.q24 === 'emailPhoneTeamCsm') {
      const teamSupport = serviceValuesAccounting.supportServices.teamOrEmail?.[segment];
      if (teamSupport) {
        total += teamSupport.monthly;
      }
    }
    if (responses.q24 === 'emailPhoneTeamCsm' || responses.q24 === 'emailPhoneCsmOwner') {
      const csmSupport = serviceValuesAccounting.supportServices.clientServiceManager?.[segment];
      if (csmSupport) {
        total += csmSupport.monthly;
      }
    }
    if (responses.q24 === 'emailPhoneCsmOwner') {
      const ownerSupport = serviceValuesAccounting.supportServices.principalOwner?.[segment];
      if (ownerSupport) {
        total += ownerSupport.monthly;
      }
    }
  }

  // q25: ASIC company secretarial work
  if (responses.q25) {
    // Handle new object format (can select multiple)
    if (typeof responses.q25 === 'object' && responses.q25 !== null) {
      if (responses.q25.annualReturns) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.monthly;
        }
      }
      if (responses.q25.detailChanges) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicFormsLodgements;
        if (asicService) {
          total += asicService.monthly;
        }
      }
    } 
    // Handle old string format for backward compatibility
    else if (responses.q25 !== '' && responses.q25 !== 'no') {
      if (responses.q25 === 'annualReturns') {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.monthly;
        }
      } else if (responses.q25 === 'detailChanges') {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicFormsLodgements;
        if (asicService) {
          total += asicService.monthly;
        }
      }
    }
  }

  // q25b: ATO payment plans
  if (responses.q25b && responses.q25b !== '' && responses.q25b !== 'no') {
    if (responses.q25b === 'basicPlans') {
      const atoPlan = serviceValuesAccounting.atoPaymentPlans.basicPlans;
      if (atoPlan) {
        total += atoPlan.monthly || 0;
      }
    } else if (responses.q25b === 'hardshipPlans') {
      const atoPlan = serviceValuesAccounting.atoPaymentPlans.hardshipPlans;
      if (atoPlan) {
        total += atoPlan.monthly || 0;
      }
    }
  }

  const adjustedTotal = Math.round(total * multiplier * 100) / 100;
  console.log('calculateTotalMonthlyPrice returning:', adjustedTotal, '(base:', total, 'x multiplier:', multiplier, ')');
  return adjustedTotal; // Round to 2 decimal places with pricing modifier applied
};

/**
 * Calculates total once-off (yearly) fees based on question responses
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

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('calculateTotalOnceOffFee - q1:', responses.q1, 'segment:', segment, 'q2a:', responses.q2a);
  }

  // q2a: System setup (Xero Setup)
  if (responses.q2a === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.xeroSetup) {
    const xeroSetup = serviceValuesAccounting.advisoryServices.xeroSetup[segment];
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding xeroSetup:', xeroSetup);
    }
    if (xeroSetup) {
      total += xeroSetup.yearly;
    }
  }

  // q7a: System setup for employees (Xero Training)
  if (responses.q7a === 'systemSetup' && responses.q7aEmployees && segment && serviceValuesAccounting?.advisoryServices?.xeroTraining) {
    const employeeCount = parseInt(responses.q7aEmployees, 10);
    if (!isNaN(employeeCount) && employeeCount > 0) {
      const xeroTraining = serviceValuesAccounting.advisoryServices.xeroTraining[segment];
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding xeroTraining for employees:', xeroTraining, 'count:', employeeCount);
      }
      if (xeroTraining) {
        total += xeroTraining.yearly * employeeCount;
      }
    }
  }

  // q18: Tax structuring
  if (responses.q18 === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.taxStructuringAdvice) {
    const taxStructuring = serviceValuesAccounting.advisoryServices.taxStructuringAdvice[segment];
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding taxStructuringAdvice:', taxStructuring);
    }
    if (taxStructuring) {
      total += taxStructuring.yearly;
    }
  }

  // q25b: ATO payment plans
  if (responses.q25b && responses.q25b !== '' && serviceValuesAccounting?.atoPaymentPlans) {
    let atoPlan = null;
    if (responses.q25b === 'basicPlans') {
      atoPlan = serviceValuesAccounting.atoPaymentPlans.basicPlans;
    } else if (responses.q25b === 'hardshipPlans') {
      atoPlan = serviceValuesAccounting.atoPaymentPlans.hardshipPlans;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding atoPaymentPlans:', atoPlan);
    }
    if (atoPlan) {
      total += atoPlan.yearly;
    }
  }

  // q27: Prior year lodgements (multiple return types)
  if (responses.q26 && typeof responses.q26 === 'object' && segment) {
    // Business returns
    if (responses.q26.business) {
      const businessCount = parseInt(responses.q26.business, 10);
      if (!isNaN(businessCount) && businessCount > 0 && serviceValuesAccounting?.taxServices?.businessReturns) {
        const businessReturn = serviceValuesAccounting.taxServices.businessReturns[segment];
        if (businessReturn) {
          total += businessReturn.yearly * businessCount;
        }
      }
    }

    // Individual returns
    if (responses.q26.individuals) {
      const individualCount = parseInt(responses.q26.individuals, 10);
      if (!isNaN(individualCount) && individualCount > 0 && serviceValuesAccounting?.taxServices?.individualReturns) {
        const individualReturn = serviceValuesAccounting.taxServices.individualReturns.all;
        if (individualReturn) {
          total += individualReturn.yearly * individualCount;
        }
      }
    }

    // BAS returns
    if (responses.q26.bas) {
      const basCount = parseInt(responses.q26.bas, 10);
      if (!isNaN(basCount) && basCount > 0 && serviceValuesAccounting?.taxServices?.bas) {
        const basService = serviceValuesAccounting.taxServices.bas[segment];
        if (basService) {
          total += basService.yearly * basCount;
        }
      }
    }

    // SMSF
    if (responses.q26.smsf) {
      const smsfCount = parseInt(responses.q26.smsf, 10);
      if (!isNaN(smsfCount) && smsfCount > 0 && serviceValuesAccounting?.taxServices?.smsf) {
        const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
        if (smsfService) {
          total += smsfService.yearly * smsfCount;
        }
      }
    }

    // IAS returns
    if (responses.q26.ias) {
      const iasCount = parseInt(responses.q26.ias, 10);
      if (!isNaN(iasCount) && iasCount > 0 && serviceValuesAccounting?.taxServices?.ias) {
        const iasService = serviceValuesAccounting.taxServices.ias[segment];
        if (iasService) {
          total += iasService.yearly * iasCount;
        }
      }
    }

    // FBT returns
    if (responses.q26.fbt) {
      const fbtCount = parseInt(responses.q26.fbt, 10);
      if (!isNaN(fbtCount) && fbtCount > 0 && serviceValuesAccounting?.taxServices?.fbtReturns) {
        const fbtService = serviceValuesAccounting.taxServices.fbtReturns[segment];
        if (fbtService) {
          total += fbtService.yearly * fbtCount;
        }
      }
    }

    // TPAR
    if (responses.q26.tpar) {
      const tparCount = parseInt(responses.q26.tpar, 10);
      if (!isNaN(tparCount) && tparCount > 0 && serviceValuesAccounting?.taxServices?.tpar) {
        const tparService = serviceValuesAccounting.taxServices.tpar[segment];
        if (tparService) {
          total += tparService.yearly * tparCount;
        }
      }
    }

    // Workers Compensation
    if (responses.q26.workersComp) {
      const workersCompCount = parseInt(responses.q26.workersComp, 10);
      if (!isNaN(workersCompCount) && workersCompCount > 0 && serviceValuesAccounting?.payrollServices?.workersCompensation) {
        const workersCompService = serviceValuesAccounting.payrollServices.workersCompensation[segment];
        if (workersCompService) {
          total += workersCompService.yearly * workersCompCount;
        }
      }
    }

    // Super Prep and Lodgement
    if (responses.q26.super) {
      const superCount = parseInt(responses.q26.super, 10);
      if (!isNaN(superCount) && superCount > 0 && serviceValuesAccounting?.payrollServices?.superPrepAndLodgement) {
        const superService = serviceValuesAccounting.payrollServices.superPrepAndLodgement[segment];
        if (superService) {
          total += superService.yearly * superCount;
        }
      }
    }

    // STP Reporting
    if (responses.q26.stpEoy) {
      const stpCount = parseInt(responses.q26.stpEoy, 10);
      if (!isNaN(stpCount) && stpCount > 0 && serviceValuesAccounting?.payrollServices?.stpReporting) {
        const stpService = serviceValuesAccounting.payrollServices.stpReporting[segment];
        if (stpService) {
          total += stpService.yearly * stpCount;
        }
      }
    }

    // LSL Reporting
    if (responses.q26.lslForms) {
      const lslCount = parseInt(responses.q26.lslForms, 10);
      if (!isNaN(lslCount) && lslCount > 0 && serviceValuesAccounting?.payrollServices?.lslReporting) {
        const lslService = serviceValuesAccounting.payrollServices.lslReporting[segment];
        if (lslService) {
          total += lslService.yearly * lslCount;
        }
      }
    }

    // Payroll Tax Returns
    if (responses.q26.payrollTax) {
      const payrollTaxCount = parseInt(responses.q26.payrollTax, 10);
      if (!isNaN(payrollTaxCount) && payrollTaxCount > 0 && serviceValuesAccounting?.payrollServices?.payrollTaxReturns) {
        const payrollTaxService = serviceValuesAccounting.payrollServices.payrollTaxReturns[segment];
        if (payrollTaxService) {
          total += payrollTaxService.yearly * payrollTaxCount;
        }
      }
    }

    // ASIC Annual Return
    if (responses.q26.asic) {
      const asicCount = parseInt(responses.q26.asic, 10);
      if (!isNaN(asicCount) && asicCount > 0 && serviceValuesAccounting?.corporateSecretarial?.asicAnnualReturn) {
        const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
        if (asicService) {
          total += asicService.yearly * asicCount;
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Q27 prior year lodgements total:', total);
    }
  }

  return Math.round(total * multiplier * 100) / 100; // Round to 2 decimal places with pricing modifier applied
};
