import { serviceValuesAccounting } from '../constants/accountingServicesValues';

export const calculateGoldMonthlyPricing = () => {
  let total = 0;

  // Iterate through all categories except revenueSegments
  Object.entries(serviceValuesAccounting).forEach(([categoryKey, categoryValue]) => {
    if (categoryKey === 'revenueSegments') return;

    // Iterate through all services in the category
    Object.entries(categoryValue).forEach(([serviceKey, serviceData]) => {
      if (!serviceData || typeof serviceData !== 'object') return;

      // Handle direct monthly values (for services that are objects with monthly property directly)
      if (serviceData.monthly && typeof serviceData.monthly === 'number') {
        total += serviceData.monthly;
      }

      // Handle nested segment values (micro, small, medium, large, etc.)
      Object.entries(serviceData).forEach(([segmentKey, segmentData]) => {
        if (
          segmentKey !== 'code' &&
          segmentKey !== 'monthly' &&
          segmentKey !== 'yearly' &&
          segmentKey !== 'quantity' &&
          segmentKey !== 'inclusion' &&
          segmentData &&
          typeof segmentData === 'object' &&
          segmentData.monthly &&
          typeof segmentData.monthly === 'number'
        ) {
          total += segmentData.monthly;
        }
      });
    });
  });

  return Math.round(total * 100) / 100;
};
