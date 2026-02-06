import React, { useEffect } from 'react';
import { Typography, Container, Stack, Chip, Paper, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { usePlan } from '../hooks/usePlan';
import { fetchSubscription, fetchProducts } from '../features/subscription/subscriptionSlice';
import { PlanBadge } from '../components/PlanGate';

export default function Home() {
  const dispatch = useDispatch();
  const { currentPlan, planName, planDescription, isLoaded } = usePlan();

  useEffect(() => {
    dispatch(fetchSubscription());
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <Container>
      <Stack spacing={3} sx={{ mt: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h3">Home Page</Typography>
          {isLoaded && currentPlan && (
            <PlanBadge plan={currentPlan} />
          )}
        </Stack>
        
        {isLoaded && currentPlan && (
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              You're on the <strong>{planName}</strong> plan. {planDescription}
            </Typography>
          </Paper>
        )}
        
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Starter Features
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the navigation above to access pricing tools, service catalog, and client quotes.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}