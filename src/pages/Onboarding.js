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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const steps = ['Create Organisation', 'Set Pricing Modifier'];

const marks = [
  { value: -50, label: '-50%' },
  { value: -25, label: '-25%' },
  { value: 0, label: '0%' },
  { value: 25, label: '+25%' },
  { value: 50, label: '+50%' },
];

function valuetext(value) {
  return `${value > 0 ? '+' : ''}${value}%`;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [activeStep, setActiveStep] = useState(0);
  const [orgName, setOrgName] = useState('');
  const [pricingModifier, setPricingModifier] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!orgName.trim()) {
        setError('Please enter an organisation name');
        return;
      }
      if (orgName.trim().length < 2) {
        setError('Organisation name must be at least 2 characters');
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
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to create organisation (${response.status})`);
      }

      // Successfully created - redirect to home
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setPricingModifier(newValue);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
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
            <Typography variant="h6" gutterBottom>
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

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Adjust your pricing modifier
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set a percentage to increase or decrease all service prices for your organisation.
              This will be applied to all pricing calculations.
            </Typography>

            <Box sx={{ px: 2, py: 4 }}>
              <Slider
                value={pricingModifier}
                onChange={handleSliderChange}
                aria-labelledby="pricing-modifier-slider"
                getAriaValueText={valuetext}
                valueLabelDisplay="on"
                valueLabelFormat={valuetext}
                step={5}
                marks={marks}
                min={-50}
                max={50}
                sx={{
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: pricingModifier > 0 ? 'success.main' : pricingModifier < 0 ? 'error.main' : 'primary.main',
                  },
                }}
              />
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" align="center">
                {pricingModifier === 0 && 'Services will be priced at standard rates'}
                {pricingModifier > 0 && `Services will be priced ${pricingModifier}% higher than standard`}
                {pricingModifier < 0 && `Services will be priced ${Math.abs(pricingModifier)}% lower than standard`}
              </Typography>
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
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
