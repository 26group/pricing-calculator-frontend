// Accounting Questions based on Accounting Price List v3 CSV
// Questions mapped to service categories for pricing calculator

export const accountingQuestions = {
  // ===================
  // Q1: TAX SERVICES
  // ===================
  Q1: {
    title: 'Tax Services',
    questions: {
      Q1a: {
        id: 'Q1a',
        title: 'Individual Tax Returns',
        prompt: 'How many Individuals do they want tax returns lodged for?',
        type: 'number',
        serviceKey: 'individualReturns',
        extras: {
          title: 'Additional Items Required',
          prompt: 'Will they have additional Items? Add the number per item in the fields below:',
          items: [
            {
              id: 'rentalProperty',
              label: 'Rental Property',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.rentalProperty',
            },
            {
              id: 'managedFunds',
              label: 'Managed Funds',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.managedFunds',
            },
            {
              id: 'businessScheduleNoGst',
              label: 'Business Schedule - no GST',
              type: 'number',
              serviceKey: 'individualReturnExtras.businessScheduleNoGst',
            },
            {
              id: 'businessScheduleWithGst',
              label: 'Business Schedule - with GST',
              type: 'number',
              serviceKey: 'individualReturnExtras.businessScheduleWithGst',
            },
            {
              id: 'dividendsNotReportedToATO',
              label: 'Dividends not reported to ATO',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.dividendsNotReportedToATO',
            },
            {
              id: 'interestNotReportedToATO',
              label: 'Interest not reported to ATO',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.interestNotReportedToATO',
            },
            {
              id: 'cgtSharesAndEquities',
              label: 'CGT — Shares and equities',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.cgtSharesAndEquities',
            },
            {
              id: 'cgtPropertySales',
              label: 'CGT — Property sales',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.cgtPropertySales',
            },
            {
              id: 'balancingAdjustmentCalculation',
              label: 'Balancing adjustment — sale of business asset',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.balancingAdjustmentCalculation',
            },
            {
              id: 'deductionsMoreThan3Standard',
              label: 'Deductions — more than 3 standard expenses',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.deductionsMoreThan3Standard',
            },
            {
              id: 'motorVehicleLogBook',
              label: 'Motor Vehicle — log book method',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.motorVehicleLogBook',
            },
            {
              id: 'motorVehicleStatutoryRate',
              label: 'Motor Vehicle — Cents per kilometre method',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.motorVehicleStatutoryRate',
            },
            {
              id: 'amendmentOriginalPreparedByFirm',
              label: 'Amendment — original return prepared by firm',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.amendmentOriginalPreparedByFirm',
            },
            {
              id: 'amendmentOriginalNotPreparedByFirm',
              label: 'Amendment — original return NOT prepared by firm',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'providedByClient', label: 'Summary by Client' },
                { value: 'preparedByFirm', label: 'Summary by Firm' },
              ],
              serviceKey: 'individualReturnExtras.amendmentOriginalNotPreparedByFirm',
            },
            {
              id: 'returnNotNecessary',
              label: 'Return not necessary',
              type: 'number',
              feeType: 'onceOff',
              serviceKey: 'individualReturnExtras.returnNotNecessary',
            },
          ],
        },
      },
      Q1b: {
        id: 'Q1b',
        title: 'Business Tax Returns',
        prompt: 'How many Business Entities do they want tax returns lodged for?',
        type: 'number',
        serviceKey: 'businessReturns',
        tierBased: true,
      },
      Q1c: {
        id: 'Q1c',
        title: 'FBT Returns',
        prompt: 'Do they require an FBT return to be lodged?',
        type: 'boolean',
        serviceKey: 'fbtReturns',
        tierBased: true,
      },
      Q1d: {
        id: 'Q1e',
        title: 'BAS (per return)',
        prompt: 'Do they want you to lodge BAS?',
        type: 'frequency',
        frequencyOptions: [
          { value: 4, label: 'Quarterly' },
          { value: 12, label: 'Monthly' },
        ],
        serviceKey: 'bas',
        tierBased: true,
      },
      Q1f: {
        id: 'Q1f',
        title: 'IAS (per return)',
        prompt: 'Do they want you to lodge IAS monthly reporting?',
        type: 'boolean',
        defaultFrequency: 8,
        serviceKey: 'ias',
        tierBased: true,
      },
      Q1g: {
        id: 'Q1g',
        title: 'TPAR (per return)',
        prompt: 'Does the client require TPAR? Please provide # suppliers.',
        type: 'number',
        serviceKey: 'tpar',
        tierBased: true,
      },
    },
  },

  // ===================
  // Q2: PAYROLL SERVICES
  // ===================
  Q2: {
    title: 'Payroll Services',
    questions: {
      Q2a: {
        id: 'Q2a',
        title: 'Workers Compensation',
        prompt: 'Do they want you to lodge Workers Compensation forms for them?',
        type: 'boolean',
        serviceKey: 'workersComp',
        tierBased: true,
      },
      Q2b: {
        id: 'Q2b',
        title: 'Payroll Processing',
        prompt: 'Do they run payroll? Enter # salaried and timesheet employees.',
        type: 'payroll',
        subFields: [
          {
            id: 'salaryEmployees',
            label: 'Salaried Employees',
            type: 'number',
            serviceKey: 'payrollProcessing.salary',
          },
          {
            id: 'timesheetEmployees',
            label: 'Timesheet Employees',
            type: 'number',
            serviceKey: 'payrollProcessing.timesheet',
          },
          {
            id: 'payFrequency',
            label: 'Pay runs per year',
            type: 'select',
            options: [
              { value: 52, label: 'Weekly' },
              { value: 26, label: 'Fortnightly' },
              { value: 12, label: 'Monthly' },
            ],
            default: 52,
          },
        ],
      },
      Q2c: {
        id: 'Q2c',
        title: 'Payroll Tax Returns',
        prompt: 'Do they want you to lodge Payroll Tax returns for them? (Medium & Large only)',
        type: 'boolean',
        serviceKey: 'payrollTax',
        tierBased: true,
        availableTiers: ['medium', 'large'],
      },
      Q2d: {
        id: 'Q2d',
        title: 'Super Prep & Lodgement',
        prompt: 'Do they want you to lodge Superannuation payments?',
        type: 'frequency',
        frequencyOptions: [
          { value: 4, label: 'Quarterly' },
          { value: 12, label: 'Monthly' },
        ],
        serviceKey: 'superPrep',
        tierBased: true,
      },
      Q2e: {
        id: 'Q2e',
        title: 'STP Reporting',
        prompt: 'Do they want you to lodge Single Touch Payroll (STP)?',
        type: 'frequency',
        frequencyOptions: [
          { value: 52, label: 'Weekly' },
          { value: 26, label: 'Fortnightly' },
          { value: 12, label: 'Monthly' },
        ],
        serviceKey: 'stpReporting',
        tierBased: true,
      },
      Q2f: {
        id: 'Q2f',
        title: 'LSL Construction Reporting',
        prompt: 'Do they want you to lodge Long Service Leave forms for them?',
        type: 'boolean',
        serviceKey: 'lslConstruction',
        tierBased: true,
      },
    },
  },

  // ===================
  // Q3: ADVISORY SERVICES
  // ===================
  Q3: {
    title: 'Advisory Services',
    multiplier: 1.5,
    questions: {
      Q3a: {
        id: 'Q3a',
        title: 'Tax Planning / Review',
        prompt: 'Do they require Tax Planning / Review?',
        type: 'boolean',
        serviceKey: 'taxPlanning',
        tierBased: true,
      },
      Q3b: {
        id: 'Q3b',
        title: 'Tax Structuring Advice',
        prompt: 'Do they require Tax Restructuring Review? (Once-off fee)',
        type: 'boolean',
        feeType: 'onceOff',
        serviceKey: 'taxStructuring',
        tierBased: true,
      },
      Q3c: {
        id: 'Q3c',
        title: 'Xero Setup',
        prompt: 'Do they have an accounting system? If not, would they like you to set one up? (Once-off fee)',
        type: 'boolean',
        feeType: 'onceOff',
        serviceKey: 'xeroSetup',
        tierBased: true,
      },
      Q3d: {
        id: 'Q3d',
        title: 'Xero Training',
        prompt: 'Would they like Xero Training? (follows Xero Setup) Training for basic of Xero (reconiling, payable, reciveibale and Payroll)',
        type: 'boolean',
        serviceKey: 'xeroTraining',
        tierBased: true,
      },
      Q3e: {
        id: 'Q3e',
        title: 'Xero Training',
        prompt: 'Would they like ongoing Xero Training?',
        type: 'boolean',
        serviceKey: 'ongoingXeroTraining',
        tierBased: true,
      },
    },
  },

  // ===================
  // Q4: REPORTING
  // ===================
  Q4: {
    title: 'Reporting',
    questions: {
      Q4a: {
        id: 'Q4a',
        title: 'Financial Statements for Tax Returns',
        prompt: 'Do they require Financial Statements for Tax Returns preparation?',
        type: 'boolean',
        serviceKey: 'financialStatements',
        tierBased: true,
      },
      Q4b: {
        id: 'Q4b',
        title: 'Statutory Financial Statements',
        prompt: 'Do they require Statutory Financial Statements?',
        type: 'boolean',
        serviceKey: 'statutoryFinancialStatements',
        tierBased: true,
        availableTiers: ['large'],
      },
      Q4c: {
        id: 'Q4c',
        title: 'Management Financial Statements',
        prompt: 'Do they require Management Financial Statements?',
        type: 'frequency',
        frequencyOptions: [
          { value: 4, label: 'Quarterly' },
          { value: 12, label: 'Monthly' },
        ],
        serviceKey: 'managementFinancialStatements',
        tierBased: true,
      },
    },
  },

  // ===================
  // Q5: MEETINGS
  // ===================
  Q5: {
    title: 'Meetings',
    questions: {
      Q5a: {
        id: 'Q5a',
        title: 'Review The Numbers Meetings',
        prompt: 'Do they require Review The Numbers meetings?',
        type: 'frequency',
        frequencyOptions: [
          { value: 4, label: 'Quarterly' },
          { value: 12, label: 'Monthly' },
        ],
        serviceKey: 'reviewTheNumbers',
        tierBased: true,
      },
      Q5b: {
        id: 'Q5b',
        title: 'Annual Tax Meetings',
        prompt: 'Do they require Annual Tax Meetings?',
        type: 'boolean',
        serviceKey: 'annualTaxMeeting',
        tierBased: true,
      },
      Q5c: {
        id: 'Q5c',
        title: 'Business Meetings',
        prompt: 'Do they require Business Meetings?',
        type: 'frequency',
        frequencyOptions: [
          { value: 4, label: 'Quarterly' },
          { value: 12, label: 'Monthly' },
        ],
        serviceKey: 'businessMeetings',
        tierBased: true,
        multiplier: 1.5,
      },
    },
  },

  // ===================
  // Q6: SUPPORT SERVICES
  // ===================
  Q6: {
    title: 'Support Services',
    questions: {
      Q6a: {
        id: 'Q6a',
        title: 'Team / Email Support',
        prompt: 'Do you offer them support? (Email only — Team)',
        type: 'boolean',
        serviceKey: 'teamEmailSupport',
        tierBased: true,
        feeType: 'monthly',
      },
      Q6b: {
        id: 'Q6b',
        title: 'Client Service Manager',
        prompt: 'Do you offer them support? (Email & Phone — Team & CSM)',
        type: 'boolean',
        serviceKey: 'clientServiceManager',
        tierBased: true,
        feeType: 'monthly',
      },
      Q6c: {
        id: 'Q6c',
        title: 'Principal / Owner',
        prompt: 'Do you offer them support? (Email & Phone — CSM & Owner)',
        type: 'boolean',
        serviceKey: 'principalOwner',
        tierBased: true,
        feeType: 'monthly',
      },
    },
  },

  // ===================
  // Q7: CORPORATE SECRETARIAL & ATO PLANS
  // ===================
  Q7: {
    title: 'Corporate Secretarial & ATO Plans',
    questions: {
      Q7a: {
        id: 'Q7a',
        title: 'Corporate Secretarial',
        prompt: 'Do they need ASIC company secretarial work? (Annual returns / Detail changes)',
        type: 'multiSelect',
        options: [
          {
            id: 'asicAnnualReturn',
            label: 'ASIC Annual Return',
            serviceKey: 'asicAnnualReturn',
            feeType: 'monthly',
          },
          {
            id: 'asicFormLodgements',
            label: 'ASIC Form Lodgements',
            serviceKey: 'asicFormLodgements',
            feeType: 'onceOff',
            type: 'number',
          },
        ],
      },
      Q7b: {
        id: 'Q7b',
        title: 'ATO Payment Plans',
        prompt: 'Do they need ATO Payment Plans set up?',
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: 'basic', label: 'Basic' },
          { value: 'hardship', label: 'Longer-term & Hardship' },
        ],
        serviceKey: 'atoPaymentPlan',
        feeType: 'onceOff',
      },
    },
  },

  // ===================
  // Q8: PRIOR YEAR LODGEMENTS
  // ===================
  Q8: {
    title: 'Prior Year Lodgements',
    questions: {
      Q8: {
        id: 'Q8',
        title: 'Prior Year Lodgements',
        prompt:
          'Do they require prior year lodgements? Enter # of returns.',
        type: 'priorYear',
        feeType: 'onceOff',
        applicableServices: [
          { id: 'businessReturns', label: 'Business Returns', serviceKey: 'businessReturns' },
          { id: 'individualReturns', label: 'Individuals', serviceKey: 'individualReturns' },
          { id: 'bas', label: 'BAS', serviceKey: 'bas' },
          { id: 'ias', label: 'IAS', serviceKey: 'ias' },
          { id: 'fbtReturns', label: 'FBT', serviceKey: 'fbtReturns' },
          { id: 'tpar', label: 'TPAR', serviceKey: 'tpar' },
          { id: 'workersComp', label: 'Workers Comp', serviceKey: 'workersComp' },
          { id: 'superPrep', label: 'Super Lodgement', serviceKey: 'superPrep' },
          { id: 'stpReporting', label: 'STP EOY', serviceKey: 'stpReporting' },
          { id: 'lslConstruction', label: 'LSL Forms', serviceKey: 'lslConstruction' },
          { id: 'payrollTax', label: 'Payroll Tax', serviceKey: 'payrollTax' },
          { id: 'asicAnnualReturn', label: 'ASIC', serviceKey: 'asicAnnualReturn' },
        ],
      },
    },
  },
};

