/**
 * Plan Features Configuration
 * 
 * This file defines what features are available for each subscription plan.
 * Two tiers: Bookkeeper (bookkeeping only) and Accounting Practice (full access)
 */

// Plan identifiers (match Stripe product names)
export const PLANS = {
  BOOKKEEPER: 'bookkeeper',
  ACCOUNTING_PRACTICE: 'accounting_practice',
};

// Feature flags for each plan
export const PLAN_FEATURES = {
  [PLANS.BOOKKEEPER]: {
    name: 'Bookkeeper',
    description: 'Essential pricing tools for bookkeepers',
    features: [
      'Bookkeeping pricing calculator',
      'Client quotes for bookkeeping',
      'Bookkeeping pricing modifier',
      'Unlimited clients',
    ],
    modules: {
      bookkeepingCalculator: true,
      bookkeepingPricingModifier: true,
      accountingCalculator: false,
      accountingPricingModifier: false,
      serviceCatalog: false,
      clientQuotes: true,
      teamManagement: true,
      prioritySupport: false,
    },
  },
  [PLANS.ACCOUNTING_PRACTICE]: {
    name: 'Accounting Practice',
    description: 'Full suite for accounting practices',
    features: [
      'All bookkeeping features',
      'Accounting pricing calculator',
      'Accounting pricing modifier',
      'Full service catalog',
      'Priority support',
    ],
    modules: {
      bookkeepingCalculator: true,
      bookkeepingPricingModifier: true,
      accountingCalculator: true,
      accountingPricingModifier: true,
      serviceCatalog: true,
      clientQuotes: true,
      teamManagement: true,
      prioritySupport: true,
    },
  },
};

/**
 * Get the plan key from a Stripe product name
 * @param {string} productName - The Stripe product name
 * @returns {string} - The plan key (bookkeeper, accounting_practice)
 */
export const getPlanFromProductName = (productName) => {
  if (!productName) return null;
  const name = productName.toLowerCase();
  if (name.includes('accounting') || name.includes('practice')) return PLANS.ACCOUNTING_PRACTICE;
  if (name.includes('bookkeeper') || name.includes('bookkeeping')) return PLANS.BOOKKEEPER;
  // Default to bookkeeper for unknown plans
  return PLANS.BOOKKEEPER;
};

/**
 * Check if a plan has access to a specific module
 * @param {string} planKey - The plan key (bookkeeper, accounting_practice)
 * @param {string} moduleName - The module to check
 * @returns {boolean}
 */
export const hasModuleAccess = (planKey, moduleName) => {
  const plan = PLAN_FEATURES[planKey];
  if (!plan) return false;
  return plan.modules[moduleName] === true;
};

/**
 * Check if the plan is a bookkeeper-only plan
 * @param {string} planKey - The plan key
 * @returns {boolean}
 */
export const isBookkeeperPlan = (planKey) => {
  return planKey === PLANS.BOOKKEEPER;
};

/**
 * Check if the plan has accounting access
 * @param {string} planKey - The plan key
 * @returns {boolean}
 */
export const hasAccountingAccess = (planKey) => {
  return planKey === PLANS.ACCOUNTING_PRACTICE;
};
