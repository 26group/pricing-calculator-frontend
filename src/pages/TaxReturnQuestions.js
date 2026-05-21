import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import {
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
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
import { taxReturnQuestionData } from '../constants/taxReturnQuestions';
import {
  calculateTaxReturnBronzePrice,
  calculateTaxReturnSilverPrice,
  calculateTaxReturnGoldPrice,
  calculateTaxReturnOnceOffFee,
  calculateTaxReturnUpfrontAnnualFee,
} from '../utils/taxReturnPricingCalculator';

const DEFAULT_PRICING_MODIFIER = 200;

const flattenQuestions = (questions) => {
  const collected = [];
  const traverse = (items) => {
    items.forEach((question) => {
      collected.push(question);
      if (question.children) traverse(question.children);
    });
  };
  traverse(questions);
  return collected;
};

const buildInitialState = () => {
  const flat = flattenQuestions(taxReturnQuestionData);
  return flat.reduce((acc, question) => {
    if (question.type === 'radio') {
      acc[question.id] = '';
      if (question.hasCountInput) {
        acc[`${question.id}_count`] = '';
      }
    } else if (question.type === 'number' || question.type === 'text') {
      acc[question.id] = '';
      if (question.summary) {
        acc[`${question.id}_summary`] = 'byClient';
      }
    } else if (question.type === 'inputGroup') {
      acc[question.id] = question.options.reduce((g, opt) => {
        g[opt.value] = '';
        return g;
      }, {});
      question.options.forEach((opt) => {
        if (opt.summary) {
          acc[`${question.id}_${opt.value}_summary`] = 'byClient';
        }
      });
    } else if (question.type === 'group') {
      // group is a layout-only container; nothing to initialize at this level
    } else {
      acc[question.id] = '';
    }
    return acc;
  }, {});
};

const loadResponsesFromStorage = () => {
  try {
    const stored = localStorage.getItem('tax_return_responses');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export default function TaxReturnQuestions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storeResponses = useSelector((state) => state.responses);
  const activePriceId = useSelector((state) => state.responses?.activePriceId);
  const clientName = useSelector((state) => state.responses?.clientName || '');
  const organisation = useSelector((state) => state.auth.organisation);
  const pricingModifier = organisation?.pricingModifier ?? DEFAULT_PRICING_MODIFIER;

  const initialState = useMemo(() => {
    const built = buildInitialState();
    // Restore from localStorage (or Redux) so values persist across navigation,
    // both for new quotes in-progress and when editing an existing saved price.
    const storedResponses = loadResponsesFromStorage();
    if (Object.keys(storedResponses).length) return { ...built, ...storedResponses };
    if (activePriceId && storeResponses && Object.keys(storeResponses).length) {
      return { ...built, ...storeResponses };
    }
    return built;
  }, [storeResponses]);

  const [responses, setResponses] = useState(initialState);
  const [focusedQuestion, setFocusedQuestion] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef(null);

  // Sync local state when activePriceId changes
  const prevActivePriceIdRef = useRef(activePriceId);
  useEffect(() => {
    if (prevActivePriceIdRef.current !== activePriceId) {
      if (!activePriceId) {
        // New proposal — wipe any leftover localStorage so old values don't leak in
        localStorage.removeItem('tax_return_responses');
      }
      setResponses(initialState);
      lastSavedRef.current = null;
      prevActivePriceIdRef.current = activePriceId;
    }
  }, [activePriceId, initialState]);

  // Persist to localStorage on every change
  useEffect(() => {
    const nonQuestionKeys = ['questionsPricing', 'serviceCatalogPricing', 'serviceSelections', 'questionsOnceOffFee', 'serviceCatalogOnceOffFee', 'clientName', 'activePriceId'];
    const questionResponses = {};
    Object.entries(responses).forEach(([key, value]) => {
      if (!nonQuestionKeys.includes(key)) questionResponses[key] = value;
    });
    localStorage.setItem('tax_return_responses', JSON.stringify(questionResponses));
  }, [responses]);

  const autoSave = useCallback(async (currentResponses) => {
    if (!activePriceId) return;
    const nonQuestionKeys = ['questionsPricing', 'serviceCatalogPricing', 'serviceSelections', 'questionsOnceOffFee', 'serviceCatalogOnceOffFee', 'clientName', 'activePriceId'];
    const questionResponses = {};
    Object.entries(currentResponses).forEach(([key, value]) => {
      if (!nonQuestionKeys.includes(key)) questionResponses[key] = value;
    });
    const dataStr = JSON.stringify(questionResponses);
    if (dataStr === lastSavedRef.current) return;
    try {
      setSaveStatus('saving');
      const totalMonthly = calculateTaxReturnSilverPrice(currentResponses, pricingModifier);
      const totalOnceOff = calculateTaxReturnOnceOffFee(currentResponses, pricingModifier);
      await updatePrice(activePriceId, {
        questionResponses,
        questionsPricing: totalMonthly,
        questionsOnceOffFee: totalOnceOff,
      });
      lastSavedRef.current = dataStr;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [activePriceId, pricingModifier]);

  useEffect(() => {
    if (!activePriceId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSave(responses), 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [responses, activePriceId, autoSave]);

  // Fetch organisation to ensure pricingModifier is available
  useEffect(() => {
    const fetchOrganisation = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/v1'}/organisations/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          dispatch(setOrganisation({ organisation: data, isOwner: data.isOwner || false }));
        }
      } catch {}
    };
    fetchOrganisation();
  }, [dispatch]);

  useEffect(() => {
    dispatch(setResponsesAction(responses));
  }, [responses, dispatch]);

  // Recalculate and dispatch pricing on change
  useEffect(() => {
    const monthly = calculateTaxReturnSilverPrice(responses, pricingModifier);
    const onceOff = calculateTaxReturnOnceOffFee(responses, pricingModifier);
    dispatch(setQuestionsPricing(monthly));
    dispatch(setQuestionsOnceOffFee(onceOff));
  }, [responses, pricingModifier, dispatch]);

  const handleRadioChange = (questionId) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({ ...prev, [questionId]: event.target.value }));
  };

  const handleNumberChange = (questionId) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({ ...prev, [questionId]: event.target.value }));
  };

  const handleInputGroupChange = (questionId, optionValue) => (event) => {
    setFocusedQuestion(questionId);
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [optionValue]: event.target.value },
    }));
  };

  const handleSummaryChange = (summaryKey) => (_event, newValue) => {
    if (!newValue) return;
    setResponses((prev) => ({ ...prev, [summaryKey]: newValue }));
  };

  const renderSummaryToggle = (summaryKey) => {
    const value = responses[summaryKey] || 'byClient';
    return (
      <ToggleButtonGroup
        value={value}
        exclusive
        size="small"
        onChange={handleSummaryChange(summaryKey)}
        sx={{
          flexShrink: 0,
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            fontSize: '0.75rem',
            px: 1.25,
            py: 0.5,
            whiteSpace: 'nowrap',
            color: '#666',
            borderColor: '#d0d0d0',
            '&.Mui-selected': {
              backgroundColor: '#002060',
              color: '#fff',
              '&:hover': { backgroundColor: '#001a47' },
            },
          },
        }}
      >
        <ToggleButton value="byClient">Summary by Client</ToggleButton>
        <ToggleButton value="byFirm">Firm to prepare</ToggleButton>
      </ToggleButtonGroup>
    );
  };

  const renderQuestion = (question, depth = 0, questionNumber = null) => {
    if (question.showWhen && !question.showWhen(responses)) return null;

    const displayPrompt = questionNumber !== null
      ? `${questionNumber}. ${question.prompt}`
      : question.prompt;

    // 'group' type: renders a single card with a header and inline child inputs,
    // each carrying its own optional summary (byClient / byFirm) toggle.
    if (question.type === 'group') {
      return (
        <div key={question.id} style={{ marginLeft: depth > 0 ? `${depth * 32}px` : 0, marginTop: depth > 0 ? '8px' : '20px' }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
              },
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                {displayPrompt}
              </Typography>
              {question.children && question.children.map((child) => {
                if (child.showWhen && !child.showWhen(responses)) return null;

                if (child.type === 'number') {
                  return (
                    <Stack
                      key={child.id}
                      direction={{ xs: 'column', sm: child.summary ? 'row' : 'column' }}
                      spacing={1}
                      alignItems={{ xs: 'stretch', sm: child.summary ? 'center' : 'stretch' }}
                      sx={{ maxWidth: child.summary ? '720px' : '600px' }}
                    >
                      <TextField
                        type="number"
                        inputProps={{ min: 0 }}
                        label={child.prompt}
                        value={responses[child.id] || ''}
                        onChange={(e) => handleNumberChange(child.id)(e)}
                        onFocus={() => setFocusedQuestion(question.id)}
                        size="small"
                        variant="outlined"
                        sx={{
                          width: '100%',
                          flex: child.summary ? 1 : undefined,
                          minWidth: child.summary ? 140 : undefined,
                          '& .MuiOutlinedInput-root': { backgroundColor: '#ffffff' },
                        }}
                      />
                      {child.summary && renderSummaryToggle(`${child.id}_summary`)}
                    </Stack>
                  );
                }

                if (child.type === 'inputGroup') {
                  return (
                    <Stack key={child.id} spacing={1.5}>
                      {child.prompt && (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                          {child.prompt}
                        </Typography>
                      )}
                      {child.options.map((option) => (
                        <Stack
                          key={option.value}
                          direction={{ xs: 'column', sm: option.summary ? 'row' : 'column' }}
                          spacing={1}
                          alignItems={{ xs: 'stretch', sm: option.summary ? 'center' : 'stretch' }}
                          sx={{ width: '100%', maxWidth: option.summary ? '720px' : '400px' }}
                        >
                          <TextField
                            type="number"
                            inputProps={{ min: 0 }}
                            label={option.label}
                            value={responses[child.id]?.[option.value] || ''}
                            onChange={(e) => {
                              setFocusedQuestion(question.id);
                              handleInputGroupChange(child.id, option.value)(e);
                            }}
                            onFocus={() => setFocusedQuestion(question.id)}
                            size="small"
                            variant="outlined"
                            sx={{
                              width: '100%',
                              flex: option.summary ? 1 : undefined,
                              minWidth: option.summary ? 140 : undefined,
                              '& .MuiOutlinedInput-root': { backgroundColor: '#ffffff' },
                            }}
                          />
                          {option.summary && renderSummaryToggle(`${child.id}_${option.value}_summary`)}
                        </Stack>
                      ))}
                    </Stack>
                  );
                }

                return null;
              })}
            </Stack>
          </Paper>
        </div>
      );
    }

    if (question.type === 'info') {
      return (
        <div key={question.id} style={{ marginLeft: depth > 0 ? `${depth * 32}px` : 0, marginTop: depth > 0 ? '8px' : '20px' }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
              },
            }}
          >
            <Stack spacing={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                {displayPrompt}
              </Typography>
              {question.children && question.children.map((child) => (
                <div key={child.id} style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {child.prompt}
                    </Typography>
                    {child.type === 'radio' && (
                      <>
                        <ToggleButtonGroup
                          value={responses[child.id]}
                          exclusive
                          onChange={(event, newValue) => {
                            if (newValue !== null) {
                              handleRadioChange(child.id)({ target: { value: newValue } });
                              if (newValue === 'none') {
                                setResponses((prev) => ({ ...prev, [`${child.id}_count`]: '' }));
                              }
                            }
                          }}
                          size="small"
                          sx={{ flexWrap: 'wrap', gap: 0.5, display: 'flex' }}
                        >
                          {child.options.map((option) => (
                            <ToggleButton
                              key={option.value}
                              value={option.value}
                              sx={{
                                minWidth: '110px',
                                flex: '0 1 110px',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                minHeight: '48px',
                                py: 0.8,
                                px: 1,
                                fontSize: '0.8rem',
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit', fontSize: '0.8rem' }}>{option.label}</Typography>
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                        {child.hasCountInput && responses[child.id] && responses[child.id] !== 'none' && (
                          <div style={{ display: 'inline-block' }}>
                            <TextField
                              type="number"
                              inputProps={{ min: 0 }}
                              value={responses[`${child.id}_count`] || ''}
                              onChange={(e) => handleNumberChange(`${child.id}_count`)(e)}
                              onFocus={() => setFocusedQuestion(question.id)}
                              label={child.countLabel || 'Enter number'}
                              size="small"
                              variant="outlined"
                              sx={{
                                maxWidth: '220px',
                                width: '100%',
                                '& .MuiOutlinedInput-root': { backgroundColor: '#ffffff' },
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </Stack>
                </div>
              ))}
            </Stack>
          </Paper>
        </div>
      );
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
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            boxShadow: focusedQuestion === question.id
              ? (theme) => `inset 0 0 0 2px ${theme.palette.primary.main}`
              : 'none',
            '&:hover': {
              backgroundColor: '#ffffff',
              boxShadow: focusedQuestion === question.id
                ? (theme) => `inset 0 0 0 2px ${theme.palette.primary.main}`
                : '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
            },
          }}
        >
          <Stack spacing={1.5}>
            {(question.type !== 'number' || question.countLabel) && (
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                {displayPrompt}
              </Typography>
            )}
            {question.description && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontSize: '0.875rem',
                  mt: '0px !important',
                }}
              >
                {question.description}
              </Typography>
            )}

            {question.type === 'radio' && (
              <>
                <ToggleButtonGroup
                  value={responses[question.id]}
                  exclusive
                  onChange={(event, newValue) => {
                    if (newValue !== null) {
                      handleRadioChange(question.id)({ target: { value: newValue } });
                      if (newValue === 'none') {
                        setResponses((prev) => ({ ...prev, [`${question.id}_count`]: '' }));
                      }
                    }
                  }}
                  size="medium"
                  sx={{ flexWrap: 'wrap', gap: 1, display: 'flex' }}
                >
                  {question.options.map((option) => (
                    <ToggleButton
                      key={option.value}
                      value={option.value}
                      sx={{
                        minWidth: '120px',
                        flex: '0 1 120px',
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
                  ))}
                </ToggleButtonGroup>
                {question.hasCountInput && responses[question.id] && responses[question.id] !== 'none' && (
                  <div style={{ display: 'inline-block', marginTop: '8px' }}>
                    <TextField
                      type="number"
                      inputProps={{ min: 0 }}
                      value={responses[`${question.id}_count`] || ''}
                      onChange={(e) => handleNumberChange(`${question.id}_count`)(e)}
                      onFocus={() => setFocusedQuestion(question.id)}
                      label={question.countLabel || 'Enter number'}
                      size="small"
                      variant="outlined"
                      sx={{
                        maxWidth: '220px',
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease-in-out',
                        },
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {question.type === 'number' && (
              <Stack
                direction={{ xs: 'column', sm: question.summary ? 'row' : 'column' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: question.summary ? 'center' : 'stretch' }}
                sx={{ marginTop: question.description ? '24px' : undefined, maxWidth: question.summary ? '820px' : '600px' }}
              >
                <TextField
                  type="number"
                  inputProps={{ min: 0 }}
                  label={question.countLabel || question.prompt}
                  value={responses[question.id] || ''}
                  onChange={(e) => handleNumberChange(question.id)(e)}
                  onFocus={() => setFocusedQuestion(question.id)}
                  size="small"
                  variant="outlined"
                  sx={{
                    width: question.summary ? '100%' : '80%',
                    flex: question.summary ? 1 : undefined,
                    maxWidth: '600px',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                />
                {question.summary && renderSummaryToggle(`${question.id}_summary`)}
              </Stack>
            )}

            {question.type === 'inputGroup' && (
              <Stack spacing={1.5}>
                {question.options.map((option) => (
                  <div key={option.value} style={{ display: 'block', width: '100%', maxWidth: '400px' }}>
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
                      variant="outlined"
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease-in-out',
                        },
                      }}
                    />
                  </div>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Render number children in a separate indented card */}
        {question.children && question.children.some(child => child.type === 'number' && (!child.showWhen || child.showWhen(responses))) && (
          <div style={{ marginLeft: '32px', marginTop: '8px' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
                },
              }}
            >
              <Stack spacing={1.5}>
                {question.children.map((child) => {
                  if (child.showWhen && !child.showWhen(responses)) return null;
                  
                  if (child.type === 'number') {
                    return (
                      <div key={child.id} style={{ display: 'block' }}>
                        <TextField
                          type="number"
                          inputProps={{ min: 0 }}
                          label={child.prompt}
                          value={responses[child.id] || ''}
                          onChange={(e) => handleNumberChange(child.id)(e)}
                          onFocus={() => setFocusedQuestion(question.id)}
                          size="small"
                          variant="outlined"
                          sx={{
                            width: '80%',
                            maxWidth: '600px',
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#ffffff',
                              transition: 'all 0.2s ease-in-out',
                            },
                          }}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </Stack>
            </Paper>
          </div>
        )}

        {/* Render non-number children recursively */}
        {question.children && question.children.filter(child => child.type !== 'number').map((child) => renderQuestion(child, depth + 1))}
      </div>
    );
  };

  const bronzeMonthlyPrice = useMemo(() =>
    calculateTaxReturnBronzePrice(responses, pricingModifier), [responses, pricingModifier]);
  const silverMonthlyPrice = useMemo(() =>
    calculateTaxReturnSilverPrice(responses, pricingModifier), [responses, pricingModifier]);
  const goldMonthlyPrice = useMemo(() =>
    calculateTaxReturnGoldPrice(responses, pricingModifier), [responses, pricingModifier]);
  const totalOnceOffFee = useMemo(() =>
    calculateTaxReturnOnceOffFee(responses, pricingModifier), [responses, pricingModifier]);
  const upfrontAnnualFee = useMemo(() =>
    calculateTaxReturnUpfrontAnnualFee(responses, pricingModifier), [responses, pricingModifier]);
  // totalOnceOffFee already includes Upfront=YES items at full annual amount.
  // Do NOT add upfrontAnnualFee again — that would double-count.
  const totalOnceOffWithUpfront = totalOnceOffFee;

  return (
    <>
      <Container sx={{ py: 3, pb: 14 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Tax Return Pricing Calculator
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Answer a few quick questions to calculate tax return pricing for your potential client
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {(() => {
            let questionNumber = 0;
            return taxReturnQuestionData.map((question, index) => {
              const isVisible = !question.showWhen || question.showWhen(responses);
              if (isVisible) questionNumber++;

              const showSectionTitle = question.sectionTitle && (
                index === 0 || taxReturnQuestionData[index - 1]?.sectionTitle !== question.sectionTitle
              );

              if (!isVisible) return null;

              return (
                <React.Fragment key={question.id}>
                  {showSectionTitle && (
                    <div style={{ marginTop: index > 0 ? '24px' : 0, paddingTop: index > 0 ? '16px' : 0, borderTop: index > 0 ? '1px solid #e0e0e0' : 'none' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#002060',
                          fontSize: '1.1rem',
                          mb: 0.5,
                          mt: 0,
                          px: 2,
                          py: 1,
                        }}
                      >
                        {question.sectionTitle}
                      </Typography>
                      {renderQuestion(question, 0, questionNumber)}
                    </div>
                  )}
                  {!showSectionTitle && renderQuestion(question, 0, questionNumber)}
                </React.Fragment>
              );
            });
          })()}
        </Stack>
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1" sx={{ color: '#666', fontWeight: 500, fontSize: '1.1rem' }}>
                {clientName || 'New Quote'}
              </Typography>
              {activePriceId && saveStatus === 'saving' && (
                <Chip icon={<CloudUploadIcon />} label="Saving..." size="small" color="info" variant="outlined" />
              )}
              {activePriceId && saveStatus === 'saved' && (
                <Chip icon={<CloudDoneIcon />} label="Saved" size="small" color="success" variant="outlined" />
              )}
              {activePriceId && saveStatus === 'error' && (
                <Chip label="Save failed" size="small" color="error" variant="outlined" />
              )}
            </Stack>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Bronze: <span style={{ fontWeight: 700, color: '#cd7f32' }}>${bronzeMonthlyPrice.toFixed(2)}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Silver: <span style={{ fontWeight: 700, color: '#757575' }}>${silverMonthlyPrice.toFixed(2)}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Gold: <span style={{ fontWeight: 700, color: '#d4af37' }}>${goldMonthlyPrice.toFixed(2)}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Upfront: <span style={{ fontWeight: 700, color: '#002060' }}>${totalOnceOffWithUpfront.toFixed(2)}</span>
              </Typography>
            </Stack>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                if (activePriceId) {
                  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                  await autoSave(responses);
                }
                navigate('/tax-return-quote');
              }}
              sx={{
                flex: { xs: 1, sm: 'initial' },
                transition: 'all 0.2s ease-in-out',
                '&:hover': { boxShadow: '0 4px 12px rgba(0, 32, 96, 0.4)' },
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
