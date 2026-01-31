import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  FormControl,
  FormControlLabel,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { segmentForServices } from './Questions';
import { serviceValues } from '../constants/serviceList';
import { calculateServiceCatalogTotalMonthly } from '../utils/serviceCatalogPricing';
import { setServiceCatalogPricing, setServiceSelections } from '../features/questions/responsesSlice';

const formatCurrency = (amount) =>
  amount == null
    ? 'N/A'
    : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const titleize = (value) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveServiceValue = (serviceEntry, revenueSelection) => {
  if (!serviceEntry) return undefined;

  if (serviceEntry.code) {
    return serviceEntry;
  }

  const normalizedSegment = segmentForServices(revenueSelection);
  if (normalizedSegment && serviceEntry[normalizedSegment]) {
    return serviceEntry[normalizedSegment];
  }

  if (revenueSelection && serviceEntry[revenueSelection]) {
    return serviceEntry[revenueSelection];
  }

  const potentialEntries = Object.entries(serviceEntry);
  const segmentKeys = ['micro', 'small', 'medium', 'large', 'enterprise'];
  const hasSegmentKeys = potentialEntries.some(([key]) => segmentKeys.includes(key));
  
  // If service doesn't have segment-based keys, return first available option
  if (!hasSegmentKeys) {
    const fallback = potentialEntries.find(([, value]) => value && typeof value === 'object');
    return fallback ? fallback[1] : undefined;
  }

  // For segment-based services with missing segment, return undefined
  return undefined;
};

const buildCatalog = () =>
  Object.entries(serviceValues)
    .filter(([categoryKey]) => categoryKey !== 'revenueSegments')
    .map(([categoryKey, categoryValue]) => ({
      categoryKey,
      categoryLabel: titleize(categoryKey),
      items: Object.entries(categoryValue).map(([serviceKey, serviceEntry]) => ({
        id: `${categoryKey}.${serviceKey}`,
        serviceKey,
        serviceLabel: titleize(serviceKey),
        serviceEntry,
      })),
    }));

const categoryQuestionMap = {
  taxServices: ['q6', 'q16', 'q17'],
  payrollServices: ['q8', 'q11', 'q12', 'q13', 'q14', 'q15'],
  advisoryServices: ['q18', 'q19'],
  reporting: ['q20', 'q21', 'q22'],
  meetings: ['q23', 'q24'],
  supportServices: ['q25'],
  corporateSecretarial: ['q26'],
  atoPaymentPlans: ['q26b'],
};

const getResponseValue = (responses, path) =>
  path.split('.').reduce((current, key) => (current ? current[key] : undefined), responses);

const isFalseResponse = (value) => value === false || value === 'no';

const shouldShowCategory = (categoryKey, responses) => {
  const responsePaths = categoryQuestionMap[categoryKey];
  if (!responsePaths) return true;
  return responsePaths.some((path) => isFalseResponse(getResponseValue(responses, path)));
};

const hasSegmentPricing = (serviceEntry, revenueSelection) => {
  if (!serviceEntry) return true; // Show by default if no entry
  
  // If service has a code at root level, it's not segment-based
  if (serviceEntry.code) return true;
  
  // Check if this is a segment-based service
  const potentialEntries = Object.entries(serviceEntry);
  const segmentKeys = ['micro', 'small', 'medium', 'large', 'enterprise'];
  const hasSegmentKeys = potentialEntries.some(([key]) => segmentKeys.includes(key));
  
  // If not segment-based, always show
  if (!hasSegmentKeys) return true;
  
  // If segment-based, check if selected segment has pricing
  if (!revenueSelection) return false; // Hide if no revenue selected for segment-based services
  
  const normalizedSegment = segmentForServices(revenueSelection);
  if (normalizedSegment && serviceEntry[normalizedSegment]) {
    return true;
  }
  
  if (revenueSelection && serviceEntry[revenueSelection]) {
    return true;
  }
  
  return false; // Hide if segment doesn't have pricing
};

