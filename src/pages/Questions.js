import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  TextField,
  Checkbox,
  Button,
  IconButton,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, Navigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { setResponses as setResponsesAction, setQuestionsPricing, setQuestionsOnceOffFee } from '../features/questions/responsesSlice';
import { setOrganisation } from '../features/auth/authSlice';
import { calculateComplianceOnlyPrice, calculateTotalOnceOffFee } from '../utils/pricingCalculator';
import { calculateSilverMonthlyPricing, calculateGoldMonthlyPricing } from '../utils/calculateGoldPricing';

// Default pricing modifier (base hourly rate)
const DEFAULT_PRICING_MODIFIER = 200;
import { updatePrice } from '../services/priceApi';
import { accountingQuestionData } from '../constants/accountingQuestions';
const questionData = accountingQuestionData;

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
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Individual Returns ALL',
      },
    },
    businessReturns: {
      micro: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Micro < $250K',
      },
      small: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Small < $500K',
      },
      medium: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Medium < $1M',
      },
      large: {
        monthly: 250,
        yearly: 3000,
        inclusion: 'Large < $3M',
      },
    },
    smsf: {
      micro: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'SMSF - Micro < $250K',
      },
      small: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'SMSF - Small < $500K',
      },
      medium: {
        monthly: 333.33,
        yearly: 4000,
        inclusion: 'SMSF - Medium < $1M',
      },
      large: {
        monthly: 500,
        yearly: 6000,
        inclusion: 'SMSF - Large < $3M',
      },
    },
    fbtReturns: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'FBT - Micro < $250K',
      },
      small: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'FBT - Small < $500K',
      },
      medium: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'FBT - Medium < $1M',
      },
      large: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'FBT - Large < $3M',
      },
    },
    bas: {
      micro: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'BAS - Micro < $250K (per return)',
      },
      small: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'BAS - Small < $500K (per return)',
      },
      medium: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'BAS - Medium < $1M (per return)',
      },
      large: {
        monthly: 25,
        yearly: 300,
        inclusion: 'BAS - Large < $3M (per return)',
      },
    },
    ias: {
      micro: {
        monthly: 8.33,
        yearly: 100,
        inclusion: 'IAS - Micro < $250K (per return)',
      },
      small: {
        monthly: 8.33,
        yearly: 100,
        inclusion: 'IAS - Small < $500K (per return)',
      },
      medium: {
        monthly: 10.42,
        yearly: 125,
        inclusion: 'IAS - Medium < $1M (per return)',
      },
      large: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'IAS - Large < $3M (per return)',
      },
    },
    tpar: {
      micro: {
        monthly: 18.33,
        yearly: 220,
        inclusion: 'TPAR - Micro < $250K (per return)',
      },
      small: {
        monthly: 18.33,
        yearly: 220,
        inclusion: 'TPAR - Small < $500K (per return)',
      },
      medium: {
        monthly: 18.33,
        yearly: 220,
        inclusion: 'TPAR - Medium < $1M (per return)',
      },
      large: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'TPAR - Large < $3M (per return)',
      },
    },
  },
  corporateSecretarial: {
    asicAnnualReturn: {
      monthly: 33.33,
      yearly: 400,
      inclusion: 'ASIC Annual Return',
    },
    asicFormsLodgements: {
      monthly: 12.5,
      yearly: 150,
      inclusion: 'ASIC Forms Lodgements',
    },
  },
  atoPaymentPlans: {
    basicPlans: {
      monthly: null,
      yearly: 500,
      inclusion: 'Basic plans',
    },
    hardshipPlans: {
      monthly: null,
      yearly: 1000,
      inclusion: 'Longer term & hardship plans',
    },
  },
  payrollServices: {
    workersCompensation: {
      micro: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'Workers Comp - Micro < $250K',
      },
      small: {
        monthly: 33.33,
        yearly: 400,
        inclusion: 'Workers Comp - Small < $500K',
      },
      medium: {
        monthly: 45.83,
        yearly: 550,
        inclusion: 'Workers Comp - Medium < $1M',
      },
      large: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Workers Comp - Large < $3M',
      },
    },
    payrollProcessing: {
      salary: {
        monthly: 10,
        yearly: null,
        inclusion: 'Payroll processing per salaried employee',
      },
      timesheets: {
        monthly: 15,
        yearly: null,
        inclusion: 'Payroll processing per timesheet employee',
      },
    },
    payrollTaxReturns: {
      medium: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'Payroll Tax - Medium < $1M',
      },
      large: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Payroll Tax - Large < $3M',
      },
    },
    superPrepAndLodgement: {
      micro: {
        monthly: 8.33,
        yearly: 100,
        inclusion: 'Super Prep and Lodgement - Micro < $250K',
      },
      small: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'Super Prep and Lodgement - Small < $500K',
      },
      medium: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Super Prep and Lodgement - Medium < $1M',
      },
      large: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Super Prep and Lodgement - Large < $3M',
      },
    },
    stpReporting: {
      micro: {
        monthly: 8.33,
        yearly: 100,
        inclusion: 'STP Reporting - Micro < $250K',
      },
      small: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'STP Reporting - Small < $500K',
      },
      medium: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'STP Reporting - Medium < $1M',
      },
      large: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'STP Reporting - Large < $3M',
      },
    },
    lslReporting: {
      micro: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'LSL Construction Reporting - Micro < $250K',
      },
      small: {
        monthly: 12.5,
        yearly: 150,
        inclusion: 'LSL Construction Reporting - Small < $500K',
      },
      medium: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'LSL Construction Reporting - Medium < $1M',
      },
      large: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'LSL Construction Reporting - Large < $3M',
      },
    },
  },
  advisoryServices: {
    taxPlanningReview: {
      micro: {
        monthly: 33.33,
        yearly: 400,
        inclusion: 'Tax Planning / Review - Micro < $250K',
      },
      small: {
        monthly: 50,
        yearly: 600,
        inclusion: 'Tax Planning / Review - Small < $500K',
      },
      medium: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Tax Planning / Review - Medium < $1M',
      },
      large: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Tax Planning / Review - Large < $3M',
      },
    },
    taxStructuringAdvice: {
      micro: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Tax Structuring Advice - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Tax Structuring Advice - Small < $500K',
      },
      medium: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Tax Structuring Advice - Medium < $1M',
      },
      large: {
        monthly: 416.67,
        yearly: 5000,
        inclusion: 'Tax Structuring Advice - Large < $3M',
      },
    },
    xeroSetup: {
      micro: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Xero Setup - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Xero Setup - Small < $500K',
      },
      medium: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Xero Setup - Medium < $1M',
      },
      large: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Xero Setup - Large < $3M',
      },
    },
    xeroTraining: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Xero Training - Micro < $250K',
      },
      small: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Xero Training - Small < $500K',
      },
      medium: {
        monthly: 66.67,
        yearly: 800,
        inclusion: 'Xero Training - Medium < $1M',
      },
      large: {
        monthly: 100,
        yearly: 1200,
        inclusion: 'Xero Training - Large < $3M',
      },
    },
  },
  reporting: {
    financialStatementsTax: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Financial Statements - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Financial Statements - Small < $500K',
      },
      medium: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Financial Statements - Medium < $1M',
      },
      large: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Financial Statements - Large < $3M',
      },
    },
    statutoryFinancialStatements: {
      large: {
        monthly: 250,
        yearly: 3000,
        inclusion: 'Statutory Financial Statements - Large < $3M',
      },
    },
    managementFinancialStatements: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Management Financial Statements - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Management Financial Statements - Small < $500K',
      },
      medium: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Management Financial Statements - Medium < $1M',
      },
      large: {
        monthly: 166.67,
        yearly: 2000,
        inclusion: 'Management Financial Statements - Large < $3M',
      },
    },
  },
  meetings: {
    reviewNumbers: {
      micro: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'Review The Numbers Meetings - Micro < $250K',
      },
      small: {
        monthly: 25,
        yearly: 300,
        inclusion: 'Review The Numbers Meetings - Small < $500K',
      },
      medium: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Review The Numbers Meetings - Medium < $1M',
      },
      large: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Review The Numbers Meetings - Large < $3M',
      },
    },
    annualTaxMeetings: {
      micro: {
        monthly: 16.67,
        yearly: 200,
        inclusion: 'Annual Meetings - Micro < $250K',
      },
      small: {
        monthly: 25,
        yearly: 300,
        inclusion: 'Annual Meetings - Small < $500K',
      },
      medium: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Annual Meetings - Medium < $1M',
      },
      large: {
        monthly: 62.5,
        yearly: 750,
        inclusion: 'Annual Meetings - Large < $3M',
      },
    },
  },
  supportServices: {
    teamOrEmail: {
      micro: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Team or Email - Micro < $250K',
      },
      small: {
        monthly: 20.83,
        yearly: 250,
        inclusion: 'Team or Email - Small < $500K',
      },
      medium: {
        monthly: 33.33,
        yearly: 400,
        inclusion: 'Team or Email - Medium < $1M',
      },
      large: {
        monthly: 50,
        yearly: 600,
        inclusion: 'Team or Email - Large < $3M',
      },
    },
    clientServiceManager: {
      micro: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Client Service Manager - Micro < $250K',
      },
      small: {
        monthly: 41.67,
        yearly: 500,
        inclusion: 'Client Service Manager - Small < $500K',
      },
      medium: {
        monthly: 50,
        yearly: 600,
        inclusion: 'Client Service Manager - Medium < $1M',
      },
      large: {
        monthly: 100,
        yearly: 1200,
        inclusion: 'Client Service Manager - Large < $3M',
      },
    },
    principalOwner: {
      micro: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Principal / Owner - Micro < $250K',
      },
      small: {
        monthly: 83.33,
        yearly: 1000,
        inclusion: 'Principal / Owner - Small < $500K',
      },
      medium: {
        monthly: 125,
        yearly: 1500,
        inclusion: 'Principal / Owner - Medium < $1M',
      },
      large: {
        monthly: 208.33,
        yearly: 2500,
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

  // Handle new q7 structure (object with bas and ias properties)
  if (typeof selection === 'object' && selection !== null) {
    const result = {};
    
    if (selection.bas === 'basQuarterly' || selection.bas === 'basMonthly') {
      result.bas = serviceValues.taxServices.bas[segment];
    }
    
    if (selection.ias === 'iasMonthly') {
      result.ias = serviceValues.taxServices.ias[segment];
    }

    return result;
  }

  // Handle old q7 structure (string values) for backward compatibility
  if (selection === 'basQuarterly' || selection === 'basMonthly') {
    return {
      bas: serviceValues.taxServices.bas[segment],
    };
  }

  if (selection === 'iasMonthly') {
    return {
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

// Helper function to get price from nested serviceValues using dot notation
const getPriceFromKey = (priceKey, segment, fixedPrice = false) => {
  if (!priceKey) return null;
  
  const parts = priceKey.split('.');
  let value = serviceValues;
  
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return null;
    }
  }
  
  // If fixedPrice is true (e.g., Individual Returns), use the value directly
  if (fixedPrice && value && value.yearly) {
    return value.yearly;
  }
  
  // Check if value is flat (no segment-based pricing, has yearly directly)
  if (value && value.yearly !== undefined) {
    return value.yearly;
  }
  
  // Otherwise get the segment-specific price
  if (value && segment && value[segment] && value[segment].yearly) {
    return value[segment].yearly;
  }
  
  return null;
};

const buildInitialState = () => {
  const flat = flattenQuestions(questionData);
  return flat.reduce((acc, question) => {
    if (question.type === 'radio') {
      acc[question.id] = '';
      return acc;
    }

    if (question.type === 'multiRadio') {
      acc[question.id] = [];
      return acc;
    }

    if (question.type === 'q7-custom') {
      acc[question.id] = { bas: '', ias: undefined, no: undefined };
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

    if (question.type === 'inputGroup' || question.type === 'extrasGroup') {
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
  const dispatch = useDispatch();
  const storeResponses = useSelector((state) => state.responses);
  const activePriceId = useSelector((state) => state.responses?.activePriceId);
  const clientName = useSelector((state) => state.responses?.clientName || '');
  
  // Get organisation for plan type check
  const organisation = useSelector((state) => state.auth.organisation);
  
  // Redirect bookkeeper users to bookkeeping questions page
  if (organisation?.planType === 'bookkeeper') {
    return <Navigate to="/bookkeeping-questions" replace />;
  }
  
  const initialState = useMemo(() => {
    const built = buildInitialState();
    if (storeResponses && Object.keys(storeResponses).length) {
      const merged = { ...built, ...storeResponses };
      // Migrate q7 from old string format to new object format if needed
      if (typeof merged.q7 === 'string') {
        merged.q7 = { bas: '', ias: undefined, no: undefined };
      }
      return merged;
    }
    return built;
  }, [storeResponses]);
  const [responses, setResponses] = useState(initialState);
  const [selectedServices, setSelectedServices] = useState({});
  const [requireQ1Message, setRequireQ1Message] = useState(false);
  
  // Get pricing modifier from organisation (already have organisation from above)
  const basePricingModifier = organisation?.pricingModifier ?? DEFAULT_PRICING_MODIFIER;
  // Apply per-quote price adjustment from slider (q30): -100% to +100%
  const priceAdjustmentPercent = Math.max(-100, Math.min(100, Number(responses.q30) || 0));
  const pricingModifier = basePricingModifier * (1 + priceAdjustmentPercent / 100);
  
  const [focusedQuestion, setFocusedQuestion] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef(null);

  // Sync local state when a new price is created or loaded (activePriceId changes)
  const prevActivePriceIdRef = useRef(activePriceId);
  useEffect(() => {
    if (prevActivePriceIdRef.current !== activePriceId) {
      setResponses(initialState);
      lastSavedRef.current = null; // Reset saved ref to allow fresh saves
      prevActivePriceIdRef.current = activePriceId;
    }
  }, [activePriceId, initialState]);

  // Auto-save debounced function
  const autoSave = useCallback(async (currentResponses) => {
    if (!activePriceId) return;
    
    // Filter out non-question keys before saving
    const nonQuestionKeys = ['questionsPricing', 'serviceCatalogPricing', 'serviceSelections', 'questionsOnceOffFee', 'serviceCatalogOnceOffFee', 'clientName', 'activePriceId'];
    const questionResponses = {};
    Object.entries(currentResponses).forEach(([key, value]) => {
      if (!nonQuestionKeys.includes(key)) {
        questionResponses[key] = value;
      }
    });

    const dataStr = JSON.stringify(questionResponses);
    if (dataStr === lastSavedRef.current) return; // No changes

    try {
      setSaveStatus('saving');
      const totalMonthly = calculateSilverMonthlyPricing(currentResponses, pricingModifier);
      const totalOnceOff = calculateTotalOnceOffFee(currentResponses, pricingModifier);
      // Extract revenue segment from Q1
      const revenueSegment = currentResponses?.q1 || undefined;
      await updatePrice(activePriceId, {
        questionResponses,
        questionsPricing: totalMonthly,
        questionsOnceOffFee: totalOnceOff,
        revenueSegment,
      });
      lastSavedRef.current = dataStr;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [activePriceId, pricingModifier]);

  // Debounced auto-save when responses change
  useEffect(() => {
    if (!activePriceId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSave(responses), 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [responses, activePriceId, autoSave]);
  
  // Fetch organisation data to ensure pricingModifier is available
  useEffect(() => {
    const fetchOrganisation = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/v1'}/organisations/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          dispatch(setOrganisation({
            organisation: data,
            isOwner: data.isOwner || false,
          }));
        }
      } catch {}
    };
    
    fetchOrganisation();
  }, [dispatch]);
  
  useEffect(() => {
    dispatch(setResponsesAction(responses));
    if (responses.q1 && requireQ1Message) {
      setRequireQ1Message(false);
    }
  }, [responses, dispatch, requireQ1Message]);

  useEffect(() => {
    if (responses.q1) {
      localStorage.setItem('selectedRevenueSegment', responses.q1);
    }
  }, [responses.q1]);

  useEffect(() => {
    // Focus question 1 on page load
    const q1Button = document.querySelector('[value="micro"]');
    if (q1Button) {
      q1Button.focus();
    }
  }, []);

  const q7StringKey = useMemo(() => JSON.stringify(responses.q7), [responses.q7]);

  useEffect(() => {
    setSelectedServices((prev) => {
      const originalSegment = responses.q1;
      const segment = segmentForServices(originalSegment);
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
      }

      if (responses.q14 === 'yes' && segment) {
        payload.workersCompCandidate = serviceValues.payrollServices.workersCompensation?.[segment];
      }

      if (
        responses.q12 &&
        responses.q12 !== 'no' &&
        (segment === 'medium' || segment === 'large')
      ) {
        payload.superPrepCandidate = serviceValues.payrollServices.payrollTaxReturns?.[segment];
      }

      if (responses.q16 === 'yes' && segment) {
        payload.tparCandidate = serviceValues.taxServices.tpar?.[segment];
      }

      if (
        responses.q17 === 'yes' &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        payload.fbtReturnCandidate = serviceValues.taxServices.fbtReturns?.[segment];
      }

      if (responses.q18 === 'yes' && segment) {
        payload.taxPlanningCandidate = serviceValues.advisoryServices.taxPlanningReview?.[segment];
      }

      if (responses.q19 === 'yes' && segment) {
        payload.taxStructuringCandidate = serviceValues.advisoryServices.taxStructuringAdvice?.[segment];
      }

      if (
        responses.q20 === 'yes' &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        payload.financialStatementsCandidate = serviceValues.reporting.financialStatementsTax?.[segment];
      }

      if (responses.q21 === 'yes' && segment) {
        payload.statutoryStatementsCandidate = serviceValues.reporting.statutoryFinancialStatements?.[segment];
      }

      if (
        (responses.q22 === 'monthly' || responses.q22 === 'quarterly') &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        payload.managementStatementsCandidate = serviceValues.reporting.managementFinancialStatements?.[segment];
      }

      if (
        (responses.q23 === 'monthly' || responses.q23 === 'quarterly') &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        payload.reviewNumbersCandidate = serviceValues.meetings.reviewNumbers?.[segment];
      }

      const supportSelection = responses.q25;
      if (supportSelection && segment) {
        if (supportSelection === 'emailTeam' || supportSelection === 'emailPhoneTeamCsm') {
          payload.supportTeamCandidate = serviceValues.supportServices.teamOrEmail?.[segment];
        }

        if (supportSelection === 'emailPhoneTeamCsm' || supportSelection === 'emailPhoneCsmOwner') {
          payload.supportCsmCandidate = serviceValues.supportServices.clientServiceManager?.[segment];
        }

        if (supportSelection === 'emailPhoneCsmOwner') {
          payload.supportOwnerCandidate = serviceValues.supportServices.principalOwner?.[segment];
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
        if (!prev.smsf || prev.smsf.inclusion !== smsfCandidate.inclusion) {
          changed = true;
        }
        next.smsf = smsfCandidate;
      } else if (prev.smsf) {
        delete next.smsf;
        changed = true;
      }

      if (fbtCandidate) {
        if (!prev.fbt || prev.fbt.inclusion !== fbtCandidate.inclusion) {
          changed = true;
        }
        next.fbt = fbtCandidate;
      } else if (prev.fbt) {
        delete next.fbt;
        changed = true;
      }

      if (basCandidate) {
        if (!prev.bas || prev.bas.inclusion !== basCandidate.inclusion) {
          changed = true;
        }
        next.bas = basCandidate;
      } else if (prev.bas) {
        delete next.bas;
        changed = true;
      }

      if (iasCandidate) {
        if (!prev.ias || prev.ias.inclusion !== iasCandidate.inclusion) {
          changed = true;
        }
        next.ias = iasCandidate;
      } else if (prev.ias) {
        delete next.ias;
        changed = true;
      }

      if (payrollTaxCandidate) {
        if (!prev.payrollTax || prev.payrollTax.inclusion !== payrollTaxCandidate.inclusion) {
          changed = true;
        }
        next.payrollTax = payrollTaxCandidate;
      } else if (prev.payrollTax) {
        delete next.payrollTax;
        changed = true;
      }

      if (workersCompCandidate) {
        if (!prev.workersComp || prev.workersComp.inclusion !== workersCompCandidate.inclusion) {
          changed = true;
        }
        next.workersComp = workersCompCandidate;
      } else if (prev.workersComp) {
        delete next.workersComp;
        changed = true;
      }

      if (superPrepCandidate) {
        if (!prev.superPrep || prev.superPrep.inclusion !== superPrepCandidate.inclusion) {
          changed = true;
        }
        next.superPrep = superPrepCandidate;
      } else if (prev.superPrep) {
        delete next.superPrep;
        changed = true;
      }

      if (tparCandidate) {
        if (!prev.tpar || prev.tpar.inclusion !== tparCandidate.inclusion) {
          changed = true;
        }
        next.tpar = tparCandidate;
      } else if (prev.tpar) {
        delete next.tpar;
        changed = true;
      }

      if (fbtReturnCandidate) {
        if (!prev.fbtReturn || prev.fbtReturn.inclusion !== fbtReturnCandidate.inclusion) {
          changed = true;
        }
        next.fbtReturn = fbtReturnCandidate;
      } else if (prev.fbtReturn) {
        delete next.fbtReturn;
        changed = true;
      }

      if (taxPlanningCandidate) {
        if (!prev.taxPlanning || prev.taxPlanning.inclusion !== taxPlanningCandidate.inclusion) {
          changed = true;
        }
        next.taxPlanning = taxPlanningCandidate;
      } else if (prev.taxPlanning) {
        delete next.taxPlanning;
        changed = true;
      }

      if (taxStructuringCandidate) {
        if (!prev.taxStructuring || prev.taxStructuring.inclusion !== taxStructuringCandidate.inclusion) {
          changed = true;
        }
        next.taxStructuring = taxStructuringCandidate;
      } else if (prev.taxStructuring) {
        delete next.taxStructuring;
        changed = true;
      }

      if (financialStatementsCandidate) {
        if (!prev.financialStatementsTax || prev.financialStatementsTax.inclusion !== financialStatementsCandidate.inclusion) {
          changed = true;
        }
        next.financialStatementsTax = financialStatementsCandidate;
      } else if (prev.financialStatementsTax) {
        delete next.financialStatementsTax;
        changed = true;
      }

      if (statutoryStatementsCandidate) {
        if (
          !prev.statutoryFinancialStatements ||
          prev.statutoryFinancialStatements.inclusion !== statutoryStatementsCandidate.inclusion
        ) {
          changed = true;
        }
        next.statutoryFinancialStatements = statutoryStatementsCandidate;
      } else if (prev.statutoryFinancialStatements) {
        delete next.statutoryFinancialStatements;
        changed = true;
      }

      if (managementStatementsCandidate) {
        if (
          !prev.managementFinancialStatements ||
          prev.managementFinancialStatements.inclusion !== managementStatementsCandidate.inclusion
        ) {
          changed = true;
        }
        next.managementFinancialStatements = managementStatementsCandidate;
      } else if (prev.managementFinancialStatements) {
        delete next.managementFinancialStatements;
        changed = true;
      }

      if (reviewNumbersCandidate) {
        if (!prev.reviewNumbers || prev.reviewNumbers.inclusion !== reviewNumbersCandidate.inclusion) {
          changed = true;
        }
        next.reviewNumbers = reviewNumbersCandidate;
      } else if (prev.reviewNumbers) {
        delete next.reviewNumbers;
        changed = true;
      }

      if (supportTeamCandidate) {
        if (!prev.teamSupport || prev.teamSupport.inclusion !== supportTeamCandidate.inclusion) {
          changed = true;
        }
        next.teamSupport = supportTeamCandidate;
      } else if (prev.teamSupport) {
        delete next.teamSupport;
        changed = true;
      }

      if (supportCsmCandidate) {
        if (!prev.clientServiceManager || prev.clientServiceManager.inclusion !== supportCsmCandidate.inclusion) {
          changed = true;
        }
        next.clientServiceManager = supportCsmCandidate;
      } else if (prev.clientServiceManager) {
        delete next.clientServiceManager;
        changed = true;
      }

      if (supportOwnerCandidate) {
        if (!prev.principalOwner || prev.principalOwner.inclusion !== supportOwnerCandidate.inclusion) {
          changed = true;
        }
        next.principalOwner = supportOwnerCandidate;
      } else if (prev.principalOwner) {
        delete next.principalOwner;
        changed = true;
      }

      if (corporateSecretarialCandidate) {
        if (
          !prev.corporateSecretarial ||
          prev.corporateSecretarial.inclusion !== corporateSecretarialCandidate.inclusion
        ) {
          changed = true;
        }
        next.corporateSecretarial = corporateSecretarialCandidate;
      } else if (prev.corporateSecretarial) {
        delete next.corporateSecretarial;
        changed = true;
      }

      if (atoPaymentPlanCandidate) {
        if (!prev.atoPaymentPlan || prev.atoPaymentPlan.inclusion !== atoPaymentPlanCandidate.inclusion) {
          changed = true;
        }
        next.atoPaymentPlan = atoPaymentPlanCandidate;
      } else if (prev.atoPaymentPlan) {
        delete next.atoPaymentPlan;
        changed = true;
      }

      let annualTaxCandidate;
      if (
        responses.q24 === 'yes' &&
        (segment === 'micro' || segment === 'small' || segment === 'medium' || segment === 'large')
      ) {
        annualTaxCandidate = serviceValues.meetings.annualTaxMeetings?.[segment];
      } else {
        annualTaxCandidate = undefined;
      }

      if (annualTaxCandidate) {
        if (!prev.annualTaxMeetings || prev.annualTaxMeetings.inclusion !== annualTaxCandidate.inclusion) {
          changed = true;
        }
        next.annualTaxMeetings = annualTaxCandidate;
      } else if (prev.annualTaxMeetings) {
        delete next.annualTaxMeetings;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [
    responses.q1,
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
    q7StringKey,
  ]);

  const handleRadioChange = (questionId) => (event) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: event.target.value,
    }));
  };

  const handleCheckboxChange = (questionId, optionValue) => (event) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [optionValue]: event.target.checked,
      },
    }));
  };

  const handleNumberChange = (questionId) => (event) => {
    const value = event.target.value;
    
    setResponses((prev) => {
      const newState = {
        ...prev,
        [questionId]: value,
      };
      
      // If q2 (Individual Tax Returns) is set to 0 or empty, clear its child fields
      if (questionId === 'q2') {
        const numValue = parseInt(value, 10);
        if (!value || numValue === 0 || isNaN(numValue)) {
          newState.q2a = '';
          newState.q2b = {};
        }
      }
      
      return newState;
    });
  };

  const handleInputGroupChange = (questionId, optionValue) => (event) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [optionValue]: event.target.value,
        // Deselect "No" option if a value is entered into any input field
        ...(event.target.value && prev[questionId].none ? { none: false } : {}),
      },
    }));
  };

  const handleInputGroupCheckboxChange = (questionId, optionValue) => (event) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [optionValue]: event.target.checked,
      },
    }));
  };

  // Calculate dynamic question numbers based on which questions are visible
  const getQuestionNumberMapping = () => {
    const mapping = {};
    const parentMap = {}; // Track parent-child relationships
    
    // Track visible questions per category to assign dynamic numbers
    const categoryCounters = {};
    
    // Recursive function to track all children
    const trackChildren = (children, parentId) => {
      if (!children) return;
      children.forEach((child) => {
        parentMap[child.id] = parentId;
        if (child.children) {
          trackChildren(child.children, child.id);
        }
      });
    };
    
    // First pass: track parent-child relationships
    questionData.forEach((question) => {
      trackChildren(question.children, question.id);
    });
    
    // Second pass: calculate dynamic numbers for visible questions
    questionData.forEach((question) => {
      // Skip if question has showWhen and it returns false
      if (question.showWhen && !question.showWhen(responses)) {
        return;
      }
      
      const category = question.category;
      if (category) {
        if (!categoryCounters[category]) {
          categoryCounters[category] = 0;
        }
        categoryCounters[category]++;
        
        // Get section number from category
        const sectionNumbers = {
          'TAX SERVICES': '2',
          'PAYROLL SERVICES': '3',
          'ADVISORY SERVICES': '4',
          'REPORTING': '5',
          'MEETINGS': '6',
          'SUPPORT SERVICES': '7',
          'CORPORATE SECRETARIAL & ATO PLANS': '8',
          'DISBURSEMENTS': '9',
          'PRICE ADJUSTMENT': '10',
          'PRIOR YEAR LODGEMENTS': '11',
        };
        const sectionNum = sectionNumbers[category] || '';
        const letterIndex = categoryCounters[category] - 1;
        const letter = String.fromCharCode(97 + letterIndex); // a, b, c, d...
        mapping[question.id] = `${sectionNum}${letter}`;
      } else if (question.id === 'q1') {
        mapping[question.id] = '1';
      }
    });
    
    return { mapping, parentMap };
  };

  const { mapping: questionNumberMapping, parentMap } = useMemo(() => getQuestionNumberMapping(), [responses]);

  const renderQuestion = (question, depth = 0) => {
    if (question.showWhen && !question.showWhen(responses)) {
      return null;
    }

    // Strip the hardcoded number prefix (e.g., "2a. ", "3c. ", "1. ") and add dynamic number
    let promptText = question.prompt;
    const dynamicNumber = questionNumberMapping[question.id];
    
    // Remove existing number prefix like "2a. " or "1. "
    const numberPrefixPattern = /^\d+[a-z]?\.\s*/;
    promptText = promptText.replace(numberPrefixPattern, '');
    
    // Prepend dynamic number if available (only for top-level questions)
    if (dynamicNumber && depth === 0) {
      promptText = `${dynamicNumber}. ${promptText}`;
    }

    return (
      <div key={question.id} style={{ marginLeft: depth > 0 ? `${depth * 32}px` : 0 }}>
        <Paper
          elevation={0}
          onFocus={() => setFocusedQuestion(question.id)}
          onBlur={() => setFocusedQuestion(null)}
          sx={{
            p: 2,
            borderRadius: '4px',
            position: 'relative',
            zIndex: depth > 0 ? 1 : 0,
            backgroundColor: focusedQuestion === question.id ? 'background.default' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            boxShadow: focusedQuestion === question.id ? (theme) => `inset 0 0 0 2px ${theme.palette.primary.main}` : 'none',
            '&:hover': {
              backgroundColor: focusedQuestion === question.id ? 'background.default' : 'background.paper',
              boxShadow: focusedQuestion === question.id ? (theme) => `inset 0 0 0 2px ${theme.palette.primary.main}` : '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
            },
          }}
        >
          <Stack spacing={1.5}>
            {question.subheading && (
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#002060', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {question.subheading}
              </Typography>
            )}
            {promptText && (
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>{promptText}</Typography>
            )}
            {question.description && (
              <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: '-4px !important', mb: 0.5, fontSize: '0.95rem' }}>
                {question.description}
              </Typography>
            )}
            {question.type === 'q7-custom' && (
              <Stack spacing={2}>
                {/* Combined BAS and IAS Options in single button group */}
                <ToggleButtonGroup
                  value={[
                    ...(responses[question.id]?.bas ? [responses[question.id].bas] : []),
                    ...(responses[question.id]?.ias ? [responses[question.id].ias] : []),
                    ...(responses[question.id]?.no ? [responses[question.id].no] : []),
                  ]}
                  onChange={(event, newValue) => {
                    setFocusedQuestion(question.id);
                    
                    // Determine which button was clicked
                    const currentSelections = [
                      ...(responses[question.id]?.bas ? [responses[question.id].bas] : []),
                      ...(responses[question.id]?.ias ? [responses[question.id].ias] : []),
                      ...(responses[question.id]?.no ? [responses[question.id].no] : []),
                    ];
                    
                    const basOptions = question.basOptions
                      .filter(opt => !opt.showWhen || opt.showWhen(responses))
                      .map(opt => opt.value);
                    const iasValue = question.iasOption.value;
                    const noValue = question.noOption.value;
                    
                    let updatedBas = responses[question.id]?.bas || '';
                    let updatedIas = responses[question.id]?.ias;
                    let updatedNo = responses[question.id]?.no;
                    
                    // Check what was added (newly selected)
                    const addedValues = newValue.filter(val => !currentSelections.includes(val));
                    
                    // If "No" was just selected, clear BAS and IAS
                    if (addedValues.includes(noValue)) {
                      updatedBas = '';
                      updatedIas = undefined;
                      updatedNo = noValue;
                    } else {
                      // Check what changed
                      newValue.forEach((val) => {
                        if (basOptions.includes(val)) {
                          updatedBas = val;
                          updatedNo = undefined; // Clear "No" when BAS is selected
                        } else if (val === iasValue) {
                          updatedIas = val;
                          updatedNo = undefined; // Clear "No" when IAS is selected
                        } else if (val === noValue) {
                          updatedNo = val;
                        }
                      });
                      
                      // Check what was removed
                      currentSelections.forEach((val) => {
                        if (!newValue.includes(val)) {
                          if (basOptions.includes(val)) {
                            updatedBas = '';
                          } else if (val === iasValue) {
                            updatedIas = undefined;
                          } else if (val === noValue) {
                            updatedNo = undefined;
                          }
                        }
                      });
                    }
                    
                    const updatedValue = {
                      ...responses[question.id],
                      bas: updatedBas,
                      ias: updatedIas,
                      no: updatedNo,
                    };
                    setResponses({ ...responses, [question.id]: updatedValue });
                  }}
                  size="medium"
                  disabled={question.id !== 'q1' && !responses.q1}
                  onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                sx={{
                  flexWrap: 'wrap',
                  gap: 1,
                  display: 'flex',
                }}
              >
                {/* BAS Options */}
                  {question.basOptions.map((option) => {
                    if (option.showWhen && !option.showWhen(responses)) {
                      return null;
                    }
                    return (
                      <ToggleButton 
                        key={option.value} 
                        value={option.value}
                        disabled={question.id !== 'q1' && !responses.q1}
                        onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                        sx={{
                          minWidth: '160px',
                          flex: '0 1 160px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          minHeight: '72px',
                          py: 1.2,
                          px: 1.5,
                          fontSize: '0.9rem',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>{option.label}</Typography>
                      </ToggleButton>
                    );
                  })}
                  {/* IAS Option */}
                  <ToggleButton 
                    key={question.iasOption.value} 
                    value={question.iasOption.value}
                    disabled={question.id !== 'q1' && !responses.q1}
                    onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                    sx={{
                      minWidth: '160px',
                      flex: '0 1 160px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minHeight: '72px',
                      py: 1.2,
                      px: 1.5,
                      fontSize: '0.9rem',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>{question.iasOption.label}</Typography>
                  </ToggleButton>
                  {/* No Option */}
                  <ToggleButton 
                    key={question.noOption.value} 
                    value={question.noOption.value}
                    disabled={question.id !== 'q1' && !responses.q1}
                    onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                    sx={{
                      minWidth: '160px',
                      flex: '0 1 160px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minHeight: '72px',
                      py: 1.2,
                      px: 1.5,
                      fontSize: '0.9rem',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>{question.noOption.label}</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}
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
                }}
                disabled={question.id !== 'q1' && !responses.q1}
                onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
              >
                {question.options.map((option) => {
                  // Check if option should be shown
                  if (option.showWhen && !option.showWhen(responses)) {
                    return null;
                  }
                  return (
                  <ToggleButton 
                    key={option.value} 
                    value={option.value}
                    sx={{
                      minWidth: ['q7', 'q25', 'q26b', 'q3b', 'q11'].includes(question.id) ? '160px' : '120px',
                      flex: ['q7', 'q25', 'q26b', 'q3b', 'q11'].includes(question.id) ? '0 1 160px' : '0 1 120px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minHeight: '72px',
                      py: 1.2,
                      px: 1.5,
                      fontSize: '0.9rem',
                    }}
                    disabled={question.id !== 'q1' && !responses.q1}
                    onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>{option.label}</Typography>
                  </ToggleButton>
                );
                })}
              </ToggleButtonGroup>
            )}
            {question.type === 'multiRadio' && (
              <ToggleButtonGroup
                value={Array.isArray(responses[question.id]) ? responses[question.id] : []}
                onChange={(event, newValue) => {
                  setFocusedQuestion(question.id);
                  // Ensure newValue is always an array
                  let arrayValue = Array.isArray(newValue) ? newValue : (newValue ? [newValue] : []);
                  
                  // Handle clearOnValue behavior - if the clear value is selected, clear all others
                  if (question.clearOnValue) {
                    const prevValue = Array.isArray(responses[question.id]) ? responses[question.id] : [];
                    const clearValue = question.clearOnValue;
                    
                    // If clearValue was just added
                    if (arrayValue.includes(clearValue) && !prevValue.includes(clearValue)) {
                      arrayValue = [clearValue];
                    }
                    // If another value was added while clearValue is selected, remove clearValue
                    else if (prevValue.includes(clearValue) && arrayValue.length > 1) {
                      arrayValue = arrayValue.filter(v => v !== clearValue);
                    }
                  }
                  
                  setResponses((prev) => ({
                    ...prev,
                    [question.id]: arrayValue,
                  }));
                }}
                exclusive={false}
                size="medium"
                sx={{
                  flexWrap: 'wrap',
                  gap: 1,
                  display: 'flex',
                }}
                disabled={!responses.q1}
                onClick={!responses.q1 ? () => setRequireQ1Message(true) : undefined}
              >
                {question.options.map((option) => {
                  if (option.showWhen && !option.showWhen(responses)) {
                    return null;
                  }
                  return (
                    <ToggleButton 
                      key={option.value} 
                      value={option.value}
                      sx={{
                        minWidth: '160px',
                        flex: '0 1 160px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        minHeight: '72px',
                        py: 1.2,
                        px: 1.5,
                        fontSize: '0.9rem',
                      }}
                      disabled={!responses.q1}
                      onClick={!responses.q1 ? () => setRequireQ1Message(true) : undefined}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>{option.label}</Typography>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
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
                        disabled={question.id !== 'q1' && !responses.q1}
                        onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                        sx={{
                          '&.Mui-disabled': {
                            opacity: 0.6,
                          },
                        }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: question.id !== 'q1' && !responses.q1 ? '#ccc' : '#666', fontWeight: 500 }}>{option.label}</Typography>}
                    disabled={question.id !== 'q1' && !responses.q1}
                    onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                    sx={{
                      m: 0,
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                ))}
              </Stack>
            )}
            {question.type === 'number' && (
              <div 
                onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                style={{ display: 'inline-block' }}
              >
                <TextField
                  type="number"
                  inputProps={{ min: 0 }}
                  value={responses[question.id]}
                  onChange={(e) => {
                    setFocusedQuestion(question.id);
                    handleNumberChange(question.id)(e);
                  }}
                  onFocus={() => setFocusedQuestion(question.id)}
                  label={question.placeholder || 'Enter number'}
                  size="small"
                  disabled={question.id !== 'q1' && !responses.q1}
                  variant="outlined"
                  sx={{
                    maxWidth: '150px',
                    pointerEvents: question.id !== 'q1' && !responses.q1 ? 'none' : 'auto',
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
                        color: '#ccc',
                        opacity: 0.6,
                        borderColor: '#ececec',
                      },
                    },
                    '& .MuiOutlinedInput-input:disabled': {
                      WebkitTextFillColor: '#ccc',
                    },
                    '& .MuiInputBase-input:disabled': {
                      WebkitTextFillColor: '#ccc',
                    },
                    '& .MuiFormLabel-root.Mui-disabled': {
                      color: '#ccc',
                    },
                  }}
                />
              </div>
            )}
            {question.type === 'dynamicList' && (() => {
              const rows = Array.isArray(responses[question.id]) ? responses[question.id] : [];
              const updateRows = (newRows) => {
                setResponses({ ...responses, [question.id]: newRows });
              };
              const handleAdd = () => {
                setFocusedQuestion(question.id);
                updateRows([...rows, { description: '', price: '' }]);
              };
              const handleRemove = (index) => {
                setFocusedQuestion(question.id);
                updateRows(rows.filter((_, i) => i !== index));
              };
              const handleChange = (index, field, value) => {
                setFocusedQuestion(question.id);
                const next = rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
                updateRows(next);
              };
              const disabled = !responses.q1;
              return (
                <Stack spacing={1.5}>
                  {rows.map((row, index) => (
                    <Stack key={index} direction="row" spacing={1} alignItems="center">
                      <TextField
                        label={question.descriptionPlaceholder || 'Enter description'}
                        value={row.description || ''}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                        onFocus={() => setFocusedQuestion(question.id)}
                        size="small"
                        disabled={disabled}
                        variant="outlined"
                        sx={{ flex: 1, maxWidth: 320 }}
                      />
                      <TextField
                        type="number"
                        inputProps={{ min: 0 }}
                        label={question.pricePlaceholder || 'Enter price'}
                        value={row.price || ''}
                        onChange={(e) => handleChange(index, 'price', e.target.value)}
                        onFocus={() => setFocusedQuestion(question.id)}
                        size="small"
                        disabled={disabled}
                        variant="outlined"
                        sx={{ width: 150 }}
                      />
                      <IconButton
                        aria-label="remove"
                        size="small"
                        onClick={() => handleRemove(index)}
                        disabled={disabled}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                  <div>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAdd}
                      disabled={disabled}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {question.addButtonLabel || 'Add row'}
                    </Button>
                  </div>
                </Stack>
              );
            })()}
            {question.type === 'slider' && (() => {
              const min = typeof question.min === 'number' ? question.min : -100;
              const max = typeof question.max === 'number' ? question.max : 100;
              const step = typeof question.step === 'number' ? question.step : 1;
              const defaultValue = typeof question.defaultValue === 'number' ? question.defaultValue : 0;
              const unit = question.unit || '';
              const raw = responses[question.id];
              const value = typeof raw === 'number'
                ? raw
                : (raw === '' || raw === undefined || raw === null ? defaultValue : Number(raw));
              const disabled = question.id !== 'q1' && !responses.q1;
              return (
                <Stack spacing={1} sx={{ maxWidth: 500, pt: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="body2" sx={{ minWidth: 40, color: '#666' }}>{min}{unit}</Typography>
                    <Slider
                      value={value}
                      min={min}
                      max={max}
                      step={step}
                      marks={[
                        { value: min, label: '' },
                        { value: defaultValue, label: '' },
                        { value: max, label: '' },
                      ]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${v}${unit}`}
                      onChange={(_, newValue) => {
                        setFocusedQuestion(question.id);
                        setResponses({ ...responses, [question.id]: newValue });
                      }}
                      disabled={disabled}
                      sx={{
                        color: '#002060',
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(0, 32, 96, 0.12)',
                          },
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40, color: '#666', textAlign: 'right' }}>{max}{unit}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600, color: '#002060' }}>
                    {value > 0 ? '+' : ''}{value}{unit}
                  </Typography>
                </Stack>
              );
            })()}
            {(question.type === 'inputGroup' || question.type === 'extrasGroup') && (
              <Stack spacing={1.5}>
                {question.options.map((option) => {
                  if (option.showWhen && !option.showWhen(responses)) {
                    return null;
                  }
                  return (
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
                          disabled={question.id !== 'q1' && !responses.q1}
                          onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                          sx={{
                            '&.Mui-disabled': {
                              opacity: 0.6,
                            },
                          }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: question.id !== 'q1' && !responses.q1 ? '#ccc' : '#666', fontWeight: 500 }}>{option.label}</Typography>}
                      disabled={question.id !== 'q1' && !responses.q1}
                      onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                      sx={{
                        m: 0,
                        transition: 'all 0.2s ease-in-out',
                      }}
                    />
                  ) : option.control === 'button' ? (
                    <div 
                      key={option.value}
                      style={{ display: 'block', width: '100%', maxWidth: '400px' }}
                    >
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          setFocusedQuestion(question.id);
                          const isSelectingNo = !responses[question.id][option.value];
                          if (isSelectingNo) {
                            // If selecting "No", clear all input fields
                            const clearedInputs = {};
                            question.options.forEach((opt) => {
                              if (opt.control !== 'button' && opt.control !== 'checkbox') {
                                clearedInputs[opt.value] = '';
                              }
                            });
                            setResponses({
                              ...responses,
                              [question.id]: {
                                ...responses[question.id],
                                ...clearedInputs,
                                [option.value]: true,
                              },
                            });
                          } else {
                            // If deselecting "No", just toggle it
                            setResponses({
                              ...responses,
                              [question.id]: {
                                ...responses[question.id],
                                [option.value]: false,
                              },
                            });
                          }
                        }}
                        disabled={question.id !== 'q1' && !responses.q1}
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          border: '1px solid #d0d0d0',
                          color: responses[question.id][option.value] ? '#fff' : '#666',
                          backgroundColor: responses[question.id][option.value] ? '#002060' : 'transparent',
                          '&:hover:not(.Mui-disabled)': {
                            backgroundColor: responses[question.id][option.value] ? '#001a47' : '#f5f5f5',
                            borderColor: '#002060',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
                            color: '#ccc',
                            opacity: 0.6,
                            border: '1px solid #d0d0d0',
                          },
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {option.label}
                      </Button>
                    </div>
                  ) : (
                    <div 
                      key={option.value}
                      onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                      style={{ display: 'block', width: '100%', maxWidth: '400px' }}
                    >
                      <TextField
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
                        disabled={question.id !== 'q1' && !responses.q1}
                        variant="outlined"
                        sx={{
                          width: '100%',
                          pointerEvents: question.id !== 'q1' && !responses.q1 ? 'none' : 'auto',
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
                              color: '#ccc',
                              opacity: 0.6,
                              borderColor: '#ececec',
                            },
                          },
                          '& .MuiOutlinedInput-input:disabled': {
                            WebkitTextFillColor: '#ccc',
                          },
                          '& .MuiInputBase-input:disabled': {
                            WebkitTextFillColor: '#ccc',
                          },
                          '& .MuiFormLabel-root.Mui-disabled': {
                            color: '#ccc',
                          },
                        }}
                      />
                    </div>
                  )
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Paper>
        {question.children && question.children.map((child) => renderQuestion(child, depth + 1))}
      </div>
    );
  };

  const bronzeMonthlyPrice = useMemo(() => {
    return calculateComplianceOnlyPrice(responses, pricingModifier);
  }, [responses, pricingModifier]);

  const totalMonthlyPrice = useMemo(() => {
    return calculateSilverMonthlyPricing(responses, pricingModifier);
  }, [responses, pricingModifier]);

  const goldMonthlyPrice = useMemo(() => {
    return calculateGoldMonthlyPricing(responses, pricingModifier);
  }, [responses, pricingModifier]);
  const serviceCatalogPricing = useSelector((state) => state.responses?.serviceCatalogPricing || 0);
  const combinedTotal = totalMonthlyPrice + serviceCatalogPricing;

  const totalOnceOffFee = useMemo(() => calculateTotalOnceOffFee(responses, pricingModifier), [responses, pricingModifier]);
  const serviceCatalogOnceOffFee = useSelector((state) => state.responses?.serviceCatalogOnceOffFee || 0);
  const combinedOnceOffTotal = totalOnceOffFee + serviceCatalogOnceOffFee;

  useEffect(() => {
    if (typeof totalMonthlyPrice === 'number' && !isNaN(totalMonthlyPrice)) {
      dispatch(setQuestionsPricing(totalMonthlyPrice));
    }
  }, [totalMonthlyPrice, dispatch]);
  
  // Re-dispatch pricing when pricingModifier changes
  useEffect(() => {
    const recalculatedMonthly = calculateSilverMonthlyPricing(responses, pricingModifier);
    const recalculatedOnceOff = calculateTotalOnceOffFee(responses, pricingModifier);
    dispatch(setQuestionsPricing(recalculatedMonthly));
    dispatch(setQuestionsOnceOffFee(recalculatedOnceOff));
  }, [pricingModifier, responses, dispatch]);

  useEffect(() => {
    if (typeof totalOnceOffFee === 'number' && !isNaN(totalOnceOffFee)) {
      dispatch(setQuestionsOnceOffFee(totalOnceOffFee));
    }
  }, [totalOnceOffFee, dispatch]);

  return (
    <>
      <Container sx={{ py: 3, pb: 14 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Accounting Pricing Calculator
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Answer a few quick questions to calculate accounting pricing for your potential client
          </Typography>

          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: { xs: 2, sm: 2.5 },
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 32, 96, 0.03)',
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <TuneIcon sx={{ color: '#002060', fontSize: 20, mt: '2px' }} />
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.55 }}>
                  Pricing combines the industry benchmark <strong>Average Hourly Rate</strong> with set fees per service. Change the Average Hourly Rate — every price recalculates instantly.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <BusinessCenterOutlinedIcon sx={{ color: '#002060', fontSize: 20, mt: '2px' }} />
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.55 }}>
                  Built for general practice, using benchmark rates across all firm types.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <ReceiptLongIcon sx={{ color: '#002060', fontSize: 20, mt: '2px' }} />
                <Typography variant="body2" sx={{ color: '#002060', fontWeight: 600 }}>
                  All pricing is GST exclusive
                </Typography>
              </Stack>
              <Divider sx={{ borderColor: 'rgba(0, 32, 96, 0.1)' }} />
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <InfoOutlinedIcon sx={{ color: '#999', fontSize: 18, mt: '2px' }} />
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem', lineHeight: 1.5 }}>
                  <strong>Disclaimer:</strong> The prices generated by this calculator are indicative only and intended as a guide. Actual fees should be tailored to the scope, complexity, and risk profile of each engagement, as well as your firm's cost base, positioning, and client mix. TwentySix Group accepts no liability for pricing decisions made solely on the output of this tool.
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
        {requireQ1Message && (
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
                onClose={() => setRequireQ1Message(false)}
                sx={{
                  backgroundColor: '#fff3cd',
                  borderRadius: 1,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Please select an answer for question 1 before proceeding.
                </Typography>
              </Alert>
            </div>
          </div>
        )}
        <Stack spacing={2}>{(() => {
          // Map category to section numbers (based on CSV structure)
          const categoryToSection = {
            'CLIENT DETAILS': { number: 'Q1', title: 'Client Details' },
            'TAX SERVICES': { number: 'Q2', title: 'Tax Services' },
            'PAYROLL SERVICES': { number: 'Q3', title: 'Payroll Services' },
            'ADVISORY SERVICES': { number: 'Q4', title: 'Advisory Services' },
            'REPORTING': { number: 'Q5', title: 'Reporting' },
            'MEETINGS': { number: 'Q6', title: 'Meetings' },
            'SUPPORT SERVICES': { number: 'Q7', title: 'Support Services' },
            'CORPORATE SECRETARIAL & ATO PLANS': { number: 'Q8', title: 'Corporate Secretarial & ATO Plans' },
            'DISBURSEMENTS': { number: 'Q9', title: 'Disbursements' },
            'PRICE ADJUSTMENT': { number: 'Q10', title: 'Price Adjustment' },
            'PRIOR YEAR LODGEMENTS': { number: 'Q11', title: 'Prior Year Lodgements' },
          };
          
          let lastCategory = null;
          const elements = [];
          
          questionData.forEach((question, index) => {
            // Check if we need to add a category header
            const isNewCategory = question.category && question.category !== lastCategory;
            const section = isNewCategory ? categoryToSection[question.category] : null;
            
            if (isNewCategory) {
              lastCategory = question.category;
            }
            
            // Render the question
            const rendered = renderQuestion(question);
            if (rendered) {
              if (section) {
                // Wrap category header and first question together to avoid Stack spacing
                elements.push(
                  <div key={`category-wrapper-${question.category}`} style={{ marginTop: index > 0 ? '24px' : 0, paddingTop: index > 0 ? '16px' : 0, borderTop: index > 0 ? '1px solid #e0e0e0' : 'none' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#002060',
                        fontSize: '1.1rem',
                        mb: 1,
                        mt: 0,
                        px: 2,
                        py: 1,
                      }}
                    >
                      {section.number} {section.title}
                    </Typography>
                    {rendered}
                  </div>
                );
              } else {
                elements.push(rendered);
              }
            }
          });
          
          return elements;
        })()}</Stack>
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
            direction="row" 
            spacing={3}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="body1" sx={{ color: '#666', fontWeight: 500, fontSize: '1.1rem' }}>
              {clientName || 'New Quote'}
            </Typography>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Bronze: <span style={{ fontWeight: 700, color: '#cd7f32' }}>${bronzeMonthlyPrice.toFixed(2)}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Silver: <span style={{ fontWeight: 700, color: '#757575' }}>${totalMonthlyPrice.toFixed(2)}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Gold: <span style={{ fontWeight: 700, color: '#d4af37' }}>${goldMonthlyPrice.toFixed(2)}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Once Off: <span style={{ fontWeight: 700, color: '#002060' }}>${combinedOnceOffTotal.toFixed(2)}</span>
              </Typography>
            </Stack>
            <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  // Final save before navigating
                  if (activePriceId) {
                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                    await autoSave(responses);
                  }
                  navigate('/accounting-quote');
                }}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 32, 96, 0.4)',
                  },
                }}
              >
                Show Packages
              </Button>
            </Stack>
        </Container>
      </Paper>
    </>
  );
}
