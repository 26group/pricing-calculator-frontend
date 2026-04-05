export const serviceValuesAccounting = {
  revenueSegments: {
    micro: '< $250K',
    small: '$250K - $500K',
    medium: '$500K - $1M',
    large: '$1M - $3M',
    enterprise: '$3M plus',
  },
  taxServices: {
    individualReturns: {
      all: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Individual Returns ALL',
      },
    },
    individualReturnExtras: {
      rentalProperty: {
        providedByClient: {
          monthly: 12.5,
          yearly: 150,
          inclusion: 'Rental Property - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 25,
          yearly: 300,
          inclusion: 'Rental Property - Summary prepared by the firm',
        },
      },
      managedFunds: {
        providedByClient: {
          monthly: 4.17,
          yearly: 50,
          inclusion: 'Managed Funds - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 8.33,
          yearly: 100,
          inclusion: 'Managed Funds - Summary prepared by the firm',
        },
      },
      dividendsNotReportedToATO: {
        providedByClient: {
          monthly: 4.17,
          yearly: 50,
          inclusion: 'Dividends not reported to ATO - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 8.33,
          yearly: 100,
          inclusion: 'Dividends not reported to ATO - Summary prepared by the firm',
        },
      },
      interestNotReportedToATO: {
        providedByClient: {
          monthly: 4.17,
          yearly: 50,
          inclusion: 'Interest not reported to ATO - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 8.33,
          yearly: 100,
          inclusion: 'Interest not reported to ATO - Summary prepared by the firm',
        },
      },
      cgtSharesAndEquities: {
        providedByClient: {
          monthly: 12.5,
          yearly: 150,
          inclusion: 'CGT - shares and equities etc - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 25,
          yearly: 300,
          inclusion: 'CGT - shares and equities etc - Summary prepared by the firm',
        },
      },
      cgtPropertySales: {
        providedByClient: {
          monthly: 45.83,
          yearly: 550,
          inclusion: 'CGT - Property sales - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 91.67,
          yearly: 1100,
          inclusion: 'CGT - Property sales - Summary prepared by the firm',
        },
      },
      balancingAdjustmentCalculation: {
        providedByClient: {
          monthly: 4.17,
          yearly: 50,
          inclusion: 'Balancing adjustment calculation (sale of business asset) - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 8.33,
          yearly: 100,
          inclusion: 'Balancing adjustment calculation (sale of business asset) - Summary prepared by the firm',
        },
      },
      deductionsMoreThan3Standard: {
        providedByClient: {
          monthly: 4.17,
          yearly: 50,
          inclusion: 'Deductions - more than 3 standard expenses - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 8.33,
          yearly: 100,
          inclusion: 'Deductions - more than 3 standard expenses - Summary prepared by the firm',
        },
      },
      motorVehicleLogBook: {
        providedByClient: {
          monthly: 4.17,
          yearly: 50,
          inclusion: 'Motor Vehicle Schedule - log book method - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 8.33,
          yearly: 100,
          inclusion: 'Motor Vehicle Schedule - log book method - Summary prepared by the firm',
        },
      },
      motorVehicleStatutoryRate: {
        providedByClient: {
          monthly: 4.17,
          yearly: 50,
          inclusion: 'Motor Vehicle claim statutory rate - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 8.33,
          yearly: 100,
          inclusion: 'Motor Vehicle claim statutory rate - Summary prepared by the firm',
        },
      },
      amendmentOriginalPreparedByFirm: {
        providedByClient: {
          monthly: 8.33,
          yearly: 100,
          inclusion: 'Amendment to lodge returns - Original prepared by firm - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 16.67,
          yearly: 200,
          inclusion: 'Amendment to lodge returns - Original prepared by firm - Summary prepared by the firm',
        },
      },
      amendmentOriginalNotPreparedByFirm: {
        providedByClient: {
          monthly: 20.83,
          yearly: 250,
          inclusion: 'Amendment to lodge returns - Original not prepared by firm - Summary provided by client',
        },
        preparedByFirm: {
          monthly: 33.33,
          yearly: 400,
          inclusion: 'Amendment to lodge returns - Original not prepared by firm - Summary prepared by the firm',
        },
      },
      returnNotNecessary: {
        providedByClient: {
          monthly: 4.17,
          yearly: 50,
          inclusion: 'Return not necessary',
        },
        preparedByFirm: null,
      },
    },
    businessReturns: {
      micro: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Micro < $250K',
      },
      small: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Small < $500K',
      },
      medium: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Medium < $1M',
      },
      large: {
        monthly: 250,
        yearly: 3000,
        inclusion: 'Large < $3M',
      },
      enterprise: {
        monthly: 375,
        yearly: 4500,
        inclusion: 'Enterprise $3M plus',
      },
    },
    smsf: {
      micro: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'SMSF - Micro < $250K',
      },
      small: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'SMSF - Small < $500K',
      },
      medium: {
        monthly: 333.33,
        yearly: 4000,
        inclusion: 'SMSF - Medium < $1M',
      },
      large: {
        monthly: 500,
        yearly: 6000,
        inclusion: 'SMSF - Large < $3M',
      },
      enterprise: {
        monthly: 750,
        yearly: 9000,
        inclusion: 'SMSF - Enterprise $3M plus',
      },
    },
    fbtReturns: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'FBT - Micro < $250K',
      },
      small: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'FBT - Small < $500K',
      },
      medium: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'FBT - Medium < $1M',
      },
      large: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'FBT - Large < $3M',
      },
      enterprise: {
        monthly: 187.5,
        yearly: 2250,
        inclusion: 'FBT - Enterprise $3M plus',
      },
    },
    bas: {
      micro: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'BAS - Micro < $250K (per return)',
      },
      small: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'BAS - Small < $500K (per return)',
      },
      medium: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'BAS - Medium < $1M (per return)',
      },
      large: {
        monthly: 25,
        yearly: 300,
        inclusion: 'BAS - Large < $3M (per return)',
      },
      enterprise: {
        monthly: 37.5,
        yearly: 450,
        inclusion: 'BAS - Enterprise $3M plus (per return)',
      },
    },
    ias: {
      micro: {
        monthly: 8.33,
        yearly: 100,
        inclusion: 'IAS - Micro < $250K (per return)',
      },
      small: {
        monthly: 8.33,
        yearly: 100,
        inclusion: 'IAS - Small < $500K (per return)',
      },
      medium: {
        monthly: 10.42,
        yearly: 125,
        inclusion: 'IAS - Medium < $1M (per return)',
      },
      large: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'IAS - Large < $3M (per return)',
      },
      enterprise: {
        monthly: 18.75,
        yearly: 225,
        inclusion: 'IAS - Enterprise $3M plus (per return)',
      },
    },
    tpar: {
      micro: {
        monthly: 18.33,
        yearly: 220,
        inclusion: 'TPAR - Micro < $250K (per return)',
      },
      small: {
        monthly: 18.33,
        yearly: 220,
        inclusion: 'TPAR - Small < $500K (per return)',
      },
      medium: {
        monthly: 18.33,
        yearly: 220,
        inclusion: 'TPAR - Medium < $1M (per return)',
      },
      large: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'TPAR - Large < $3M (per return)',
      },
      enterprise: {
        monthly: 31.25,
        yearly: 375,
        inclusion: 'TPAR - Enterprise $3M plus (per return)',
      },
    },
  },
  corporateSecretarial: {
    asicAnnualReturn: {
      monthly: 33.33,
      yearly: 400,
      inclusion: 'ASIC Annual Return',
    },
    asicFormsLodgements: {
      monthly: 12.5,
      yearly: 150,
      inclusion: 'ASIC Forms Lodgements',
    },
  },
  atoPaymentPlans: {
    basicPlans: {
      monthly: null,
      yearly: 500,
      inclusion: 'Basic plans',
    },
    hardshipPlans: {
      monthly: null,
      yearly: 1000,
      inclusion: 'Longer term & hardship plans',
    },
  },
  payrollServices: {
    workersCompensation: {
      micro: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'Workers Comp - Micro < $250K',
      },
      small: {
        monthly: 33.33,
        yearly: 400,
        inclusion: 'Workers Comp - Small < $500K',
      },
      medium: {
        monthly: 45.83,
        yearly: 550,
        inclusion: 'Workers Comp - Medium < $1M',
      },
      large: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Workers Comp - Large < $3M',
      },
      enterprise: {
        monthly: 93.75,
        yearly: 1125,
        inclusion: 'Workers Comp - Enterprise $3M plus',
      },
    },
    payrollProcessing: {
      salary: {
        monthly: 10,
        yearly: null,
        inclusion: 'Payroll processing per salaried employee',
      },
      timesheets: {
        monthly: 15,
        yearly: null,
        inclusion: 'Payroll processing per timesheet employee',
      },
    },
    payrollTaxReturns: {
      medium: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'Payroll Tax - Medium < $1M',
      },
      large: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Payroll Tax - Large < $3M',
      },
      enterprise: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Payroll Tax - Enterprise $3M plus',
      },
    },
    superPrepAndLodgement: {
      micro: {
        monthly: 8.33,
        yearly: 100,
        inclusion: 'Super Prep and Lodgement - Micro < $250K',
      },
      small: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'Super Prep and Lodgement - Small < $500K',
      },
      medium: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Super Prep and Lodgement - Medium < $1M',
      },
      large: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Super Prep and Lodgement - Large < $3M',
      },
      enterprise: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Super Prep and Lodgement - Enterprise $3M plus',
      },
    },
    stpReporting: {
      micro: {
        monthly: 8.33,
        yearly: 100,
        inclusion: 'STP Reporting - Micro < $250K',
      },
      small: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'STP Reporting - Small < $500K',
      },
      medium: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'STP Reporting - Medium < $1M',
      },
      large: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'STP Reporting - Large < $3M',
      },
      enterprise: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'STP Reporting - Enterprise $3M plus',
      },
    },
    lslReporting: {
      micro: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'LSL Construction Reporting - Micro < $250K',
      },
      small: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'LSL Construction Reporting - Small < $500K',
      },
      medium: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'LSL Construction Reporting - Medium < $1M',
      },
      large: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'LSL Construction Reporting - Large < $3M',
      },
      enterprise: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'LSL Construction Reporting - Enterprise $3M plus',
      },
    },
  },
  advisoryServices: {
    taxPlanningReview: {
      micro: {
        monthly: 33.33,
        yearly: 400,
        inclusion: 'Tax Planning / Review - Micro < $250K',
      },
      small: {
        monthly: 50,
        yearly: 600,
        inclusion: 'Tax Planning / Review - Small < $500K',
      },
      medium: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Tax Planning / Review - Medium < $1M',
      },
      large: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Tax Planning / Review - Large < $3M',
      },
      enterprise: {
        monthly: 250,
        yearly: 3000,
        inclusion: 'Tax Planning / Review - Enterprise $3M plus',
      },
    },
    taxStructuringAdvice: {
      micro: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Tax Structuring Advice - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Tax Structuring Advice - Small < $500K',
      },
      medium: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Tax Structuring Advice - Medium < $1M',
      },
      large: {
        monthly: 416.67,
        yearly: 5000,
        inclusion: 'Tax Structuring Advice - Large < $3M',
      },
      enterprise: {
        monthly: 625,
        yearly: 7500,
        inclusion: 'Tax Structuring Advice - Enterprise $3M plus',
      },
    },
    xeroSetup: {
      micro: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Xero Setup - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Xero Setup - Small < $500K',
      },
      medium: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Xero Setup - Medium < $1M',
      },
      large: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Xero Setup - Large < $3M',
      },
      enterprise: {
        monthly: 187.5,
        yearly: 2250,
        inclusion: 'Xero Setup - Enterprise $3M plus',
      },
    },
    xeroTraining: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Xero Training - Micro < $250K',
      },
      small: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Xero Training - Small < $500K',
      },
      medium: {
        monthly: 66.67,
        yearly: 800,
        inclusion: 'Xero Training - Medium < $1M',
      },
      large: {
        monthly: 100,
        yearly: 1200,
        inclusion: 'Xero Training - Large < $3M',
      },
      enterprise: {
        monthly: 150,
        yearly: 1800,
        inclusion: 'Xero Training - Enterprise $3M plus',
      },
    },
  },
  reporting: {
    financialStatementsTax: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Financial Statements - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Financial Statements - Small < $500K',
      },
      medium: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Financial Statements - Medium < $1M',
      },
      large: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Financial Statements - Large < $3M',
      },
      enterprise: {
        monthly: 250,
        yearly: 3000,
        inclusion: 'Financial Statements - Enterprise $3M plus',
      },
    },
    statutoryFinancialStatements: {
      large: {
        monthly: 250,
        yearly: 3000,
        inclusion: 'Statutory Financial Statements - Large < $3M',
      },
      enterprise: {
        monthly: 375,
        yearly: 4500,
        inclusion: 'Statutory Financial Statements - Enterprise $3M plus',
      },
    },
    managementFinancialStatements: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Management Financial Statements - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Management Financial Statements - Small < $500K',
      },
      medium: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Management Financial Statements - Medium < $1M',
      },
      large: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Management Financial Statements - Large < $3M',
      },
      enterprise: {
        monthly: 250,
        yearly: 3000,
        inclusion: 'Management Financial Statements - Enterprise $3M plus',
      },
    },
  },
  meetings: {
    reviewNumbers: {
      micro: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'Review The Numbers Meetings - Micro < $250K',
      },
      small: {
        monthly: 25,
        yearly: 300,
        inclusion: 'Review The Numbers Meetings - Small < $500K',
      },
      medium: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Review The Numbers Meetings - Medium < $1M',
      },
      large: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Review The Numbers Meetings - Large < $3M',
      },
      enterprise: {
        monthly: 93.75,
        yearly: 1125,
        inclusion: 'Review The Numbers Meetings - Enterprise $3M plus',
      },
    },
    annualTaxMeetings: {
      micro: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'Annual Meetings - Micro < $250K',
      },
      small: {
        monthly: 25,
        yearly: 300,
        inclusion: 'Annual Meetings - Small < $500K',
      },
      medium: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Annual Meetings - Medium < $1M',
      },
      large: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Annual Meetings - Large < $3M',
      },
      enterprise: {
        monthly: 93.75,
        yearly: 1125,
        inclusion: 'Annual Meetings - Enterprise $3M plus',
      },
    },
  },
  supportServices: {
    teamOrEmail: {
      micro: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Team or Email - Micro < $250K',
      },
      small: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Team or Email - Small < $500K',
      },
      medium: {
        monthly: 33.33,
        yearly: 400,
        inclusion: 'Team or Email - Medium < $1M',
      },
      large: {
        monthly: 50,
        yearly: 600,
        inclusion: 'Team or Email - Large < $3M',
      },
      enterprise: {
        monthly: 75,
        yearly: 900,
        inclusion: 'Team or Email - Enterprise $3M plus',
      },
    },
    clientServiceManager: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Client Service Manager - Micro < $250K',
      },
      small: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Client Service Manager - Small < $500K',
      },
      medium: {
        monthly: 50,
        yearly: 600,
        inclusion: 'Client Service Manager - Medium < $1M',
      },
      large: {
        monthly: 100,
        yearly: 1200,
        inclusion: 'Client Service Manager - Large < $3M',
      },
      enterprise: {
        monthly: 150,
        yearly: 1800,
        inclusion: 'Client Service Manager - Enterprise $3M plus',
      },
    },
    principalOwner: {
      micro: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Principal / Owner - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Principal / Owner - Small < $500K',
      },
      medium: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Principal / Owner - Medium < $1M',
      },
      large: {
        monthly: 208.33,
        yearly: 2500,
        inclusion: 'Principal / Owner - Large < $3M',
      },
      enterprise: {
        monthly: 312.5,
        yearly: 3750,
        inclusion: 'Principal / Owner - Enterprise $3M plus',
      },
    },
  },
};
