// Revenue segment labels for display
export const REVENUE_SEGMENT_LABELS = {
  micro: '< $250K',
  small: '$250K - $500K',
  medium: '$500K - $1M',
  large: '$1M - $3M',
  enterprise: '$3M plus',
  unknown: '—',
};

export const getRevenueSegmentLabel = (value) => {
  return REVENUE_SEGMENT_LABELS[value] || value;
};
