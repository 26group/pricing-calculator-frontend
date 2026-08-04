// Shared per-question price override helpers.
//
// Each proposal type (accounting, bookkeeping, tax return) supports the same
// override shape stored inside `responses._priceOverrides`:
//
//   responses._priceOverrides = {
//     monthly: { q4: 123.45, q17: 200, ... },  // absolute dollar values
//     onceOff: { q2:  850,  q25: 300, ... },  // absolute dollar values
//   }
//
// A missing / empty / non-numeric entry means "use the calculated formula".
// An override applies to whichever tier includes that question — the tier
// calculator subtracts the formula contribution and adds the override.

const OVERRIDE_KEY = '_priceOverrides';

const numOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Returns the override amount (in dollars) for a given question / kind, or
 * `null` if no override is set.
 * @param {Object} responses - the full responses object
 * @param {'monthly' | 'onceOff'} kind
 * @param {string} questionId
 * @returns {number | null}
 */
export const getPriceOverride = (responses, kind, questionId) => {
  const bucket = responses?.[OVERRIDE_KEY]?.[kind];
  if (!bucket) return null;
  return numOrNull(bucket[questionId]);
};

/**
 * Returns a new responses object with the specified override applied.
 * Passing `null` or `''` clears the override.
 */
export const setPriceOverride = (responses, kind, questionId, value) => {
  const overrides = { ...(responses?.[OVERRIDE_KEY] || {}) };
  const bucket = { ...(overrides[kind] || {}) };
  if (value === '' || value === null || value === undefined) {
    delete bucket[questionId];
  } else {
    bucket[questionId] = value;
  }
  overrides[kind] = bucket;
  // Prune empty buckets so we don't persist noise
  if (Object.keys(bucket).length === 0) delete overrides[kind];
  const next = { ...responses };
  if (Object.keys(overrides).length === 0) {
    delete next[OVERRIDE_KEY];
  } else {
    next[OVERRIDE_KEY] = overrides;
  }
  return next;
};

/**
 * Adjusts a base tier total by applying any monthly overrides against the
 * formula contribution for each question. The caller supplies the map of
 * per-question formula contributions for the tier being adjusted.
 *
 * @param {number} baseTotal - tier total computed by the existing formula (post-multiplier, rounded or not)
 * @param {Object} formulaContributionsInTier - { qId: dollarValue } post-multiplier
 * @param {Object} responses - full responses object
 * @param {'monthly'|'onceOff'} kind
 * @returns {number} adjusted total (rounded to 2dp)
 */
export const applyPriceOverrides = (baseTotal, formulaContributionsInTier, responses, kind = 'monthly') => {
  const overrides = responses?.[OVERRIDE_KEY]?.[kind] || {};
  let total = baseTotal;
  Object.entries(overrides).forEach(([qId, override]) => {
    const overrideNum = numOrNull(override);
    if (overrideNum === null) return;
    const formulaContrib = numOrNull(formulaContributionsInTier?.[qId]);
    if (formulaContrib === null) return; // Question not in this tier — override has no effect
    if (formulaContrib === 0) return; // Question in tier but contributing nothing — skip so overrides can't materialise unused items
    total = total - formulaContrib + overrideNum;
  });
  return Math.round(total * 100) / 100;
};

export const PRICE_OVERRIDES_KEY = OVERRIDE_KEY;
