import React, { useMemo, useState, useEffect } from 'react';
import { Paper, Stack, Typography, TextField, IconButton, Tooltip, InputAdornment } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { getPriceOverride, setPriceOverride } from '../utils/priceOverrides';
import {
  getTaxReturnQuestionMonthlyContribution,
  taxReturnQuestionHasMonthlyValue,
} from '../utils/taxReturnPricingCalculator';

// Proposal-type dispatch for computing the formula (non-overridden) monthly
// contribution of a single question.
const getFormulaContribution = (proposalType, questionId, responses, pricingModifier) => {
  switch (proposalType) {
    case 'taxReturn':
      return getTaxReturnQuestionMonthlyContribution(questionId, responses, pricingModifier);
    case 'bookkeeping': {
      // Lazy import to avoid circular dep issues at module load
      // eslint-disable-next-line global-require
      const { getBookkeepingQuestionMonthlyContribution } = require('../utils/bookkeepingPricingCalculator');
      return getBookkeepingQuestionMonthlyContribution(questionId, responses, pricingModifier);
    }
    case 'accounting': {
      // eslint-disable-next-line global-require
      const { getAccountingQuestionMonthlyContribution } = require('../utils/pricingCalculator');
      return getAccountingQuestionMonthlyContribution(questionId, responses, pricingModifier);
    }
    default:
      return 0;
  }
};

const hasFormulaValue = (proposalType, questionId, responses, pricingModifier) => {
  if (proposalType === 'taxReturn') {
    return taxReturnQuestionHasMonthlyValue(questionId, responses, pricingModifier);
  }
  return getFormulaContribution(proposalType, questionId, responses, pricingModifier) > 0;
};

const formatDollars = (n) => {
  if (!Number.isFinite(n)) return '';
  return n.toFixed(2);
};

/**
 * Compact editable input for a single question's monthly dollar contribution.
 * Renders nothing when the question doesn't currently produce a value AND has
 * no existing override — so it disappears for unanswered / no-value questions.
 */
export default function PriceOverrideField({
  proposalType,
  questionId,
  responses,
  setResponses,
  pricingModifier,
  label = 'Monthly value',
}) {
  const override = getPriceOverride(responses, 'monthly', questionId);
  const hasOverride = override !== null;

  const formulaValue = useMemo(
    () => getFormulaContribution(proposalType, questionId, responses, pricingModifier),
    [proposalType, questionId, responses, pricingModifier],
  );

  const shouldRender = hasFormulaValue(proposalType, questionId, responses, pricingModifier) || hasOverride;

  // Local input state so typing feels responsive; commit on blur / Enter.
  const displayValue = hasOverride ? override : formulaValue;
  const [draft, setDraft] = useState(formatDollars(displayValue));

  useEffect(() => {
    setDraft(formatDollars(displayValue));
  }, [displayValue]);

  if (!shouldRender) return null;

  const commit = () => {
    const trimmed = (draft || '').trim();
    if (trimmed === '' || trimmed === formatDollars(formulaValue)) {
      // Empty or same as formula → clear override
      if (hasOverride) {
        setResponses((prev) => setPriceOverride(prev, 'monthly', questionId, null));
      }
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      // Reset to displayed value on invalid input
      setDraft(formatDollars(displayValue));
      return;
    }
    setResponses((prev) => setPriceOverride(prev, 'monthly', questionId, parsed));
  };

  const handleReset = () => {
    setResponses((prev) => setPriceOverride(prev, 'monthly', questionId, null));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: '10px',
        backgroundColor: hasOverride ? '#fff8e1' : '#f6f8fb',
        border: hasOverride ? '1px solid #f0c76a' : '1px solid #e4e8ef',
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: hasOverride ? '#8a6d1f' : '#5b6b7d' }}>
          {hasOverride ? <LockIcon sx={{ fontSize: 16 }} /> : <LockOpenIcon sx={{ fontSize: 16 }} />}
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
            {label}
          </Typography>
        </Stack>
        <TextField
          size="small"
          variant="outlined"
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.target.blur();
            }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}>$</InputAdornment>,
            inputProps: { min: 0, step: '0.01', style: { padding: '4px 6px', fontSize: '0.85rem' } },
          }}
          sx={{
            width: 140,
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-root': { borderRadius: '6px' },
          }}
        />
        {hasOverride && (
          <Tooltip title={`Reset to calculated value ($${formatDollars(formulaValue)})`}>
            <IconButton size="small" onClick={handleReset} sx={{ color: '#8a6d1f' }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Typography variant="caption" sx={{ color: '#8a94a6', ml: 'auto' }}>
          {hasOverride
            ? `Custom · calculated $${formatDollars(formulaValue)}`
            : 'Auto-calculated. Edit to override.'}
        </Typography>
      </Stack>
    </Paper>
  );
}
