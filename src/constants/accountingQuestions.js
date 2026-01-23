export const accountingQuestionData = [
  {
    id: 'q1',
    prompt: '1. What services do you provide? Please select one or more from below.',
    type: 'checkbox',
    options: [
      { label: 'Tax Accounting', value: 'taxAccounting' },
      { label: 'Bookkeeping', value: 'bookkeeping' },
    ],
  },
  {
    id: 'q2',
    prompt: "2. What is your potential client's current annual revenue?",
    type: 'radio',
    options: [
      { label: '< $250K', value: 'micro' },
      { label: '$250K - $500K', value: 'small' },
      { label: '$500K - $1M', value: 'medium' },
      { label: '$1M - $3M', value: 'large' },
      { label: '$3M plus', value: 'enterprise' },
      { label: 'I don’t know the annual revenue', value: 'unknown' },
    ],
  },
  {
    id: 'q3',
    prompt: '3. Do they have an accounting system in place?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q3a',
        prompt: '3.a Would they like you to set up a system for them?',
        type: 'radio',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        showWhen: (responses) => responses.q3 === 'no',
        children: [
          {
            id: 'q3b',
            prompt: '3.b How will they provide the information to complete the return?',
            type: 'radio',
            options: [
              { label: 'Shoe box', value: 'shoeBox' },
              { label: 'Spreadsheet - reconciled cashbook', value: 'spreadsheet' },
              { label: 'Other', value: 'other' },
            ],
            showWhen: (responses) => responses.q3a === 'no',
          },
        ],
      },
    ],
  },
  {
    id: 'q4',
    prompt: '4. How many business entities do they want tax returns lodged for?',
    type: 'number',
  },
  {
    id: 'q5',
    prompt: '5. How many individuals do they want tax returns lodged for?',
    type: 'number',
  },
  {
    id: 'q6',
    prompt: '6. Do they have a Self Managed Superannuation Fund (SMSF)?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q6a',
        prompt: '6.a Do they want you to complete the audit and tax return?',
        type: 'radio',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        showWhen: (responses) => responses.q6 === 'yes',
      },
    ],
  },
  {
    id: 'q7',
    prompt: '7. Do they want you to lodge their BAS and/or IAS?',
    type: 'radio',
    options: [
      { label: 'BAS Quarterly (Micro-Small)', value: 'basQuarterly' },
      { label: 'BAS Monthly', value: 'basMonthly' },
      { label: 'IAS monthly reporting', value: 'iasMonthly' },
    ],
  },
  {
    id: 'q8',
    prompt: '8. Do they run payroll?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q8a',
        prompt: '8.a Do they want you to run payroll for them?',
        type: 'radio',
        options: [
          { label: 'Yes - they want you to process the payroll electronically', value: 'processElectronic' },
          { label: 'Yes - they require a system setup (how many employees?)', value: 'systemSetup' },
          { label: 'No - they do not require payroll services', value: 'noServices' },
        ],
        showWhen: (responses) => responses.q8 === 'yes',
        children: [
          {
            id: 'q8aEmployees',
            prompt: 'How many employees require the system setup?',
            type: 'number',
            showWhen: (responses) => responses.q8a === 'systemSetup',
          },
        ],
      },
    ],
  },
  {
    id: 'q9',
    prompt: '9. How many salaried employees do they have?',
    type: 'inputGroup',
    options: [
      { label: 'Weekly salary', value: 'weekly', control: 'number' },
      { label: 'Fortnightly salary', value: 'fortnightly', control: 'number' },
      { label: 'Monthly salary', value: 'monthly', control: 'number' },
    ],
  },
  {
    id: 'q10',
    prompt: '10. How many timesheet employees do they have?',
    type: 'inputGroup',
    options: [
      { label: 'Weekly timesheet', value: 'weekly', control: 'number' },
      { label: 'Fortnightly timesheet', value: 'fortnightly', control: 'number' },
      { label: 'Monthly timesheet', value: 'monthly', control: 'number' },
    ],
  },
  {
    id: 'q11',
    prompt: '11. Do they want you to lodge Single Touch Payroll for them?',
    type: 'radio',
    options: [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Fortnightly', value: 'fortnightly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q12',
    prompt: '12. Do they want you to lodge superannuation payments for them?',
    type: 'radio',
    options: [
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'They do not require', value: 'no' },
    ],
  },
  {
    id: 'q13',
    prompt: '13. Do they want you to lodge payroll tax returns for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q14',
    prompt: '14. Do they want you to lodge workers compensation forms for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q15',
    prompt: '15. Do they want you to lodge long service leave forms for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q16',
    prompt: '16. Does your potential client require TPAR?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
    children: [
      {
        id: 'q16a',
        prompt: '16.a Please provide number of suppliers.',
        type: 'number',
        showWhen: (responses) => responses.q16 === 'yes',
      },
    ],
  },
  {
    id: 'q17',
    prompt: '17. Do they require FBT return to be lodged?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q18',
    prompt: '18. Do they require tax planning?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q19',
    prompt: '19. Do they require tax restructuring review?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q20',
    prompt: '20. Do they require financial statements for tax returns preparation?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q21',
    prompt: '21. Do they require statutory financial statements?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q22',
    prompt: '22. Do they require management financial statements?',
    type: 'radio',
    options: [
      { label: 'Monthly reports', value: 'monthly' },
      { label: 'Quarterly reports', value: 'quarterly' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q23',
    prompt: '23. Do they require “Review the Numbers” meetings?',
    type: 'radio',
    options: [
      { label: 'Monthly meetings', value: 'monthly' },
      { label: 'Quarterly meetings', value: 'quarterly' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q24',
    prompt: '24. Do they require annual tax meetings?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No - they do not require', value: 'no' },
    ],
  },
  {
    id: 'q25',
    prompt: '25. Do you offer them support?',
    type: 'radio',
    options: [
      { label: 'Email only - Team', value: 'emailTeam' },
      { label: 'Email and phone - Team & CSM', value: 'emailPhoneTeamCsm' },
      { label: 'Email and phone - CSM & Owner', value: 'emailPhoneCsmOwner' },
    ],
  },
  {
    id: 'q26',
    prompt: '26. Do they need ASIC company secretarial work?',
    type: 'radio',
    options: [
      { label: 'Annual returns', value: 'annualReturns' },
      { label: 'Detail changes', value: 'detailChanges' },
    ],
  },
  {
    id: 'q26b',
    prompt: '27. Do they need ATO payment plans set up?',
    type: 'radio',
    options: [
      { label: 'Basic plans', value: 'basicPlans' },
      { label: 'Longer-term & hardship plans', value: 'hardshipPlans' },
    ],
  },
  {
    id: 'q27',
    prompt: '28. Do they require prior year to be lodged?',
    type: 'inputGroup',
    options: [
      { label: 'Yes - please provide # of Business returns', value: 'business', control: 'number' },
      { label: 'Yes - please provide # of Individuals', value: 'individuals', control: 'number' },
      { label: 'Yes - please provide # of BAS', value: 'bas', control: 'number' },
      { label: 'Yes - please provide # of SMSF', value: 'smsf', control: 'number' },
      { label: 'Yes - please provide # of IAS', value: 'ias', control: 'number' },
      { label: 'Yes - please provide # of FBT', value: 'fbt', control: 'number' },
      { label: 'Yes - please provide # of TPAR', value: 'tpar', control: 'number' },
      { label: 'Yes - please provide # of Workers comp', value: 'workersComp', control: 'number' },
      { label: 'Yes - please provide # of Super lodgment', value: 'super', control: 'number' },
      { label: 'Yes - please provide # of STP EOY', value: 'stpEoy', control: 'number' },
      { label: 'Yes - please provide # of LSL forms', value: 'lslForms', control: 'number' },
      { label: 'Yes - please provide # of Payroll Tax', value: 'payrollTax', control: 'number' },
      { label: 'Yes - please provide # of ASIC', value: 'asic', control: 'number' },
      { label: 'No - they do not require', value: 'none', control: 'checkbox' },
    ],
  },
];