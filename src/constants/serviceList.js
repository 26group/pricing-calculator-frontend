export const serviceValues = {
  taxServices: {
    individualReturns: {
      all: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Individual Returns ALL',
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
    },
    statutoryFinancialStatements: {
      large: {
        monthly: 250,
        yearly: 3000,
        inclusion: 'Statutory Financial Statements - Large < $3M',
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
    },
  },
};

export default serviceValues;