// Revenue segments for tier selection
export const revenueSegments = [
  { id: 'micro', label: 'Micro', description: '< $250K' },
  { id: 'small', label: 'Small', description: '$250K - $500K' },
  { id: 'medium', label: 'Medium', description: '$500K - $1M' },
  { id: 'large', label: 'Large', description: '$1M - $3M' },
];

// Fee type descriptions
export const feeTypes = {
  monthly: {
    label: 'Monthly',
    formula: 'Price / 12 × Multiplier',
    formulaWithUnit: 'Price × Units / 12 × Multiplier',
    formulaWithFreq: 'Price × Frequency / 12 × Multiplier',
    formulaWithBoth: 'Price × Units × Frequency / 12 × Multiplier',
  },
  onceOff: {
    label: 'Once-Off',
    formula: 'Price × Multiplier',
    formulaWithUnit: 'Price × Units × Multiplier',
  },
  perEmployeeRun: {
    label: 'Per Employee/Run',
    formula: 'Rate × Units × Frequency / 12 × Multiplier',
  },
};

// Multipliers by service category
export const multipliers = {
  advisory: 1.5, // Q3: Advisory Services, Q5c: Business Meetings
  tax: 1.2, // Q1: Tax Services, Q5b: Annual Tax Meeting
  payroll: 1.0, // Q2: Payroll Services
  support: 1.0, // Q6: Support Services
  corporate: 1.0, // Q7: Corporate Secretarial & ATO Plans
};

