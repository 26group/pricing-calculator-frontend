import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Slider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const steps = ['Your Name', 'Create Organisation', 'Set Pricing Modifiers'];

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

// Base pricing modifiers (standard hourly rates)
const BASE_ACCOUNTING_MODIFIER = 200;
const BASE_BOOKKEEPING_MODIFIER = 100;

function valuetext(value) {
  return `$${value}/hr`;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth0();
  
  // Check if we should start at a specific step (e.g., ?step=pricing)
  const getInitialStep = () => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'pricing') return 2;
    return 0;
  };
  
  const [activeStep, setActiveStep] = useState(getInitialStep);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [pricingModifier, setPricingModifier] = useState(200);
  const [bookkeepingPricingModifier, setBookkeepingPricingModifier] = useState(100);
  const [pricingTab, setPricingTab] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);

  const checkOrgNameAvailable = async (name) => {
    const token = localStorage.getItem('token');
    if (!token) return true; // Skip check if no token
    
    try {
      const response = await fetch(`http://localhost:4000/v1/organisations/check-name?name=${encodeURIComponent(name)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
      return true; // Assume available if check fails
    } catch (error) {
      console.error('Error checking org name:', error);
      return true; // Assume available if check fails
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter both first and last name');
        return;
      }
      setError('');
    } else if (activeStep === 1) {
      if (!orgName.trim()) {
        setError('Please enter an organisation name');
        return;
      }
      if (orgName.trim().length < 2) {
        setError('Organisation name must be at least 2 characters');
        return;
      }
      
      // Check if name is available
      setCheckingName(true);
      setError('');
      const isAvailable = await checkOrgNameAvailable(orgName.trim());
      setCheckingName(false);
      
      if (!isAvailable) {
        setError('This organisation name is already taken. Please choose a different name.');
        return;
      }
      
      setError('');
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      const response = await fetch('http://localhost:4000/v1/organisations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: orgName.trim(),
          pricingModifier,
          bookkeepingPricingModifier,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to create organisation (${response.status})`);
      }

      // Successfully created - redirect to plan selection
      navigate('/onboarding/select-plan');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setPricingModifier(newValue);
  };

  const handleBookkeepingSliderChange = (event, newValue) => {
    setBookkeepingPricingModifier(newValue);
  };

  const handlePricingTabChange = (event, newValue) => {
    setPricingTab(newValue);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
          Welcome{user?.name ? `, ${user.name}` : ''}!
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Let's set up your organisation to get started.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              What's your name?
            </Typography>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              sx={{ mb: 2 }}
              autoFocus
            />
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              What's your organisation called?
            </Typography>
            <TextField
              fullWidth
              label="Organisation Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              sx={{ mb: 3 }}
              autoFocus
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Set your hourly rates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set your base hourly rates for accounting and bookkeeping services.
              These will be used to calculate pricing for your clients.
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={pricingTab} onChange={handlePricingTabChange} centered>
                <Tab label="Accounting" />
                <Tab label="Bookkeeping" />
              </Tabs>
            </Box>

            {/* Accounting Tab */}
            {pricingTab === 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Standard accounting rate: $200/hr
                </Typography>
                <Box sx={{ px: 2, py: 4 }}>
                  <Slider
                    value={pricingModifier}
                    onChange={handleSliderChange}
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
                        backgroundColor: pricingModifier > BASE_ACCOUNTING_MODIFIER ? 'success.main' : pricingModifier < BASE_ACCOUNTING_MODIFIER ? 'error.main' : 'primary.main',
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
                  <Typography variant="body2" align="center" sx={{ fontWeight: 500 }}>
                    Accounting rate: ${pricingModifier}/hr
                    {pricingModifier !== BASE_ACCOUNTING_MODIFIER && (
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}({pricingModifier > BASE_ACCOUNTING_MODIFIER ? '+' : ''}{Math.round((pricingModifier / BASE_ACCOUNTING_MODIFIER - 1) * 100)}% from standard)
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Bookkeeping Tab */}
            {pricingTab === 1 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Standard bookkeeping rate: $100/hr
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
                        backgroundColor: bookkeepingPricingModifier > BASE_BOOKKEEPING_MODIFIER ? 'success.main' : bookkeepingPricingModifier < BASE_BOOKKEEPING_MODIFIER ? 'error.main' : 'primary.main',
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
                  <Typography variant="body2" align="center" sx={{ fontWeight: 500 }}>
                    Bookkeeping rate: ${bookkeepingPricingModifier}/hr
                    {bookkeepingPricingModifier !== BASE_BOOKKEEPING_MODIFIER && (
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}({bookkeepingPricingModifier > BASE_BOOKKEEPING_MODIFIER ? '+' : ''}{Math.round((bookkeepingPricingModifier / BASE_BOOKKEEPING_MODIFIER - 1) * 100)}% from standard)
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creating...' : 'Complete Setup'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={checkingName}
              startIcon={checkingName ? <CircularProgress size={20} /> : null}
            >
              {checkingName ? 'Checking...' : 'Next'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
