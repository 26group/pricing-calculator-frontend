import { useSelector } from 'react-redux';
import { PLANS, PLAN_FEATURES, getPlanFromProductName, hasModuleAccess, isBookkeeperPlan, hasAccountingAccess } from '../constants/planFeatures';

/**
 * Hook to access current plan information and check feature access
 * 
 * Usage:
 *   const { currentPlan, planName, hasAccess, canUse } = usePlan();
 *   
 *   // Check if user has a specific plan
 *   if (currentPlan === PLANS.ENTERPRISE) { ... }
 *   
 *   // Check module access
 *   if (canUse('advancedReporting')) { ... }
 */
export function usePlan() {
  const { subscription, products, currentPlanName } = useSelector((state) => state.subscription);
  
  // Get the current plan from subscription
  const getCurrentPlan = () => {
    // First try from the stored plan name
    if (currentPlanName) {
      return getPlanFromProductName(currentPlanName);
    }
    
    if (!subscription) return null;
    
    // Try to get plan from subscription's product name
    if (subscription.plan?.name) {
      return getPlanFromProductName(subscription.plan.name);
    }
    
    // Try to get from selectedPlanId by matching with products
    if (subscription.selectedPlanId && products.length > 0) {
      const product = products.find(p => p.price?.id === subscription.selectedPlanId);
      if (product) {
        return getPlanFromProductName(product.name);
      }
    }
    
    // Try to get from stripePriceId
    if (subscription.stripePriceId && products.length > 0) {
      const product = products.find(p => p.price?.id === subscription.stripePriceId);
      if (product) {
        return getPlanFromProductName(product.name);
      }
    }
    
    return null;
  };
  
  const currentPlan = getCurrentPlan();
  const planConfig = currentPlan ? PLAN_FEATURES[currentPlan] : null;
  
  /**
   * Check if user has access to a specific module
   * @param {string} moduleName - The module to check (e.g., 'advancedReporting')
   * @returns {boolean}
   */
  const canUse = (moduleName) => {
    if (!currentPlan) return false;
    return hasModuleAccess(currentPlan, moduleName);
  };
  
  /**
   * Check if user's plan is at least the specified level
   * @param {string} requiredPlan - Minimum plan required
   * @returns {boolean}
   */
  const hasAccess = (requiredPlan) => {
    if (!currentPlan) return false;
    const planOrder = [PLANS.BOOKKEEPER, PLANS.ACCOUNTING_PRACTICE];
    const currentIndex = planOrder.indexOf(currentPlan);
    const requiredIndex = planOrder.indexOf(requiredPlan);
    return currentIndex >= requiredIndex;
  };
  
  /**
   * Check if current plan is a specific plan
   * @param {string} planKey - The plan to check against
   * @returns {boolean}
   */
  const isPlan = (planKey) => currentPlan === planKey;

  /**
   * Check if user is on bookkeeper-only plan
   * @returns {boolean}
   */
  const isBookkeeper = () => isBookkeeperPlan(currentPlan);

  /**
   * Check if user has access to accounting features
   * @returns {boolean}
   */
  const canAccessAccounting = () => hasAccountingAccess(currentPlan);
  
  return {
    // Current plan key (bookkeeper, accounting_practice)
    currentPlan,
    // Plan display name
    planName: planConfig?.name || 'No Plan',
    // Plan description
    planDescription: planConfig?.description || '',
    // Plan feature list
    planFeatures: planConfig?.features || [],
    // Check module access
    canUse,
    // Check plan level access
    hasAccess,
    // Check specific plan
    isPlan,
    // Is bookkeeper-only plan
    isBookkeeper,
    // Has accounting access
    canAccessAccounting,
    // Is plan loaded
    isLoaded: !!subscription,
    // Plan constants for comparison
    PLANS,
  };
}

export default usePlan;