// Question order for display
export const questionOrder = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'];

// ===================
// ACCOUNTING QUESTION DATA ARRAY
// Based on Accounting Price List v3 CSV
// This is the format used by Questions.js
// ===================
export const accountingQuestionData = [
  // 1: Revenue Segment
  {
    id: 'q1',
    title: 'Annual Revenue',
    prompt: "1. What is your potential client's current annual revenue?",
    subheading: 'Annual Revenue',
    category: 'CLIENT DETAILS',
    type: 'radio',
    options: [
      { label: '< $250K', value: 'micro' },
      { label: '$250K - $500K', value: 'small' },
      { label: '$500K - $1M', value: 'medium' },
      { label: '$1M - $3M', value: 'large' },
    ],
  },

  // =================== 2: TAX SERVICES ===================

  // 2a: Individual Tax Returns
  {
    id: 'q2',
    prompt: '2a. How many Individuals do they want tax returns lodged for? Enter number.',
    subheading: 'Individual Tax Returns',
    type: 'number',
    category: 'TAX SERVICES',
    children: [
      {
        id: 'q2a',
        prompt: 'How are the workpapers provided?',
        type: 'radio',
        options: [
          { label: 'Summary provided by Client', value: 'providedByClient' },
          { label: 'Firm to prepare workpaper', value: 'preparedByFirm' },
        ],
        showWhen: (responses) => responses.q2 && parseInt(responses.q2, 10) > 0,
      },
      {
        id: 'q2b',
        prompt: 'Will they have additional Items? Add the number per item in the fields below:',
        type: 'extrasGroup',
        showWhen: (responses) => responses.q2 && parseInt(responses.q2, 10) > 0 && responses.q2a,
        options: [
          { label: 'Rental Property', value: 'rentalProperty', control: 'number' },
          { label: 'Managed Funds', value: 'managedFunds', control: 'number' },
          { label: 'Dividends not reported to ATO', value: 'dividendsNotReportedToATO', control: 'number' },
          { label: 'Interest not reported to ATO', value: 'interestNotReportedToATO', control: 'number' },
          { label: 'CGT — Shares and equities', value: 'cgtSharesAndEquities', control: 'number' },
          { label: 'CGT — Property sales', value: 'cgtPropertySales', control: 'number' },
          { label: 'Balancing adjustment — sale of business asset', value: 'balancingAdjustmentCalculation', control: 'number' },
          { label: 'Deductions — more than 3 standard expenses', value: 'deductionsMoreThan3Standard', control: 'number' },
          { label: 'Motor Vehicle — log book method', value: 'motorVehicleLogBook', control: 'number' },
          { label: 'Motor Vehicle — Cents per kilometre method', value: 'motorVehicleStatutoryRate', control: 'number' },
          { label: 'Amendment — original return prepared by firm', value: 'amendmentOriginalPreparedByFirm', control: 'number' },
          { label: 'Amendment — original return NOT prepared by firm', value: 'amendmentOriginalNotPreparedByFirm', control: 'number' },
          { label: 'Return not necessary (once-off)', value: 'returnNotNecessary', control: 'number' },
          { label: 'None of the above', value: 'none', control: 'button' },
        ],
      },
    ],
  },

  // 2b: Business Tax Returns
  {
    id: 'q3',
    prompt: 'How many Trading Business Entities do they want tax returns lodged for?',
    subheading: 'Business Tax Returns',
    type: 'number',
    category: 'TAX SERVICES',
  },

  // 2b-ii: Non Trading Business Tax Returns
  {
    id: 'q3b',
    prompt: 'How many NON Trading Entities do they want tax returns lodged for?',
    subheading: 'Non Trading Business Tax Returns',
    placeholder: 'Enter number',
    type: 'number',
    category: 'TAX SERVICES',
  },

  // 2d: FBT Returns
  {
    id: 'q5',
    prompt: '2d. How many FBT returns do they require to be lodged?',
    subheading: 'FBT Returns',
    placeholder: 'Enter number',
    type: 'number',
    category: 'TAX SERVICES',
  },

  // 2e: BAS
  {
    id: 'q6',
    prompt: '2e. Do they want you to lodge BAS?',
    subheading: 'BAS (per return)',
    type: 'radio',
    category: 'TAX SERVICES',
    options: [
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q6_entities',
        prompt: 'How many entities?',
        type: 'number',
        placeholder: 'Enter number',
        showWhen: (responses) => responses.q6 && responses.q6 !== 'no',
      },
    ],
  },

  // 2f: IAS
  {
    id: 'q7',
    prompt: '2f. Do they want you to lodge IAS? 8 monthly returns',
    subheading: 'IAS (per return)',
    type: 'radio',
    category: 'TAX SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q7_entities',
        prompt: 'How many entities?',
        type: 'number',
        placeholder: 'Enter number',
        showWhen: (responses) => responses.q7 === 'yes',
      },
    ],
  },

  // 2g: TPAR
  {
    id: 'q8',
    prompt: '2g. Does the client require TPAR? Enter # of suppliers.',
    subheading: 'TPAR (per return)',
    type: 'number',
    category: 'TAX SERVICES',
    placeholder: 'Enter number',
  },

  // =================== 3: PAYROLL SERVICES ===================

  // 3a: Workers Compensation
  {
    id: 'q9',
    prompt: '3a. Do they want you to lodge Workers Compensation forms for them?',
    subheading: 'Workers Compensation',
    type: 'radio',
    category: 'PAYROLL SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },

  // 3b: Payroll Processing
  {
    id: 'q10',
    prompt: '3b. Do they want you to process payroll?',
    subheading: 'Payroll Processing (per employee per pay run)',
    type: 'radio',
    category: 'PAYROLL SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    children: [
      {
        id: 'q10a',
        prompt: 'Salary ONLY employees',
        type: 'inputGroup',
        showWhen: (responses) => responses.q10 === 'yes',
        options: [
          { label: 'Weekly', value: 'salaryWeekly', control: 'number' },
          { label: 'Fortnightly', value: 'salaryFortnightly', control: 'number' },
          { label: 'Monthly', value: 'salaryMonthly', control: 'number' },
        ],
      },
      {
        id: 'q10b',
        prompt: 'Timesheet ONLY employees',
        type: 'inputGroup',
        showWhen: (responses) => responses.q10 === 'yes',
        options: [
          { label: 'Weekly', value: 'timesheetWeekly', control: 'number' },
          { label: 'Fortnightly', value: 'timesheetFortnightly', control: 'number' },
          { label: 'Monthly', value: 'timesheetMonthly', control: 'number' },
        ],
      },
    ],
  },

  // 3c: Payroll Tax Returns (Medium & Large only)
  {
    id: 'q11',
    prompt: '3c. Do they want you to lodge Payroll Tax returns for them?',
    subheading: 'Payroll Tax Returns',
    type: 'radio',
    category: 'PAYROLL SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    showWhen: (responses) => responses.q1 === 'medium' || responses.q1 === 'large',
  },

  // 3d: Super Prep & Lodgement
  {
    id: 'q12',
    prompt: '3d. Do they want you to lodge Superannuation payments?',
    subheading: 'Super Prep & Lodgement',
    type: 'radio',
    category: 'PAYROLL SERVICES',
    options: [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Fortnightly', value: 'fortnightly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },

  // 3e: STP Reporting
  {
    id: 'q13',
    prompt: '3e. Do they want you to lodge Single Touch Payroll (STP)?',
    subheading: 'STP Reporting',
    type: 'radio',
    category: 'PAYROLL SERVICES',
    options: [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Fortnightly', value: 'fortnightly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'No', value: 'no' },
    ],
  },

  // 3e2: Payroll Reconciliation and STP Reporting
  {
    id: 'q13b',
    prompt: 'Do they want you to do an end-of-year wage reconciliation and STP finalisation?',
    subheading: 'Payroll Reconciliation and STP Reporting',
    type: 'radio',
    category: 'PAYROLL SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q14',
    prompt: '3f. Do they want you to lodge Long Service Leave forms for them?',
    subheading: 'LSL Construction Reporting',
    type: 'radio',
    category: 'PAYROLL SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },

  // =================== 4: ADVISORY SERVICES ===================

  // 4a: Tax Planning / Review
  {
    id: 'q15',
    prompt: 'Do they require Tax Planning?',
    subheading: 'Tax Planning Review',
    description: 'Preparation of year end tax position and basic recommendation of tax minimisation activities',
    type: 'radio',
    category: 'ADVISORY SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },

  // 4b: Tax Structuring Advice (Once-off)
  {
    id: 'q16',
    prompt: '4b. Do they require Tax Restructuring Review? (Once-off fee)',
    subheading: 'Tax Structuring Advice',
    description: 'Review only — does not include implementation of advice or new entities etc.',
    type: 'radio',
    category: 'ADVISORY SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },

  // 4c: Xero Setup (Once-off)
  {
    id: 'q17',
    prompt: 'Do they have an accounting system? If not, would they like you to set one up? (Once-off fee)',
    subheading: 'Accounting System Setup',
    type: 'radio',
    category: 'ADVISORY SERVICES',
    options: [
      { label: 'Yes - Setup required', value: 'yes' },
      { label: 'No - Already have system', value: 'no' },
    ],
    children: [
      {
        id: 'q17a',
        prompt: 'Would they like Accounting Software Training? (follows Accounting Software Setup) Training for basic of Accounting Software (reconiling, payable, reciveibale and Payroll)',
        subheading: 'Accounting Software Training',
        type: 'radio',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        showWhen: (responses) => responses.q17 === 'yes',
      },
    ],
  },

  // 4e: Ongoing Xero Training (standalone)
  {
    id: 'q17b',
    prompt: 'Would they like ongoing Accounting Software Training?',
    subheading: 'Accounting Software Training',
    type: 'radio',
    category: 'ADVISORY SERVICES',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },

  // =================== 5: REPORTING ===================

  // 5a: Financial Statements for Tax Returns
  {
    id: 'q18',
    prompt: '5a. How many Financial Statements for Tax Returns do they require?',
    subheading: 'Financial Statements for Tax Returns',
    placeholder: 'Enter number',
    type: 'number',
    category: 'REPORTING',
  },

  // 5b: Statutory Financial Statements (Large only)
  {
    id: 'q19',
    prompt: '5b. Do they require Statutory Financial Statements?',
    subheading: 'Statutory Financial Statements',
    type: 'radio',
    category: 'REPORTING',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    showWhen: (responses) => responses.q1 === 'large' || responses.q1 === 'enterprise',
  },

  // 5c: Management Financial Statements
  {
    id: 'q20',
    prompt: '5c. Do they require Management Financial Statements?',
    subheading: 'Management Financial Statements',
    type: 'radio',
    category: 'REPORTING',
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },

  // =================== 6: MEETINGS ===================

  // 6a: Review The Numbers Meetings
  {
    id: 'q21',
    prompt: '6a. Do they require Review The Numbers meetings?',
    subheading: 'Review The Numbers Meetings',
    type: 'radio',
    category: 'MEETINGS',
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },

  // 6b: Annual Tax Meetings
  {
    id: 'q22',
    prompt: 'Do they require Annual Tax return Meetings?',
    subheading: 'Annual Tax Return Meetings',
    description: 'Meeting to review the Annual tax financials and income tax returns',
    type: 'radio',
    category: 'MEETINGS',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },

  // 6c: Business Meetings
  {
    id: 'q23',
    prompt: '6c. Do they require Business Meetings?',
    subheading: 'Business Meetings',
    description: 'Meetings to provide general business advice — RECOMMENDATION: use these with high demand clients instead of taking multiple calls & emails.',
    type: 'radio',
    category: 'MEETINGS',
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Biannually', value: 'biannually' },
      { label: 'No', value: 'no' },
    ],
  },

  // =================== 7: SUPPORT SERVICES ===================

  // 7: Support Level
  {
    id: 'q24',
    prompt: '7. Do you offer them support?',
    subheading: 'Support Level',
    type: 'radio',
    category: 'SUPPORT SERVICES',
    options: [
      { label: 'Email only — Team', value: 'emailTeam' },
      { label: 'Email & Phone — Team & CSM', value: 'emailPhoneTeamCsm' },
      { label: 'Email & Phone — CSM & Owner', value: 'emailPhoneCsmOwner' },
      { label: 'No support', value: 'no' },
    ],
  },

  // =================== 8: CORPORATE SECRETARIAL & ATO PLANS ===================

  // 8a: Corporate Secretarial
  {
    id: 'q25',
    prompt: '8a. Do they need ASIC company secretarial work? (Annual returns / Detail changes)',
    subheading: 'Corporate Secretarial',
    type: 'multiRadio',
    category: 'CORPORATE SECRETARIAL & ATO PLANS',
    clearOnValue: 'none',
    options: [
      { label: 'ASIC Annual Return', value: 'annualReturns' },
      { label: 'ASIC Form Lodgements (once-off)', value: 'formLodgements' },
      { label: 'None', value: 'none' },
    ],
    children: [
      {
        id: 'q25b',
        prompt: 'How many ASIC Annual Returns?',
        placeholder: 'Enter number',
        type: 'number',
        showWhen: (responses) => {
          if (Array.isArray(responses.q25)) {
            return responses.q25.includes('annualReturns');
          }
          if (typeof responses.q25 === 'object' && responses.q25 !== null) {
            return responses.q25.annualReturns;
          }
          return responses.q25 === 'annualReturns';
        },
      },
      {
        id: 'q25a',
        prompt: 'How many ASIC Form Lodgements?',
        placeholder: 'Enter number',
        type: 'number',
        showWhen: (responses) => {
          if (Array.isArray(responses.q25)) {
            return responses.q25.includes('formLodgements');
          }
          if (typeof responses.q25 === 'object' && responses.q25 !== null) {
            return responses.q25.formLodgements;
          }
          return false;
        },
      },
    ],
  },

  // 8b: ATO Payment Plans (Once-off)
  {
    id: 'q26',
    prompt: '8b. Do they need ATO Payment Plans set up?',
    subheading: 'ATO Payment Plans',
    type: 'radio',
    category: 'CORPORATE SECRETARIAL & ATO PLANS',
    options: [
      { label: 'Basic plans', value: 'basic' },
      { label: 'Longer-term & hardship plans', value: 'hardship' },
      { label: 'No', value: 'no' },
    ],
  },

  // =================== 9: DISBURSEMENTS ===================

  // 9a: Accounting Software Disbursement
  {
    id: 'q28',
    prompt: 'Do you disburse Accountign Software',
    subheading: 'Accounting Software Disbursement',
    type: 'radio',
    category: 'DISBURSEMENTS',
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

  // 9b: Other Disbursements
  {
    id: 'q29',
    prompt: 'List other disbursements',
    subheading: 'Other Disbursements',
    type: 'dynamicList',
    category: 'DISBURSEMENTS',
    addButtonLabel: 'Add disbursement',
    descriptionPlaceholder: 'Enter description',
    pricePlaceholder: 'Enter price',
  },

  // =================== 10: PRICE ADJUSTMENT ===================

  // 10a: Price Adjustment slider
  {
    id: 'q30',
    prompt: 'Adjust the price to allow for complexity or extra effort that comes with some clients.',
    subheading: 'Price Adjustment',
    type: 'slider',
    category: 'PRICE ADJUSTMENT',
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
    unit: '%',
  },

  // =================== 10: PRIOR YEAR LODGEMENTS ===================

  // 10: Prior Year Lodgements (Once-off)
  {
    id: 'q27',
    prompt: '9. Do they require prior year lodgements? Enter # of returns.',
    subheading: 'Prior Year Lodgements',
    type: 'inputGroup',
    category: 'PRIOR YEAR LODGEMENTS',
    showPrices: true,
    priorYearMultiplier: 1.5,
    options: [
      { label: 'Business Returns', value: 'businessReturns', control: 'number', priceKey: 'taxServices.businessReturns' },
      { label: 'Individuals', value: 'individuals', control: 'number', priceKey: 'taxServices.individualReturns.all', fixedPrice: true },
      { label: 'BAS', value: 'bas', control: 'number', priceKey: 'taxServices.bas' },
      { label: 'IAS', value: 'ias', control: 'number', priceKey: 'taxServices.ias' },
      { label: 'FBT', value: 'fbt', control: 'number', priceKey: 'taxServices.fbtReturns' },
      { label: 'TPAR', value: 'tpar', control: 'number', priceKey: 'taxServices.tpar' },
      { label: 'Workers Comp', value: 'workersComp', control: 'number', priceKey: 'payrollServices.workersCompensation' },
      { label: 'Super Lodgement', value: 'superLodgement', control: 'number', priceKey: 'payrollServices.superPrepAndLodgement' },
      { label: 'STP EOY', value: 'stpEoy', control: 'number', priceKey: 'payrollServices.stpReporting' },
      { label: 'LSL Forms', value: 'lslForms', control: 'number', priceKey: 'payrollServices.lslReporting' },
      { label: 'Payroll Tax', value: 'payrollTax', control: 'number', priceKey: 'payrollServices.payrollTaxReturns' },
      { label: 'ASIC', value: 'asic', control: 'number', priceKey: 'corporateSecretarial.asicAnnualReturn' },
      { label: 'None', value: 'none', control: 'button' },
    ],
  },
];

export default accountingQuestions;
