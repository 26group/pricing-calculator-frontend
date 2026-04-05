import React from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';

/**
 * Component to gate features based on plan
 * 
 * Usage:
 *   <PlanGate module="advancedReporting">
 *     <AdvancedReportingComponent />
 *   </PlanGate>
 * 
 *   <PlanGate requiredPlan="practice">
 *     <PracticeOnlyFeature />
 *   </PlanGate>
 */
export function PlanGate({ 
  children, 
  module, 
  requiredPlan, 
  fallback = null,
  showUpgradePrompt = true 
}) {
  const navigate = useNavigate();
  const { canUse, hasAccess, planName, PLANS } = usePlan();
  
  // Check access based on module or required plan
  const hasModuleAccess = module ? canUse(module) : true;
  const hasPlanAccess = requiredPlan ? hasAccess(requiredPlan) : true;
  const allowed = hasModuleAccess && hasPlanAccess;
  
  if (allowed) {
    return children;
  }
  
  // If fallback provided, use it
  if (fallback) {
    return fallback;
  }
  
  // If upgrade prompt disabled, return null
  if (!showUpgradePrompt) {
    return null;
  }
  
  // Show upgrade prompt
  const requiredPlanName = requiredPlan 
    ? requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)
    : 'a higher';
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        textAlign: 'center', 
        bgcolor: 'grey.50',
        border: '1px dashed',
        borderColor: 'grey.300',
        borderRadius: 2,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <LockIcon sx={{ fontSize: 48, color: 'grey.400' }} />
        <Typography variant="h6" color="text.secondary">
          This feature requires {requiredPlanName} plan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You're currently on the {planName} plan
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/settings/billing')}
        >
          Upgrade Plan
        </Button>
      </Stack>
    </Paper>
  );
}

/**
 * Badge to show which plan a feature belongs to
 */
export function PlanBadge({ plan, size = 'small' }) {
  const colors = {
    starter: 'primary',
    practice: 'secondary',
    enterprise: 'warning',
  };
  
  return (
    <Chip 
      label={plan.charAt(0).toUpperCase() + plan.slice(1)} 
      color={colors[plan] || 'default'}
      size={size}
    />
  );
}

/**
 * Wrapper to show a "coming soon" message for features under development
 */
export function ComingSoon({ planName, featureName, children }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ opacity: 0.5, pointerEvents: 'none' }}>
        {children}
      </Box>
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          p: 3,
          textAlign: 'center',
          bgcolor: 'white',
          minWidth: 250,
        }}
      >
        <Stack spacing={1} alignItems="center">
          <PlanBadge plan={planName} />
          <Typography variant="h6">{featureName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Coming Soon
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PlanGate;
