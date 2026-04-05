export const accountingQuestionData = [
  {
    id: 'q1',
    prompt: "1. What is your potential client's current annual revenue?",
    type: 'radio',
    options: [
      { label: '< $250K', value: 'micro' },
      { label: '$250K - $500K', value: 'small' },
      { label: '$500K - $1M', value: 'medium' },
      { label: '$1M - $3M', value: 'large' },
      { label: '$3M plus', value: 'enterprise' },

    ],
  },
  {
    id: 'q2',
    prompt: '2. Do they have an accounting system in place?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q2a',
        prompt: '2.a Would they like you to set up a system for them?',
        type: 'radio',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        showWhen: (responses) => responses.q2 === 'no',
        children: [
          {
            id: 'q2b',
            prompt: '2.b How will they provide the information to complete the return?',
            type: 'radio',
            options: [
              { label: 'Shoe box', value: 'shoeBox' },
              { label: 'Spreadsheet - reconciled cashbook', value: 'spreadsheet' },
              { label: 'Other', value: 'other' },
            ],
            showWhen: (responses) => responses.q2a === 'no',
          },
        ],
      },
    ],
  },
  {
    id: 'q3',
    prompt: '3. How many business entities do they want tax returns lodged for?',
    type: 'number',
  },
  {
    id: 'q4',
    prompt: '4. How many individuals do they want tax returns lodged for?',
    type: 'number',
    children: [
      {
        id: 'q4a',
        prompt: '4.a Is the income/deduction summary provided by the client or prepared by the firm?',
        type: 'radio',
        options: [
          { label: 'Summary provided by client', value: 'providedByClient' },
          { label: 'Summary prepared by the firm', value: 'preparedByFirm' },
        ],
        showWhen: (responses) => responses.q4 && parseInt(responses.q4, 10) > 0,
        children: [
          {
            id: 'q4b',
            prompt: '4.b Select any extras that apply to the individual returns:',
            type: 'inputGroup',
            options: [
              { label: 'How many rental properties?', value: 'rentalProperty', control: 'number' },
              { label: 'How many managed funds?', value: 'managedFunds', control: 'number' },
              { label: 'How many dividends not reported to ATO?', value: 'dividendsNotReportedToATO', control: 'number' },
              { label: 'How many interest not reported to ATO?', value: 'interestNotReportedToATO', control: 'number' },
              { label: 'How many CGT - shares and equities?', value: 'cgtSharesAndEquities', control: 'number' },
              { label: 'How many CGT - property sales?', value: 'cgtPropertySales', control: 'number' },
              { label: 'How many balancing adjustment calculations?', value: 'balancingAdjustmentCalculation', control: 'number' },
              { label: 'Deductions - more than 3 standard expenses?', value: 'deductionsMoreThan3Standard', control: 'checkbox' },
              { label: 'How many motor vehicle log book schedules?', value: 'motorVehicleLogBook', control: 'number' },
              { label: 'How many motor vehicle statutory rate claims?', value: 'motorVehicleStatutoryRate', control: 'number' },
              { label: 'None of the above', value: 'none', control: 'checkbox' },
            ],
            showWhen: (responses) => responses.q4a,
          },
        ],
      },
    ],
  },
  {
    id: 'q5',
    prompt: '5. Do they have a Self Managed Superannuation Fund (SMSF)?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q5a',
        prompt: '5.a Do they want you to complete the audit and tax return?',
        type: 'radio',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        showWhen: (responses) => responses.q5 === 'yes',
      },
    ],
  },
  {
    id: 'q6',
    prompt: '6. Do they want you to lodge their BAS and/or IAS?',
    type: 'q7-custom',
    basOptions: [
      { label: 'BAS Quarterly (Micro-Small)', value: 'basQuarterly', showWhen: (responses) => responses.q1 === 'micro' },
      { label: 'BAS Monthly', value: 'basMonthly' },
    ],
    iasOption: { label: 'IAS monthly reporting', value: 'iasMonthly' },
    noOption: { label: 'No', value: 'no' },
  },
  {
    id: 'q7',
    prompt: '7. Do they run payroll?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q7a',
        prompt: '7.a Do they want you to run payroll for them?',
        type: 'radio',
        options: [
          { label: 'Yes - they want you to process the payroll electronically', value: 'processElectronic' },
          { label: 'Yes - they require a system setup (how many employees?)', value: 'systemSetup' },
          { label: 'No', value: 'noServices' },
        ],
        showWhen: (responses) => responses.q7 === 'yes',
        children: [
          {
            id: 'q7aEmployees',
            prompt: 'How many employees require the system setup?',
            type: 'number',
            showWhen: (responses) => responses.q7a === 'systemSetup',
          },
        ],
      },
    ],
  },
  {
    id: 'q8',
    prompt: '8. How many salaried employees do they have?',
    type: 'inputGroup',
    options: [
      { label: 'Weekly salary', value: 'weekly', control: 'number' },
      { label: 'Fortnightly salary', value: 'fortnightly', control: 'number' },
      { label: 'Monthly salary', value: 'monthly', control: 'number' },
    ],
  },
  {
    id: 'q9',
    prompt: '9. How many timesheet employees do they have?',
    type: 'inputGroup',
    options: [
      { label: 'Weekly timesheet', value: 'weekly', control: 'number' },
      { label: 'Fortnightly timesheet', value: 'fortnightly', control: 'number' },
      { label: 'Monthly timesheet', value: 'monthly', control: 'number' },
    ],
  },
  {
    id: 'q10',
    prompt: '10. Do they want you to lodge Single Touch Payroll for them?',
    type: 'radio',
    options: [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Fortnightly', value: 'fortnightly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q11',
    prompt: '11. Do they want you to lodge superannuation payments for them?',
    type: 'radio',
    options: [
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q12',
    prompt: '12. Do they want you to lodge payroll tax returns for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q13',
    prompt: '13. Do they want you to lodge workers compensation forms for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q14',
    prompt: '14. Do they want you to lodge long service leave forms for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q15',
    prompt: '15. Does your potential client require TPAR?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q15a',
        prompt: '15.a Please provide number of suppliers.',
        type: 'number',
        showWhen: (responses) => responses.q15 === 'yes',
      },
    ],
  },
  {
    id: 'q16',
    prompt: '16. Do they require FBT return to be lodged?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q17',
    prompt: '17. Do they require tax planning?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q18',
    prompt: '18. Do they require tax restructuring review?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q19',
    prompt: '19. Do they require financial statements for tax returns preparation?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q20',
    prompt: '20. Do they require statutory financial statements?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q21',
    prompt: '21. Do they require management financial statements?',
    type: 'radio',
    options: [
      { label: 'Monthly reports', value: 'monthly' },
      { label: 'Quarterly reports', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q22',
    prompt: '22. Do they require "Review the Numbers" meetings?',
    type: 'radio',
    options: [
      { label: 'Monthly meetings', value: 'monthly' },
      { label: 'Quarterly meetings', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q23',
    prompt: '23. Do they require annual tax meetings?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q24',
    prompt: '24. Do you offer them support?',
    type: 'radio',
    options: [
      { label: 'Email only - Team', value: 'emailTeam' },
      { label: 'Email and phone - Team & CSM', value: 'emailPhoneTeamCsm' },
      { label: 'Email and phone - CSM & Owner', value: 'emailPhoneCsmOwner' },
    ],
  },
  {
    id: 'q25',
    prompt: '25. Do they need ASIC company secretarial work?',
    type: 'radio',
    options: [
      { label: 'Annual returns', value: 'annualReturns' },
      { label: 'Detail changes', value: 'detailChanges' },
    ],
  },
  {
    id: 'q25b',
    prompt: '26. Do they need ATO payment plans set up?',
    type: 'radio',
    options: [
      { label: 'Basic plans', value: 'basicPlans' },
      { label: 'Longer-term & hardship plans', value: 'hardshipPlans' },
    ],
  },
  {
    id: 'q26',
    prompt: '27. Do they require prior year to be lodged?',
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
      { label: 'Yes - please provide # of SGC lodgment', value: 'super', control: 'number' },
      { label: 'Yes - please provide # of STP EOY', value: 'stpEoy', control: 'number' },
      { label: 'Yes - please provide # of LSL forms', value: 'lslForms', control: 'number' },
      { label: 'Yes - please provide # of Payroll Tax', value: 'payrollTax', control: 'number' },
      { label: 'Yes - please provide # of ASIC', value: 'asic', control: 'number' },
      { label: 'No', value: 'none', control: 'checkbox' },
    ],
  },
];