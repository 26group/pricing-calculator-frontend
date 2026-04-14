// Accounting Services Values based on Accounting Price List v3 CSV
// Revenue segments: Micro (<$250K), Small ($250-500K), Medium ($500K-1M), Large ($1M-3M)
// Structure matches pricingCalculator.js expectations

export const serviceValuesAccounting = {
  revenueSegments: {
    micro: '< $250K',
    small: '$250K - $500K',
    medium: '$500K - $1M',
    large: '$1M - $3M',
  },

  // ===================
  // TAX SERVICES (Q1)
  // ===================
  taxServices: {
    // Q1a: Individual Tax Returns
    // Base individual return: $250/year = $25/month (same for all tiers)
    individualReturns: {
      all: {
        yearly: 250,
        monthly: 25,
        inclusion: 'Individual Returns — ALL',
      },
    },

    // Q1a Individual Return Extras - prices vary by client/firm summary
    individualReturnExtras: {
      rentalProperty: {
        providedByClient: {
          yearly: 150,
          monthly: 15,
          inclusion: 'Rental Property — Summary by Client',
        },
        preparedByFirm: {
          yearly: 300,
          monthly: 30,
          inclusion: 'Rental Property — Summary by Firm',
        },
      },
      managedFunds: {
        providedByClient: {
          yearly: 50,
          monthly: 5,
          inclusion: 'Managed Funds — Summary by Client',
        },
        preparedByFirm: {
          yearly: 100,
          monthly: 10,
          inclusion: 'Managed Funds — Summary by Firm',
        },
      },
      dividendsNotReportedToATO: {
        providedByClient: {
          yearly: 50,
          monthly: 5,
          inclusion: 'Dividends not reported to ATO — Summary by Client',
        },
        preparedByFirm: {
          yearly: 100,
          monthly: 10,
          inclusion: 'Dividends not reported to ATO — Summary by Firm',
        },
      },
      interestNotReportedToATO: {
        providedByClient: {
          yearly: 50,
          monthly: 5,
          inclusion: 'Interest not reported to ATO — Summary by Client',
        },
        preparedByFirm: {
          yearly: 100,
          monthly: 10,
          inclusion: 'Interest not reported to ATO — Summary by Firm',
        },
      },
      cgtSharesAndEquities: {
        providedByClient: {
          yearly: 150,
          monthly: 15,
          inclusion: 'CGT — Shares and equities — Summary by Client',
        },
        preparedByFirm: {
          yearly: 300,
          monthly: 30,
          inclusion: 'CGT — Shares and equities — Summary by Firm',
        },
      },
      cgtPropertySales: {
        providedByClient: {
          yearly: 550,
          monthly: 55,
          inclusion: 'CGT — Property sales — Summary by Client',
        },
        preparedByFirm: {
          yearly: 1100,
          monthly: 110,
          inclusion: 'CGT — Property sales — Summary by Firm',
        },
      },
      balancingAdjustmentCalculation: {
        providedByClient: {
          yearly: 50,
          monthly: 5,
          inclusion: 'Balancing adjustment — sale of business asset — Summary by Client',
        },
        preparedByFirm: {
          yearly: 100,
          monthly: 10,
          inclusion: 'Balancing adjustment — sale of business asset — Summary by Firm',
        },
      },
      deductionsMoreThan3Standard: {
        providedByClient: {
          yearly: 50,
          monthly: 5,
          inclusion: 'Deductions — more than 3 standard expenses — Summary by Client',
        },
        preparedByFirm: {
          yearly: 100,
          monthly: 10,
          inclusion: 'Deductions — more than 3 standard expenses — Summary by Firm',
        },
      },
      motorVehicleLogBook: {
        providedByClient: {
          yearly: 50,
          monthly: 5,
          inclusion: 'Motor Vehicle — log book method — Summary by Client',
        },
        preparedByFirm: {
          yearly: 100,
          monthly: 10,
          inclusion: 'Motor Vehicle — log book method — Summary by Firm',
        },
      },
      motorVehicleStatutoryRate: {
        providedByClient: {
          yearly: 50,
          monthly: 5,
          inclusion: 'Motor Vehicle — statutory rate — Summary by Client',
        },
        preparedByFirm: {
          yearly: 100,
          monthly: 10,
          inclusion: 'Motor Vehicle — statutory rate — Summary by Firm',
        },
      },
      amendmentOriginalPreparedByFirm: {
        providedByClient: {
          yearly: 100,
          monthly: 10,
          inclusion: 'Amendment — original return prepared by firm — Summary by Client',
        },
        preparedByFirm: {
          yearly: 200,
          monthly: 20,
          inclusion: 'Amendment — original return prepared by firm — Summary by Firm',
        },
      },
      amendmentOriginalNotPreparedByFirm: {
        providedByClient: {
          yearly: 200,
          monthly: 20,
          inclusion: 'Amendment — original return NOT prepared by firm — Summary by Client',
        },
        preparedByFirm: {
          yearly: 400,
          monthly: 40,
          inclusion: 'Amendment — original return NOT prepared by firm — Summary by Firm',
        },
      },
      returnNotNecessary: {
        onceOff: 60, // Base price $60, multiplied at calculation time
        inclusion: 'Return not necessary (once-off)',
      },
    },

    // Q1b: Business Tax Returns
    businessReturns: {
      micro: {
        yearly: 750,
        monthly: 75,
        inclusion: 'Business Returns — Micro',
      },
      small: {
        yearly: 1500,
        monthly: 150,
        inclusion: 'Business Returns — Small',
      },
      medium: {
        yearly: 2000,
        monthly: 200,
        inclusion: 'Business Returns — Medium',
      },
      large: {
        yearly: 3000,
        monthly: 300,
        inclusion: 'Business Returns — Large',
      },
    },

    // Q1c: SMSF
    smsf: {
      micro: {
        yearly: 2000,
        monthly: 200,
        inclusion: 'SMSF — Micro',
      },
      small: {
        yearly: 2500,
        monthly: 250,
        inclusion: 'SMSF — Small',
      },
      medium: {
        yearly: 4000,
        monthly: 400,
        inclusion: 'SMSF — Medium',
      },
      large: {
        yearly: 6000,
        monthly: 600,
        inclusion: 'SMSF — Large',
      },
    },

    // Q1d: FBT Returns
    fbtReturns: {
      micro: {
        yearly: 500,
        monthly: 50,
        inclusion: 'FBT — Micro',
      },
      small: {
        yearly: 750,
        monthly: 75,
        inclusion: 'FBT — Small',
      },
      medium: {
        yearly: 1000,
        monthly: 100,
        inclusion: 'FBT — Medium',
      },
      large: {
        yearly: 1500,
        monthly: 150,
        inclusion: 'FBT — Large',
      },
    },

    // Q1e: BAS (per return)
    // Price × Frequency / 12 × Multiplier
    bas: {
      micro: {
        perReturn: 150,
        monthly: 60, // $150 × 4 / 12 (quarterly default)
        quarterlyMonthly: 60,
        monthlyMonthly: 150, // $150 × 12 / 12
        inclusion: 'BAS — Micro',
      },
      small: {
        perReturn: 150,
        monthly: 60,
        quarterlyMonthly: 60,
        monthlyMonthly: 150,
        inclusion: 'BAS — Small',
      },
      medium: {
        perReturn: 200,
        monthly: 80,
        quarterlyMonthly: 80,
        monthlyMonthly: 200,
        inclusion: 'BAS — Medium',
      },
      large: {
        perReturn: 300,
        monthly: 120,
        quarterlyMonthly: 120,
        monthlyMonthly: 300,
        inclusion: 'BAS — Large',
      },
    },

    // Q1f: IAS (per return)
    // Fixed frequency of 8 months for IAS
    ias: {
      micro: {
        perReturn: 100,
        monthly: 80, // $100 × 8 / 12
        inclusion: 'IAS — Micro',
      },
      small: {
        perReturn: 100,
        monthly: 80,
        inclusion: 'IAS — Small',
      },
      medium: {
        perReturn: 125,
        monthly: 100,
        inclusion: 'IAS — Medium',
      },
      large: {
        perReturn: 150,
        monthly: 120,
        inclusion: 'IAS — Large',
      },
    },

    // Q1g: TPAR (per return)
    tpar: {
      micro: {
        yearly: 220,
        monthly: 22,
        inclusion: 'TPAR — Micro',
      },
      small: {
        yearly: 220,
        monthly: 22,
        inclusion: 'TPAR — Small',
      },
      medium: {
        yearly: 220,
        monthly: 22,
        inclusion: 'TPAR — Medium',
      },
      large: {
        yearly: 250,
        monthly: 25,
        inclusion: 'TPAR — Large',
      },
    },
  },

  // ===================
  // PAYROLL SERVICES (Q2)
  // ===================
  payrollServices: {
    // Q2a: Workers Compensation
    workersCompensation: {
      micro: {
        yearly: 200,
        monthly: 16.67,
        inclusion: 'Workers Comp — Micro',
      },
      small: {
        yearly: 400,
        monthly: 33.33,
        inclusion: 'Workers Comp — Small',
      },
      medium: {
        yearly: 550,
        monthly: 45.83,
        inclusion: 'Workers Comp — Medium',
      },
      large: {
        yearly: 750,
        monthly: 62.5,
        inclusion: 'Workers Comp — Large',
      },
    },

    // Q2b: Payroll Processing
    // Rate × Units × Frequency / 12 × Multiplier
    payrollProcessing: {
      salary: {
        ratePerEmployeePerRun: 10,
        perEmployee: 10,
        monthly: 43.33, // $10 × 52 / 12 (weekly default)
        inclusion: 'Salary employees',
      },
      timesheets: {
        ratePerEmployeePerRun: 15,
        perEmployee: 15,
        monthly: 65, // $15 × 52 / 12 (weekly default)
        inclusion: 'Timesheet employees',
      },
    },

    // Q2c: Payroll Tax Returns (Medium & Large only)
    payrollTaxReturns: {
      medium: {
        yearly: 250,
        monthly: 20.83,
        inclusion: 'Payroll Tax — Medium',
      },
      large: {
        yearly: 500,
        monthly: 41.67,
        inclusion: 'Payroll Tax — Large',
      },
    },

    // Q2d: Super Prep & Lodgement
    superPrepAndLodgement: {
      micro: {
        perLodgement: 100,
        monthly: 33.33, // quarterly default
        quarterlyMonthly: 33.33,
        monthlyMonthly: 100,
        inclusion: 'Super Prep & Lodgement — Micro',
      },
      small: {
        perLodgement: 150,
        monthly: 50,
        quarterlyMonthly: 50,
        monthlyMonthly: 150,
        inclusion: 'Super Prep & Lodgement — Small',
      },
      medium: {
        perLodgement: 250,
        monthly: 83.33,
        quarterlyMonthly: 83.33,
        monthlyMonthly: 250,
        inclusion: 'Super Prep & Lodgement — Medium',
      },
      large: {
        perLodgement: 500,
        monthly: 500, // monthly default for large
        quarterlyMonthly: 166.67,
        monthlyMonthly: 500,
        inclusion: 'Super Prep & Lodgement — Large',
      },
    },

    // Q2e: STP Reporting
    stpReporting: {
      micro: {
        perReport: 25,
        monthly: 108.33, // weekly default
        weeklyMonthly: 108.33,
        fortnightlyMonthly: 54.17,
        monthlyMonthly: 25,
        inclusion: 'STP Reporting — Micro',
      },
      small: {
        perReport: 35,
        monthly: 151.67,
        weeklyMonthly: 151.67,
        fortnightlyMonthly: 75.83,
        monthlyMonthly: 35,
        inclusion: 'STP Reporting — Small',
      },
      medium: {
        perReport: 50,
        monthly: 216.67,
        weeklyMonthly: 216.67,
        fortnightlyMonthly: 108.33,
        monthlyMonthly: 50,
        inclusion: 'STP Reporting — Medium',
      },
      large: {
        perReport: 75,
        monthly: 325,
        weeklyMonthly: 325,
        fortnightlyMonthly: 162.5,
        monthlyMonthly: 75,
        inclusion: 'STP Reporting — Large',
      },
    },

    // Q2f: LSL Construction Reporting
    lslReporting: {
      micro: {
        yearly: 150,
        monthly: 12.5,
        inclusion: 'LSL Construction — Micro',
      },
      small: {
        yearly: 150,
        monthly: 12.5,
        inclusion: 'LSL Construction — Small',
      },
      medium: {
        yearly: 250,
        monthly: 20.83,
        inclusion: 'LSL Construction — Medium',
      },
      large: {
        yearly: 500,
        monthly: 41.67,
        inclusion: 'LSL Construction — Large',
      },
    },
  },

  // ===================
  // ADVISORY SERVICES (Q3)
  // ===================
  advisoryServices: {
    // Q3a: Tax Planning / Review
    taxPlanningReview: {
      micro: {
        yearly: 400,
        monthly: 50,
        inclusion: 'Tax Planning / Review — Micro',
      },
      small: {
        yearly: 600,
        monthly: 75,
        inclusion: 'Tax Planning / Review — Small',
      },
      medium: {
        yearly: 1000,
        monthly: 125,
        inclusion: 'Tax Planning / Review — Medium',
      },
      large: {
        yearly: 2000,
        monthly: 250,
        inclusion: 'Tax Planning / Review — Large',
      },
    },

    // Q3b: Tax Structuring Advice (Once-off)
    taxStructuringAdvice: {
      micro: {
        basePrice: 1000,
        onceOff: 1500,
        inclusion: 'Tax Structuring Advice — Micro',
      },
      small: {
        basePrice: 1500,
        onceOff: 2250,
        inclusion: 'Tax Structuring Advice — Small',
      },
      medium: {
        basePrice: 3000,
        onceOff: 4500,
        inclusion: 'Tax Structuring Advice — Medium',
      },
      large: {
        basePrice: 5000,
        onceOff: 7500,
        inclusion: 'Tax Structuring Advice — Large',
      },
    },

    // Q3c: Xero Setup (Once-off)
    xeroSetup: {
      micro: {
        basePrice: 750,
        onceOff: 1125,
        inclusion: 'Xero Setup — Micro',
      },
      small: {
        basePrice: 1000,
        onceOff: 1500,
        inclusion: 'Xero Setup — Small',
      },
      medium: {
        basePrice: 1500,
        onceOff: 2250,
        inclusion: 'Xero Setup — Medium',
      },
      large: {
        basePrice: 2000,
        onceOff: 3000,
        inclusion: 'Xero Setup — Large',
      },
    },

    // Q3d: Xero Training
    xeroTraining: {
      micro: {
        yearly: 600,
        monthly: 75,
        inclusion: 'Xero Training — Micro',
      },
      small: {
        yearly: 600,
        monthly: 75,
        inclusion: 'Xero Training — Small',
      },
      medium: {
        yearly: 1200,
        monthly: 150,
        inclusion: 'Xero Training — Medium',
      },
      large: {
        yearly: 1200,
        monthly: 150,
        inclusion: 'Xero Training — Large',
      },
    },

    // Q3e: Ongoing Xero Training
    ongoingXeroTraining: {
      micro: {
        monthly: 50.00,
        inclusion: 'Ongoing Xero Training — Micro',
      },
      small: {
        monthly: 75.00,
        inclusion: 'Ongoing Xero Training — Small',
      },
      medium: {
        monthly: 100.00,
        inclusion: 'Ongoing Xero Training — Medium',
      },
      large: {
        monthly: 200.00,
        inclusion: 'Ongoing Xero Training — Large',
      },
    },
  },

  // ===================
  // REPORTING (Q4)
  // ===================
  reporting: {
    // Q4a: Financial Statements for Tax Returns
    financialStatementsTax: {
      micro: {
        yearly: 500,
        monthly: 41.67,
        inclusion: 'Financial Statements — Micro',
      },
      small: {
        yearly: 1000,
        monthly: 83.33,
        inclusion: 'Financial Statements — Small',
      },
      medium: {
        yearly: 1500,
        monthly: 125,
        inclusion: 'Financial Statements — Medium',
      },
      large: {
        yearly: 2000,
        monthly: 166.67,
        inclusion: 'Financial Statements — Large',
      },
    },

    // Q4b: Statutory Financial Statements (Large only)
    statutoryFinancialStatements: {
      large: {
        yearly: 3000,
        monthly: 250,
        inclusion: 'Statutory Financial Statements — Large',
      },
    },

    // Q4c: Management Financial Statements
    managementFinancialStatements: {
      micro: {
        quarterlyMonthly: 166.67,
        monthlyMonthly: 500.00,
        monthly: 166.67,
        inclusion: 'Mgt Financial Statements — Micro',
      },
      small: {
        quarterlyMonthly: 333.33,
        monthlyMonthly: 1000.00,
        monthly: 333.33,
        inclusion: 'Mgt Financial Statements — Small',
      },
      medium: {
        quarterlyMonthly: 500.00,
        monthlyMonthly: 1500.00,
        monthly: 500.00,
        inclusion: 'Mgt Financial Statements — Medium',
      },
      large: {
        quarterlyMonthly: 666.67,
        monthlyMonthly: 2000.00,
        monthly: 666.67,
        inclusion: 'Mgt Financial Statements — Large',
      },
    },
  },

  // ===================
  // MEETINGS (Q5)
  // ===================
  meetings: {
    // Q5a: Review The Numbers Meetings
    reviewNumbers: {
      micro: {
        perMeeting: 200,
        monthly: 100, // quarterly default
        quarterlyMonthly: 100,
        monthlyMonthly: 300,
        inclusion: 'Review The Numbers — Micro',
      },
      small: {
        perMeeting: 300,
        monthly: 150,
        quarterlyMonthly: 150,
        monthlyMonthly: 450,
        inclusion: 'Review The Numbers — Small',
      },
      medium: {
        perMeeting: 500,
        monthly: 750, // monthly default for medium
        quarterlyMonthly: 250,
        monthlyMonthly: 750,
        inclusion: 'Review The Numbers — Medium',
      },
      large: {
        perMeeting: 750,
        monthly: 1125, // monthly default for large
        quarterlyMonthly: 375,
        monthlyMonthly: 1125,
        inclusion: 'Review The Numbers — Large',
      },
    },

    // Q5b: Annual Tax Meetings
    annualTaxMeetings: {
      micro: {
        yearly: 200,
        monthly: 20,
        inclusion: 'Annual Tax Meeting — Micro',
      },
      small: {
        yearly: 300,
        monthly: 30,
        inclusion: 'Annual Tax Meeting — Small',
      },
      medium: {
        yearly: 500,
        monthly: 50,
        inclusion: 'Annual Tax Meeting — Medium',
      },
      large: {
        yearly: 750,
        monthly: 75,
        inclusion: 'Annual Tax Meeting — Large',
      },
    },

    // Q5c: Business Meetings
    businessMeetings: {
      micro: {
        perMeeting: 250,
        monthly: 125, // quarterly default
        quarterlyMonthly: 125,
        monthlyMonthly: 375,
        inclusion: 'Business Meeting — Micro',
      },
      small: {
        perMeeting: 350,
        monthly: 175,
        quarterlyMonthly: 175,
        monthlyMonthly: 525,
        inclusion: 'Business Meeting — Small',
      },
      medium: {
        perMeeting: 600,
        monthly: 900, // monthly default for medium
        quarterlyMonthly: 300,
        monthlyMonthly: 900,
        inclusion: 'Business Meeting — Medium',
      },
      large: {
        perMeeting: 1000,
        monthly: 1500, // monthly default for large
        quarterlyMonthly: 500,
        monthlyMonthly: 1500,
        inclusion: 'Business Meeting — Large',
      },
    },
  },

  // ===================
  // SUPPORT SERVICES (Q6)
  // ===================
  support: {
    // Q6a: Team / Email Support
    emailOnlyTeam: {
      micro: {
        monthly: 100,
        inclusion: 'Team or Email — Micro',
      },
      small: {
        monthly: 150,
        inclusion: 'Team or Email — Small',
      },
      medium: {
        monthly: 200,
        inclusion: 'Team or Email — Medium',
      },
      large: {
        monthly: 300,
        inclusion: 'Team or Email — Large',
      },
    },

    // Q6b: Client Service Manager
    clientServiceManager: {
      micro: {
        monthly: 150,
        inclusion: 'Client Service Mgr — Micro',
      },
      small: {
        monthly: 200,
        inclusion: 'Client Service Mgr — Small',
      },
      medium: {
        monthly: 250,
        inclusion: 'Client Service Mgr — Medium',
      },
      large: {
        monthly: 400,
        inclusion: 'Client Service Mgr — Large',
      },
    },

    // Q6c: Principal / Owner
    principalOwner: {
      micro: {
        monthly: 400,
        inclusion: 'Principal / Owner — Micro',
      },
      small: {
        monthly: 400,
        inclusion: 'Principal / Owner — Small',
      },
      medium: {
        monthly: 400,
        inclusion: 'Principal / Owner — Medium',
      },
      large: {
        monthly: 500,
        inclusion: 'Principal / Owner — Large',
      },
    },
  },

  // ===================
  // CORPORATE SECRETARIAL & ATO PLANS (Q7)
  // ===================
  corporateSecretarial: {
    // Q7a: ASIC Annual Return
    asicAnnualReturn: {
      yearly: 400,
      monthly: 33.33,
      inclusion: 'ASIC Annual Return',
    },

    // Q7a: ASIC Form Lodgements
    asicFormsLodgements: {
      onceOff: 150,
      monthly: 12.5, // Amortized for inclusion purposes
      inclusion: 'ASIC Form Lodgements',
    },
  },

  // Q7b: ATO Payment Plans
  atoPaymentPlans: {
    basic: {
      onceOff: 500,
      inclusion: 'ATO Payment Plan — Basic',
    },
    hardship: {
      onceOff: 1000,
      inclusion: 'ATO Payment Plan — Hardship',
    },
  },

  // ===================
  // PRIOR YEAR LODGEMENTS (Q8/Q27)
  // ===================
  priorYearLodgements: {
    description:
      'Prior year lodgements use the annual rate for each service type × number of returns × multiplier as a once-off fee.',
    applicableServices: [
      'Business Returns',
      'Individuals',
      'BAS',
      'SMSF',
      'IAS',
      'FBT',
      'TPAR',
      'Workers Comp',
      'Super Lodgement',
      'STP EOY',
      'LSL Forms',
      'Payroll Tax',
      'ASIC',
    ],
  },
};

export default serviceValuesAccounting;
