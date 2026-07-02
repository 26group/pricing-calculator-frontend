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
        prompt: 'Which accounting system?',
        type: 'radio',
        options: [
          { label: 'Xero', value: 'xero' },
          { label: 'MYOB', value: 'myob' },
          { label: 'QBO', value: 'qbo' },
          { label: 'No', value: 'no' },
        ],
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
      { label: 'Weekly', value: 'weekly' },
      { label: 'Fortnightly', value: 'fortnightly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q6a',
        prompt: 'How many employees?',
        type: 'number',
        showWhen: (responses) => responses.q6 && responses.q6 !== 'no',
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
      { label: '< 50 transactions', value: 'upTo50' },
      { label: '51 - 100 transactions', value: 'upTo100' },
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
    prompt: 'Does the client require Accounts Payable (Payables) management?',
    type: 'radio',
    options: [
      { label: '< 10 suppliers/month', value: 'upTo10' },
      { label: '11-20 suppliers/month', value: 'upTo20' },
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
  // SECTION: ACCOUNTS RECEIVABLE
  // ===================
  {
    id: 'q14',
    sectionTitle: 'Accounts Receivable',
    prompt: 'Does the client require Accounts Receivable invoicing?',
    type: 'radio',
    options: [
      { label: '< 10 invoices/month', value: 'upTo10' },
      { label: '11-20 invoices/month', value: 'upTo20' },
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
      { label: '< 10 debtors/month', value: 'upTo10' },
      { label: '11-20 debtors/month', value: 'upTo20' },
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
      { label: 'IAS Lodgement = 8 monthly returns', value: 'ias' },
      { label: 'None', value: 'none' },
    ],
    clearOnValue: 'none',
    mutuallyExclusive: ['basQuarterly', 'basMonthly'],
  },
  {
    id: 'q12',
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

  {
    id: 'q24',
    prompt: 'Does the client require Payroll Tax Return?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q24a',
        prompt: 'How many lodgements?',
        type: 'number',
        showWhen: (responses) => responses.q24 === 'yes',
      },
    ],
  },

  // ===================
  // SECTION: SUPPORT
  // ===================
  {
    id: 'q20',
    sectionTitle: 'Support',
    prompt: 'What level of support do you offer the client?',
    description: 'For bookkeepers on your own, use this to stop the phone calls from low end clients. This will allow you to truly serve your better quality clients who value your expertise!',
    type: 'radio',
    options: [
      { label: 'Email Only (Unlimited)', value: 'emailOnly' },
      { label: 'Email & Phone - Team & CSM', value: 'emailPhoneTeamCsm' },
      { label: 'Email & Phone - CSM & Owner/Partner', value: 'emailPhoneCsmOwner' },
      { label: 'No support', value: 'no' },
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
  // SECTION: ACCOUNTING SOFTWARE SETUP AND TRAINING
  // ===================
  {
    id: 'q25',
    sectionTitle: 'Accounting Software Setup and Training',
    prompt: 'Does the client require Accounting Software setup (once-off)?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q25b',
    prompt: 'Does the client require Accounting Software training (once-off)?',
    type: 'radio',
    options: [
      { label: 'Basic 30 min', value: 'basic' },
      { label: 'Intermediate 45 min', value: 'intermediate' },
      { label: 'Advanced 60 min', value: 'advanced' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q25c',
        prompt: 'How many training sessions?',
        type: 'number',
        showWhen: (responses) => responses.q25b && responses.q25b !== 'no',
      },
    ],
  },
  {
    id: 'q26',
    prompt: 'Would they like ongoing Accounting Software Support and Training?',
    description: 'Training for every day use of the software based on the size of the business as such allowing for the complexity and volume that comes with bigger businesses.',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q26a',
        prompt: 'Enter number of ongoing sessions',
        type: 'inputGroup',
        showWhen: (responses) => responses.q26 === 'yes',
        options: [
          { label: '# Online Training Sessions (30 min per month)', value: 'sessions30min', control: 'number' },
          { label: '# Online Training Sessions (60 min per month)', value: 'sessions60min', control: 'number' },
        ],
      },
    ],
  },
  {
    id: 'q27',
    prompt: 'Does your client require you to integrate Point of Sale data?',
    type: 'multiRadio',
    clearOnValue: 'no',
    options: [
      { label: 'Import and review for accuracy', value: 'importReview' },
      { label: 'Monthly reconciliation between POS and accounting software', value: 'monthlyReconciliation' },
      { label: 'Monthly download from POS and rework to upload', value: 'monthlyDownloadRework' },
      { label: 'No', value: 'no' },
    ],
  },

  // ===================
  // SECTION: DISBURSEMENTS
  // ===================
  {
    id: 'q28',
    sectionTitle: 'Disbursements',
    prompt: 'Do you disburse Accounting Software?',
    type: 'radio',
    options: [
      { label: 'Xero', value: 'xero' },
      { label: 'MYOB', value: 'myob' },
      { label: 'QBO', value: 'qbo' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q28_price',
        prompt: '',
        placeholder: 'Enter price',
        type: 'number',
        showWhen: (responses) => responses.q28 && responses.q28 !== 'no' && responses.q28 !== '',
      },
    ],
  },
  {
    id: 'q29',
    prompt: 'List other disbursements',
    type: 'dynamicList',
    addButtonLabel: 'Add disbursement',
    descriptionPlaceholder: 'Enter description',
    pricePlaceholder: 'Enter price',
  },

  // ===================
  // SECTION: PRICE ADJUSTMENT
  // ===================
  {
    id: 'q30',
    sectionTitle: 'Price Adjustment',
    prompt: 'Adjust the price to allow for complexity or extra effort that comes with some clients.',
    description: 'Apply a positive adjustment (up to +20%) when a client needs extra care, is complex, or is difficult to work with, and a negative adjustment (down to -10%) for very simple clients or where the calculated price feels too high.',
    type: 'slider',
    min: -10,
    max: 20,
    step: 1,
    defaultValue: 0,
    unit: '%',
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
];

// Export section titles for grouping in the UI
export const bookkeepingSections = [
  'Client Details',
  'Setup Services',
  'Payroll Services',
  'Bookkeeping - Transactions & Payables',
  'Accounts Receivable',
  'Reporting',
  'Compliance Services',
  'Support',
  'End of Financial Year',
  'Accounting Software Setup and Training',
  'Disbursements',
  'Price Adjustment',
  'Rescue / Cleanup',
];

export default bookkeepingQuestionData;
