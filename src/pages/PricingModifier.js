import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Slider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

// Accounting slider config
const accountingMarks = [
  { value: 0, label: '$0' },
  { value: 100, label: '$100' },
  { value: 200, label: '$200' },
  { value: 300, label: '$300' },
  { value: 400, label: '$400' },
];

// Bookkeeping slider config
const bookkeepingMarks = [
  { value: 0, label: '$0' },
  { value: 75, label: '$75' },
  { value: 150, label: '$150' },
  { value: 225, label: '$225' },
  { value: 300, label: '$300' },
];

function valuetext(value) {
  return `$${value}`;
}

export default function PricingModifier() {
  const [activeTab, setActiveTab] = useState(0);
  const [pricingModifier, setPricingModifier] = useState(200);
  const [bookkeepingPricingModifier, setBookkeepingPricingModifier] = useState(100);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [loadingData, setLoadingData] = useState(true);
  const saveTimerRef = useRef(null);
  const initialLoadRef = useRef(true);

  // Load current pricing modifiers from organisation
  useEffect(() => {
    const fetchOrganisation = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingData(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/v1/organisations/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.pricingModifier !== undefined) {
            setPricingModifier(data.pricingModifier);
          } else {
            setPricingModifier(200); // Default to $200
          }
          if (data.bookkeepingPricingModifier !== undefined) {
            setBookkeepingPricingModifier(data.bookkeepingPricingModifier);
          } else {
            setBookkeepingPricingModifier(100); // Default to $100
          }
        }
      } catch (err) {
        console.error('Error fetching organisation:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchOrganisation();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Auto-save function
  const saveModifiers = useCallback(async (accounting, bookkeeping) => {
    setSaveStatus('saving');
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setSaveStatus('idle');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/v1/organisations/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          pricingModifier: accounting,
          bookkeepingPricingModifier: bookkeeping,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update pricing modifiers');
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setError(err.message);
      setSaveStatus('idle');
    }
  }, []);

  // Debounced save effect
  useEffect(() => {
    // Skip auto-save on initial load
    if (initialLoadRef.current) {
      return;
    }

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer for debounced save
    saveTimerRef.current = setTimeout(() => {
      saveModifiers(pricingModifier, bookkeepingPricingModifier);
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [pricingModifier, bookkeepingPricingModifier, saveModifiers]);

  // Mark initial load as complete after data is loaded
  useEffect(() => {
    if (!loadingData) {
      // Small delay to ensure state is settled
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 100);
    }
  }, [loadingData]);

  const handleAccountingSliderChange = (event, newValue) => {
    setPricingModifier(newValue);
  };

  const handleBookkeepingSliderChange = (event, newValue) => {
    setBookkeepingPricingModifier(newValue);
  };

  if (loadingData) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
          Pricing Modifiers
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Adjust the pricing modifiers for accounting and bookkeeping services.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Accounting" />
            <Tab label="Bookkeeping" />
          </Tabs>
        </Box>

        {/* Accounting Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Accounting Hourly Rate
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set your hourly rate for accounting services. $200/hr is the standard rate.
            </Typography>

            <Box sx={{ px: 2, py: 4 }}>
              <Slider
                value={pricingModifier}
                onChange={handleAccountingSliderChange}
                aria-labelledby="accounting-pricing-modifier-slider"
                getAriaValueText={valuetext}
                valueLabelDisplay="on"
                valueLabelFormat={valuetext}
                step={10}
                marks={accountingMarks}
                min={0}
                max={400}
                sx={{
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: 'primary.main',
                    borderRadius: '10px',
                  },
                  '& .MuiSlider-thumb': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(135deg, #868CFF 0%, #422AFB 100%)',
                  },
                }}
              />
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: '12px' }}>
              <Typography variant="body1" align="center" sx={{ color: 'text.primary', fontSize: '1.1rem' }}>
                Accounting hourly rate:{' '}
                <span style={{ fontWeight: 600 }}>${pricingModifier}/hr</span>
              </Typography>
              {pricingModifier !== 200 && (
                <Typography variant="body2" align="center" sx={{ color: 'text.secondary', opacity: 0.8, mt: 0.5 }}>
                  ({pricingModifier > 200 ? '+' : ''}{Math.round((pricingModifier / 200 - 1) * 100)}% from standard)
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Bookkeeping Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Bookkeeping Hourly Rate
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set your hourly rate for bookkeeping services. $100/hr is the standard rate.
            </Typography>

            <Box sx={{ px: 2, py: 4 }}>
              <Slider
                value={bookkeepingPricingModifier}
                onChange={handleBookkeepingSliderChange}
                aria-labelledby="bookkeeping-pricing-modifier-slider"
                getAriaValueText={valuetext}
                valueLabelDisplay="on"
                valueLabelFormat={valuetext}
                step={10}
                marks={bookkeepingMarks}
                min={0}
                max={300}
                sx={{
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: 'primary.main',
                    borderRadius: '10px',
                  },
                  '& .MuiSlider-thumb': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiSlider-track': {
                    background: 'linear-gradient(135deg, #868CFF 0%, #422AFB 100%)',
                  },
                }}
              />
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: '12px' }}>
              <Typography variant="body1" align="center" sx={{ color: 'text.primary', fontSize: '1.1rem' }}>
                Bookkeeping hourly rate:{' '}
                <span style={{ fontWeight: 600 }}>${bookkeepingPricingModifier}/hr</span>
              </Typography>
              {bookkeepingPricingModifier !== 100 && (
                <Typography variant="body2" align="center" sx={{ color: 'text.secondary', opacity: 0.8, mt: 0.5 }}>
                  ({bookkeepingPricingModifier > 100 ? '+' : ''}{Math.round((bookkeepingPricingModifier / 100 - 1) * 100)}% from standard)
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {saveStatus === 'saving' && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">Saving...</Typography>
        </Box>
      )}

      {saveStatus === 'saved' && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
          <CloudDoneIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
          <Typography variant="body2" color="success.main">Saved</Typography>
        </Box>
      )}
    </Container>
  );
}
