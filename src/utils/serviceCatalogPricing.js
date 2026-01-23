import { segmentForServices } from '../pages/Questions';

/**
 * Resolves a service value based on segment
 * @param {Object} serviceEntry - The service entry from the catalog
 * @param {string} revenueSelection - The revenue segment selection
 * @returns {Object|undefined} The resolved service value
 */
export const resolveServiceValue = (serviceEntry, revenueSelection) => {
  if (!serviceEntry) return undefined;

  if (serviceEntry.code) {
    return serviceEntry;
  }

  const normalizedSegment = segmentForServices(revenueSelection);
  if (normalizedSegment && serviceEntry[normalizedSegment]) {
    return serviceEntry[normalizedSegment];
  }

  if (revenueSelection && serviceEntry[revenueSelection]) {
    return serviceEntry[revenueSelection];
  }

  const potentialEntries = Object.entries(serviceEntry);
  const segmentKeys = ['micro', 'small', 'medium', 'large', 'enterprise'];
  const hasSegmentKeys = potentialEntries.some(([key]) => segmentKeys.includes(key));
  if (hasSegmentKeys) {
    return undefined;
  }

  const fallback = potentialEntries.find(([, value]) => value && typeof value === 'object' && value.code);
  return fallback ? fallback[1] : undefined;
};

/**
 * Calculates total monthly pricing for ServiceCatalog selections
 * @param {Object} serviceSelections - Service selections (id => 'yes'/'no')
 * @param {Object} catalog - Catalog structure with items and serviceEntry
 * @param {string} revenueSelection - Revenue segment
 * @returns {number} Total monthly cost
 */
export const calculateServiceCatalogTotalMonthly = (serviceSelections, catalog, revenueSelection) => {
  if (!serviceSelections || !catalog) {
    return 0;
  }

  let total = 0;

  catalog.forEach((category) => {
    category.items.forEach((item) => {
      const selection = serviceSelections[item.id];
      if (selection === 'yes') {
        const resolvedService = resolveServiceValue(item.serviceEntry, revenueSelection);
        if (resolvedService && resolvedService.monthly) {
          total += resolvedService.monthly;
        }
      }
    });
  });

  return Math.round(total * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculates total once-off (yearly) pricing for ServiceCatalog selections
 * @param {Object} serviceSelections - Service selections (id => 'yes'/'no')
 * @param {Object} catalog - Catalog structure with items and serviceEntry
 * @param {string} revenueSelection - Revenue segment
 * @returns {number} Total once-off cost
 */
export const calculateServiceCatalogTotalOnceOff = (serviceSelections, catalog, revenueSelection) => {
  if (!serviceSelections || !catalog) {
    return 0;
  }

  let total = 0;

  catalog.forEach((category) => {
    category.items.forEach((item) => {
      const selection = serviceSelections[item.id];
      if (selection === 'yes') {
        const resolvedService = resolveServiceValue(item.serviceEntry, revenueSelection);
        if (resolvedService && resolvedService.yearly) {
          total += resolvedService.yearly;
        }
      }
    });
  });

  return Math.round(total * 100) / 100; // Round to 2 decimal places
};
