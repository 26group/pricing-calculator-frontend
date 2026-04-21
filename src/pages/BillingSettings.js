import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import posthog from 'posthog-js';
import { fetchSubscription, fetchProducts } from '../features/subscription/subscriptionSlice';
import * as subscriptionApi from '../services/subscriptionApi';

const formatCurrency = (amount, currency = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const StatusChip = ({ status }) => {
  const statusConfig = {
    trialing: { color: 'info', label: 'Trial' },
    active: { color: 'success', label: 'Active' },
    past_due: { color: 'warning', label: 'Past Due' },
    canceled: { color: 'error', label: 'Canceled' },
    unpaid: { color: 'error', label: 'Unpaid' },
  };

  const config = statusConfig[status] || { color: 'default', label: status };
  return <Chip size="small" color={config.color} label={config.label} />;
};

export default function BillingSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { subscription, loading, error } = useSelector((state) => state.subscription);
  const user = useSelector((state) => state.auth.user);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Check if current user is the organisation owner
  const { isOwner } = useSelector((state) => state.auth);
  
  // Debug logging
  console.log('BillingSettings Debug:', { isOwner, subscription, user });

  useEffect(() => {
    dispatch(fetchSubscription());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Payment method added successfully!');
      dispatch(fetchSubscription());
    }
    if (searchParams.get('canceled') === 'true') {
      setActionError('Payment setup was canceled.');
    }
  }, [searchParams, dispatch]);

  const handleAddPayment = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const { url } = await subscriptionApi.createCheckoutSession();
      posthog.capture('payment_method_initiated', {
        plan_name: subscription?.plan?.name,
        subscription_status: subscription?.status,
      });
      window.location.href = url;
    } catch (err) {
      posthog.captureException(err, { $exception_source: 'BillingSettings.handleAddPayment' });
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const { url } = await subscriptionApi.createPortalSession();
      window.location.href = url;
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await subscriptionApi.cancelSubscription(true);
      posthog.capture('subscription_cancelled', {
        plan_name: subscription?.plan?.name,
        subscription_status: subscription?.status,
      });
      setCancelDialogOpen(false);
      setSuccessMessage('Subscription will be canceled at the end of the billing period.');
      dispatch(fetchSubscription());
    } catch (err) {
      posthog.captureException(err, { $exception_source: 'BillingSettings.handleCancelSubscription' });
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !subscription) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading billing information...</Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#002060' }}>
          Billing & Subscription
        </Typography>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {(error || actionError) && (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {error || actionError}
          </Alert>
        )}

        {/* Current Plan */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Current Plan
              </Typography>
              {subscription?.status && <StatusChip status={subscription.status} />}
            </Stack>

            <Divider />

            {subscription?.plan ? (
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={500}>Plan Name</Typography>
                  <Typography variant="body1">{subscription.plan.name}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={500}>Price</Typography>
                  <Typography variant="body1">
                    {formatCurrency(subscription.plan.price.unitAmount, subscription.plan.price.currency)}
                    /{subscription.plan.price.interval}/seat
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={500}>Seats</Typography>
                  <Typography variant="body1">{subscription.quantity || 1}</Typography>
                </Stack>

                {subscription.status === 'trialing' && (
                  <>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" fontWeight={500}>Trial Ends</Typography>
                      <Typography variant="body1" color={subscription.isTrialExpired ? 'error' : 'text.primary'}>
                        {formatDate(subscription.trialEndDate)}
                        {subscription.isTrialExpired && ' (Expired)'}
                      </Typography>
                    </Stack>
                  </>
                )}

                {subscription.currentPeriodEnd && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1" fontWeight={500}>Current Period Ends</Typography>
                    <Typography variant="body1">{formatDate(subscription.currentPeriodEnd)}</Typography>
                  </Stack>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Your subscription will be canceled at the end of the current billing period.
                  </Alert>
                )}
              </Stack>
            ) : (
              <Typography color="text.secondary">No active subscription</Typography>
            )}
          </Stack>
        </Paper>

        {/* Payment Method */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Payment Method
            </Typography>

            <Divider />

            {subscription?.paymentMethodAdded ? (
              <Stack spacing={2}>
                {subscription?.paymentMethod ? (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CreditCardIcon color="action" />
                    <Box>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CreditCardIcon color="action" />
                    <Typography>Payment method on file</Typography>
                  </Stack>
                )}
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Alert severity={subscription?.requiresPayment ? 'error' : 'info'}>
                  {subscription?.requiresPayment
                    ? 'Your trial has expired. Please add a payment method to continue using the application.'
                    : 'No payment method on file. Add one to avoid service interruption after your trial.'}
                </Alert>
              </Stack>
            )}

            {/* Always show payment button for now - isOwner check can be added back later */}
            <Stack direction="row" spacing={2}>
              {subscription?.paymentMethodAdded ? (
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={handleManageBilling}
                  disabled={actionLoading}
                >
                  Manage Billing
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<CreditCardIcon />}
                  onClick={handleAddPayment}
                  disabled={actionLoading}
                >
                  {actionLoading ? <CircularProgress size={24} /> : 'Add Payment Method'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Actions */}
        {isOwner && subscription?.stripeSubscriptionId && !subscription?.cancelAtPeriodEnd && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Subscription Actions
              </Typography>

              <Divider />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/settings/select-plan')}
                >
                  Change Plan
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel Subscription
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel your subscription? You will continue to have access
              until the end of your current billing period.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>Keep Subscription</Button>
            <Button
              color="error"
              onClick={handleCancelSubscription}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Cancel Subscription'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}
