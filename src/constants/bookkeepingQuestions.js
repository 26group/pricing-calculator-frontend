// Bookkeeping Questions - Based on Bookkeeping Pricing Calculator v4
// Q1 (Service Type) is handled in App.js routing - not shown here
// Questions start from Q2 (Revenue) which maps to q1 in the code

export const bookkeepingQuestionData = [
  // Q2 in CSV -> q1 in code: Revenue Segment
  {
    id: 'q1',
    prompt: "1. What is the potential client's current annual revenue?",
    type: 'radio',
    options: [
      { label: '< $250K', value: 'micro' },
      { label: '$250K - $500K', value: 'small' },
      { label: '$500K - $1M', value: 'medium' },
      { label: '$1M - $3M', value: 'large' },
      { label: '$3M+', value: 'enterprise' },
      { label: "I don't know", value: 'micro' }, // Default to Micro band
    ],
  },
  // Q3 in CSV -> q2 in code: Accounting System
  {
    id: 'q2',
    prompt: '2. Do they have an accounting system in place?',
    type: 'radio',
    options: [
      { label: 'Yes - existing system', value: 'yes' },
      { label: 'No - require software setup (once-off)', value: 'no' },
    ],
    children: [
      {
        id: 'q2a',
        prompt: '2.a Enter system name',
        type: 'text',
        showWhen: (responses) => responses.q2 === 'yes',
      },
    ],
  },
  // Q4 in CSV -> q3 in code: Run Payroll
  {
    id: 'q3',
    prompt: '3. Do they run payroll?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'Yes - require payroll system setup (per employee)', value: 'yesSetup' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q3a',
        prompt: '3.a How many employees require payroll setup?',
        type: 'number',
        showWhen: (responses) => responses.q3 === 'yesSetup',
      },
    ],
  },
  // Q5 in CSV -> q4 in code: Salaried Employees
  {
    id: 'q4',
    prompt: '4. How many SALARIED employees do they have?',
    type: 'inputGroup',
    showWhen: (responses) => responses.q3 === 'yes' || responses.q3 === 'yesSetup',
    options: [
      { label: 'Weekly Salary (# employees)', value: 'weekly', control: 'number' },
      { label: 'Fortnightly Salary (# employees)', value: 'fortnightly', control: 'number' },
      { label: 'Monthly Salary (# employees)', value: 'monthly', control: 'number' },
    ],
  },
  // Q6 in CSV -> q5 in code: Timesheet Employees
  {
    id: 'q5',
    prompt: '5. How many TIMESHEET employees do they have?',
    type: 'inputGroup',
    showWhen: (responses) => responses.q3 === 'yes' || responses.q3 === 'yesSetup',
    options: [
      { label: 'Weekly Timesheet (# employees)', value: 'weekly', control: 'number' },
      { label: 'Fortnightly Timesheet (# employees)', value: 'fortnightly', control: 'number' },
      { label: 'Monthly Timesheet (# employees)', value: 'monthly', control: 'number' },
    ],
  },
  // Q7 in CSV -> q6 in code: Transactions per month
  {
    id: 'q6',
    prompt: '6. How many transactions per month across all bank & credit card accounts?',
    type: 'radio',
    options: [
      { label: '< 100 transactions', value: 'under100' },
      { label: '101 - 200 transactions', value: '101to200' },
      { label: '201 - 400 transactions', value: '201to400' },
      { label: '400+ transactions', value: 'over400' },
    ],
    children: [
      {
        id: 'q6a',
        prompt: '6.a Please enter number of transactions',
        type: 'number',
        showWhen: (responses) => responses.q6 === 'over400',
      },
    ],
  },
  // Q8 in CSV -> q7 in code: Accounts Payable
  {
    id: 'q7',
    prompt: '7. Does the client require Accounts Payable (Payables) management?',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: '< 20 single-line supplier invoices/month', value: 'under20' },
      { label: '20-50 single-line supplier invoices/month', value: '20to50' },
    ],
    children: [
      {
        id: 'q7a',
        prompt: '7.a Extra transactions above flat-fee threshold (enter #)',
        type: 'number',
        showWhen: (responses) => responses.q7 === '20to50',
      },
      {
        id: 'q7b',
        prompt: '7.b Multi-line invoices - extra lines (enter # lines)',
        type: 'number',
        showWhen: (responses) => responses.q7 !== 'no',
      },
    ],
  },
  // Q9 in CSV -> q8 in code: TPAR
  {
    id: 'q8',
    prompt: '8. Does the client require TPAR (Taxable Payments Annual Report)?',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
    ],
    children: [
      {
        id: 'q8a',
        prompt: '8.a Enter number of TPAR reports to lodge',
        type: 'number',
        showWhen: (responses) => responses.q8 === 'yes',
      },
    ],
  },
  // Q10 in CSV -> q9 in code: Accounts Receivable
  {
    id: 'q9',
    prompt: '9. Does the client require Accounts Receivable (Receivables) management?',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: '< 20 single-line sales invoices/month', value: 'under20' },
      { label: '20-50 single-line sales invoices/month', value: '20to50' },
    ],
    children: [
      {
        id: 'q9a',
        prompt: '9.a Extra transactions above flat-fee threshold (enter #)',
        type: 'number',
        showWhen: (responses) => responses.q9 === '20to50',
      },
      {
        id: 'q9b',
        prompt: '9.b Extra lines on multi-line invoices (enter # lines)',
        type: 'number',
        showWhen: (responses) => responses.q9 !== 'no',
      },
      {
        id: 'q9c',
        prompt: '9.c Debtor management required (enter # debtors)',
        type: 'number',
        showWhen: (responses) => responses.q9 !== 'no',
      },
    ],
  },
  // Q11 in CSV -> q10 in code: Financial Reporting
  {
    id: 'q10',
    prompt: '10. Does the client require Financial Reporting (Management Reports)?',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Monthly Management Reports', value: 'monthly' },
      { label: 'Quarterly Management Reports', value: 'quarterly' },
    ],
  },
  // Q12 in CSV -> q11 in code: Management Meetings
  {
    id: 'q11',
    prompt: '11. Does the client require Management Meetings?',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Monthly Meetings (12 per year)', value: 'monthly' },
      { label: 'Quarterly Meetings (4 per year)', value: 'quarterly' },
    ],
  },
  // Q13 in CSV -> q12 in code: Compliance Lodgement Services
  {
    id: 'q12',
    prompt: '12. Which compliance lodgement services does the client require?',
    type: 'checkbox',
    options: [
      { label: 'BAS Quarterly Lodgement', value: 'basQuarterly' },
      { label: 'BAS Monthly Lodgement', value: 'basMonthly' },
      { label: 'IAS Monthly Lodgement', value: 'iasMonthly' },
    ],
  },
  // Q14 in CSV -> q13 in code: Support Level
  {
    id: 'q13',
    prompt: '13. What level of support do you offer the client?',
    type: 'radio',
    options: [
      { label: 'Email only (Unlimited)', value: 'emailOnly' },
      { label: 'Email & Phone - Team & Client Service Manager', value: 'emailPhoneTeamCsm' },
      { label: 'Email & Phone - CSM & Owner/Partner (senior)', value: 'emailPhoneCsmOwner' },
    ],
  },
  // Q15 in CSV -> q14 in code: EOFY Process
  {
    id: 'q14',
    prompt: '14. Does the client require an EOFY process & workpapers? (Bookkeeping only clients)',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes - Micro & Small', value: 'microSmall' },
      { label: 'Yes - Medium & Large', value: 'mediumLarge' },
    ],
  },
  // Q16 in CSV -> q15 in code: Cleanup/Rescue Work
  {
    id: 'q15',
    prompt: '15. Does the client require rescue / cleanup work?',
    type: 'radio',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
    ],
    children: [
      {
        id: 'q15a',
        prompt: '15.a Enter number of months of cleanup required',
        type: 'number',
        showWhen: (responses) => responses.q15 === 'yes',
      },
    ],
  },
];
