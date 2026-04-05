// Bookkeeping Services Values - Based on Bookkeeping Pricing Calculator v4
// All prices are base rates that can be adjusted by the bookkeepingPricingModifier

export const serviceValuesBookkeeping = {
  // Q3 - Accounting System Setup (once-off)
  setupServices: {
    accountingSoftwareSetup: {
      onceOff: 1000.00,
      monthly: 83.33, // 1000/12 for monthly amortization display
      inclusion: 'Accounting Software Setup - includes bank accounts, 1 credit card, conversion balances, payables/receivables & directors payroll',
    },
    payrollSetupPerEmployee: {
      onceOff: 50.00,
      monthly: null,
      inclusion: 'Payroll Setup - per employee',
    },
  },

  // Q5 - Salaried Employees Payroll Processing
  payrollServices: {
    salariedWeekly: {
      perEmployeePerRun: 10.00,
      runsPerYear: 52,
      inclusion: 'Payroll Processing - Weekly Salaried Employee',
    },
    salariedFortnightly: {
      perEmployeePerRun: 12.50,
      runsPerYear: 26,
      inclusion: 'Payroll Processing - Fortnightly Salaried Employee',
    },
    salariedMonthly: {
      perEmployeePerRun: 15.00,
      runsPerYear: 12,
      inclusion: 'Payroll Processing - Monthly Salaried Employee',
    },
    // Q6 - Timesheet Employees
    timesheetWeekly: {
      perEmployeePerRun: 15.00,
      runsPerYear: 52,
      inclusion: 'Payroll Processing - Weekly Timesheet Employee',
    },
    timesheetFortnightly: {
      perEmployeePerRun: 17.50,
      runsPerYear: 26,
      inclusion: 'Payroll Processing - Fortnightly Timesheet Employee',
    },
    timesheetMonthly: {
      perEmployeePerRun: 20.00,
      runsPerYear: 12,
      inclusion: 'Payroll Processing - Monthly Timesheet Employee',
    },
  },

  // Q7 - Bank & Credit Card Transactions
  bookkeepingServices: {
    under100Transactions: {
      monthly: 225.00,
      inclusion: 'Bank & Credit Card Reconciliation - Up to 100 transactions',
    },
    transactions101to200: {
      monthly: 400.00,
      inclusion: 'Bank & Credit Card Reconciliation - 101 to 200 transactions',
    },
    transactions201to400: {
      monthly: 600.00,
      inclusion: 'Bank & Credit Card Reconciliation - 201 to 400 transactions',
    },
    transactionsOver400: {
      perTransaction: 1.10,
      inclusion: 'Bank & Credit Card Reconciliation - Per transaction (400+)',
    },
  },

  // Q8 - Accounts Payable
  accountsPayable: {
    under20SingleLine: {
      monthly: 30.00,
      inclusion: 'Accounts Payable - Up to 20 single-line supplier invoices/month',
    },
    under50SingleLine: {
      monthly: 75.00,
      inclusion: 'Accounts Payable - 20-50 single-line supplier invoices/month',
    },
    extraTransaction: {
      each: 1.00,
      inclusion: 'Accounts Payable - Extra transaction above threshold',
    },
    extraMultiLine: {
      each: 0.50,
      inclusion: 'Accounts Payable - Extra lines on multi-line invoices',
    },
  },

  // Q9 - TPAR
  tpar: {
    perReport: {
      yearly: 25.00,
      inclusion: 'TPAR Annual Report - per report',
    },
  },

  // Q10 - Accounts Receivable
  accountsReceivable: {
    under20SingleLine: {
      monthly: 30.00,
      inclusion: 'Accounts Receivable - Up to 20 single-line sales invoices/month',
    },
    under50SingleLine: {
      monthly: 75.00,
      inclusion: 'Accounts Receivable - 20-50 single-line sales invoices/month',
    },
    extraTransaction: {
      each: 1.00,
      inclusion: 'Accounts Receivable - Extra transaction above threshold',
    },
    extraMultiLine: {
      each: 0.50,
      inclusion: 'Accounts Receivable - Extra lines on multi-line invoices',
    },
    debtorManagement: {
      each: 80.00,
      inclusion: 'Accounts Receivable - Debtor management per debtor',
    },
  },

  // Q11 - Financial Reporting (Management Reports)
  managementReports: {
    monthly: {
      yearly: 660.00,
      monthly: 55.00, // 660/12
      inclusion: 'Monthly Management Reports - P&L, Balance Sheet, Cash Flow, Aged Debtors/Creditors',
    },
    quarterly: {
      yearly: 330.00,
      monthly: 27.50, // 330/12
      inclusion: 'Quarterly Management Reports - P&L, Balance Sheet, Cash Flow, Aged Debtors/Creditors',
    },
  },

  // Q12 - Management Meetings
  managementMeetings: {
    monthly: {
      yearly: 2340.00,
      monthly: 195.00, // 2340/12
      inclusion: 'Monthly Meetings - 12 x 1-hour online meetings per year',
    },
    quarterly: {
      yearly: 780.00,
      monthly: 65.00, // 780/12
      inclusion: 'Quarterly Meetings - 4 x 1-hour online meetings per year',
    },
  },

  // Q13 - Compliance Lodgement Services (BAS/IAS)
  complianceServices: {
    basQuarterly: {
      micro: { yearly: 500.00, monthly: 41.67 },
      small: { yearly: 500.00, monthly: 41.67 },
      medium: { yearly: 740.00, monthly: 61.67 },
      large: { yearly: 1000.00, monthly: 83.33 },
      inclusion: 'BAS Quarterly Lodgement - Reconcile GST, Tax Authority accounts & correspondence',
    },
    basMonthly: {
      yearly: 2960.00,
      monthly: 246.67, // 2960/12
      inclusion: 'BAS Monthly Lodgement - Full GST reconciliation each month',
    },
    iasMonthly: {
      yearly: 2000.00,
      monthly: 166.67, // 2000/12
      inclusion: 'IAS Monthly Lodgement - Instalment Activity Statement',
    },
  },

  // Q14 - Support Level
  support: {
    emailOnly: {
      monthly: 50.00,
      inclusion: 'Email Only Support - Unlimited',
    },
    emailPhoneTeamCsm: {
      monthly: 75.00,
      inclusion: 'Email & Phone Support - Team & Client Service Manager',
    },
    emailPhoneCsmOwner: {
      monthly: 130.00,
      inclusion: 'Email & Phone Support - CSM & Owner/Partner (senior)',
    },
  },

  // Q15 - EOFY Process & Workpapers
  eofy: {
    microSmall: {
      yearly: 495.00,
      monthly: 41.25, // 495/12
      inclusion: 'EOFY Package (Micro & Small) - GST/STP recon, balance sheet recs, payment summaries, EOFY lock, accountant handover',
    },
    mediumLarge: {
      yearly: 895.00,
      monthly: 74.58, // 895/12
      inclusion: 'EOFY Package (Medium & Large) - GST/STP recon, balance sheet recs, payment summaries, EOFY lock, accountant handover',
    },
  },

  // Q16 - Cleanup/Rescue Work (once-off, calculated as total monthly × months)
  cleanup: {
    perMonth: {
      multiplier: 1, // Multiply total monthly package by number of months
      inclusion: 'Rescue/Cleanup Work - Total monthly package × number of months',
    },
  },

  // Additional Once-Off Services
  additionalServices: {
    accountingSoftwareSetup: {
      onceOff: 1000.00,
      inclusion: 'Accounting Software Setup - includes bank accounts, 1 credit card, conversion balances, payables/receivables, directors payroll',
    },
    payablesReceivablesSetup: {
      onceOff: 50.00,
      inclusion: 'Payables & Receivables Setup - per 50 items',
    },
    extraPayablesReceivablesItem: {
      each: 0.50,
      inclusion: 'Extra Payables & Receivables items - per item above 50-batch threshold',
    },
    payrollSetupPerEmployee: {
      onceOff: 50.00,
      inclusion: 'Payroll Setup - per new employee',
    },
    singleTrainingSession: {
      onceOff: 99.00,
      inclusion: '1 × Online Training Session (30 min) - Recorded Zoom session',
    },
    threeTrainingSessions: {
      onceOff: 250.00,
      inclusion: '3 × Online Training Sessions (30 min each) - Recorded Zoom sessions',
    },
  },
};
