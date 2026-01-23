import { serviceValuesAccounting } from '../constants/accountingServicesValues';

/**
 * Calculates total monthly pricing based on question responses
 * @param {Object} responses - Question responses from Questions.js
 * @returns {number} Total monthly cost
 */
export const calculateTotalMonthlyPrice = (responses) => {
  let total = 0;

  console.log('calculateTotalMonthlyPrice called with responses:', responses);

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

  const segment = getSegment(responses.q2);

  // q1: Services provided (checkbox) - not directly a service cost
  // q2: Revenue segment - used for lookups
  // q3: Accounting system - not directly a service cost
  // q3a: Set up system - not directly a service cost
  // q3b: Information method - not directly a service cost
  // q4: Number of business entities
  if (responses.q4 && responses.q4 !== '' && segment) {
    const businessCount = parseInt(responses.q4, 10);
    if (!isNaN(businessCount) && businessCount > 0) {
      // Business returns pricing per entity
      const businessReturn = serviceValuesAccounting.taxServices.businessReturns[segment];
      if (businessReturn) {
        total += businessReturn.monthly * businessCount;
      }
    }
  }

  // q5: Number of individual returns
  if (responses.q5 && responses.q5 !== '') {
    const individualCount = parseInt(responses.q5, 10);
    if (!isNaN(individualCount) && individualCount > 0) {
      const individualReturn = serviceValuesAccounting.taxServices.individualReturns.all;
      if (individualReturn) {
        total += individualReturn.monthly * individualCount;
      }
    }
  }

  // q6: SMSF
  if (responses.q6 === 'yes' && segment) {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q6a: SMSF audit and tax return
  if (responses.q6a === 'yes' && segment) {
    const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
    if (smsfService) {
      total += smsfService.monthly;
    }
  }

  // q7: BAS/IAS
  if (responses.q7 && segment) {
    // Handle new object format { bas: 'basQuarterly'|'basMonthly', ias: 'iasMonthly'|undefined }
    if (typeof responses.q7 === 'object' && responses.q7 !== null) {
      if (responses.q7.bas === 'basQuarterly' || responses.q7.bas === 'basMonthly') {
        const basService = serviceValuesAccounting.taxServices.bas[segment];
        if (basService) {
          total += basService.monthly;
        }
      }
      if (responses.q7.ias === 'iasMonthly') {
        const iasService = serviceValuesAccounting.taxServices.ias[segment];
        if (iasService) {
          total += iasService.monthly;
        }
      }
    } else if (responses.q7 !== '') {
      // Handle old string format for backward compatibility
      if (responses.q7 === 'basQuarterly' || responses.q7 === 'basMonthly') {
        const basService = serviceValuesAccounting.taxServices.bas[segment];
        if (basService) {
          total += basService.monthly;
        }
      } else if (responses.q7 === 'iasMonthly') {
        const iasService = serviceValuesAccounting.taxServices.ias[segment];
        if (iasService) {
          total += iasService.monthly;
        }
      }
    }
  }

  // q8: Run payroll - not directly a service cost
  // q8a: Payroll processing - not directly mapped (varies by employee count)
  // q9: Salaried employees
  if (responses.q9 && typeof responses.q9 === 'object' && segment) {
    const { weekly = 0, fortnightly = 0, monthly = 0 } = responses.q9;
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

  // q10: Timesheet employees
  if (responses.q10 && typeof responses.q10 === 'object' && segment) {
    const { weekly = 0, fortnightly = 0, monthly = 0 } = responses.q10;
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

  // q11: Single Touch Payroll
  if (responses.q11 && responses.q11 !== 'no' && segment) {
    const stpService = serviceValuesAccounting.payrollServices.stpReporting?.[segment];
    if (stpService) {
      total += stpService.monthly;
    }
  }

  // q12: Superannuation lodgement
  if (responses.q12 && responses.q12 !== 'no' && segment) {
    const superService = serviceValuesAccounting.payrollServices.superPrepAndLodgement?.[segment];
    if (superService) {
      total += superService.monthly;
    }
  }

  // q13: Payroll tax returns
  if (responses.q13 === 'yes' && segment) {
    const payrollTaxService = serviceValuesAccounting.payrollServices.payrollTaxReturns?.[segment];
    if (payrollTaxService) {
      total += payrollTaxService.monthly;
    }
  }

  // q14: Workers compensation
  if (responses.q14 === 'yes' && segment) {
    const workersCompService = serviceValuesAccounting.payrollServices.workersCompensation?.[segment];
    if (workersCompService) {
      total += workersCompService.monthly;
    }
  }

  // q15: Long service leave - not directly mapped in accountingServicesValues
  // q16: TPAR
  if (responses.q16 === 'yes' && segment) {
    const tparService = serviceValuesAccounting.taxServices.tpar?.[segment];
    if (tparService) {
      total += tparService.monthly;
    }
  }

  // q17: FBT return
  if (responses.q17 === 'yes' && segment) {
    const fbtService = serviceValuesAccounting.taxServices.fbtReturns?.[segment];
    if (fbtService) {
      total += fbtService.monthly;
    }
  }

  // q18: Tax planning
  if (responses.q18 === 'yes' && segment) {
    const taxPlanningService = serviceValuesAccounting.advisoryServices.taxPlanningReview?.[segment];
    if (taxPlanningService) {
      total += taxPlanningService.monthly;
    }
  }

  // q19: Tax structuring
  if (responses.q19 === 'yes' && segment) {
    const taxStructuringService = serviceValuesAccounting.advisoryServices.taxStructuringAdvice?.[segment];
    if (taxStructuringService) {
      total += taxStructuringService.monthly;
    }
  }

  // q20: Financial statements
  if (responses.q20 === 'yes' && segment) {
    const fsService = serviceValuesAccounting.reporting.financialStatementsTax?.[segment];
    if (fsService) {
      total += fsService.monthly;
    }
  }

  // q21: Statutory financial statements
  if (responses.q21 === 'yes' && segment) {
    const statutoryService = serviceValuesAccounting.reporting.statutoryFinancialStatements?.[segment];
    if (statutoryService) {
      total += statutoryService.monthly;
    }
  }

  // q22: Management financial statements
  if (responses.q22 && responses.q22 !== 'no' && segment) {
    const mfsService = serviceValuesAccounting.reporting.managementFinancialStatements?.[segment];
    if (mfsService) {
      total += mfsService.monthly;
    }
  }

  // q23: Review the Numbers meetings
  if (responses.q23 && responses.q23 !== 'no' && segment) {
    const reviewService = serviceValuesAccounting.meetings.reviewNumbers?.[segment];
    if (reviewService) {
      total += reviewService.monthly;
    }
  }

  // q24: Annual tax meetings
  if (responses.q24 === 'yes' && segment) {
    const annualService = serviceValuesAccounting.meetings.annualTaxMeetings?.[segment];
    if (annualService) {
      total += annualService.monthly;
    }
  }

  // q25: Support level
  if (responses.q25 && responses.q25 !== '' && segment) {
    if (responses.q25 === 'emailTeam' || responses.q25 === 'emailPhoneTeamCsm') {
      const teamSupport = serviceValuesAccounting.supportServices.teamOrEmail?.[segment];
      if (teamSupport) {
        total += teamSupport.monthly;
      }
    }
    if (responses.q25 === 'emailPhoneTeamCsm' || responses.q25 === 'emailPhoneCsmOwner') {
      const csmSupport = serviceValuesAccounting.supportServices.clientServiceManager?.[segment];
      if (csmSupport) {
        total += csmSupport.monthly;
      }
    }
    if (responses.q25 === 'emailPhoneCsmOwner') {
      const ownerSupport = serviceValuesAccounting.supportServices.principalOwner?.[segment];
      if (ownerSupport) {
        total += ownerSupport.monthly;
      }
    }
  }

  // q26: ASIC company secretarial work
  if (responses.q26 && responses.q26 !== '' && responses.q26 !== 'no') {
    if (responses.q26 === 'annualReturns') {
      const asicService = serviceValuesAccounting.corporateSecretarial.asicAnnualReturn;
      if (asicService) {
        total += asicService.monthly;
      }
    } else if (responses.q26 === 'detailChanges') {
      const asicService = serviceValuesAccounting.corporateSecretarial.asicFormsLodgements;
      if (asicService) {
        total += asicService.monthly;
      }
    }
  }

  // q26b: ATO payment plans
  if (responses.q26b && responses.q26b !== '' && responses.q26b !== 'no') {
    if (responses.q26b === 'basicPlans') {
      const atoPlan = serviceValuesAccounting.atoPaymentPlans.basicPlans;
      if (atoPlan) {
        total += atoPlan.monthly || 0;
      }
    } else if (responses.q26b === 'hardshipPlans') {
      const atoPlan = serviceValuesAccounting.atoPaymentPlans.hardshipPlans;
      if (atoPlan) {
        total += atoPlan.monthly || 0;
      }
    }
  }

  console.log('calculateTotalMonthlyPrice returning:', Math.round(total * 100) / 100);
  return Math.round(total * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculates total once-off (yearly) fees based on question responses
 * @param {Object} responses - Question responses from Questions.js
 * @returns {number} Total once-off fee
 */
export const calculateTotalOnceOffFee = (responses) => {
  let total = 0;

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

  const segment = getSegment(responses.q2);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('calculateTotalOnceOffFee - q2:', responses.q2, 'segment:', segment, 'q3a:', responses.q3a);
  }

  // q3a: System setup (Xero Setup)
  if (responses.q3a === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.xeroSetup) {
    const xeroSetup = serviceValuesAccounting.advisoryServices.xeroSetup[segment];
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding xeroSetup:', xeroSetup);
    }
    if (xeroSetup) {
      total += xeroSetup.yearly;
    }
  }

  // q8a: System setup for employees (Xero Training)
  if (responses.q8a === 'systemSetup' && responses.q8aEmployees && segment && serviceValuesAccounting?.advisoryServices?.xeroTraining) {
    const employeeCount = parseInt(responses.q8aEmployees, 10);
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

  // q19: Tax structuring
  if (responses.q19 === 'yes' && segment && serviceValuesAccounting?.advisoryServices?.taxStructuringAdvice) {
    const taxStructuring = serviceValuesAccounting.advisoryServices.taxStructuringAdvice[segment];
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding taxStructuringAdvice:', taxStructuring);
    }
    if (taxStructuring) {
      total += taxStructuring.yearly;
    }
  }

  // q26b: ATO payment plans
  if (responses.q26b && responses.q26b !== '' && serviceValuesAccounting?.atoPaymentPlans) {
    let atoPlan = null;
    if (responses.q26b === 'basicPlans') {
      atoPlan = serviceValuesAccounting.atoPaymentPlans.basicPlans;
    } else if (responses.q26b === 'hardshipPlans') {
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
  if (responses.q27 && typeof responses.q27 === 'object' && segment) {
    // Business returns
    if (responses.q27.business) {
      const businessCount = parseInt(responses.q27.business, 10);
      if (!isNaN(businessCount) && businessCount > 0 && serviceValuesAccounting?.taxServices?.businessReturns) {
        const businessReturn = serviceValuesAccounting.taxServices.businessReturns[segment];
        if (businessReturn) {
          total += businessReturn.yearly * businessCount;
        }
      }
    }

    // Individual returns
    if (responses.q27.individuals) {
      const individualCount = parseInt(responses.q27.individuals, 10);
      if (!isNaN(individualCount) && individualCount > 0 && serviceValuesAccounting?.taxServices?.individualReturns) {
        const individualReturn = serviceValuesAccounting.taxServices.individualReturns.all;
        if (individualReturn) {
          total += individualReturn.yearly * individualCount;
        }
      }
    }

    // BAS returns
    if (responses.q27.bas) {
      const basCount = parseInt(responses.q27.bas, 10);
      if (!isNaN(basCount) && basCount > 0 && serviceValuesAccounting?.taxServices?.bas) {
        const basService = serviceValuesAccounting.taxServices.bas[segment];
        if (basService) {
          total += basService.yearly * basCount;
        }
      }
    }

    // SMSF
    if (responses.q27.smsf) {
      const smsfCount = parseInt(responses.q27.smsf, 10);
      if (!isNaN(smsfCount) && smsfCount > 0 && serviceValuesAccounting?.taxServices?.smsf) {
        const smsfService = serviceValuesAccounting.taxServices.smsf[segment];
        if (smsfService) {
          total += smsfService.yearly * smsfCount;
        }
      }
    }

    // IAS returns
    if (responses.q27.ias) {
      const iasCount = parseInt(responses.q27.ias, 10);
      if (!isNaN(iasCount) && iasCount > 0 && serviceValuesAccounting?.taxServices?.ias) {
        const iasService = serviceValuesAccounting.taxServices.ias[segment];
        if (iasService) {
          total += iasService.yearly * iasCount;
        }
      }
    }

    // FBT returns
    if (responses.q27.fbt) {
      const fbtCount = parseInt(responses.q27.fbt, 10);
      if (!isNaN(fbtCount) && fbtCount > 0 && serviceValuesAccounting?.taxServices?.fbtReturns) {
        const fbtService = serviceValuesAccounting.taxServices.fbtReturns[segment];
        if (fbtService) {
          total += fbtService.yearly * fbtCount;
        }
      }
    }

    // TPAR
    if (responses.q27.tpar) {
      const tparCount = parseInt(responses.q27.tpar, 10);
      if (!isNaN(tparCount) && tparCount > 0 && serviceValuesAccounting?.taxServices?.tpar) {
        const tparService = serviceValuesAccounting.taxServices.tpar[segment];
        if (tparService) {
          total += tparService.yearly * tparCount;
        }
      }
    }

    // Workers Compensation
    if (responses.q27.workersComp) {
      const workersCompCount = parseInt(responses.q27.workersComp, 10);
      if (!isNaN(workersCompCount) && workersCompCount > 0 && serviceValuesAccounting?.payrollServices?.workersCompensation) {
        const workersCompService = serviceValuesAccounting.payrollServices.workersCompensation[segment];
        if (workersCompService) {
          total += workersCompService.yearly * workersCompCount;
        }
      }
    }

    // Super Prep and Lodgement
    if (responses.q27.super) {
      const superCount = parseInt(responses.q27.super, 10);
      if (!isNaN(superCount) && superCount > 0 && serviceValuesAccounting?.payrollServices?.superPrepAndLodgement) {
        const superService = serviceValuesAccounting.payrollServices.superPrepAndLodgement[segment];
        if (superService) {
          total += superService.yearly * superCount;
        }
      }
    }

    // STP Reporting
    if (responses.q27.stpEoy) {
      const stpCount = parseInt(responses.q27.stpEoy, 10);
      if (!isNaN(stpCount) && stpCount > 0 && serviceValuesAccounting?.payrollServices?.stpReporting) {
        const stpService = serviceValuesAccounting.payrollServices.stpReporting[segment];
        if (stpService) {
          total += stpService.yearly * stpCount;
        }
      }
    }

    // LSL Reporting
    if (responses.q27.lslForms) {
      const lslCount = parseInt(responses.q27.lslForms, 10);
      if (!isNaN(lslCount) && lslCount > 0 && serviceValuesAccounting?.payrollServices?.lslReporting) {
        const lslService = serviceValuesAccounting.payrollServices.lslReporting[segment];
        if (lslService) {
          total += lslService.yearly * lslCount;
        }
      }
    }

    // Payroll Tax Returns
    if (responses.q27.payrollTax) {
      const payrollTaxCount = parseInt(responses.q27.payrollTax, 10);
      if (!isNaN(payrollTaxCount) && payrollTaxCount > 0 && serviceValuesAccounting?.payrollServices?.payrollTaxReturns) {
        const payrollTaxService = serviceValuesAccounting.payrollServices.payrollTaxReturns[segment];
        if (payrollTaxService) {
          total += payrollTaxService.yearly * payrollTaxCount;
        }
      }
    }

    // ASIC Annual Return
    if (responses.q27.asic) {
      const asicCount = parseInt(responses.q27.asic, 10);
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

  return Math.round(total * 100) / 100; // Round to 2 decimal places
};