export default function ServiceCatalog() {
  const navigate = useNavigate();
  const getInitialRevenue = () => {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem('selectedRevenueSegment');
    return stored ?? '';
  };

  const [revenueSelection, setRevenueSelection] = useState(getInitialRevenue);
  const questionResponses = useSelector((state) => state.responses || {});
  const storedServiceSelections = useSelector((state) => state.responses?.serviceSelections || {});
  const dispatch = useDispatch();

  const [serviceSelections, setServiceSelections] = useState(() => storedServiceSelections);

  const catalog = useMemo(() => buildCatalog(), []);

  const handleSelectionChange = (serviceId) => (event) => {
    setServiceSelections((prev) => ({
      ...prev,
      [serviceId]: event.target.value,
    }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleStorage = (event) => {
      if (event.key === 'selectedRevenueSegment') {
        setRevenueSelection(event.newValue ?? '');
      }
    };

    const refreshRevenue = () => {
      setRevenueSelection(getInitialRevenue());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', refreshRevenue);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', refreshRevenue);
    };
  }, []);

  const showRevenueHint = !revenueSelection;

  const totalMonthlyPrice = useMemo(
    () => calculateServiceCatalogTotalMonthly(serviceSelections, catalog, revenueSelection) || 0,
    [serviceSelections, catalog, revenueSelection]
  );

  const questionsPricing = useSelector((state) => state.responses?.questionsPricing || 0);
  const questionsOnceOffFee = useSelector((state) => state.responses?.questionsOnceOffFee || 0);
  const combinedTotal = totalMonthlyPrice + questionsPricing;
  const combinedOnceOffTotal = questionsOnceOffFee;

  useEffect(() => {
    if (typeof totalMonthlyPrice === 'number' && !isNaN(totalMonthlyPrice)) {
      const action = setServiceCatalogPricing(totalMonthlyPrice);
      if (action && action.type) {
        dispatch(action);
      }
    }
  }, [totalMonthlyPrice, dispatch]);

  useEffect(() => {
    if (serviceSelections && typeof serviceSelections === 'object' && Object.keys(serviceSelections).length > 0) {
      const action = setServiceSelections(serviceSelections);
      if (action && action.type) {
        dispatch(action);
      }
    }
  }, [serviceSelections, dispatch]);

  return (
    <>
      <Container sx={{ py: 3, pb: 14 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Services
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Select the services you would like to include in your pricing quote
          </Typography>
        </Stack>

        {showRevenueHint && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a revenue segment on the Questions page to see pricing for segmented services.
          </Typography>
        )}

        <Stack spacing={4}>
          {catalog.filter((category) => shouldShowCategory(category.categoryKey, questionResponses)).map((category) => (
            <Stack key={category.categoryKey} spacing={2}>
              {category.categoryKey !== 'payrollServices' && (
                <>
                  <Typography variant="h5">{category.categoryLabel}</Typography>
                  <Divider />
                </>
              )}
              {category.items.filter((item) => hasSegmentPricing(item.serviceEntry, revenueSelection)).map((item) => {
                const selection = serviceSelections[item.id] ?? 'no';
                const resolvedService =
                  selection === 'yes' ? resolveServiceValue(item.serviceEntry, revenueSelection) : undefined;

                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1rem' }}>{item.serviceLabel}</Typography>
                      <ToggleButtonGroup
                        value={selection}
                        exclusive
                        onChange={(event, newValue) => {
                          if (newValue !== null) {
                            handleSelectionChange(item.id)({ target: { value: newValue } });
                          }
                        }}
                        size="medium"
                        sx={{
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
                      >
                        <ToggleButton
                          value="yes"
                          sx={{
                            minWidth: '120px',
                            flex: '0 1 120px',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            py: 1.2,
                            px: 1.5,
                            fontSize: '0.9rem',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Yes</Typography>
                        </ToggleButton>
                        <ToggleButton
                          value="no"
                          sx={{
                            minWidth: '120px',
                            flex: '0 1 120px',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            py: 1.2,
                            px: 1.5,
                            fontSize: '0.9rem',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>No</Typography>
                        </ToggleButton>
                      </ToggleButtonGroup>
                      {selection === 'yes' && resolvedService && (
                        <Typography variant="body2" color="text.secondary">
                          Selected service: {resolvedService.inclusion} (Code {resolvedService.code}) — Monthly{' '}
                          {formatCurrency(resolvedService.monthly)}, Yearly {formatCurrency(resolvedService.yearly)}
                        </Typography>
                      )}
                      {selection === 'yes' && !resolvedService && (
                        <Typography variant="body2" color="warning.main">
                          Select a revenue segment on the Questions page to view pricing for this service.
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          ))}
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
                variant="outlined"
                color="primary"
                onClick={() => navigate('/questions')}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 32, 96, 0.4)',
                  },
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/pricing-quote')}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 32, 96, 0.4)',
                  },
                }}
              >
                View Pricing
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>
    </>
  );
}
