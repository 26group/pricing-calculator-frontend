import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectPlan } from '../features/subscription/subscriptionSlice';

const formatCurrency = (amount, currency = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

// Sort plans: Starter first, Enterprise last
const sortPlans = (products) => {
  const order = { starter: 0, basic: 1, standard: 2, practice: 3, pro: 4, growth: 5, professional: 6, enterprise: 7 };
  return [...products].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aOrder = Object.entries(order).find(([key]) => aName.includes(key))?.[1] ?? 99;
    const bOrder = Object.entries(order).find(([key]) => bName.includes(key))?.[1] ?? 99;
    // If same tier, sort by price
    if (aOrder === bOrder) {
      return (a.price?.unit_amount || 0) - (b.price?.unit_amount || 0);
    }
    return aOrder - bOrder;
  });
};

export default function SelectPlan() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.subscription);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSelectPlan = async () => {
    if (!selectedPriceId) return;
    
    setSubmitting(true);
    try {
      await dispatch(selectPlan(selectedPriceId)).unwrap();
      navigate('/clients');
    } catch (err) {
      console.error('Failed to select plan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading plans...</Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Choose Your Plan
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Select a subscription plan for your organisation. You'll have a 7-day free trial before you need to add payment details.
          </Typography>
          <Chip 
            label="7-Day Free Trial" 
            color="success" 
            sx={{ mt: 1, fontWeight: 600 }}
          />
        </Stack>

        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        <Grid container spacing={3} justifyContent="center">
          {sortPlans(products).map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: selectedPriceId === product.price?.id ? '2px solid' : '1px solid',
                  borderColor: selectedPriceId === product.price?.id ? 'primary.main' : 'divider',
                  borderRadius: '20px',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  boxShadow: selectedPriceId === product.price?.id 
                    ? '14px 17px 40px 4px rgba(66, 42, 251, 0.15)' 
                    : '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '14px 17px 40px 4px rgba(66, 42, 251, 0.2)',
                  },
                }}
                onClick={() => setSelectedPriceId(product.price?.id)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {product.name}
                    </Typography>
                    {product.price && (
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatCurrency(product.price.unitAmount, product.price.currency)}
                        <Typography component="span" variant="body2" color="text.secondary">
                          /{product.price.interval}/seat
                        </Typography>
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                    {product.metadata?.features && (
                      <Stack spacing={1}>
                        {product.metadata.features.split(',').map((feature, index) => (
                          <Stack key={index} direction="row" spacing={1} alignItems="center">
                            <CheckIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
                            <Typography variant="body2">{feature.trim()}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={selectedPriceId === product.price?.id ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPriceId(product.price?.id);
                    }}
                  >
                    {selectedPriceId === product.price?.id ? 'Selected' : 'Select'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!selectedPriceId || submitting}
            onClick={handleSelectPlan}
            sx={{ px: 6 }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Start Free Trial'}
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          No credit card required during trial. You can add payment details later in Settings.
        </Typography>
      </Stack>
    </Container>
  );
}
