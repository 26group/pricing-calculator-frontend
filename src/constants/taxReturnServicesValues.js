// Tax Return Services Values — Based on Tax Return Pricing Calculator v1 CSV
// Formula: Price / 12 × Multiplier = Monthly fee
// Per-unit: Rate × Unit × Frequency / 12 × Multiplier = Monthly fee
// Base AHR: $200/hr

export const serviceValuesTaxReturn = {

  // ===================
  // Q1: INDIVIDUAL TAX RETURNS
  // ===================
  individualReturns: {
    // $200 per return per year → / 12 per month
    annualRate: 200.00,
    frequency: 1, // lodged once per year
    inclusion: 'Individual Tax Returns',
  },

  // ===================
  // Q2-Q5: INCOME ITEMS
  // Each item: by client ($50/yr) or by firm ($100/yr)
  // ===================
  incomeItems: {
    dividends: {
      byClient: { annualRate: 50.00, inclusion: 'Dividends not reported to ATO — Summary by Client' },
      byFirm:   { annualRate: 100.00, inclusion: 'Dividends not reported to ATO — Summary by Firm' },
    },
    interest: {
      byClient: { annualRate: 50.00, inclusion: 'Interest not reported to ATO — Summary by Client' },
      byFirm:   { annualRate: 100.00, inclusion: 'Interest not reported to ATO — Summary by Firm' },
    },
    managedFunds: {
      byClient: { annualRate: 50.00, inclusion: 'Managed Funds — Summary by Client' },
      byFirm:   { annualRate: 100.00, inclusion: 'Managed Funds — Summary by Firm' },
    },
    rentalProperty: {
      // Bronze = NO
      byClient: { annualRate: 150.00, inclusion: 'Rental Property — Summary by Client' },
      byFirm:   { annualRate: 300.00, inclusion: 'Rental Property — Summary by Firm' },
    },
  },

  // ===================
  // Q6-Q8: CAPITAL GAINS
  // ===================
  capitalGains: {
    cgtShares: {
      byClient: { annualRate: 150.00, inclusion: 'CGT — Shares and equities — Summary by Client' },
      byFirm:   { annualRate: 300.00, inclusion: 'CGT — Shares and equities — Summary by Firm' },
    },
    cgtProperty: {
      // Bronze = NO
      byClient: { annualRate: 550.00, inclusion: 'CGT — Property sales — Summary by Client' },
      byFirm:   { annualRate: 1100.00, inclusion: 'CGT — Property sales — Summary by Firm' },
    },
    balancingAdj: {
      // Bronze = NO
      byClient: { annualRate: 50.00, inclusion: 'Balancing adjustment — sale of business asset — Summary by Client' },
      byFirm:   { annualRate: 100.00, inclusion: 'Balancing adjustment — sale of business asset — Summary by Firm' },
    },
  },

  // ===================
  // Q9-Q10: BUSINESS SCHEDULES
  // Bronze = NO for all
  // ===================
  businessSchedules: {
    noGst: {
      byClient: { annualRate: 200.00, inclusion: 'Business Schedule — no GST — Summary by Client' },
      byFirm:   { annualRate: 400.00, inclusion: 'Business Schedule — no GST — Summary by Firm' },
    },
    withGst: {
      byClient: { annualRate: 300.00, inclusion: 'Business Schedule — with GST — Summary by Client' },
      byFirm:   { annualRate: 600.00, inclusion: 'Business Schedule — with GST — Summary by Firm' },
    },
  },

  // ===================
  // Q11-Q13: DEDUCTIONS
  // Bronze = YES for all
  // ===================
  deductions: {
    moreThan3Standard: {
      byClient: { annualRate: 50.00, inclusion: 'Deductions — more than 3 standard expenses — Summary by Client' },
      byFirm:   { annualRate: 100.00, inclusion: 'Deductions — more than 3 standard expenses — Summary by Firm' },
    },
    motorVehicleLogBook: {
      byClient: { annualRate: 50.00, inclusion: 'Motor Vehicle — log book method — Summary by Client' },
      byFirm:   { annualRate: 100.00, inclusion: 'Motor Vehicle — log book method — Summary by Firm' },
    },
    motorVehicleCPK: {
      byClient: { annualRate: 50.00, inclusion: 'Motor Vehicle — Cents per kilometre method — Summary by Client' },
      byFirm:   { annualRate: 100.00, inclusion: 'Motor Vehicle — Cents per kilometre method — Summary by Firm' },
    },
  },

  // ===================
  // Q14: BAS
  // Bronze = NO
  // Quarterly × 4 or Annual × 1
  // ===================
  bas: {
    byClient: {
      quarterly: { ratePerReturn: 150.00, frequency: 4, inclusion: 'BAS Quarterly — Summary by Client' },
      annual:    { ratePerReturn: 150.00, frequency: 1, inclusion: 'BAS Annual — Summary by Client' },
    },
    byFirm: {
      quarterly: { ratePerReturn: 400.00, frequency: 4, inclusion: 'BAS Quarterly — Summary by Firm' },
      annual:    { ratePerReturn: 400.00, frequency: 1, inclusion: 'BAS Annual — Summary by Firm' },
    },
  },

  // ===================
  // Q15: TPAR
  // Bronze = NO
  // ===================
  tpar: {
    byClient: { annualRate: 100.00, inclusion: 'TPAR — Summary by Client' },
    byFirm:   { annualRate: 200.00, inclusion: 'TPAR — Summary by Firm' },
  },

  // ===================
  // Q16: WORKERS COMPENSATION
  // Bronze = YES
  // ===================
  workersComp: {
    byClient: { annualRate: 200.00, inclusion: 'Workers Compensation — Summary by Client' },
    byFirm:   { annualRate: 400.00, inclusion: 'Workers Compensation — Summary by Firm' },
  },

  // ===================
  // Q17-Q18: PAYROLL PROCESSING
  // Per employee per pay run
  // Bronze = NO
  // ===================
  payrollSalary: {
    byClient: {
      weekly:      { ratePerEmployee: 10.00, frequency: 52, inclusion: 'Payroll — Salary Weekly — by Client' },
      fortnightly: { ratePerEmployee: 10.00, frequency: 26, inclusion: 'Payroll — Salary Fortnightly — by Client' },
      monthly:     { ratePerEmployee: 10.00, frequency: 12, inclusion: 'Payroll — Salary Monthly — by Client' },
      annual:      { ratePerEmployee: 10.00, frequency: 1,  inclusion: 'Payroll — Salary Annual — by Client' },
    },
    byFirm: {
      weekly:      { ratePerEmployee: 20.00, frequency: 52, inclusion: 'Payroll — Salary Weekly — by Firm' },
      fortnightly: { ratePerEmployee: 20.00, frequency: 26, inclusion: 'Payroll — Salary Fortnightly — by Firm' },
      monthly:     { ratePerEmployee: 20.00, frequency: 12, inclusion: 'Payroll — Salary Monthly — by Firm' },
      annual:      { ratePerEmployee: 20.00, frequency: 1,  inclusion: 'Payroll — Salary Annual — by Firm' },
    },
  },
  payrollTimesheet: {
    byClient: {
      weekly:      { ratePerEmployee: 15.00, frequency: 52, inclusion: 'Payroll — Timesheet Weekly — by Client' },
      fortnightly: { ratePerEmployee: 15.00, frequency: 26, inclusion: 'Payroll — Timesheet Fortnightly — by Client' },
      monthly:     { ratePerEmployee: 15.00, frequency: 12, inclusion: 'Payroll — Timesheet Monthly — by Client' },
    },
    byFirm: {
      weekly:      { ratePerEmployee: 25.00, frequency: 52, inclusion: 'Payroll — Timesheet Weekly — by Firm' },
      fortnightly: { ratePerEmployee: 25.00, frequency: 26, inclusion: 'Payroll — Timesheet Fortnightly — by Firm' },
      monthly:     { ratePerEmployee: 25.00, frequency: 12, inclusion: 'Payroll — Timesheet Monthly — by Firm' },
    },
  },

  // ===================
  // Q19: SUPER PREP & LODGEMENT
  // Bronze = NO
  // ===================
  superPrepLodgement: {
    byClient: {
      weekly:      { annualRate: 100.00, frequency: 52, inclusion: 'Super Prep & Lodgement Weekly — by Client' },
      fortnightly: { annualRate: 100.00, frequency: 26, inclusion: 'Super Prep & Lodgement Fortnightly — by Client' },
      monthly:     { annualRate: 100.00, frequency: 12, inclusion: 'Super Prep & Lodgement Monthly — by Client' },
      quarterly:   { annualRate: 100.00, frequency: 4,  inclusion: 'Super Prep & Lodgement Quarterly — by Client' },
      annual:      { annualRate: 100.00, frequency: 1,  inclusion: 'Super Prep & Lodgement Annual — by Client' },
    },
    byFirm: {
      weekly:      { annualRate: 200.00, frequency: 52, inclusion: 'Super Prep & Lodgement Weekly — by Firm' },
      fortnightly: { annualRate: 200.00, frequency: 26, inclusion: 'Super Prep & Lodgement Fortnightly — by Firm' },
      monthly:     { annualRate: 200.00, frequency: 12, inclusion: 'Super Prep & Lodgement Monthly — by Firm' },
      quarterly:   { annualRate: 200.00, frequency: 4,  inclusion: 'Super Prep & Lodgement Quarterly — by Firm' },
      annual:      { annualRate: 200.00, frequency: 1,  inclusion: 'Super Prep & Lodgement Annual — by Firm' },
    },
  },

  // ===================
  // Q20: STP REPORTING
  // Bronze = NO
  // ===================
  stpReporting: {
    byClient: { annualRate: 25.00, inclusion: 'STP Reporting — Summary by Client' },
    byFirm:   { annualRate: 50.00, inclusion: 'STP Reporting — Summary by Firm' },
  },

  // ===================
  // Q21: LSL CONSTRUCTION
  // Bronze = NO
  // ===================
  lslConstruction: {
    byClient: { annualRate: 150.00, inclusion: 'LSL Construction — Summary by Client' },
    byFirm:   { annualRate: 250.00, inclusion: 'LSL Construction — Summary by Firm' },
  },

  // ===================
  // Q22: TAX PLANNING
  // Bronze = NO
  // ===================
  taxPlanning: {
    byClient: { annualRate: 300.00, inclusion: 'Tax Planning / Review — Summary by Client' },
    byFirm:   { annualRate: 500.00, inclusion: 'Tax Planning / Review — Summary by Firm' },
  },

  // ===================
  // Q23: TAX STRUCTURING ADVICE (once-off only)
  // ===================
  taxStructuring: {
    onceOff: 1000.00,
    inclusion: 'Tax Structuring Advice',
  },

  // ===================
  // Q24: ANNUAL TAX MEETING
  // Bronze = YES
  // ===================
  annualTaxMeeting: {
    annualRate: 100.00,
    inclusion: 'Annual Tax Meeting',
  },

  // ===================
  // Q25: ADVICE MEETING
  // Bronze = NO
  // ===================
  adviceMeeting: {
    annualRate: 300.00,
    inclusion: 'Advice Meeting',
  },

  // ===================
  // SUPPORT SERVICES (hard-coded by tier)
  // ===================
  supportServices: {
    team:   { monthly: 20.00, inclusion: 'Team / Email Support' },
    csm:    { monthly: 40.00, inclusion: 'Client Service Manager' },
    owner:  { monthly: 60.00, inclusion: 'Principal / Owner' },
  },

  // ===================
  // Q26: XERO SETUP (once-off)
  // ===================
  xeroSetup: {
    onceOff: 750.00,
    inclusion: 'Xero Setup',
  },

  // ===================
  // Q27: XERO TRAINING (once-off)
  // ===================
  xeroTraining: {
    basic:    { onceOff: 300.00, inclusion: 'Xero Training — Basic (reconciling & GST)' },
    everyday: { onceOff: 500.00, inclusion: 'Xero Training — Everyday (+ payables & receivables)' },
    advanced: { onceOff: 650.00, inclusion: 'Xero Training — Advanced (+ payroll)' },
  },

  // ===================
  // Q28: XERO SUPPORT (annual / 12)
  // Silver = basic/everyday, Gold = basic/everyday/advanced
  // ===================
  xeroSupport: {
    basic:    { annualRate: 360.00, inclusion: 'Xero Support — Basic (reconciling & GST)' },
    everyday: { annualRate: 600.00, inclusion: 'Xero Support — Everyday (+ payables & receivables)' },
    advanced: { annualRate: 900.00, inclusion: 'Xero Support — Advanced (+ payroll)' },
  },

  // ===================
  // Q29: ATO PAYMENT PLANS (once-off)
  // ===================
  atoPaymentPlans: {
    basic:    { onceOff: 500.00, inclusion: 'ATO Payment Plan — Basic' },
    hardship: { onceOff: 1000.00, inclusion: 'ATO Payment Plan — Hardship' },
  },

  // ===================
  // Q30: PRIOR YEAR LODGEMENTS (once-off — $200/return)
  // ===================
  priorYearLodgements: {
    ratePerReturn: 200.00,
    inclusion: 'Prior Year Lodgements',
  },

  // ===================
  // Q31: AMENDED RETURNS (once-off)
  // ===================
  amendedReturns: {
    origByFirmClient:    { onceOff: 100.00, inclusion: 'Amendment — original prepared by firm — by Client' },
    origByFirmFirm:      { onceOff: 200.00, inclusion: 'Amendment — original prepared by firm — by Firm' },
    origNotByFirmClient: { onceOff: 200.00, inclusion: 'Amendment — original NOT prepared by firm — by Client' },
    origNotByFirmFirm:   { onceOff: 400.00, inclusion: 'Amendment — original NOT prepared by firm — by Firm' },
  },

  // ===================
  // Q32: RETURN NOT NECESSARY (once-off, per client)
  // ===================
  returnNotNecessary: {
    ratePerClient: 50.00,
    inclusion: 'Return Not Necessary',
  },

  // ===================
  // Q33: FINAL RETURN (once-off, per client)
  // ===================
  finalReturn: {
    ratePerClient: 20.00,
    inclusion: 'Final Return',
  },
};
