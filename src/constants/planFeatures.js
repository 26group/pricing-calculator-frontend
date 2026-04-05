/**
 * Plan Features Configuration
 * 
 * This file defines what features are available for each subscription plan.
 * Add new features here as they are developed.
 */

// Plan identifiers (match Stripe product names)
export const PLANS = {
  STARTER: 'starter',
  PRACTICE: 'practice',
  ENTERPRISE: 'enterprise',
};

// Feature flags for each plan
export const PLAN_FEATURES = {
  [PLANS.STARTER]: {
    name: 'Starter',
    description: 'Essential pricing tools for individual accountants',
    features: [
      'Basic pricing calculator',
      'Service catalog',
      'Client quotes',
      'Up to 50 clients',
    ],
    modules: {
      pricingCalculator: true,
      serviceCatalog: true,
      clientQuotes: true,
      advancedReporting: false,
      teamManagement: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  [PLANS.PRACTICE]: {
    name: 'Practice',
    description: 'Advanced tools for growing practices',
    features: [
      'Everything in Starter',
      'Advanced reporting',
      'Team management',
      'Unlimited clients',
      'Priority support',
    ],
    modules: {
      pricingCalculator: true,
      serviceCatalog: true,
      clientQuotes: true,
      advancedReporting: true,
      teamManagement: true,
      customBranding: false,
      apiAccess: false,
      prioritySupport: true,
    },
  },
  [PLANS.ENTERPRISE]: {
    name: 'Enterprise',
    description: 'Full suite for large accounting firms',
    features: [
      'Everything in Practice',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
    ],
    modules: {
      pricingCalculator: true,
      serviceCatalog: true,
      clientQuotes: true,
      advancedReporting: true,
      teamManagement: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
};

/**
 * Get the plan key from a Stripe product name
 * @param {string} productName - The Stripe product name
 * @returns {string} - The plan key (starter, practice, enterprise)
 */
export const getPlanFromProductName = (productName) => {
  if (!productName) return null;
  const name = productName.toLowerCase();
  if (name.includes('enterprise')) return PLANS.ENTERPRISE;
  if (name.includes('practice')) return PLANS.PRACTICE;
  if (name.includes('starter')) return PLANS.STARTER;
  // Default to starter for unknown plans
  return PLANS.STARTER;
};

/**
 * Check if a plan has access to a specific module
 * @param {string} planKey - The plan key (starter, practice, enterprise)
 * @param {string} moduleName - The module to check
 * @returns {boolean}
 */
export const hasModuleAccess = (planKey, moduleName) => {
  const plan = PLAN_FEATURES[planKey];
  if (!plan) return false;
  return plan.modules[moduleName] === true;
};
