import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
  Chip,
} from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { setResponses as setResponsesAction, setQuestionsPricing, setQuestionsOnceOffFee } from '../features/questions/responsesSlice';
import { setOrganisation } from '../features/auth/authSlice';
import { updatePrice } from '../services/priceApi';
import { bookkeepingQuestionData } from '../constants/bookkeepingQuestions';
import { calculateBookkeepingMonthlyPrice, calculateBookkeepingOnceOffFee } from '../utils/bookkeepingPricingCalculator';

// Default bookkeeping pricing modifier (base hourly rate: $100/hr)
const DEFAULT_BOOKKEEPING_PRICING_MODIFIER = 100;

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
  const flat = flattenQuestions(bookkeepingQuestionData);
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

    if (question.type === 'number' || question.type === 'text') {
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

const loadResponsesFromStorage = () => {
  try {
    const stored = localStorage.getItem('bookkeeping_responses');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading from storage:', error);
    return {};
  }
};

export default function BookkeepingQuestions() {
  const navigate = useNavigate();
  const storeResponses = useSelector((state) => state.responses);
  const activePriceId = useSelector((state) => state.responses?.activePriceId);
  const clientName = useSelector((state) => state.responses?.clientName || '');
  const initialState = useMemo(() => {
    const built = buildInitialState();
    // First try to load from localStorage
    const storedResponses = loadResponsesFromStorage();
    if (Object.keys(storedResponses).length) {
      return { ...built, ...storedResponses };
    }
    // Then try to load from Redux
    if (storeResponses && Object.keys(storeResponses).length) {
      const merged = { ...built, ...storeResponses };
      return merged;
    }
    return built;
  }, [storeResponses]);
  const [responses, setResponses] = useState(initialState);
  const [requireQ1Message, setRequireQ1Message] = useState(false);
  
  // Get bookkeeping pricing modifier from organisation
  const organisation = useSelector((state) => state.auth.organisation);
  const bookkeepingPricingModifier = organisation?.bookkeepingPricingModifier ?? DEFAULT_BOOKKEEPING_PRICING_MODIFIER;
  
  // Debug: Log when bookkeepingPricingModifier changes
  useEffect(() => {
    console.log('🔍 BookkeepingQuestions.js - bookkeepingPricingModifier changed:', bookkeepingPricingModifier, 'organisation:', organisation);
  }, [bookkeepingPricingModifier, organisation]);
  
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
      const totalMonthly = calculateBookkeepingMonthlyPrice(currentResponses, bookkeepingPricingModifier);
      const totalOnceOff = calculateBookkeepingOnceOffFee(currentResponses, bookkeepingPricingModifier);
      // Extract revenue segment from Q1 (annual revenue question)
      const revenueSegment = currentResponses?.q1 || undefined;
      console.log('💾 Bookkeeping auto-save - Q1:', currentResponses?.q1, 'revenueSegment:', revenueSegment);
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
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [activePriceId, bookkeepingPricingModifier]);

  // Debounced auto-save when responses change
  useEffect(() => {
    if (!activePriceId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSave(responses), 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [responses, activePriceId, autoSave]);

  const dispatch = useDispatch();
  
  // Fetch organisation data to ensure bookkeepingPricingModifier is available
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
          console.log('📊 BookkeepingQuestions.js - Fetched organisation:', { bookkeepingPricingModifier: data.bookkeepingPricingModifier });
          dispatch(setOrganisation({
            organisation: data,
            isOwner: data.isOwner || false,
          }));
        }
      } catch (error) {
        console.error('Error fetching organisation:', error);
      }
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

  const handleRadioChange = (questionId) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({ ...prev, [questionId]: event.target.value }));
  };

  const handleNumberChange = (questionId) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({ ...prev, [questionId]: event.target.value }));
  };

  const handleTextChange = (questionId) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({ ...prev, [questionId]: event.target.value }));
  };

  const handleCheckboxChange = (questionId, optionValue) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [optionValue]: event.target.checked },
    }));
  };

  const handleInputGroupChange = (questionId, optionValue) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [optionValue]: event.target.value },
    }));
  };

  const handleInputGroupCheckboxChange = (questionId, optionValue) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [optionValue]: event.target.checked },
    }));
  };

  const renderQuestion = (question, depth = 0) => {
    if (question.showWhen && !question.showWhen(responses)) {
      return null;
    }

    return (
      <div key={question.id} style={{ marginLeft: depth > 0 ? `${depth * 32}px` : 0, marginTop: depth > 0 ? '8px' : '20px' }}>
        <Paper
          elevation={0}
          onFocus={() => setFocusedQuestion(question.id)}
          onBlur={() => setFocusedQuestion(null)}
          sx={{
            p: 2,
            borderRadius: '12px',
            position: 'relative',
            zIndex: depth > 0 ? 1 : 0,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            boxShadow: focusedQuestion === question.id ? (theme) => `inset 0 0 0 2px ${theme.palette.primary.main}` : 'none',
            '&:hover': {
              backgroundColor: '#ffffff',
              boxShadow: focusedQuestion === question.id ? (theme) => `inset 0 0 0 2px ${theme.palette.primary.main}` : '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
            },
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>{question.prompt}</Typography>
            
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
                  if (option.showWhen && !option.showWhen(responses)) {
                    return null;
                  }
                  return (
                    <ToggleButton 
                      key={option.value} 
                      value={option.value}
                      sx={{
                        minWidth: '120px',
                        flex: '0 1 120px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
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

            {question.type === 'checkbox' && (
              <Stack spacing={1}>
                {question.options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={responses[question.id]?.[option.value] || false}
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

            {question.type === 'mixed' && (
              <ToggleButtonGroup
                value={responses[question.id]?.basOption || ''}
                exclusive
                size="medium"
                sx={{
                  flexWrap: 'wrap',
                  gap: 1,
                  display: 'flex',
                }}
                disabled={question.id !== 'q1' && !responses.q1}
                onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
              >
                {/* BAS Options - mutually exclusive */}
                {question.basOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    onChange={() => {
                      setFocusedQuestion(question.id);
                      setResponses((prev) => ({
                        ...prev,
                        [question.id]: {
                          ...prev[question.id],
                          basOption: option.value,
                          basQuarterly: option.value === 'basQuarterly',
                          basMonthly: option.value === 'basMonthly',
                        },
                      }));
                    }}
                    sx={{
                      minWidth: '120px',
                      flex: '0 1 120px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      py: 1.2,
                      px: 1.5,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      color: '#555',
                      '&.Mui-selected': {
                        backgroundColor: (theme) => theme.palette.primary.main,
                        color: '#fff',
                        borderColor: (theme) => theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.primary.dark,
                        },
                      },
                      '&:hover': {
                        borderColor: '#999',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.6,
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>{option.label}</Typography>
                  </ToggleButton>
                ))}

                {/* IAS Option - independent toggle */}
                {question.independentOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    selected={responses[question.id]?.iasMonthly || false}
                    onChange={() => {
                      setFocusedQuestion(question.id);
                      setResponses((prev) => ({
                        ...prev,
                        [question.id]: {
                          ...prev[question.id],
                          iasMonthly: !prev[question.id]?.iasMonthly,
                        },
                      }));
                    }}
                    sx={{
                      minWidth: '120px',
                      flex: '0 1 120px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      py: 1.2,
                      px: 1.5,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      color: '#555',
                      '&.Mui-selected': {
                        backgroundColor: (theme) => theme.palette.primary.main,
                        color: '#fff',
                        borderColor: (theme) => theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.primary.dark,
                        },
                      },
                      '&:hover': {
                        borderColor: '#999',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.6,
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>{option.label}</Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
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
                  label="Enter number"
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

            {question.type === 'text' && (
              <div 
                onClick={question.id !== 'q1' && !responses.q1 ? () => setRequireQ1Message(true) : undefined}
                style={{ display: 'inline-block' }}
              >
                <TextField
                  type="text"
                  value={responses[question.id] || ''}
                  onChange={(e) => {
                    setFocusedQuestion(question.id);
                    handleTextChange(question.id)(e);
                  }}
                  onFocus={() => setFocusedQuestion(question.id)}
                  label="Enter details"
                  size="small"
                  disabled={question.id !== 'q1' && !responses.q1}
                  variant="outlined"
                  sx={{
                    maxWidth: '400px',
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
            )}

            {question.type === 'inputGroup' && (
              <Stack spacing={1.5}>
                {question.options.map((option) =>
                  option.control === 'checkbox' ? (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={Boolean(responses[question.id]?.[option.value])}
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
                        value={responses[question.id]?.[option.value] || ''}
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
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
        {question.children && question.children.map((child) => renderQuestion(child, depth + 1))}
      </div>
    );
  };

  // Calculate monthly price using bookkeeping pricing calculator
  const totalMonthlyPrice = useMemo(() => {
    return calculateBookkeepingMonthlyPrice(responses, bookkeepingPricingModifier);
  }, [responses, bookkeepingPricingModifier]);

  const serviceCatalogPricing = useSelector((state) => state.responses?.serviceCatalogPricing || 0);
  const combinedTotal = totalMonthlyPrice + serviceCatalogPricing;

  const totalOnceOffFee = useMemo(() => {
    return calculateBookkeepingOnceOffFee(responses, bookkeepingPricingModifier);
  }, [responses, bookkeepingPricingModifier]);

  const serviceCatalogOnceOffFee = useSelector((state) => state.responses?.serviceCatalogOnceOffFee || 0);
  const combinedOnceOffTotal = totalOnceOffFee + serviceCatalogOnceOffFee;

  useEffect(() => {
    if (typeof totalMonthlyPrice === 'number' && !isNaN(totalMonthlyPrice)) {
      dispatch(setQuestionsPricing(totalMonthlyPrice));
    }
  }, [totalMonthlyPrice, dispatch]);
  
  // Re-dispatch pricing when bookkeepingPricingModifier changes
  useEffect(() => {
    console.log('💰 Bookkeeping pricing modifier changed, recalculating prices with modifier:', bookkeepingPricingModifier);
    const recalculatedMonthly = calculateBookkeepingMonthlyPrice(responses, bookkeepingPricingModifier);
    const recalculatedOnceOff = calculateBookkeepingOnceOffFee(responses, bookkeepingPricingModifier);
    console.log('💰 Recalculated bookkeeping prices:', { monthly: recalculatedMonthly, onceOff: recalculatedOnceOff, modifier: bookkeepingPricingModifier });
    dispatch(setQuestionsPricing(recalculatedMonthly));
    dispatch(setQuestionsOnceOffFee(recalculatedOnceOff));
  }, [bookkeepingPricingModifier, responses, dispatch]);

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
            Bookkeeping Pricing Calculator
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Answer a few quick questions to calculate bookkeeping pricing for your potential client
          </Typography>
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
                  Please select an answer for question 2 before proceeding.
                </Typography>
              </Alert>
            </div>
          </div>
        )}
        <Stack spacing={2}>{bookkeepingQuestionData.map((question) => renderQuestion(question))}</Stack>
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
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
                Monthly: <span style={{ fontWeight: 700, color: '#002060' }}>${combinedTotal.toFixed(2)}</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
                Once Off: <span style={{ fontWeight: 700, color: '#002060' }}>${combinedOnceOffTotal.toFixed(2)}</span>
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: '#666', fontWeight: 500, minWidth: 120, textAlign: 'center', fontSize: '1.1rem' }}>
              {clientName || 'New Quote'}
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  // Final save before navigating
                  if (activePriceId) {
                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                    await autoSave(responses);
                  }
                  navigate('/pricing-quote');
                }}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 32, 96, 0.4)',
                  },
                }}
              >
                Generate Quote
              </Button>
            </Stack>
        </Container>
      </Paper>
    </>
  );
}
