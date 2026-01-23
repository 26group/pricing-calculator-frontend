import React, { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import {
  Container,
  Typography,
  Paper,
  Stack,
  FormControl,
  FormControlLabel,
  TextField,
  Checkbox,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { setResponses as setResponsesAction, setQuestionsPricing, setQuestionsOnceOffFee } from '../features/questions/responsesSlice';
import { calculateTotalMonthlyPrice, calculateTotalOnceOffFee } from '../utils/pricingCalculator';
const questionData = [
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
      { label: "I don't know", value: 'unknown' },
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
          { label: 'No', value: 'noServices' },
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
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q12',
    prompt: '12. Do they want you to lodge superannuation payments for them?',
    type: 'radio',
    options: [
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q13',
    prompt: '13. Do they want you to lodge payroll tax returns for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q14',
    prompt: '14. Do they want you to lodge workers compensation forms for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q15',
    prompt: '15. Do they want you to lodge long service leave forms for them?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q16',
    prompt: '16. Does your potential client require TPAR?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
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
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q18',
    prompt: '18. Do they require tax planning?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q19',
    prompt: '19. Do they require tax restructuring review?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q20',
    prompt: '20. Do they require financial statements for tax returns preparation?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q21',
    prompt: '21. Do they require statutory financial statements?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q22',
    prompt: '22. Do they require management financial statements?',
    type: 'radio',
    options: [
      { label: 'Monthly reports', value: 'monthly' },
      { label: 'Quarterly reports', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q23',
    prompt: '23. Do they require “Review the Numbers” meetings?',
    type: 'radio',
    options: [
      { label: 'Monthly meetings', value: 'monthly' },
      { label: 'Quarterly meetings', value: 'quarterly' },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'q24',
    prompt: '24. Do they require annual tax meetings?',
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
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
      { label: 'No', value: 'none', control: 'checkbox' },
    ],
  },
];

const formatCurrency = (amount) =>
  amount == null
    ? 'N/A'
    : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const serviceValues = {
  revenueSegments: {
    micro: '< $250K',
    small: '$250K - $500K',
    medium: '$500K - $1M',
    large: '$1M - $3M',
    enterprise: '$3M plus',
  },
  taxServices: {
    individualReturns: {
      all: {
        code: '416422',
        monthly: 20.83,
        yearly: 250,
        quantity: null,
        inclusion: 'Individual Returns ALL',
      },
    },
    businessReturns: {
      micro: {
        code: '416423',
        monthly: 62.5,
        yearly: 750,
        quantity: 1,
        inclusion: 'Micro < $250K',
      },
      small: {
        code: '416424',
        monthly: 125,
        yearly: 1500,
        quantity: 1,
        inclusion: 'Small < $500K',
      },
      medium: {
        code: '416425',
        monthly: 166.67,
        yearly: 2000,
        quantity: 1,
        inclusion: 'Medium < $1M',
      },
      large: {
        code: '416426',
        monthly: 250,
        yearly: 3000,
        quantity: 1,
        inclusion: 'Large < $3M',
      },
    },
    smsf: {
      micro: {
        code: '416416',
        monthly: 166.67,
        yearly: 2000,
        quantity: null,
        inclusion: 'SMSF - Micro < $250K',
      },
      small: {
        code: '416417',
        monthly: 166.67,
        yearly: 2000,
        quantity: null,
        inclusion: 'SMSF - Small < $500K',
      },
      medium: {
        code: '416418',
        monthly: 333.33,
        yearly: 4000,
        quantity: null,
        inclusion: 'SMSF - Medium < $1M',
      },
      large: {
        code: '416419',
        monthly: 500,
        yearly: 6000,
        quantity: null,
        inclusion: 'SMSF - Large < $3M',
      },
    },
    fbtReturns: {
      micro: {
        code: '416421',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'FBT - Micro < $250K',
      },
      small: {
        code: '416422',
        monthly: 62.5,
        yearly: 750,
        quantity: null,
        inclusion: 'FBT - Small < $500K',
      },
      medium: {
        code: '416423',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'FBT - Medium < $1M',
      },
      large: {
        code: '416424',
        monthly: 125,
        yearly: 1500,
        quantity: null,
        inclusion: 'FBT - Large < $3M',
      },
    },
    bas: {
      micro: {
        code: '416426',
        monthly: 12.5,
        yearly: 150,
        quantity: 4,
        inclusion: 'BAS - Micro < $250K (per return)',
      },
      small: {
        code: '416427',
        monthly: 12.5,
        yearly: 150,
        quantity: 4,
        inclusion: 'BAS - Small < $500K (per return)',
      },
      medium: {
        code: '416428',
        monthly: 16.67,
        yearly: 200,
        quantity: 4,
        inclusion: 'BAS - Medium < $1M (per return)',
      },
      large: {
        code: '416429',
        monthly: 25,
        yearly: 300,
        quantity: 4,
        inclusion: 'BAS - Large < $3M (per return)',
      },
    },
    ias: {
      micro: {
        code: '416431',
        monthly: 8.33,
        yearly: 100,
        quantity: null,
        inclusion: 'IAS - Micro < $250K (per return)',
      },
      small: {
        code: '416432',
        monthly: 8.33,
        yearly: 100,
        quantity: null,
        inclusion: 'IAS - Small < $500K (per return)',
      },
      medium: {
        code: '416433',
        monthly: 10.42,
        yearly: 125,
        quantity: null,
        inclusion: 'IAS - Medium < $1M (per return)',
      },
      large: {
        code: '416434',
        monthly: 12.5,
        yearly: 150,
        quantity: null,
        inclusion: 'IAS - Large < $3M (per return)',
      },
    },
    tpar: {
      micro: {
        code: '416436',
        monthly: 18.33,
        yearly: 220,
        quantity: null,
        inclusion: 'TPAR - Micro < $250K (per return)',
      },
      small: {
        code: '416437',
        monthly: 18.33,
        yearly: 220,
        quantity: null,
        inclusion: 'TPAR - Small < $500K (per return)',
      },
      medium: {
        code: '416438',
        monthly: 18.33,
        yearly: 220,
        quantity: null,
        inclusion: 'TPAR - Medium < $1M (per return)',
      },
      large: {
        code: '416439',
        monthly: 20.83,
        yearly: 250,
        quantity: null,
        inclusion: 'TPAR - Large < $3M (per return)',
      },
    },
  },
  corporateSecretarial: {
    asicAnnualReturn: {
      code: '416590',
      monthly: 33.33,
      yearly: 400,
      quantity: null,
      inclusion: 'ASIC Annual Return',
    },
    asicFormsLodgements: {
      code: '416591',
      monthly: 12.5,
      yearly: 150,
      quantity: null,
      inclusion: 'ASIC Forms Lodgements',
    },
  },
  atoPaymentPlans: {
    basicPlans: {
      code: '416600',
      monthly: null,
      yearly: 500,
      quantity: null,
      inclusion: 'Basic plans',
    },
    hardshipPlans: {
      code: '416601',
      monthly: null,
      yearly: 1000,
      quantity: null,
      inclusion: 'Longer term & hardship plans',
    },
  },
  payrollServices: {
    workersCompensation: {
      micro: {
        code: '416441',
        monthly: 16.67,
        yearly: 200,
        quantity: null,
        inclusion: 'Workers Comp - Micro < $250K',
      },
      small: {
        code: '416442',
        monthly: 33.33,
        yearly: 400,
        quantity: null,
        inclusion: 'Workers Comp - Small < $500K',
      },
      medium: {
        code: '416443',
        monthly: 45.83,
        yearly: 550,
        quantity: null,
        inclusion: 'Workers Comp - Medium < $1M',
      },
      large: {
        code: '416444',
        monthly: 62.5,
        yearly: 750,
        quantity: null,
        inclusion: 'Workers Comp - Large < $3M',
      },
    },
    payrollProcessing: {
      salary: {
        code: null,
        monthly: 10,
        yearly: null,
        quantity: null,
        inclusion: 'Payroll processing per salaried employee',
      },
      timesheets: {
        code: null,
        monthly: 15,
        yearly: null,
        quantity: null,
        inclusion: 'Payroll processing per timesheet employee',
      },
    },
    payrollTaxReturns: {
      medium: {
        code: '416446',
        monthly: 16.67,
        yearly: 200,
        quantity: null,
        inclusion: 'Payroll Tax - Medium < $1M',
      },
      large: {
        code: '416447',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Payroll Tax - Large < $3M',
      },
    },
    superPrepAndLodgement: {
      micro: {
        code: '416449',
        monthly: 8.33,
        yearly: 100,
        quantity: null,
        inclusion: 'Super Prep and Lodgement - Micro < $250K',
      },
      small: {
        code: '416450',
        monthly: 12.5,
        yearly: 150,
        quantity: null,
        inclusion: 'Super Prep and Lodgement - Small < $500K',
      },
      medium: {
        code: '416451',
        monthly: 20.83,
        yearly: 250,
        quantity: null,
        inclusion: 'Super Prep and Lodgement - Medium < $1M',
      },
      large: {
        code: '416452',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Super Prep and Lodgement - Large < $3M',
      },
    },
    stpReporting: {
      micro: {
        code: '416454',
        monthly: 8.33,
        yearly: 100,
        quantity: null,
        inclusion: 'STP Reporting - Micro < $250K',
      },
      small: {
        code: '416455',
        monthly: 12.5,
        yearly: 150,
        quantity: null,
        inclusion: 'STP Reporting - Small < $500K',
      },
      medium: {
        code: '416456',
        monthly: 20.83,
        yearly: 250,
        quantity: null,
        inclusion: 'STP Reporting - Medium < $1M',
      },
      large: {
        code: '416457',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'STP Reporting - Large < $3M',
      },
    },
    lslReporting: {
      micro: {
        code: '416459',
        monthly: 12.5,
        yearly: 150,
        quantity: null,
        inclusion: 'LSL Construction Reporting - Micro < $250K',
      },
      small: {
        code: '416460',
        monthly: 12.5,
        yearly: 150,
        quantity: null,
        inclusion: 'LSL Construction Reporting - Small < $500K',
      },
      medium: {
        code: '416461',
        monthly: 20.83,
        yearly: 250,
        quantity: null,
        inclusion: 'LSL Construction Reporting - Medium < $1M',
      },
      large: {
        code: '416462',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'LSL Construction Reporting - Large < $3M',
      },
    },
  },
  advisoryServices: {
    taxPlanningReview: {
      micro: {
        code: '416464',
        monthly: 33.33,
        yearly: 400,
        quantity: null,
        inclusion: 'Tax Planning / Review - Micro < $250K',
      },
      small: {
        code: '416465',
        monthly: 50,
        yearly: 600,
        quantity: null,
        inclusion: 'Tax Planning / Review - Small < $500K',
      },
      medium: {
        code: '416466',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'Tax Planning / Review - Medium < $1M',
      },
      large: {
        code: '416467',
        monthly: 166.67,
        yearly: 2000,
        quantity: null,
        inclusion: 'Tax Planning / Review - Large < $3M',
      },
    },
    taxStructuringAdvice: {
      micro: {
        code: '416469',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'Tax Structuring Advice - Micro < $250K',
      },
      small: {
        code: '416470',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'Tax Structuring Advice - Small < $500K',
      },
      medium: {
        code: '416471',
        monthly: 166.67,
        yearly: 2000,
        quantity: null,
        inclusion: 'Tax Structuring Advice - Medium < $1M',
      },
      large: {
        code: '416472',
        monthly: 416.67,
        yearly: 5000,
        quantity: null,
        inclusion: 'Tax Structuring Advice - Large < $3M',
      },
    },
    xeroSetup: {
      micro: {
        code: '416474',
        monthly: 62.5,
        yearly: 750,
        quantity: null,
        inclusion: 'Xero Setup - Micro < $250K',
      },
      small: {
        code: '416475',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'Xero Setup - Small < $500K',
      },
      medium: {
        code: '416476',
        monthly: 125,
        yearly: 1500,
        quantity: null,
        inclusion: 'Xero Setup - Medium < $1M',
      },
      large: {
        code: '416477',
        monthly: 125,
        yearly: 1500,
        quantity: null,
        inclusion: 'Xero Setup - Large < $3M',
      },
    },
    xeroTraining: {
      micro: {
        code: '416479',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Xero Training - Micro < $250K',
      },
      small: {
        code: '416480',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Xero Training - Small < $500K',
      },
      medium: {
        code: '416481',
        monthly: 66.67,
        yearly: 800,
        quantity: null,
        inclusion: 'Xero Training - Medium < $1M',
      },
      large: {
        code: '416482',
        monthly: 100,
        yearly: 1200,
        quantity: null,
        inclusion: 'Xero Training - Large < $3M',
      },
    },
  },
  reporting: {
    financialStatementsTax: {
      micro: {
        code: '416484',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Financial Statements - Micro < $250K',
      },
      small: {
        code: '416485',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'Financial Statements - Small < $500K',
      },
      medium: {
        code: '416486',
        monthly: 125,
        yearly: 1500,
        quantity: null,
        inclusion: 'Financial Statements - Medium < $1M',
      },
      large: {
        code: '416487',
        monthly: 166.67,
        yearly: 2000,
        quantity: null,
        inclusion: 'Financial Statements - Large < $3M',
      },
    },
    statutoryFinancialStatements: {
      large: {
        code: '416489',
        monthly: 250,
        yearly: 3000,
        quantity: null,
        inclusion: 'Statutory Financial Statements - Large < $3M',
      },
    },
    managementFinancialStatements: {
      micro: {
        code: '416491',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Management Financial Statements - Micro < $250K',
      },
      small: {
        code: '416492',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'Management Financial Statements - Small < $500K',
      },
      medium: {
        code: '416493',
        monthly: 125,
        yearly: 1500,
        quantity: null,
        inclusion: 'Management Financial Statements - Medium < $1M',
      },
      large: {
        code: '416494',
        monthly: 166.67,
        yearly: 2000,
        quantity: null,
        inclusion: 'Management Financial Statements - Large < $3M',
      },
    },
  },
  meetings: {
    reviewNumbers: {
      micro: {
        code: '416496',
        monthly: 16.67,
        yearly: 200,
        quantity: null,
        inclusion: 'Review The Numbers Meetings - Micro < $250K',
      },
      small: {
        code: '416497',
        monthly: 25,
        yearly: 300,
        quantity: null,
        inclusion: 'Review The Numbers Meetings - Small < $500K',
      },
      medium: {
        code: '416498',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Review The Numbers Meetings - Medium < $1M',
      },
      large: {
        code: '416499',
        monthly: 62.5,
        yearly: 750,
        quantity: null,
        inclusion: 'Review The Numbers Meetings - Large < $3M',
      },
    },
    annualTaxMeetings: {
      micro: {
        code: '416501',
        monthly: 16.67,
        yearly: 200,
        quantity: null,
        inclusion: 'Annual Meetings - Micro < $250K',
      },
      small: {
        code: '416502',
        monthly: 25,
        yearly: 300,
        quantity: null,
        inclusion: 'Annual Meetings - Small < $500K',
      },
      medium: {
        code: '416503',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Annual Meetings - Medium < $1M',
      },
      large: {
        code: '416504',
        monthly: 62.5,
        yearly: 750,
        quantity: null,
        inclusion: 'Annual Meetings - Large < $3M',
      },
    },
  },
  supportServices: {
    teamOrEmail: {
      micro: {
        code: '416506',
        monthly: 20.83,
        yearly: 250,
        quantity: null,
        inclusion: 'Team or Email - Micro < $250K',
      },
      small: {
        code: '416507',
        monthly: 20.83,
        yearly: 250,
        quantity: null,
        inclusion: 'Team or Email - Small < $500K',
      },
      medium: {
        code: '416508',
        monthly: 33.33,
        yearly: 400,
        quantity: null,
        inclusion: 'Team or Email - Medium < $1M',
      },
      large: {
        code: '416509',
        monthly: 50,
        yearly: 600,
        quantity: null,
        inclusion: 'Team or Email - Large < $3M',
      },
    },
    clientServiceManager: {
      micro: {
        code: '416511',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Client Service Manager - Micro < $250K',
      },
      small: {
        code: '416512',
        monthly: 41.67,
        yearly: 500,
        quantity: null,
        inclusion: 'Client Service Manager - Small < $500K',
      },
      medium: {
        code: '416513',
        monthly: 50,
        yearly: 600,
        quantity: null,
        inclusion: 'Client Service Manager - Medium < $1M',
      },
      large: {
        code: '416514',
        monthly: 100,
        yearly: 1200,
        quantity: null,
        inclusion: 'Client Service Manager - Large < $3M',
      },
    },
    principalOwner: {
      micro: {
        code: '416516',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'Principal / Owner - Micro < $250K',
      },
      small: {
        code: '416517',
        monthly: 83.33,
        yearly: 1000,
        quantity: null,
        inclusion: 'Principal / Owner - Small < $500K',
      },
      medium: {
        code: '416518',
        monthly: 125,
        yearly: 1500,
        quantity: null,
        inclusion: 'Principal / Owner - Medium < $1M',
      },
      large: {
        code: '416519',
        monthly: 208.33,
        yearly: 2500,
        quantity: null,
        inclusion: 'Principal / Owner - Large < $3M',
      },
    },
  },
};

export const segmentForServices = (segment) => {
  switch (segment) {
    case 'micro':
    case 'small':
    case 'medium':
    case 'large':
      return segment;
    case 'enterprise':
      return 'large';
    default:
      return null;
  }
};

const resolveBasIasService = (segment, selection) => {
  if (!segment) {
    return { bas: undefined, ias: undefined };
  }

  if (selection === 'basQuarterly' || selection === 'basMonthly') {
    return {
      bas: serviceValues.taxServices.bas[segment],
      // ias: undefined,
    };
  }

  if (selection === 'iasMonthly') {
    return {
      // bas: undefined,
      ias: serviceValues.taxServices.ias[segment],
    };
  }

  return { bas: undefined, ias: undefined };
};

const flattenQuestions = (questions) => {
  const collected = [];
  const traverse = (items) => {
    items.forEach((question) => {
      collected.push(question);
      if (question.children) {
        traverse(question.children);
      }
    });
  };
  traverse(questions);
  return collected;
};

const buildInitialState = () => {
  const flat = flattenQuestions(questionData);
  return flat.reduce((acc, question) => {
    if (question.type === 'radio') {
      acc[question.id] = '';
      return acc;
    }

    if (question.type === 'checkbox') {
      acc[question.id] = question.options.reduce((optionState, option) => {
        optionState[option.value] = false;
        return optionState;
      }, {});
      return acc;
    }

    if (question.type === 'number') {
      acc[question.id] = '';
      return acc;
    }

    if (question.type === 'inputGroup') {
      acc[question.id] = question.options.reduce((groupState, option) => {
        if (option.control === 'checkbox') {
          groupState[option.value] = false;
        } else {
          groupState[option.value] = '';
        }
        return groupState;
      }, {});
      return acc;
    }

    acc[question.id] = '';
    return acc;
  }, {});
};

export default function Questions() {
  const navigate = useNavigate();
  const storeResponses = useSelector((state) => state.responses);
  const initialState = useMemo(() => {
    const built = buildInitialState();
    return storeResponses && Object.keys(storeResponses).length ? { ...built, ...storeResponses } : built;
  }, [storeResponses]);
  const [responses, setResponses] = useState(initialState);
  const [selectedServices, setSelectedServices] = useState({});
  const [requireQ2Message, setRequireQ2Message] = useState(false);
  const [focusedQuestion, setFocusedQuestion] = useState(null);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResponsesAction(responses));
    if (responses.q2 && requireQ2Message) {
      setRequireQ2Message(false);
    }
  }, [responses, dispatch, requireQ2Message]);

  useEffect(() => {
    if (responses.q2) {
      localStorage.setItem('selectedRevenueSegment', responses.q2);
    }
  }, [responses.q2]);

  useEffect(() => {
    setSelectedServices((prev) => {
      const originalSegment = responses.q2;
      const segment = segmentForServices(originalSegment);
      if (originalSegment && !segment) {
        console.log('No service mapping for revenue segment', { question2Value: originalSegment });
      }
      const smsfCandidate =
        responses.q6 === 'yes' && segment ? serviceValues.taxServices.smsf[segment] : undefined;
      const fbtCandidate =
        responses.q6 === 'yes' && responses.q6a === 'yes' && segment
          ? serviceValues.taxServices.fbtReturns[segment]
          : undefined;
      const { bas: basCandidate, ias: iasCandidate } = resolveBasIasService(segment, responses.q7);

      let payload = {
        payrollTaxCandidate: undefined,
        workersCompCandidate: undefined,
        superPrepCandidate: undefined,
        tparCandidate: undefined,
        fbtReturnCandidate: undefined,
        taxPlanningCandidate: undefined,
        taxStructuringCandidate: undefined,
        financialStatementsCandidate: undefined,
        statutoryStatementsCandidate: undefined,
        managementStatementsCandidate: undefined,
        reviewNumbersCandidate: undefined,
        supportTeamCandidate: undefined,
        supportCsmCandidate: undefined,
        supportOwnerCandidate: undefined,
        corporateSecretarialCandidate: undefined,
        atoPaymentPlanCandidate: undefined,
      };

      if (responses.q13 === 'yes' && (segment === 'medium' || segment === 'large')) {
        payload.payrollTaxCandidate = serviceValues.payrollServices.payrollTaxReturns?.[segment];
        if (!payload.payrollTaxCandidate) {
          console.log('No payroll tax service value found for segment', {
            question: 'q13',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (responses.q14 === 'yes' && segment) {
        payload.workersCompCandidate = serviceValues.payrollServices.workersCompensation?.[segment];
        if (!payload.workersCompCandidate) {
          console.log('No workers compensation service value found for segment', {
            question: 'q14',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (
        (responses.q12 === 'quarterly' || responses.q12 === 'monthly') &&
        (segment === 'medium' || segment === 'large')
      ) {
        payload.superPrepCandidate = serviceValues.payrollServices.payrollTaxReturns?.[segment];
        if (!payload.superPrepCandidate) {
          console.log('No payroll tax service value found for question 12 segment', {
            question: 'q12',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (responses.q16 === 'yes' && segment) {
        payload.tparCandidate = serviceValues.taxServices.tpar?.[segment];
        if (!payload.tparCandidate) {
          console.log('No TPAR service value found for segment', {
            question: 'q16',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (
        responses.q17 === 'yes' &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        payload.fbtReturnCandidate = serviceValues.taxServices.fbtReturns?.[segment];
        if (!payload.fbtReturnCandidate) {
          console.log('No FBT return service value found for segment', {
            question: 'q17',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (responses.q18 === 'yes' && segment) {
        payload.taxPlanningCandidate = serviceValues.advisoryServices.taxPlanningReview?.[segment];
        if (!payload.taxPlanningCandidate) {
          console.log('No Tax Planning service value found for segment', {
            question: 'q18',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (responses.q19 === 'yes' && segment) {
        payload.taxStructuringCandidate = serviceValues.advisoryServices.taxStructuringAdvice?.[segment];
        if (!payload.taxStructuringCandidate) {
          console.log('No Tax Structuring service value found for segment', {
            question: 'q19',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (
        responses.q20 === 'yes' &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        payload.financialStatementsCandidate = serviceValues.reporting.financialStatementsTax?.[segment];
        if (!payload.financialStatementsCandidate) {
          console.log('No Financial Statements service value found for segment', {
            question: 'q20',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (responses.q21 === 'yes' && segment) {
        payload.statutoryStatementsCandidate = serviceValues.reporting.statutoryFinancialStatements?.[segment];
        if (!payload.statutoryStatementsCandidate) {
          console.log('No Statutory Financial Statements service value found for segment', {
            question: 'q21',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (
        (responses.q22 === 'monthly' || responses.q22 === 'quarterly') &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        payload.managementStatementsCandidate = serviceValues.reporting.managementFinancialStatements?.[segment];
        if (!payload.managementStatementsCandidate) {
          console.log('No Management Financial Statements service value found for segment', {
            question: 'q22',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      if (
        (responses.q23 === 'monthly' || responses.q23 === 'quarterly') &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        payload.reviewNumbersCandidate = serviceValues.meetings.reviewNumbers?.[segment];
        if (!payload.reviewNumbersCandidate) {
          console.log('No Review Numbers service value found for segment', {
            question: 'q23',
            revenueSelection: originalSegment,
            segment,
          });
        }
      }

      const supportSelection = responses.q25;
      if (supportSelection && segment) {
        if (supportSelection === 'emailTeam' || supportSelection === 'emailPhoneTeamCsm') {
          payload.supportTeamCandidate = serviceValues.supportServices.teamOrEmail?.[segment];
          if (!payload.supportTeamCandidate) {
            console.log('No Team support service value found for segment', {
              question: 'q25',
              selection: supportSelection,
              revenueSelection: originalSegment,
              segment,
            });
          }
        }

        if (supportSelection === 'emailPhoneTeamCsm' || supportSelection === 'emailPhoneCsmOwner') {
          payload.supportCsmCandidate = serviceValues.supportServices.clientServiceManager?.[segment];
          if (!payload.supportCsmCandidate) {
            console.log('No Client Service Manager value found for segment', {
              question: 'q25',
              selection: supportSelection,
              revenueSelection: originalSegment,
              segment,
            });
          }
        }

        if (supportSelection === 'emailPhoneCsmOwner') {
          payload.supportOwnerCandidate = serviceValues.supportServices.principalOwner?.[segment];
          if (!payload.supportOwnerCandidate) {
            console.log('No Principal/Owner support value found for segment', {
              question: 'q25',
              selection: supportSelection,
              revenueSelection: originalSegment,
              segment,
            });
          }
        }
      }

      if (responses.q26 === 'annualReturns') {
        payload.corporateSecretarialCandidate = serviceValues.corporateSecretarial.asicAnnualReturn;
      } else if (responses.q26 === 'detailChanges') {
        payload.corporateSecretarialCandidate = serviceValues.corporateSecretarial.asicFormsLodgements;
      }

      if (responses.q26b === 'basicPlans') {
        payload.atoPaymentPlanCandidate = serviceValues.atoPaymentPlans.basicPlans;
      } else if (responses.q26b === 'hardshipPlans') {
        payload.atoPaymentPlanCandidate = serviceValues.atoPaymentPlans.hardshipPlans;
      }

      const {
        payrollTaxCandidate,
        workersCompCandidate,
        superPrepCandidate,
        tparCandidate,
        fbtReturnCandidate,
        taxPlanningCandidate,
        taxStructuringCandidate,
        financialStatementsCandidate,
        statutoryStatementsCandidate,
        managementStatementsCandidate,
        reviewNumbersCandidate,
        supportTeamCandidate,
        supportCsmCandidate,
        supportOwnerCandidate,
        corporateSecretarialCandidate,
        atoPaymentPlanCandidate,
      } = payload;

      const next = { ...prev };
      let changed = false;

      if (smsfCandidate) {
        if (!prev.smsf || prev.smsf.code !== smsfCandidate.code) {
          console.log('Selected SMSF service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: smsfCandidate,
          });
          changed = true;
        }
        next.smsf = smsfCandidate;
      } else if (prev.smsf) {
        console.log('Cleared SMSF service selection');
        delete next.smsf;
        changed = true;
      }

      if (fbtCandidate) {
        if (!prev.fbt || prev.fbt.code !== fbtCandidate.code) {
          console.log('Selected FBT service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: fbtCandidate,
          });
          changed = true;
        }
        next.fbt = fbtCandidate;
      } else if (prev.fbt) {
        console.log('Cleared FBT service selection');
        delete next.fbt;
        changed = true;
      }

      if (basCandidate) {
        if (!prev.bas || prev.bas.code !== basCandidate.code) {
          console.log('Selected BAS service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: basCandidate,
          });
          changed = true;
        }
        next.bas = basCandidate;
      } else if (prev.bas) {
        console.log('Cleared BAS service selection');
        delete next.bas;
        changed = true;
      }

      if (iasCandidate) {
        if (!prev.ias || prev.ias.code !== iasCandidate.code) {
          console.log('Selected IAS service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: iasCandidate,
          });
          changed = true;
        }
        next.ias = iasCandidate;
      } else if (prev.ias) {
        console.log('Cleared IAS service selection');
        delete next.ias;
        changed = true;
      }

      if (payrollTaxCandidate) {
        if (!prev.payrollTax || prev.payrollTax.code !== payrollTaxCandidate.code) {
          console.log('Selected Payroll Tax service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: payrollTaxCandidate,
          });
          changed = true;
        }
        next.payrollTax = payrollTaxCandidate;
      } else if (prev.payrollTax) {
        console.log('Cleared Payroll Tax service selection');
        delete next.payrollTax;
        changed = true;
      }

      if (workersCompCandidate) {
        if (!prev.workersComp || prev.workersComp.code !== workersCompCandidate.code) {
          console.log('Selected Workers Compensation service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: workersCompCandidate,
          });
          changed = true;
        }
        next.workersComp = workersCompCandidate;
      } else if (prev.workersComp) {
        console.log('Cleared Workers Compensation service selection');
        delete next.workersComp;
        changed = true;
      }

      if (superPrepCandidate) {
        if (!prev.superPrep || prev.superPrep.code !== superPrepCandidate.code) {
          console.log('Selected Superannuation Lodgement service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: superPrepCandidate,
          });
          changed = true;
        }
        next.superPrep = superPrepCandidate;
      } else if (prev.superPrep) {
        console.log('Cleared Superannuation Lodgement service selection');
        delete next.superPrep;
        changed = true;
      }

      if (tparCandidate) {
        if (!prev.tpar || prev.tpar.code !== tparCandidate.code) {
          console.log('Selected TPAR service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: tparCandidate,
          });
          changed = true;
        }
        next.tpar = tparCandidate;
      } else if (prev.tpar) {
        console.log('Cleared TPAR service selection');
        delete next.tpar;
        changed = true;
      }

      if (fbtReturnCandidate) {
        if (!prev.fbtReturn || prev.fbtReturn.code !== fbtReturnCandidate.code) {
          console.log('Selected FBT return service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: fbtReturnCandidate,
          });
          changed = true;
        }
        next.fbtReturn = fbtReturnCandidate;
      } else if (prev.fbtReturn) {
        console.log('Cleared FBT return service selection');
        delete next.fbtReturn;
        changed = true;
      }

      if (taxPlanningCandidate) {
        if (!prev.taxPlanning || prev.taxPlanning.code !== taxPlanningCandidate.code) {
          console.log('Selected Tax Planning service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: taxPlanningCandidate,
          });
          changed = true;
        }
        next.taxPlanning = taxPlanningCandidate;
      } else if (prev.taxPlanning) {
        console.log('Cleared Tax Planning service selection');
        delete next.taxPlanning;
        changed = true;
      }

      if (taxStructuringCandidate) {
        if (!prev.taxStructuring || prev.taxStructuring.code !== taxStructuringCandidate.code) {
          console.log('Selected Tax Structuring service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: taxStructuringCandidate,
          });
          changed = true;
        }
        next.taxStructuring = taxStructuringCandidate;
      } else if (prev.taxStructuring) {
        console.log('Cleared Tax Structuring service selection');
        delete next.taxStructuring;
        changed = true;
      }

      if (financialStatementsCandidate) {
        if (!prev.financialStatementsTax || prev.financialStatementsTax.code !== financialStatementsCandidate.code) {
          console.log('Selected Financial Statements service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: financialStatementsCandidate,
          });
          changed = true;
        }
        next.financialStatementsTax = financialStatementsCandidate;
      } else if (prev.financialStatementsTax) {
        console.log('Cleared Financial Statements service selection');
        delete next.financialStatementsTax;
        changed = true;
      }

      if (statutoryStatementsCandidate) {
        if (
          !prev.statutoryFinancialStatements ||
          prev.statutoryFinancialStatements.code !== statutoryStatementsCandidate.code
        ) {
          console.log('Selected Statutory Financial Statements service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: statutoryStatementsCandidate,
          });
          changed = true;
        }
        next.statutoryFinancialStatements = statutoryStatementsCandidate;
      } else if (prev.statutoryFinancialStatements) {
        console.log('Cleared Statutory Financial Statements service selection');
        delete next.statutoryFinancialStatements;
        changed = true;
      }

      if (managementStatementsCandidate) {
        if (
          !prev.managementFinancialStatements ||
          prev.managementFinancialStatements.code !== managementStatementsCandidate.code
        ) {
          console.log('Selected Management Financial Statements service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: managementStatementsCandidate,
          });
          changed = true;
        }
        next.managementFinancialStatements = managementStatementsCandidate;
      } else if (prev.managementFinancialStatements) {
        console.log('Cleared Management Financial Statements service selection');
        delete next.managementFinancialStatements;
        changed = true;
      }

      if (reviewNumbersCandidate) {
        if (!prev.reviewNumbers || prev.reviewNumbers.code !== reviewNumbersCandidate.code) {
          console.log('Selected Review Numbers service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: reviewNumbersCandidate,
          });
          changed = true;
        }
        next.reviewNumbers = reviewNumbersCandidate;
      } else if (prev.reviewNumbers) {
        console.log('Cleared Review Numbers service selection');
        delete next.reviewNumbers;
        changed = true;
      }

      if (supportTeamCandidate) {
        if (!prev.teamSupport || prev.teamSupport.code !== supportTeamCandidate.code) {
          console.log('Selected Team support service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: supportTeamCandidate,
          });
          changed = true;
        }
        next.teamSupport = supportTeamCandidate;
      } else if (prev.teamSupport) {
        console.log('Cleared Team support service selection');
        delete next.teamSupport;
        changed = true;
      }

      if (supportCsmCandidate) {
        if (!prev.clientServiceManager || prev.clientServiceManager.code !== supportCsmCandidate.code) {
          console.log('Selected Client Service Manager value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: supportCsmCandidate,
          });
          changed = true;
        }
        next.clientServiceManager = supportCsmCandidate;
      } else if (prev.clientServiceManager) {
        console.log('Cleared Client Service Manager selection');
        delete next.clientServiceManager;
        changed = true;
      }

      if (supportOwnerCandidate) {
        if (!prev.principalOwner || prev.principalOwner.code !== supportOwnerCandidate.code) {
          console.log('Selected Principal/Owner support value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: supportOwnerCandidate,
          });
          changed = true;
        }
        next.principalOwner = supportOwnerCandidate;
      } else if (prev.principalOwner) {
        console.log('Cleared Principal/Owner support selection');
        delete next.principalOwner;
        changed = true;
      }

      if (corporateSecretarialCandidate) {
        if (
          !prev.corporateSecretarial ||
          prev.corporateSecretarial.code !== corporateSecretarialCandidate.code
        ) {
          console.log('Selected Corporate Secretarial service value', {
            questionSelection: responses.q26,
            service: corporateSecretarialCandidate,
          });
          changed = true;
        }
        next.corporateSecretarial = corporateSecretarialCandidate;
      } else if (prev.corporateSecretarial) {
        console.log('Cleared Corporate Secretarial service selection');
        delete next.corporateSecretarial;
        changed = true;
      }

      if (atoPaymentPlanCandidate) {
        if (!prev.atoPaymentPlan || prev.atoPaymentPlan.code !== atoPaymentPlanCandidate.code) {
          console.log('Selected ATO payment plan service value', {
            questionSelection: responses.q26b,
            service: atoPaymentPlanCandidate,
          });
          changed = true;
        }
        next.atoPaymentPlan = atoPaymentPlanCandidate;
      } else if (prev.atoPaymentPlan) {
        console.log('Cleared ATO payment plan selection');
        delete next.atoPaymentPlan;
        changed = true;
      }

      let annualTaxCandidate;
      if (
        responses.q24 === 'yes' &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        annualTaxCandidate = serviceValues.meetings.annualTaxMeetings?.[segment];
        if (!annualTaxCandidate) {
          console.log('No Annual Tax Meetings service value found for segment', {
            question: 'q24',
            revenueSelection: originalSegment,
            segment,
          });
        }
      } else {
        annualTaxCandidate = undefined;
      }

      if (annualTaxCandidate) {
        if (!prev.annualTaxMeetings || prev.annualTaxMeetings.code !== annualTaxCandidate.code) {
          console.log('Selected Annual Tax Meetings service value', {
            revenueSelection: originalSegment,
            resolvedSegment: segment,
            service: annualTaxCandidate,
          });
          changed = true;
        }
        next.annualTaxMeetings = annualTaxCandidate;
      } else if (prev.annualTaxMeetings) {
        console.log('Cleared Annual Tax Meetings service selection');
        delete next.annualTaxMeetings;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [
    responses.q2,
    responses.q6,
    responses.q6a,
    responses.q7,
    responses.q12,
    responses.q13,
    responses.q14,
    responses.q16,
    responses.q17,
    responses.q18,
    responses.q19,
    responses.q20,
    responses.q21,
    responses.q22,
    responses.q23,
    responses.q24,
    responses.q25,
    responses.q26,
    responses.q26b,
  ]);

  const handleRadioChange = (questionId) => (event) => {
    console.log(`Response updated`, { questionId, value: event.target.value });
    setResponses((prev) => ({
      ...prev,
      [questionId]: event.target.value,
    }));
  };

  const handleCheckboxChange = (questionId, optionValue) => (event) => {
    console.log(`Response updated`, {
      questionId,
      option: optionValue,
      checked: event.target.checked,
    });
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [optionValue]: event.target.checked,
      },
    }));
  };

  const handleNumberChange = (questionId) => (event) => {
    console.log(`Response updated`, { questionId, value: event.target.value });
    setResponses((prev) => ({
      ...prev,
      [questionId]: event.target.value,
    }));
  };

  const handleInputGroupChange = (questionId, optionValue) => (event) => {
    console.log(`Response updated`, { questionId, option: optionValue, value: event.target.value });
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [optionValue]: event.target.value,
      },
    }));
  };

  const handleInputGroupCheckboxChange = (questionId, optionValue) => (event) => {
    console.log(`Response updated`, {
      questionId,
      option: optionValue,
      checked: event.target.checked,
    });
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [optionValue]: event.target.checked,
      },
    }));
  };

  const renderQuestion = (question, depth = 0) => {
    if (question.showWhen && !question.showWhen(responses)) {
      return null;
    }

    return (
      <div key={question.id} style={{ marginLeft: depth > 0 ? `${depth * 32}px` : 0 }}>
        <Paper
          elevation={0}
          onFocus={() => setFocusedQuestion(question.id)}
          onBlur={() => setFocusedQuestion(null)}
          sx={{
            p: 2,
            borderRadius: 1,
            position: 'relative',
            zIndex: depth > 0 ? 1 : 0,
            backgroundColor: focusedQuestion === question.id ? '#f5f5f5' : '#ffffff',
            transition: 'all 0.2s ease-in-out',
            boxShadow: focusedQuestion === question.id ? 'inset 0 0 0 2px #002060' : 'none',
            '&:hover': {
              backgroundColor: focusedQuestion === question.id ? '#f5f5f5' : '#ffffff',
              boxShadow: focusedQuestion === question.id ? 'inset 0 0 0 2px #002060' : '0 4px 16px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1rem' }}>{question.prompt}</Typography>
            {question.type === 'radio' && (
              <ToggleButtonGroup
                value={responses[question.id]}
                exclusive
                onChange={(event, newValue) => {
                  if (newValue !== null) {
                    setFocusedQuestion(question.id);
                    handleRadioChange(question.id)({ target: { value: newValue } });
                  }
                }}
                size="medium"
                sx={{
                  flexWrap: 'wrap',
                  gap: 1,
                  display: 'flex',
                  '& .MuiToggleButton-root': {
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid #d0d0d0',
                    color: '#666',
                    '&:hover:not(.Mui-disabled)': {
                      backgroundColor: '#f5f5f5',
                      borderColor: '#002060',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#002060',
                      color: '#fff',
                      borderColor: '#002060',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#001a47',
                      },
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#f5f5f5',
                      color: '#ccc',
                      opacity: 0.6,
                    },
                  },
                }}
                disabled={question.id !== 'q2' && !responses.q2}
                onClick={question.id !== 'q2' && !responses.q2 ? () => setRequireQ2Message(true) : undefined}
              >
                {question.options.map((option) => (
                  <ToggleButton 
                    key={option.value} 
                    value={option.value}
                    sx={{
                      minWidth: ['q7', 'q25', 'q26b'].includes(question.id) ? '160px' : '120px',
                      flex: ['q7', 'q25', 'q26b'].includes(question.id) ? '0 1 160px' : '0 1 120px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      py: 1.2,
                      px: 1.5,
                      fontSize: '0.9rem',
                    }}
                    disabled={question.id !== 'q2' && !responses.q2}
                    onClick={question.id !== 'q2' && !responses.q2 ? () => setRequireQ2Message(true) : undefined}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{option.label}</Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
            {question.id === 'q6' && selectedServices.smsf && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.smsf.inclusion} (Code {selectedServices.smsf.code}) — Monthly{' '}
                {formatCurrency(selectedServices.smsf.monthly)}, Yearly {formatCurrency(selectedServices.smsf.yearly)}
              </Typography>
            )}
            {question.id === 'q6a' && selectedServices.fbt && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.fbt.inclusion} (Code {selectedServices.fbt.code}) — Monthly{' '}
                {formatCurrency(selectedServices.fbt.monthly)}, Yearly {formatCurrency(selectedServices.fbt.yearly)}
              </Typography>
            )}
            {question.id === 'q7' && selectedServices.bas && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.bas.inclusion} (Code {selectedServices.bas.code}) — Monthly{' '}
                {formatCurrency(selectedServices.bas.monthly)}, Yearly {formatCurrency(selectedServices.bas.yearly)}
              </Typography>
            )}
            {question.id === 'q7' && selectedServices.ias && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.ias.inclusion} (Code {selectedServices.ias.code}) — Monthly{' '}
                {formatCurrency(selectedServices.ias.monthly)}, Yearly {formatCurrency(selectedServices.ias.yearly)}
              </Typography>
            )}
            {question.id === 'q12' && selectedServices.superPrep && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.superPrep.inclusion} (Code {selectedServices.superPrep.code}) — Monthly{' '}
                {formatCurrency(selectedServices.superPrep.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.superPrep.yearly)}
              </Typography>
            )}
            {question.id === 'q13' && selectedServices.payrollTax && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.payrollTax.inclusion} (Code {selectedServices.payrollTax.code}) — Monthly{' '}
                {formatCurrency(selectedServices.payrollTax.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.payrollTax.yearly)}
              </Typography>
            )}
            {question.id === 'q14' && selectedServices.workersComp && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.workersComp.inclusion} (Code {selectedServices.workersComp.code}) — Monthly{' '}
                {formatCurrency(selectedServices.workersComp.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.workersComp.yearly)}
              </Typography>
            )}
            {question.id === 'q16' && selectedServices.tpar && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.tpar.inclusion} (Code {selectedServices.tpar.code}) — Monthly{' '}
                {formatCurrency(selectedServices.tpar.monthly)}, Yearly {formatCurrency(selectedServices.tpar.yearly)}
              </Typography>
            )}
            {question.id === 'q17' && selectedServices.fbtReturn && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.fbtReturn.inclusion} (Code {selectedServices.fbtReturn.code}) — Monthly{' '}
                {formatCurrency(selectedServices.fbtReturn.monthly)}, Yearly {formatCurrency(selectedServices.fbtReturn.yearly)}
              </Typography>
            )}
            {question.id === 'q18' && selectedServices.taxPlanning && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.taxPlanning.inclusion} (Code {selectedServices.taxPlanning.code}) — Monthly{' '}
                {formatCurrency(selectedServices.taxPlanning.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.taxPlanning.yearly)}
              </Typography>
            )}
            {question.id === 'q19' && selectedServices.taxStructuring && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.taxStructuring.inclusion} (Code {selectedServices.taxStructuring.code}) — Monthly{' '}
                {formatCurrency(selectedServices.taxStructuring.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.taxStructuring.yearly)}
              </Typography>
            )}
            {question.id === 'q20' && selectedServices.financialStatementsTax && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.financialStatementsTax.inclusion} (Code {selectedServices.financialStatementsTax.code}) — Monthly{' '}
                {formatCurrency(selectedServices.financialStatementsTax.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.financialStatementsTax.yearly)}
              </Typography>
            )}
            {question.id === 'q21' && selectedServices.statutoryFinancialStatements && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.statutoryFinancialStatements.inclusion} (Code {selectedServices.statutoryFinancialStatements.code}) — Monthly{' '}
                {formatCurrency(selectedServices.statutoryFinancialStatements.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.statutoryFinancialStatements.yearly)}
              </Typography>
            )}
            {question.id === 'q22' && selectedServices.managementFinancialStatements && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.managementFinancialStatements.inclusion} (Code {selectedServices.managementFinancialStatements.code}) — Monthly{' '}
                {formatCurrency(selectedServices.managementFinancialStatements.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.managementFinancialStatements.yearly)}
              </Typography>
            )}
            {question.id === 'q23' && selectedServices.reviewNumbers && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.reviewNumbers.inclusion} (Code {selectedServices.reviewNumbers.code}) — Monthly{' '}
                {formatCurrency(selectedServices.reviewNumbers.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.reviewNumbers.yearly)}
              </Typography>
            )}
            {question.id === 'q25' && selectedServices.teamSupport && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.teamSupport.inclusion} (Code {selectedServices.teamSupport.code}) — Monthly{' '}
                {formatCurrency(selectedServices.teamSupport.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.teamSupport.yearly)}
              </Typography>
            )}
            {question.id === 'q25' && selectedServices.clientServiceManager && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.clientServiceManager.inclusion} (Code {selectedServices.clientServiceManager.code}) — Monthly{' '}
                {formatCurrency(selectedServices.clientServiceManager.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.clientServiceManager.yearly)}
              </Typography>
            )}
            {question.id === 'q25' && selectedServices.principalOwner && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.principalOwner.inclusion} (Code {selectedServices.principalOwner.code}) — Monthly{' '}
                {formatCurrency(selectedServices.principalOwner.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.principalOwner.yearly)}
              </Typography>
            )}
            {question.id === 'q26' && selectedServices.corporateSecretarial && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.corporateSecretarial.inclusion} (Code {selectedServices.corporateSecretarial.code}) — Monthly{' '}
                {formatCurrency(selectedServices.corporateSecretarial.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.corporateSecretarial.yearly)}
              </Typography>
            )}
            {question.id === 'q26b' && selectedServices.atoPaymentPlan && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.atoPaymentPlan.inclusion} (Code {selectedServices.atoPaymentPlan.code}) — Monthly{' '}
                {formatCurrency(selectedServices.atoPaymentPlan.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.atoPaymentPlan.yearly)}
              </Typography>
            )}
            {question.id === 'q24' && selectedServices.annualTaxMeetings && (
              <Typography variant="body2" color="text.secondary">
                Selected service: {selectedServices.annualTaxMeetings.inclusion} (Code {selectedServices.annualTaxMeetings.code}) — Monthly{' '}
                {formatCurrency(selectedServices.annualTaxMeetings.monthly)}, Yearly{' '}
                {formatCurrency(selectedServices.annualTaxMeetings.yearly)}
              </Typography>
            )}
            {question.type === 'checkbox' && (
              <Stack spacing={1}>
                {question.options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={responses[question.id][option.value]}
                        onChange={(e) => {
                          setFocusedQuestion(question.id);
                          handleCheckboxChange(question.id, option.value)(e);
                        }}
                        size="small"
                        disabled={question.id !== 'q2' && !responses.q2}
                        onClick={question.id !== 'q2' && !responses.q2 ? () => setRequireQ2Message(true) : undefined}
                        sx={{
                          '&.Mui-disabled': {
                            opacity: 0.6,
                          },
                        }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: question.id !== 'q2' && !responses.q2 ? '#ccc' : '#666', fontWeight: 500 }}>{option.label}</Typography>}
                    disabled={question.id !== 'q2' && !responses.q2}
                    onClick={question.id !== 'q2' && !responses.q2 ? () => setRequireQ2Message(true) : undefined}
                    sx={{
                      m: 0,
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                ))}
              </Stack>
            )}
            {question.type === 'number' && (
              <TextField
                type="number"
                inputProps={{ min: 0 }}
                value={responses[question.id]}
                onChange={(e) => {
                  setFocusedQuestion(question.id);
                  handleNumberChange(question.id)(e);
                }}
                onFocus={() => setFocusedQuestion(question.id)}
                label="Enter number"
                size="small"
                disabled={question.id !== 'q2' && !responses.q2}
                onClick={question.id !== 'q2' && !responses.q2 ? () => setRequireQ2Message(true) : undefined}
                variant="outlined"
                sx={{
                  maxWidth: '150px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#002060',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(0, 32, 96, 0.1)',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#f5f5f5',
                    },
                  },
                }}
              />
            )}
            {question.type === 'inputGroup' && (
              <Stack spacing={1.5}>
                {question.options.map((option) =>
                  option.control === 'checkbox' ? (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={Boolean(responses[question.id][option.value])}
                          onChange={(e) => {
                            setFocusedQuestion(question.id);
                            handleInputGroupCheckboxChange(question.id, option.value)(e);
                          }}
                          size="small"
                          disabled={question.id !== 'q2' && !responses.q2}
                          onClick={question.id !== 'q2' && !responses.q2 ? () => setRequireQ2Message(true) : undefined}
                          sx={{
                            '&.Mui-disabled': {
                              opacity: 0.6,
                            },
                          }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: question.id !== 'q2' && !responses.q2 ? '#ccc' : '#666', fontWeight: 500 }}>{option.label}</Typography>}
                      disabled={question.id !== 'q2' && !responses.q2}
                      onClick={question.id !== 'q2' && !responses.q2 ? () => setRequireQ2Message(true) : undefined}
                      sx={{
                        m: 0,
                        transition: 'all 0.2s ease-in-out',
                      }}
                    />
                  ) : (
                    <TextField
                      key={option.value}
                      type="number"
                      inputProps={{ min: 0 }}
                      label={option.label}
                      value={responses[question.id][option.value]}
                      onChange={(e) => {
                        setFocusedQuestion(question.id);
                        handleInputGroupChange(question.id, option.value)(e);
                      }}
                      onFocus={() => setFocusedQuestion(question.id)}
                      size="small"
                      disabled={question.id !== 'q2' && !responses.q2}
                      onClick={question.id !== 'q2' && !responses.q2 ? () => setRequireQ2Message(true) : undefined}
                      variant="outlined"
                      sx={{
                        width: '100%',
                        maxWidth: '400px',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: '#002060',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 0 0 3px rgba(0, 32, 96, 0.1)',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
                          },
                        },
                      }}
                    />
                  )
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
        {question.children && question.children.map((child) => renderQuestion(child, depth + 1))}
      </div>
    );
  };

  const totalMonthlyPrice = useMemo(() => calculateTotalMonthlyPrice(responses), [responses]);
  const serviceCatalogPricing = useSelector((state) => state.responses?.serviceCatalogPricing || 0);
  const combinedTotal = totalMonthlyPrice + serviceCatalogPricing;

  const totalOnceOffFee = useMemo(() => calculateTotalOnceOffFee(responses), [responses]);
  const serviceCatalogOnceOffFee = useSelector((state) => state.responses?.serviceCatalogOnceOffFee || 0);
  const combinedOnceOffTotal = totalOnceOffFee + serviceCatalogOnceOffFee;

  useEffect(() => {
    if (typeof totalMonthlyPrice === 'number' && !isNaN(totalMonthlyPrice)) {
      const action = setQuestionsPricing(totalMonthlyPrice);
      if (action && action.type) {
        dispatch(action);
      }
    }
  }, [totalMonthlyPrice, dispatch]);

  useEffect(() => {
    if (typeof totalOnceOffFee === 'number' && !isNaN(totalOnceOffFee)) {
      const action = setQuestionsOnceOffFee(totalOnceOffFee);
      if (action && action.type) {
        dispatch(action);
      }
    }
  }, [totalOnceOffFee, dispatch]);

  return (
    <>
      <Container sx={{ py: 3, pb: 14 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Service Calculator
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Answer a few quick questions to calculate pricing for your potential client
          </Typography>
        </Stack>
        {requireQ2Message && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: 0,
            right: 0,
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            animation: 'slideDown 0.3s ease-out',
          }}>
            <style>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            <div style={{ pointerEvents: 'auto', minWidth: 320, maxWidth: 500 }}>
              <Alert 
                severity="warning" 
                onClose={() => setRequireQ2Message(false)}
                sx={{
                  backgroundColor: '#fff3cd',
                  borderRadius: 1,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Please select an answer for question 2 before proceeding.
                </Typography>
              </Alert>
            </div>
          </div>
        )}
        <Stack spacing={2}>{questionData.filter((question) => question.id !== 'q1').map((question) => renderQuestion(question))}</Stack>
      </Container>
      
      {/* Sticky Footer Bar with Pricing */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '2px solid #e0e0e0',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
          zIndex: 1000,
        }}
      >
        <Container sx={{ py: 2 }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  Monthly:
                </Typography>
                <Typography variant="h6" sx={{ color: '#002060', fontWeight: 700, minWidth: '110px' }}>
                  ${combinedTotal.toFixed(2)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  Once Off:
                </Typography>
                <Typography variant="h6" sx={{ color: '#002060', fontWeight: 700, minWidth: '110px' }}>
                  ${combinedOnceOffTotal.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/services')}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 32, 96, 0.4)',
                  },
                }}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>
    </>
  );
}
