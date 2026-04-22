// Tax Return Questions - Based on Tax Return Pricing Calculator v1 CSV
// Questions use flat array format for TaxReturnQuestions.js page
// Includes sectionTitle for grouping display
// No revenue segment gating — all questions enabled by default

export const taxReturnQuestionData = [

  // ===================
  // SECTION: TAX RETURNS
  // ===================
  {
    id: 'q1',
    sectionTitle: 'Individual Tax Returns',
    prompt: 'How many individuals do they want tax returns lodged for?',
    type: 'number',
  },

  // ===================
  // SECTION: INCOME ITEMS
  // ===================
  {
    id: 'q2',
    sectionTitle: 'Income Items',
    prompt: 'Do they have Investment income items — how are these prepared?',
    type: 'radio',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
    children: [
      {
        id: 'q2a',
        prompt: 'Dividends not reported to ATO',
        type: 'number',
        showWhen: (responses) => responses.q2 && responses.q2 !== 'none',
      },
      {
        id: 'q2b',
        prompt: 'Interest not reported to ATO',
        type: 'number',
        showWhen: (responses) => responses.q2 && responses.q2 !== 'none',
      },
      {
        id: 'q2c',
        prompt: 'Managed Funds',
        type: 'number',
        showWhen: (responses) => responses.q2 && responses.q2 !== 'none',
      },
      {
        id: 'q2d',
        prompt: 'Rental Property',
        type: 'number',
        showWhen: (responses) => responses.q2 && responses.q2 !== 'none',
      },
    ],
  },

  // ===================
  // SECTION: CAPITAL GAINS
  // ===================
  {
    id: 'q6',
    sectionTitle: 'Capital Gains',
    prompt: 'Did they sell a capital asset for gain and require a schedule?',
    type: 'radio',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
    children: [
      {
        id: 'q6_count',
        prompt: 'CGT — Shares and equities — How many CGT share events?',
        type: 'number',
        showWhen: (responses) => responses.q6 && responses.q6 !== 'none',
      },
      {
        id: 'q7_count',
        prompt: 'CGT — Property sales — How many property sales?',
        type: 'number',
        showWhen: (responses) => responses.q6 && responses.q6 !== 'none',
      },
      {
        id: 'q8_count',
        prompt: 'Balancing adjustment — sale of business asset — How many balancing adjustments?',
        type: 'number',
        showWhen: (responses) => responses.q6 && responses.q6 !== 'none',
      },
    ],
  },

  // ===================
  // SECTION: BUSINESS SCHEDULES
  // ===================
  {
    id: 'q9',
    sectionTitle: 'Business Schedules',
    prompt: 'Do they have a business to report?',
    type: 'radio',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
    children: [
      {
        id: 'q9_count',
        prompt: 'Business Schedule — no GST — How many business schedules (no GST)?',
        type: 'number',
        showWhen: (responses) => responses.q9 && responses.q9 !== 'none',
      },
      {
        id: 'q10_count',
        prompt: 'Business Schedule — with GST — How many business schedules (with GST)?',
        type: 'number',
        showWhen: (responses) => responses.q9 && responses.q9 !== 'none',
      },
    ],
  },

  // ===================
  // SECTION: DEDUCTIONS
  // ===================
  // SECTION: DEDUCTIONS
  // ===================
  {
    id: 'q11',
    sectionTitle: 'Deductions',
    prompt: 'Do they have deductions to claim?',
    type: 'radio',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
    children: [
      {
        id: 'q11_count',
        prompt: 'Deductions — more than 3 standard expenses — How many deduction items?',
        type: 'number',
        showWhen: (responses) => responses.q11 && responses.q11 !== 'none',
      },
      {
        id: 'q12_count',
        prompt: 'Motor Vehicle — log book method — How many motor vehicles (log book)?',
        type: 'number',
        showWhen: (responses) => responses.q11 && responses.q11 !== 'none',
      },
      {
        id: 'q13_count',
        prompt: 'Motor Vehicle — Cents per kilometre method — How many motor vehicles (CPK)?',
        type: 'number',
        showWhen: (responses) => responses.q11 && responses.q11 !== 'none',
      },
    ],
  },

  // ===================
  // SECTION: BAS & TPAR
  // ===================
  {
    id: 'q14',
    sectionTitle: 'BAS & TPAR',
    prompt: 'BAS — do they want you to lodge BAS?',
    type: 'radio',
    options: [
      { label: 'No', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
    children: [
      {
        id: 'q14a',
        prompt: 'BAS Frequency',
        type: 'radio',
        showWhen: (responses) => responses.q14 && responses.q14 !== 'none',
        options: [
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Annual', value: 'annual' },
        ],
      },
    ],
  },
  {
    id: 'q15',
    prompt: 'TPAR — does the client require TPAR?',
    type: 'radio',
    options: [
      { label: 'No', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
  },

  // ===================
  // SECTION: PAYROLL SERVICES
  // ===================
  {
    id: 'q16',
    sectionTitle: 'Payroll Services',
    prompt: 'Workers Compensation — do they want you to lodge Workers Compensation forms?',
    type: 'radio',
    options: [
      { label: 'No', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
  },
  {
    id: 'q17',
    prompt: 'Payroll Processing — Salary ONLY employees (enter number per pay run frequency)',
    type: 'inputGroup',
    options: [
      { label: 'Weekly', value: 'weekly', control: 'number' },
      { label: 'Fortnightly', value: 'fortnightly', control: 'number' },
      { label: 'Monthly', value: 'monthly', control: 'number' },
      { label: 'Annual', value: 'annual', control: 'number' },
    ],
  },
  {
    id: 'q17delivery',
    prompt: 'Payroll Processing (Salary) — how is this prepared?',
    showWhen: (responses) => {
      const q17 = responses.q17;
      return q17 && (parseInt(q17.weekly, 10) > 0 || parseInt(q17.fortnightly, 10) > 0 || parseInt(q17.monthly, 10) > 0 || parseInt(q17.annual, 10) > 0);
    },
    type: 'radio',
    options: [
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
  },
  {
    id: 'q18',
    prompt: 'Payroll Processing — Timesheet ONLY employees (enter number per pay run frequency)',
    type: 'inputGroup',
    options: [
      { label: 'Weekly', value: 'weekly', control: 'number' },
      { label: 'Fortnightly', value: 'fortnightly', control: 'number' },
      { label: 'Monthly', value: 'monthly', control: 'number' },
    ],
  },
  {
    id: 'q18delivery',
    prompt: 'Payroll Processing (Timesheet) — how is this prepared?',
    showWhen: (responses) => {
      const q18 = responses.q18;
      return q18 && (parseInt(q18.weekly, 10) > 0 || parseInt(q18.fortnightly, 10) > 0 || parseInt(q18.monthly, 10) > 0);
    },
    type: 'radio',
    options: [
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
  },
  {
    id: 'q19',
    prompt: 'Super Prep & Lodgement — do they want you to lodge Superannuation payments?',
    type: 'radio',
    options: [
      { label: 'No', value: 'none' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Fortnightly', value: 'fortnightly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Annual', value: 'annual' },
    ],
    children: [
      {
        id: 'q19delivery',
        prompt: 'Super Prep & Lodgement — how is this prepared?',
        type: 'radio',
        showWhen: (responses) => responses.q19 && responses.q19 !== 'none',
        options: [
          { label: 'Summary by Client', value: 'byClient' },
          { label: 'Summary by Firm', value: 'byFirm' },
        ],
      },
    ],
  },
  {
    id: 'q20',
    prompt: 'STP Reporting — do they want you to lodge Single Touch Payroll?',
    type: 'radio',
    options: [
      { label: 'No', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
  },
  {
    id: 'q21',
    prompt: 'LSL Construction — do they want you to lodge Long Service Leave forms?',
    type: 'radio',
    options: [
      { label: 'No', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
  },

  // ===================
  // SECTION: ADVISORY SERVICES
  // ===================
  {
    id: 'q22',
    sectionTitle: 'Advisory Services',
    prompt: 'Tax Planning — do they require Tax Planning / Review?',
    type: 'radio',
    options: [
      { label: 'No', value: 'none' },
      { label: 'Summary by Client', value: 'byClient' },
      { label: 'Summary by Firm', value: 'byFirm' },
    ],
  },
  {
    id: 'q23',
    prompt: 'Tax Structuring Advice — do they require Tax Restructuring Review? (Once-off fee)',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
    ],
  },

  // ===================
  // SECTION: MEETINGS
  // ===================
  {
    id: 'q24',
    sectionTitle: 'Meetings',
    prompt: 'Annual Tax Meeting — do they require Annual Tax Meetings?',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
    ],
  },
  {
    id: 'q25',
    prompt: 'Advice Meeting — do they require Advice Meetings?',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
    ],
  },

  // ===================
  // SECTION: XERO
  // ===================
  {
    id: 'q26',
    sectionTitle: 'Xero Setup, Training & Support',
    prompt: 'Xero Setup — do they need an accounting system set up? (Once-off fee)',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
    ],
  },
  {
    id: 'q27',
    prompt: 'Xero Training — would they like Xero Training? (Once-off fee)',
    type: 'radio',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Basic (reconciling & GST) — $300', value: 'basic' },
      { label: 'Everyday (+ payables & receivables) — $500', value: 'everyday' },
      { label: 'Advanced (+ payroll) — $650', value: 'advanced' },
    ],
  },
  {
    id: 'q28',
    prompt: 'Xero Support — would they like ongoing Xero Support?',
    type: 'radio',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Basic (reconciling & GST) — $360/yr', value: 'basic' },
      { label: 'Everyday (+ payables & receivables) — $600/yr', value: 'everyday' },
      { label: 'Advanced (+ payroll) — $900/yr', value: 'advanced' },
    ],
  },

  // ===================
  // SECTION: ATO PAYMENT PLANS
  // ===================
  {
    id: 'q29',
    sectionTitle: 'ATO Payment Plans',
    prompt: 'ATO Payment Plans — do they need ATO Payment Plans set up? (Once-off fee)',
    type: 'radio',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Basic — $500', value: 'basic' },
      { label: 'Hardship — $1,000', value: 'hardship' },
    ],
  },

  // ===================
  // SECTION: PRIOR YEAR & AMENDMENTS
  // ===================
  {
    id: 'q30',
    sectionTitle: 'Prior Year & Amendments',
    prompt: 'Prior Year Lodgements — how many prior year returns are required? (Once-off — enter number)',
    type: 'number',
  },
  {
    id: 'q31',
    prompt: 'Amended Returns — do they require previous year amended returns? (Once-off)',
    type: 'radio',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Original by Firm — by Client ($100)', value: 'origByFirmClient' },
      { label: 'Original by Firm — by Firm ($200)', value: 'origByFirmFirm' },
      { label: 'NOT by Firm — by Client ($200)', value: 'origNotByFirmClient' },
      { label: 'NOT by Firm — by Firm ($400)', value: 'origNotByFirmFirm' },
    ],
  },
  {
    id: 'q32',
    prompt: 'Return Not Necessary — how many clients require notification of Return Not Necessary? ($50 each, once-off)',
    type: 'number',
  },
  {
    id: 'q33',
    prompt: 'Final Return — how many clients require notification of Final Return? ($20 each, once-off)',
    type: 'number',
  },
];
