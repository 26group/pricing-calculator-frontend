// Tax Return Questions — rebuilt from scratch against
// "Tax return ONLY Pricing Calculator v1.xlsx — Copy of Accounting Price List.csv"
//
// Conventions:
//   - Items described in the CSV with a "Unit" (count) => number input field
//   - Items described with a Frequency (weekly/fortnightly/monthly/quarterly/
//     annual) => frequency radio buttons
//   - "Summary provided by Client" / "Firm to prepare workpaper" =>
//     rendered as an inline per-field toggle (summary: true) sitting next to
//     each count/input. Stored as <fieldId>_summary in responses with
//     default 'byClient'. A count of 0 means the service is not selected.
//
// Pricing model (see utils/taxReturnPricingCalculator.js):
//   - Bronze / Silver / Gold: monthly fee = annualAmount / 12 × multiplier
//   - Once-off total: true one-off services (tax structuring, ATO plans,
//     xero setup/training, prior year, amendments, return-not-necessary,
//     final return) PLUS the full annual amount of every Upfront=YES
//     recurring service. Support Services and Xero Support are the only
//     items flagged Upfront=NO and are therefore excluded from once-off.

export const taxReturnQuestionData = [

  // ════════════════════════════════════════════════════════════════════
  // Q1 — TAX SERVICES · INDIVIDUAL TAX RETURNS
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q1',
    sectionTitle: 'Tax Services',
    prompt: 'How many Individuals do they want tax returns lodged for?',
    description: 'Individual Returns — Basic ATO portal and less than 3 deductible items',
    type: 'number',
    summary: true,
    countLabel: 'Number of individuals',
  },

  // ────────────────────────────────────────────────────────────────────
  // Q2 — Income Items
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q2',
    prompt: 'Investment Income Items — quantity per type',
    type: 'group',
    children: [
      { id: 'q2_dividends',      prompt: 'Dividends not reported to ATO — quantity', type: 'number', summary: true },
      { id: 'q2_interest',       prompt: 'Interest not reported to ATO — quantity',  type: 'number', summary: true },
      { id: 'q2_managedFunds',   prompt: 'Managed Funds — quantity',                 type: 'number', summary: true },
      { id: 'q2_rentalProperty', prompt: 'Rental Property — quantity',               type: 'number', summary: true },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q3 — Capital Gains
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q3',
    prompt: 'Capital Gains Schedules — quantity per type',
    type: 'group',
    children: [
      { id: 'q3_cgtShares',    prompt: 'CGT — Shares and equities — quantity',                  type: 'number', summary: true },
      { id: 'q3_cgtProperty',  prompt: 'CGT — Property sales — quantity',                       type: 'number', summary: true },
      { id: 'q3_balancingAdj', prompt: 'Balancing adjustment — sale of business asset — quantity', type: 'number', summary: true },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q4 — Business Schedules
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q4',
    prompt: 'Business Schedules — quantity per type',
    type: 'group',
    children: [
      { id: 'q4_noGst',   prompt: 'Business Schedule — no GST — quantity',   type: 'number', summary: true },
      { id: 'q4_withGst', prompt: 'Business Schedule — with GST — quantity', type: 'number', summary: true },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q5 — Deductions
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q5',
    prompt: 'Deductions — quantity per type',
    type: 'group',
    children: [
      { id: 'q5_standard',     prompt: 'Deductions — more than 3 standard expenses — quantity', type: 'number', summary: true },
      { id: 'q5_motorLogBook', prompt: 'Motor Vehicle — log book method — quantity',            type: 'number', summary: true },
      { id: 'q5_motorCPK',     prompt: 'Motor Vehicle — Cents per kilometre method — quantity', type: 'number', summary: true },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q6 — BAS (per return, frequency-based)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q6',
    prompt: 'BAS — do they want you to lodge BAS?',
    type: 'radio',
    options: [
      { label: 'Summary provided by Client', value: 'byClient' },
      { label: 'Firm to prepare workpaper',   value: 'byFirm' },
      { label: 'No',                value: 'none' },
    ],
    children: [
      {
        id: 'q6_frequency',
        prompt: 'BAS — Frequency',
        type: 'radio',
        showWhen: (r) => r.q6 && r.q6 !== 'none',
        options: [
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Annual',    value: 'annual' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q7 — TPAR (per return, # suppliers as unit)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q7',
    prompt: 'TPAR — Taxable Payments Annual Report',
    type: 'group',
    children: [
      { id: 'q7_suppliers', prompt: 'Number of suppliers', type: 'number', summary: true },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // Q8 — PAYROLL SERVICES · Workers Compensation
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q8',
    sectionTitle: 'Payroll Services',
    prompt: 'Workers Compensation lodgements',
    type: 'group',
    children: [
      { id: 'q8_count', prompt: 'Number of lodgements per year', type: 'number', summary: true },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q9 — Payroll Processing
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q9_salary',
    prompt: 'Payroll Processing — Salary ONLY employees per pay-run frequency',
    type: 'group',
    children: [
      {
        id: 'q9_salaryCounts',
        prompt: 'Enter number of salary-only employees per pay-run frequency',
        type: 'inputGroup',
        options: [
          { label: 'Weekly (×52)',      value: 'weekly',      control: 'number', summary: true },
          { label: 'Fortnightly (×26)', value: 'fortnightly', control: 'number', summary: true },
          { label: 'Monthly (×12)',     value: 'monthly',     control: 'number', summary: true },
          { label: 'Quarterly (×4)',    value: 'quarterly',   control: 'number', summary: true },
          { label: 'Annual (×1)',       value: 'annual',      control: 'number', summary: true },
        ],
      },
    ],
  },
  {
    id: 'q9_timesheet',
    prompt: 'Payroll Processing — Timesheet ONLY employees per pay-run frequency',
    type: 'group',
    children: [
      {
        id: 'q9_timesheetCounts',
        prompt: 'Enter number of timesheet-only employees per pay-run frequency',
        type: 'inputGroup',
        options: [
          { label: 'Weekly (×52)',      value: 'weekly',      control: 'number', summary: true },
          { label: 'Fortnightly (×26)', value: 'fortnightly', control: 'number', summary: true },
          { label: 'Monthly (×12)',     value: 'monthly',     control: 'number', summary: true },
          { label: 'Quarterly (×4)',    value: 'quarterly',   control: 'number', summary: true },
          { label: 'Annual (×1)',       value: 'annual',      control: 'number', summary: true },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q10 — Super Prep & Lodgement (frequency-based)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q10',
    prompt: 'Super Prep & Lodgement — do they want you to lodge Superannuation payments?',
    type: 'radio',
    options: [
      { label: 'Summary provided by Client', value: 'byClient' },
      { label: 'Firm to prepare workpaper',   value: 'byFirm' },
      { label: 'No',                value: 'none' },
    ],
    children: [
      {
        id: 'q10_frequency',
        prompt: 'Super — Frequency',
        type: 'radio',
        showWhen: (r) => r.q10 && r.q10 !== 'none',
        options: [
          { label: 'Weekly',      value: 'weekly' },
          { label: 'Fortnightly', value: 'fortnightly' },
          { label: 'Monthly',     value: 'monthly' },
          { label: 'Quarterly',   value: 'quarterly' },
          { label: 'Annual',      value: 'annual' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q11 — STP Reporting (frequency-based)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q11',
    prompt: 'STP Reporting — do they want you to lodge Single Touch Payroll?',
    type: 'radio',
    options: [
      { label: 'Summary provided by Client', value: 'byClient' },
      { label: 'Firm to prepare workpaper',   value: 'byFirm' },
      { label: 'No',                value: 'none' },
    ],
    children: [
      {
        id: 'q11_frequency',
        prompt: 'STP — Frequency',
        type: 'radio',
        showWhen: (r) => r.q11 && r.q11 !== 'none',
        options: [
          { label: 'Weekly',      value: 'weekly' },
          { label: 'Fortnightly', value: 'fortnightly' },
          { label: 'Monthly',     value: 'monthly' },
          { label: 'Quarterly',   value: 'quarterly' },
          { label: 'Annual',      value: 'annual' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q12 — LSL Construction Reporting
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q12',
    prompt: 'LSL Construction — do they want you to lodge Long Service Leave forms?',
    type: 'radio',
    options: [
      { label: 'Summary provided by Client', value: 'byClient' },
      { label: 'Firm to prepare workpaper',   value: 'byFirm' },
      { label: 'No',                value: 'none' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // Q13 — ADVISORY SERVICES · Tax Planning
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q13',
    sectionTitle: 'Advisory Services',
    prompt: 'Tax Planning — do they require Tax Planning / Review?',
    type: 'radio',
    options: [
      { label: 'Summary provided by Client', value: 'byClient' },
      { label: 'Firm to prepare workpaper',   value: 'byFirm' },
      { label: 'No',                value: 'none' },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q14 — Tax Structuring Advice (once-off)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q14',
    prompt: 'Tax Structuring Advice — do they require Tax Restructuring Review? (Once-off fee)',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No',  value: 'no' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // Q15 — MEETINGS · Annual Tax Meeting
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q15',
    sectionTitle: 'Meetings',
    prompt: 'Annual Tax Meeting — do they require Annual Tax Meetings?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No',  value: 'no' },
    ],
  },
  {
    id: 'q16',
    prompt: 'Advice Meeting — do they require Advice Meetings?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No',  value: 'no' },
    ],
    children: [
      {
        id: 'q16_count',
        prompt: 'Number of Advice Meetings',
        type: 'number',
        showWhen: (r) => r.q16 === 'yes',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // Q25 — SUPPORT SERVICES
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q25',
    sectionTitle: 'Support Services',
    prompt: 'Do you offer them support?',
    type: 'radio',
    options: [
      { label: 'Email only — Team', value: 'emailTeam' },
      { label: 'Email & Phone — Team & CSM', value: 'emailPhoneTeamCsm' },
      { label: 'Email & Phone — CSM & Owner', value: 'emailPhoneCsmOwner' },
      { label: 'No support', value: 'no' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // Q17 — ATO PAYMENT PLANS (once-off)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q17',
    sectionTitle: 'ATO Payment Plans',
    prompt: 'ATO Payment Plans — do they need ATO Payment Plans set up? (Once-off fee)',
    type: 'radio',
    options: [
      { label: 'None',     value: 'none' },
      { label: 'Basic',    value: 'basic' },
      { label: 'Hardship', value: 'hardship' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // Q18–Q20 — XERO SETUP / TRAINING / SUPPORT
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q18',
    sectionTitle: 'Xero Setup, Training & Support',
    prompt: 'Xero Setup — do they need an accounting system set up? (Once-off fee)',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No',  value: 'no' },
    ],
  },
  {
    id: 'q19',
    prompt: 'Xero Training — would they like Xero Training? (Once-off fee)',
    type: 'radio',
    options: [
      { label: 'None',                                  value: 'none' },
      { label: 'Basic (reconciling & GST)',             value: 'basic' },
      { label: 'Everyday (+ payables & receivables)',   value: 'everyday' },
      { label: 'Advanced (+ payroll)',                  value: 'advanced' },
    ],
  },
  {
    id: 'q20',
    prompt: 'Xero Support — would they like ongoing Xero Support?',
    type: 'radio',
    options: [
      { label: 'None',                                  value: 'none' },
      { label: 'Basic (reconciling & GST)',             value: 'basic' },
      { label: 'Everyday (+ payables & receivables)',   value: 'everyday' },
      { label: 'Advanced (+ payroll)',                  value: 'advanced' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // Q21 — PRIOR YEAR LODGEMENTS (once-off · $200 per return)
  //   Two number fields: total Tax Services returns + total Payroll returns
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q21',
    sectionTitle: 'Prior Year Lodgements & Amendments',
    prompt: 'Prior Year Lodgements — do they require prior year lodgements?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No',  value: 'no' },
    ],
    children: [
      {
        id: 'q21_taxServices',
        prompt: 'Tax Services — total number of prior year lodgements (Individual Returns, Income Items, Capital Gains, Business Schedules, Deductions, BAS, TPAR)',
        type: 'number',
        showWhen: (r) => r.q21 === 'yes',
      },
      {
        id: 'q21_payroll',
        prompt: 'Payroll Services — total number of prior year lodgements (Workers Comp, Payroll, Super, STP, LSL)',
        type: 'number',
        showWhen: (r) => r.q21 === 'yes',
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  // Q22 — Amended Returns (once-off)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'q22',
    prompt: 'Amended Returns — do they require previous year amended returns? (Once-off)',
    type: 'radio',
    options: [
      { label: 'None',                           value: 'none' },
      { label: 'Original by Firm — by Client',   value: 'origByFirmClient' },
      { label: 'Original by Firm — by Firm',     value: 'origByFirmFirm' },
      { label: 'NOT by Firm — by Client',        value: 'origNotByFirmClient' },
      { label: 'NOT by Firm — by Firm',          value: 'origNotByFirmFirm' },
    ],
    children: [
      {
        id: 'q22_count',
        prompt: 'How many amended returns?',
        type: 'number',
        showWhen: (r) => r.q22 && r.q22 !== 'none',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // Q23 — RETURN NOT NECESSARY (once-off, per client)
  // Q24 — FINAL RETURN (once-off, per client)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'q23',
    sectionTitle: 'Return Not Necessary / Final Return',
    prompt: 'Do they require notification of Return Not Necessary?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No',  value: 'no' },
    ],
  },
  {
    id: 'q24',
    prompt: 'Do they require notification of Final Return?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No',  value: 'no' },
    ],
  },
];
