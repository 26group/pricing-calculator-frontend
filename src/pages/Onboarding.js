import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Stack,
  Grid,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectPlan } from '../features/subscription/subscriptionSlice';

const steps = ['Your Name', 'Create Organisation', 'Select Plan', 'Set Pricing'];

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

// Plan type constants for selection
const PLAN_TYPES = {
  BOOKKEEPER: 'bookkeeper',
  ACCOUNTING_PRACTICE: 'accounting_practice',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useAuth0();
  const { products } = useSelector((state) => state.subscription);
  
  // Check if we should start at a specific step (e.g., ?step=pricing)
  const getInitialStep = () => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'pricing') return 3;
    if (stepParam === 'plan') return 2;
    return 0;
  };
  
  const [activeStep, setActiveStep] = useState(getInitialStep);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState(null); // 'bookkeeper' or 'accounting_practice'
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [pricingModifier, setPricingModifier] = useState(200);
  const [bookkeepingPricingModifier, setBookkeepingPricingModifier] = useState(100);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);

  // Pre-fill name from Auth0 user (e.g., Google sign-in)
  useEffect(() => {
    if (user) {
      // Auth0 provides given_name and family_name for Google users
      if (user.given_name) {
        setFirstName(user.given_name);
      }
      if (user.family_name) {
        setLastName(user.family_name);
      }
      // Fallback: parse the full name if given_name/family_name not available
      if (!user.given_name && !user.family_name && user.name) {
        const nameParts = user.name.trim().split(' ');
        if (nameParts.length >= 1) {
          setFirstName(nameParts[0]);
        }
        if (nameParts.length >= 2) {
          setLastName(nameParts.slice(1).join(' '));
        }
      }
    }
  }, [user]);

  // Fetch products when we reach the plan selection step
  useEffect(() => {
    if (activeStep === 2 && products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [activeStep, products.length, dispatch]);

  const checkOrgNameAvailable = async (name) => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/v1'}/organisations/check-name?name=${encodeURIComponent(name)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
      return true;
    } catch (error) {
      console.error('Error checking org name:', error);
      return true;
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
      
      setCheckingName(true);
      setError('');
      const isAvailable = await checkOrgNameAvailable(orgName.trim());
      setCheckingName(false);
      
      if (!isAvailable) {
        setError('This organisation name is already taken. Please choose a different name.');
        return;
      }
      
      setError('');
    } else if (activeStep === 2) {
      if (!selectedPlanType) {
        setError('Please select a plan type');
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
      
      // Create organisation with plan type and pricing modifiers
      const orgData = {
        name: orgName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        planType: selectedPlanType,
        bookkeepingPricingModifier,
      };

      // Only include accounting modifier if they're an accounting practice
      if (selectedPlanType === PLAN_TYPES.ACCOUNTING_PRACTICE) {
        orgData.pricingModifier = pricingModifier;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/v1'}/organisations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to create organisation (${response.status})`);
      }

      // Store user email for display persistence (from Auth0 user if available)
      if (user?.email) {
        localStorage.setItem('userEmail', user.email);
      }

      // Select plan with Stripe if we have a price ID
      if (selectedPriceId) {
        try {
          await dispatch(selectPlan(selectedPriceId)).unwrap();
        } catch (planError) {
          console.error('Failed to select plan:', planError);
          // Continue anyway - they can select plan later
        }
      }

      // Successfully created - redirect to clients
      navigate('/clients');
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

  const handlePlanTypeSelect = (planType) => {
    setSelectedPlanType(planType);
    setSelectedPriceId(null); // Reset price selection when plan type changes
  };

  // Plan type cards for step 3
  const planTypeCards = [
    {
      type: PLAN_TYPES.BOOKKEEPER,
      name: 'Bookkeeper',
      description: 'Perfect for bookkeeping professionals',
      features: [
        'Bookkeeping pricing calculator',
        'Client quotes for bookkeeping services',
        'Bookkeeping pricing modifier',
        'Unlimited clients',
        'Team management',
      ],
    },
    {
      type: PLAN_TYPES.ACCOUNTING_PRACTICE,
      name: 'Accounting Practice',
      description: 'Full suite for accounting firms',
      features: [
        'Everything in Bookkeeper plan',
        'Accounting pricing calculator',
        'Accounting pricing modifier',
        'Full service catalog',
        'Priority support',
      ],
    },
  ];

  // Get display name - use given_name if available, otherwise don't show email
  const getDisplayName = () => {
    if (!user) return '';
    // Use given_name from Google/social login
    if (user.given_name) return `, ${user.given_name}`;
    // Check if name looks like an email (contains @), if so don't show it
    if (user.name && !user.name.includes('@')) return `, ${user.name}`;
    return '';
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
          Welcome{getDisplayName()}!
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

        {/* Step 1: Name */}
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

        {/* Step 2: Organisation Name */}
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
              placeholder="e.g., Acme Bookkeeping"
              sx={{ mb: 3 }}
              autoFocus
            />
          </Box>
        )}

        {/* Step 3: Select Plan Type */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
              What type of services do you provide?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Select the plan that best fits your practice
            </Typography>

            <Grid container spacing={3}>
              {planTypeCards.map((plan) => (
                <Grid item xs={12} md={6} key={plan.type}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: selectedPlanType === plan.type ? '2px solid' : '1px solid',
                      borderColor: selectedPlanType === plan.type ? 'primary.main' : 'divider',
                      borderRadius: '20px',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      boxShadow: selectedPlanType === plan.type 
                        ? '14px 17px 40px 4px rgba(66, 42, 251, 0.15)' 
                        : '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '14px 17px 40px 4px rgba(66, 42, 251, 0.2)',
                      },
                    }}
                    onClick={() => handlePlanTypeSelect(plan.type)}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack spacing={2}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan.description}
                        </Typography>
                        <Stack spacing={1}>
                          {plan.features.map((feature, index) => (
                            <Stack key={index} direction="row" spacing={1} alignItems="center">
                              <CheckIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
                              <Typography variant="body2">{feature}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                    <Box sx={{ p: 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant={selectedPlanType === plan.type ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlanTypeSelect(plan.type);
                        }}
                      >
                        {selectedPlanType === plan.type ? 'Selected' : 'Select'}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Step 4: Pricing Modifiers */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Set your hourly rate{selectedPlanType === PLAN_TYPES.ACCOUNTING_PRACTICE ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedPlanType === PLAN_TYPES.ACCOUNTING_PRACTICE 
                ? 'Set your base hourly rates for accounting and bookkeeping services.'
                : 'Set your base hourly rate for bookkeeping services.'}
            </Typography>

            {/* Accounting Pricing (only shown for Accounting Practice) */}
            {selectedPlanType === PLAN_TYPES.ACCOUNTING_PRACTICE && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Accounting Hourly Rate
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Set your hourly rate for accounting services. $200/hr is the standard rate.
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
                  {pricingModifier !== BASE_ACCOUNTING_MODIFIER && (
                    <Typography variant="body2" align="center" sx={{ color: 'text.secondary', opacity: 0.8, mt: 0.5 }}>
                      ({pricingModifier > BASE_ACCOUNTING_MODIFIER ? '+' : ''}{Math.round((pricingModifier / BASE_ACCOUNTING_MODIFIER - 1) * 100)}% from standard)
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Bookkeeping Pricing (shown for both plan types) */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
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
                {bookkeepingPricingModifier !== BASE_BOOKKEEPING_MODIFIER && (
                  <Typography variant="body2" align="center" sx={{ color: 'text.secondary', opacity: 0.8, mt: 0.5 }}>
                    ({bookkeepingPricingModifier > BASE_BOOKKEEPING_MODIFIER ? '+' : ''}{Math.round((bookkeepingPricingModifier / BASE_BOOKKEEPING_MODIFIER - 1) * 100)}% from standard)
                  </Typography>
                )}
              </Box>
            </Box>
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
              disabled={checkingName || (activeStep === 2 && !selectedPlanType)}
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
