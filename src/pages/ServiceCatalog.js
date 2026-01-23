import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider,
  Button,
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
  if (hasSegmentKeys) {
    return undefined;
  }

  const fallback = potentialEntries.find(([, value]) => value && typeof value === 'object' && value.code);
  return fallback ? fallback[1] : undefined;
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
      <Container sx={{ py: 4, pb: 12 }}>
        <Typography variant="h3" sx={{ mb: 3 }}>
          Services
        </Typography>

        {showRevenueHint && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a revenue segment on the Questions page to see pricing for segmented services.
          </Typography>
        )}

        <Stack spacing={4}>
          {catalog.filter((category) => shouldShowCategory(category.categoryKey, questionResponses)).map((category) => (
            <Stack key={category.categoryKey} spacing={2}>
              <Typography variant="h5">{category.categoryLabel}</Typography>
              <Divider />
              {category.items.map((item) => {
                const selection = serviceSelections[item.id] ?? 'no';
                const resolvedService =
                  selection === 'yes' ? resolveServiceValue(item.serviceEntry, revenueSelection) : undefined;

                return (
                  <Paper key={item.id} sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Typography variant="h6">{item.serviceLabel}</Typography>
                      <FormControl>
                        <RadioGroup row value={selection} onChange={handleSelectionChange(item.id)}>
                          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                          <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                      </FormControl>
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
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}
      >
        <Container sx={{ py: 2 }}>
          <Stack direction="row" spacing={4} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Monthly:
                </Typography>
                <Typography variant="h6" sx={{ color: '#002060', fontWeight: 'bold', minWidth: '120px' }}>
                  ${combinedTotal.toFixed(2)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Once Off:
                </Typography>
                <Typography variant="h6" sx={{ color: '#002060', fontWeight: 'bold', minWidth: '120px' }}>
                  ${combinedOnceOffTotal.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/questions')}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/pricing')}
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
