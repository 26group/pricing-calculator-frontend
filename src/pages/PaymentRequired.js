import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import { useSelector } from 'react-redux';
import * as subscriptionApi from '../services/subscriptionApi';

export default function PaymentRequired() {
  const { subscription } = useSelector((state) => state.subscription);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await subscriptionApi.createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={4} alignItems="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#ffebee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: '#f44336' }} />
          </Box>

          <Stack spacing={2}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#002060' }}>
              Trial Period Ended
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your 7-day free trial has expired. To continue using the application,
              please add a payment method to activate your subscription.
            </Typography>
          </Stack>

          {subscription?.plan && (
            <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Your Selected Plan
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {subscription.plan.name}
                </Typography>
                <Typography variant="body2">
                  ${(subscription.plan.price.unitAmount / 100).toFixed(2)}/
                  {subscription.plan.price.interval}/seat
                </Typography>
              </Stack>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? null : <CreditCardIcon />}
            onClick={handleAddPayment}
            disabled={loading}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Payment Method'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            You will be redirected to our secure payment page powered by Stripe.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
