// Bookkeeping Services Values - Based on Bookkeeping Pricing Calculator v11
// All prices are base rates that can be adjusted by the pricing modifier (default 1.2x)
// Formula: Base Rate × Units × Frequency / 12 × Multiplier = Monthly Fee

export const serviceValuesBookkeeping = {
  // ===================
  // Q2: ACCOUNTING SYSTEM SETUP
  // ===================
  setupServices: {
    // Q2: Accounting Software Setup (once-off)
    accountingSoftwareSetup: {
      onceOff: 1000.00,
      inclusion: 'Accounting Software Setup',
    },
  },

  // ===================
  // Q3-8: PAYROLL SERVICES
  // ===================
  payrollServices: {
    // Q3: Payroll System Setup (once-off, per employee)
    payrollSetup: {
      perEmployee: 50.00,
      inclusion: 'Payroll System Setup - per employee',
    },

    // Q4: Salaried Employees - Rate × Units × Frequency / 12 × Multiplier
    salaried: {
      weekly: {
        ratePerEmployee: 10.00,
        frequency: 52,
        inclusion: 'Payroll Processing - Weekly Salaried Employee',
      },
      fortnightly: {
        ratePerEmployee: 10.00,
        frequency: 26,
        inclusion: 'Payroll Processing - Fortnightly Salaried Employee',
      },
      monthly: {
        ratePerEmployee: 10.00,
        frequency: 12,
        inclusion: 'Payroll Processing - Monthly Salaried Employee',
      },
    },

    // Q5: Timesheet Employees - Rate × Units × Frequency / 12 × Multiplier
    timesheet: {
      weekly: {
        ratePerEmployee: 15.00,
        frequency: 52,
        inclusion: 'Payroll Processing - Weekly Timesheet Employee',
      },
      fortnightly: {
        ratePerEmployee: 20.00,
        frequency: 26,
        inclusion: 'Payroll Processing - Fortnightly Timesheet Employee',
      },
      monthly: {
        ratePerEmployee: 25.00,
        frequency: 12,
        inclusion: 'Payroll Processing - Monthly Timesheet Employee',
      },
    },

    // Q6: Super Prep & Lodgement (per employee)
    superLodgement: {
      weekly: {
        ratePerEmployee: 7.00,
        frequency: 52,
        inclusion: 'Super Prep & Lodgement - Weekly',
      },
      fortnightly: {
        ratePerEmployee: 7.00,
        frequency: 26,
        inclusion: 'Super Prep & Lodgement - Fortnightly',
      },
      quarterly: {
        ratePerEmployee: 5.00,
        frequency: 4,
        inclusion: 'Super Prep & Lodgement - Quarterly',
      },
      monthly: {
        ratePerEmployee: 7.00,
        frequency: 12,
        inclusion: 'Super Prep & Lodgement - Monthly',
      },
    },

    // Q7: STP Reporting (per employee)
    stpReporting: {
      weekly: {
        ratePerEmployee: 2.50,
        frequency: 52,
        inclusion: 'STP Reporting - Weekly',
      },
      fortnightly: {
        ratePerEmployee: 2.50,
        frequency: 26,
        inclusion: 'STP Reporting - Fortnightly',
      },
      monthly: {
        ratePerEmployee: 2.50,
        frequency: 12,
        inclusion: 'STP Reporting - Monthly',
      },
    },

    // Q8: Workers Compensation (per lodgement, yearly)
    workersComp: {
      ratePerLodgement: 150.00,
      frequency: 1,
      inclusion: 'Workers Compensation Form Lodgement',
    },
  },

  // ===================
  // Q9: BOOKKEEPING - TRANSACTIONS & PAYABLES
  // ===================
  bookkeepingServices: {
    // Q9a: Single Line Bank & Credit Card Transactions
    singleLineTransactions: {
      upTo50: {
        ratePerUnit: 3.00,
        maxUnits: 50,
        inclusion: 'Bank & Credit Card Reconciliation - Up to 50 transactions',
      },
      upTo100: {
        ratePerUnit: 2.25,
        maxUnits: 100,
        inclusion: 'Bank & Credit Card Reconciliation - 51-100 transactions',
      },
      upTo200: {
        ratePerUnit: 2.00,
        maxUnits: 200,
        inclusion: 'Bank & Credit Card Reconciliation - 101-200 transactions',
      },
      upTo400: {
        ratePerUnit: 1.50,
        maxUnits: 400,
        inclusion: 'Bank & Credit Card Reconciliation - 201-400 transactions',
      },
      over400: {
        ratePerUnit: 1.10,
        inclusion: 'Bank & Credit Card Reconciliation - 400+ transactions',
      },
    },

    // Q9b: Multi-Line Transactions
    multiLineTransactions: {
      ratePerLine: 1.50,
      inclusion: 'Multi-Line Transactions - per line',
    },

    // Q9c: Accounts Payable Management
    accountsPayable: {
      upTo10: {
        ratePerSupplier: 2.50,
        maxSuppliers: 10,
        inclusion: 'Accounts Payable - Up to 10 suppliers/month',
      },
      upTo20: {
        ratePerSupplier: 2.00,
        maxSuppliers: 20,
        inclusion: 'Accounts Payable - 11-20 suppliers/month',
      },
      upTo50: {
        ratePerSupplier: 1.50,
        maxSuppliers: 50,
        inclusion: 'Accounts Payable - Up to 50 suppliers/month',
      },
      extra: {
        ratePerSupplier: 1.00,
        inclusion: 'Accounts Payable - Extra suppliers above threshold',
      },
    },
  },

  // ===================
  // Q10: TAX & COMPLIANCE LODGEMENTS
  // ===================
  complianceLodgements: {
    // Q10a: TPAR
    tpar: {
      ratePerReport: 1.50,
      inclusion: 'TPAR Annual Report',
    },

    // Q10b: LSL Construction Reporting
    lslConstruction: {
      ratePerLodgement: 20.00,
      inclusion: 'LSL Construction Reporting',
    },
  },

  // ===================
  // Q11: ACCOUNTS RECEIVABLE
  // ===================
  accountsReceivable: {
    // Q11a: Single Line AR Invoices
    singleLineInvoices: {
      upTo10: {
        ratePerInvoice: 3.50,
        maxInvoices: 10,
        inclusion: 'Accounts Receivable - Up to 10 invoices/month',
      },
      upTo20: {
        ratePerInvoice: 3.00,
        maxInvoices: 20,
        inclusion: 'Accounts Receivable - 11-20 invoices/month',
      },
      upTo50: {
        ratePerInvoice: 2.75,
        maxInvoices: 50,
        inclusion: 'Accounts Receivable - 21-50 invoices/month',
      },
      upTo75: {
        ratePerInvoice: 2.50,
        maxInvoices: 75,
        inclusion: 'Accounts Receivable - 51-75 invoices/month',
      },
      over75: {
        ratePerInvoice: 2.00,
        inclusion: 'Accounts Receivable - 75+ invoices/month',
      },
    },

    // Q11b: Multi-Line AR Invoices
    multiLineInvoices: {
      ratePerLine: 1.00,
      inclusion: 'Multi-Line AR Invoices - per line',
    },

    // Q11c: Debtor Management
    debtorManagement: {
      upTo10: {
        ratePerDebtor: 6.00,
        maxDebtors: 10,
        inclusion: 'Debtor Management - Up to 10 debtors/month',
      },
      upTo20: {
        ratePerDebtor: 5.00,
        maxDebtors: 20,
        inclusion: 'Debtor Management - 11-20 debtors/month',
      },
      upTo50: {
        ratePerDebtor: 4.00,
        maxDebtors: 50,
        inclusion: 'Debtor Management - Up to 50 debtors/month',
      },
      extra: {
        ratePerDebtor: 3.00,
        inclusion: 'Debtor Management - Extra debtors above threshold',
      },
    },
  },

  // ===================
  // Q12: FINANCIAL REPORTING
  // ===================
  financialReporting: {
    monthly: {
      rate: 72.00,
      inclusion: 'Monthly Management Reports',
    },
    quarterly: {
      rate: 36.00,
      inclusion: 'Quarterly Management Reports',
    },
  },

  // ===================
  // Q13: MANAGEMENT MEETINGS
  // ===================
  managementMeetings: {
    monthly: {
      rate: 225.00,
      inclusion: 'Monthly Management Meetings',
    },
    quarterly: {
      rate: 100.00,
      inclusion: 'Quarterly Management Meetings',
    },
  },

  // ===================
  // Q14: COMPLIANCE LODGEMENT SERVICES
  // ===================
  complianceServices: {
    basQuarterly: {
      rate: 60.00,
      inclusion: 'BAS Quarterly Lodgement',
    },
    basMonthly: {
      rate: 120.00,
      inclusion: 'BAS Monthly Lodgement',
    },
    ias: {
      rate: 64.00,
      inclusion: 'IAS Lodgement',
    },
  },

  // ===================
  // Q15: SUPPORT LEVEL
  // ===================
  support: {
    emailOnly: {
      monthly: 50.00,
      inclusion: 'Email Only Support - Unlimited',
    },
    emailPhoneTeamCsm: {
      monthly: 75.00,
      inclusion: 'Email & Phone - Team & Client Service Manager',
    },
    emailPhoneCsmOwner: {
      monthly: 130.00,
      inclusion: 'Email & Phone - CSM & Owner/Partner',
    },
  },

  // ===================
  // Q16: EOFY PROCESS & WORKPAPERS
  // ===================
  eofyProcess: {
    microSmall: {
      rate: 49.50,
      inclusion: 'EOFY Process & Workpapers - Micro & Small',
    },
    mediumLarge: {
      rate: 89.50,
      inclusion: 'EOFY Process & Workpapers - Medium & Large',
    },
  },

  // ===================
  // Q17: RESCUE / CLEANUP WORK
  // ===================
  rescueCleanup: {
    // Calculated as: Total monthly package × # months = once-off fee
    description: 'Rescue/cleanup work is quoted as total monthly package × number of months',
    inclusion: 'Rescue / Cleanup Work',
  },

  // ===================
  // ADDITIONAL ONCE-OFF SERVICES
  // ===================
  additionalServices: {
    accountingSoftwareSetup: {
      onceOff: 1000.00,
      inclusion: 'Accounting Software Setup',
    },
    onlineTraining1Session: {
      onceOff: 99.00,
      inclusion: '1 × Online Training Session (30 min)',
    },
    onlineTraining3Sessions: {
      onceOff: 250.00,
      inclusion: '3 × Online Training Sessions (30 min each)',
    },
  },
};

export default serviceValuesBookkeeping;
