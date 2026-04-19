// Bookkeeping Questions - Based on Bookkeeping Pricing Calculator v11
// Questions use flat array format for BookkeepingQuestions.js page
// Includes sectionTitle for grouping display
// Formula: Base Rate × Units × Frequency / 12 × Multiplier = Monthly Fee

export const bookkeepingQuestionData = [
  // ===================
  // SECTION: CLIENT DETAILS
  // ===================
  {
    id: 'q1',
    sectionTitle: 'Client Details',
    prompt: "What is the potential client's current annual revenue?",
    type: 'radio',
    options: [
      { label: '< $250K', value: 'micro' },
      { label: '$250K - $500K', value: 'small' },
      { label: '$500K - $1M', value: 'medium' },
      { label: '$1M - $3M', value: 'large' },
      { label: '$3M+', value: 'enterprise' },
    ],
  },

  // ===================
  // SECTION: SETUP SERVICES
  // ===================
  {
    id: 'q2',
    sectionTitle: 'Setup Services',
    prompt: 'Do they have an accounting system in place?',
    type: 'radio',
    options: [
      { label: 'Yes - existing system', value: 'yes' },
      { label: 'No - require software setup', value: 'no' },
    ],
    children: [
      {
        id: 'q2a',
        prompt: 'Enter system name',
        type: 'text',
        showWhen: (responses) => responses.q2 === 'yes',
      },
    ],
  },

  // ===================
  // SECTION: PAYROLL SERVICES
  // ===================
  {
    id: 'q3',
    sectionTitle: 'Payroll Services',
    prompt: 'Do they want you to run payroll?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'Yes - require payroll system setup', value: 'yesSetup' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q3a',
        prompt: 'How many employees require payroll setup?',
        type: 'number',
        showWhen: (responses) => responses.q3 === 'yesSetup',
      },
    ],
  },
  {
    id: 'q4',
    prompt: 'Salary ONLY employees',
    type: 'inputGroup',
    showWhen: (responses) => responses.q3 === 'yes' || responses.q3 === 'yesSetup',
    options: [
      { label: 'Weekly', value: 'weekly', control: 'number' },
      { label: 'Fortnightly', value: 'fortnightly', control: 'number' },
      { label: 'Monthly', value: 'monthly', control: 'number' },
    ],
  },
  {
    id: 'q5',
    prompt: 'Timesheet ONLY employees.',
    type: 'inputGroup',
    showWhen: (responses) => responses.q3 === 'yes' || responses.q3 === 'yesSetup',
    options: [
      { label: 'Weekly', value: 'weekly', control: 'number' },
      { label: 'Fortnightly', value: 'fortnightly', control: 'number' },
      { label: 'Monthly', value: 'monthly', control: 'number' },
    ],
  },
  {
    id: 'q6',
    prompt: 'Do they require Superannuation Preparation & Lodgement?',
    type: 'radio',
    showWhen: (responses) => responses.q3 === 'yes' || responses.q3 === 'yesSetup',
    options: [
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q6a',
        prompt: 'How many employees?',
        type: 'number',
        showWhen: (responses) => responses.q6 === 'quarterly' || responses.q6 === 'monthly',
      },
    ],
  },
  {
    id: 'q7',
    prompt: 'Do they require STP (Single Touch Payroll) Reporting?',
    type: 'radio',
    showWhen: (responses) => responses.q3 === 'yes' || responses.q3 === 'yesSetup',
    options: [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Fortnightly', value: 'fortnightly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q7a',
        prompt: 'How many employees?',
        type: 'number',
        showWhen: (responses) => responses.q7 === 'weekly' || responses.q7 === 'fortnightly' || responses.q7 === 'monthly',
      },
    ],
  },
  {
    id: 'q8',
    prompt: 'Do they require Workers Compensation lodgement?',
    type: 'radio',
    showWhen: (responses) => responses.q3 === 'yes' || responses.q3 === 'yesSetup',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q8a',
        prompt: 'How many lodgements per year?',
        type: 'number',
        showWhen: (responses) => responses.q8 === 'yes',
      },
    ],
  },

  // ===================
  // SECTION: BOOKKEEPING - TRANSACTIONS & PAYABLES
  // ===================
  {
    id: 'q9',
    sectionTitle: 'Bookkeeping - Transactions & Payables',
    prompt: 'How many transactions per month across all bank & credit card accounts?',
    type: 'radio',
    options: [
      { label: '< 100 transactions', value: 'upTo100' },
      { label: '101 - 200 transactions', value: 'upTo200' },
      { label: '201 - 400 transactions', value: 'upTo400' },
      { label: '400+ transactions', value: 'over400' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q9a',
        prompt: 'How many transactions above 400?',
        type: 'number',
        showWhen: (responses) => responses.q9 === 'over400',
      },
    ],
  },
  {
    id: 'q10',
    prompt: 'How many multi-line transactions per month?',
    type: 'inputGroup',
    options: [
      { label: '# Invoices', value: 'invoices', control: 'number' },
      { label: 'Avg Lines per Invoice', value: 'avgLines', control: 'number' },
    ],
  },
  {
    id: 'q11',
    prompt: 'Does the client require Accounts Payable management?',
    type: 'radio',
    options: [
      { label: '< 20 suppliers/month', value: 'upTo20' },
      { label: '20-50 suppliers/month', value: 'upTo50' },
      { label: '50+ suppliers/month', value: 'extra' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q11a',
        prompt: 'How many suppliers above 50?',
        type: 'number',
        showWhen: (responses) => responses.q11 === 'extra',
      },
    ],
  },

  // ===================
  // SECTION: COMPLIANCE LODGEMENTS
  // ===================
  {
    id: 'q12',
    sectionTitle: 'Compliance Lodgements',
    prompt: 'Does the client require TPAR (Taxable Payments Annual Report)?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q12a',
        prompt: 'How many TPAR reports?',
        type: 'number',
        showWhen: (responses) => responses.q12 === 'yes',
      },
    ],
  },
  {
    id: 'q13',
    prompt: 'Does the client require LSL Construction Reporting?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q13a',
        prompt: 'How many LSL lodgements?',
        type: 'number',
        showWhen: (responses) => responses.q13 === 'yes',
      },
    ],
  },

  // ===================
  // SECTION: ACCOUNTS RECEIVABLE
  // ===================
  {
    id: 'q14',
    sectionTitle: 'Accounts Receivable',
    prompt: 'Does the client require Accounts Receivable invoicing?',
    type: 'radio',
    options: [
      { label: '< 20 invoices/month', value: 'upTo20' },
      { label: '21-50 invoices/month', value: 'upTo50' },
      { label: '51-75 invoices/month', value: 'upTo75' },
      { label: '75+ invoices/month', value: 'over75' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q14a',
        prompt: 'How many invoices above 75?',
        type: 'number',
        showWhen: (responses) => responses.q14 === 'over75',
      },
    ],
  },
  {
    id: 'q15',
    prompt: 'How many multi-line AR invoices per month?',
    type: 'inputGroup',
    showWhen: (responses) => responses.q14 && responses.q14 !== 'no',
    options: [
      { label: '# Invoices', value: 'invoices', control: 'number' },
      { label: 'Avg Lines per Invoice', value: 'avgLines', control: 'number' },
    ],
  },
  {
    id: 'q16',
    prompt: 'Does the client require Debtor Management?',
    type: 'radio',
    options: [
      { label: '< 20 debtors/month', value: 'upTo20' },
      { label: '21-50 debtors/month', value: 'upTo50' },
      { label: '50+ debtors/month', value: 'extra' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q16a',
        prompt: 'How many debtors above 50?',
        type: 'number',
        showWhen: (responses) => responses.q16 === 'extra',
      },
    ],
  },

  // ===================
  // SECTION: REPORTING
  // ===================
  {
    id: 'q17',
    sectionTitle: 'Reporting',
    prompt: 'Does the client require Financial Reporting (Management Reports)?',
    type: 'radio',
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q18',
    prompt: 'Does the client require Management Meetings?',
    type: 'radio',
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },

  // ===================
  // SECTION: COMPLIANCE SERVICES
  // ===================
  {
    id: 'q19',
    sectionTitle: 'Compliance Services',
    prompt: 'Which compliance lodgement services does the client require?',
    type: 'multiRadio',
    options: [
      { label: 'BAS Quarterly', value: 'basQuarterly' },
      { label: 'BAS Monthly', value: 'basMonthly' },
      { label: 'IAS', value: 'ias' },
      { label: 'None', value: 'none' },
    ],
    clearOnValue: 'none',
    mutuallyExclusive: ['basQuarterly', 'basMonthly'],
  },

  // ===================
  // SECTION: SUPPORT
  // ===================
  {
    id: 'q20',
    sectionTitle: 'Support',
    prompt: 'What level of support do you offer the client?',
    type: 'radio',
    options: [
      { label: 'Email Only (Unlimited)', value: 'emailOnly' },
      { label: 'Email & Phone - Team & CSM', value: 'emailPhoneTeamCsm' },
      { label: 'Email & Phone - CSM & Owner/Partner', value: 'emailPhoneCsmOwner' },
    ],
  },

  // ===================
  // SECTION: END OF FINANCIAL YEAR
  // ===================
  {
    id: 'q21',
    sectionTitle: 'End of Financial Year',
    prompt: 'Does the client require an EOFY process & workpapers?',
    type: 'radio',
    options: [
      { label: 'Yes - Micro & Small', value: 'microSmall', showWhen: (responses) => responses.q1 === 'micro' || responses.q1 === 'small' },
      { label: 'Yes - Medium & Large', value: 'mediumLarge', showWhen: (responses) => responses.q1 === 'medium' || responses.q1 === 'large' || responses.q1 === 'enterprise' },
      { label: 'No', value: 'no' },
    ],
  },

  // ===================
  // SECTION: RESCUE / CLEANUP
  // ===================
  {
    id: 'q22',
    sectionTitle: 'Rescue / Cleanup',
    prompt: 'Does the client require rescue / cleanup work?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q22a',
        prompt: 'How many months of cleanup work is required?',
        type: 'number',
        showWhen: (responses) => responses.q22 === 'yes',
      },
    ],
  },

  // ===================
  // SECTION: ADDITIONAL SERVICES
  // ===================
  {
    id: 'q23',
    sectionTitle: 'Additional Services',
    prompt: 'Select any additional once-off services required',
    type: 'checkbox',
    options: [
      { label: 'Accounting Software Setup', value: 'accountingSoftwareSetup' },
      { label: '1 × Online Training (30 min)', value: 'onlineTraining1Session' },
      { label: '3 × Online Training (30 min each)', value: 'onlineTraining3Sessions' },
    ],
  },
];

// Export section titles for grouping in the UI
export const bookkeepingSections = [
  'Client Details',
  'Setup Services',
  'Payroll Services',
  'Bookkeeping - Transactions & Payables',
  'Compliance Lodgements',
  'Accounts Receivable',
  'Reporting',
  'Compliance Services',
  'Support',
  'End of Financial Year',
  'Rescue / Cleanup',
  'Additional Services',
];

export default bookkeepingQuestionData;
