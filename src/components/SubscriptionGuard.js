import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchSubscription } from '../features/subscription/subscriptionSlice';
import PaymentRequired from '../pages/PaymentRequired';
import { CircularProgress, Stack } from '@mui/material';

// Routes that don't require subscription check
const EXEMPT_ROUTES = [
  '/onboarding',
  '/settings/billing',
  '/settings/select-plan',
  '/login',
  '/register',
  '/logout',
  '/payment-required',
];

export default function SubscriptionGuard({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { subscription, loading, requiresPayment } = useSelector((state) => state.subscription);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.organisation) {
      dispatch(fetchSubscription());
    }
  }, [dispatch, user?.organisation]);

  // Check if current route is exempt
  const isExemptRoute = EXEMPT_ROUTES.some((route) => location.pathname.startsWith(route));

  // If no user or no organisation, let other guards handle it
  if (!user || !user.organisation) {
    return children;
  }

  // Show loading while fetching subscription
  if (loading && !subscription) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  // Allow access to exempt routes
  if (isExemptRoute) {
    return children;
  }

  // If payment is required (trial expired without payment method)
  if (requiresPayment) {
    return <PaymentRequired />;
  }

  // User has not selected a plan yet (during onboarding)
  if (subscription && !subscription.stripePriceId && !subscription.selectedPlanId) {
    return <Navigate to="/onboarding/select-plan" replace />;
  }

  return children;
}
