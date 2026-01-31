import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useSelector } from 'react-redux';
import { calculateGoldMonthlyPricing } from '../utils/calculateGoldPricing';
import { createPrice } from '../services/priceApi';

const formatCurrency = (amount) =>
  amount == null
    ? 'N/A'
    : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CheckMark = () => <CheckIcon sx={{ color: '#4caf50', fontWeight: 'bold' }} />;

const NotIncluded = () => (
  <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
    not included
  </Typography>
);

export default function PricingQuote() {
  const questionsPricing = useSelector((state) => state.responses?.questionsPricing || 0);
  const serviceCatalogPricing = useSelector((state) => state.responses?.serviceCatalogPricing || 0);
  const questionResponses = useSelector((state) => state.responses || {});
  const serviceSelections = useSelector((state) => state.responses?.serviceSelections || {});
  const questionsOnceOffFee = useSelector((state) => state.responses?.questionsOnceOffFee || 0);
  const serviceCatalogOnceOffFee = useSelector((state) => state.responses?.serviceCatalogOnceOffFee || 0);
  const clientName = useSelector((state) => state.responses?.clientName || '');

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [clientNameInput, setClientNameInput] = useState(clientName);
  const [revenueSegment, setRevenueSegment] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const bronzeMonthly = questionsPricing + serviceCatalogPricing;
  const silverMonthly = questionsPricing + serviceCatalogPricing;
  const goldMonthly = calculateGoldMonthlyPricing();

  // Debug logging
  console.log('PricingQuote - questionsPricing:', questionsPricing, 'questionsOnceOffFee:', questionsOnceOffFee, 'bronzeMonthly:', bronzeMonthly);
  console.log('PricingQuote - Full Redux state questionResponses:', questionResponses);
  console.log('PricingQuote - q4 value:', questionResponses.q4, 'q7 value:', questionResponses.q7);

  // Check if tax services are included (based on q4, q5, q6, q16, q17)
  const hasTaxServices =
    (questionResponses.q4 && questionResponses.q4 !== 'no') ||
    (questionResponses.q5 && questionResponses.q5 !== 'no') ||
    (questionResponses.q6 && questionResponses.q6 !== 'no') ||
    (questionResponses.q16 && questionResponses.q16 !== 'no') ||
    (questionResponses.q17 && questionResponses.q17 !== 'no');

  // Check if corporate secretarial services are included (based on q26)
  const hasCorporateSecretarial = questionResponses.q26 && questionResponses.q26 !== 'no';

  // Check if financial statement services are included (based on q20, q21, q22)
  const hasFinancialReports =
    (questionResponses.q20 && questionResponses.q20 !== 'no') ||
    (questionResponses.q21 && questionResponses.q21 !== 'no') ||
    (questionResponses.q22 && questionResponses.q22 !== 'no');

  // Check if tax planning services are included (based on q18, q19)
  const hasTaxPlanning =
    (questionResponses.q18 && questionResponses.q18 !== 'no') ||
    (questionResponses.q19 && questionResponses.q19 !== 'no');

  // Check if reporting services are included (based on q20, q21, q22)
  const hasReporting =
    (questionResponses.q20 && questionResponses.q20 !== 'no') ||
    (questionResponses.q21 && questionResponses.q21 !== 'no') ||
    (questionResponses.q22 && questionResponses.q22 !== 'no');

  // Determine reporting frequency (monthly takes precedence over quarterly)
  const reportingFrequency =
    questionResponses.q20 === 'monthly' || questionResponses.q21 === 'monthly' || questionResponses.q22 === 'monthly'
      ? 'Monthly'
      : questionResponses.q20 === 'quarterly' || questionResponses.q21 === 'quarterly' || questionResponses.q22 === 'quarterly'
      ? 'Quarterly'
      : null;

  // Check if business meetings services are included (based on q23, q24)
  const hasBusinessMeetings =
    (questionResponses.q23 && questionResponses.q23 !== 'no') ||
    (questionResponses.q24 && questionResponses.q24 !== 'no');

  // Determine business meetings frequency (monthly takes precedence over quarterly)
  const meetingsFrequency =
    questionResponses.q23 === 'monthly' || questionResponses.q24 === 'monthly'
      ? 'Monthly'
      : questionResponses.q23 === 'quarterly' || questionResponses.q24 === 'quarterly'
      ? 'Quarterly'
      : null;

  // Determine support level text based on q25 selection
  const getSupportText = (selection) => {
    switch (selection) {
      case 'emailTeam':
        return (
          <Typography variant="body2">
            Email the team
            <br />
            within 48 hr response
          </Typography>
        );
      case 'emailPhoneTeamCsm':
        return (
          <Typography variant="body2">
            Email and phone team
            <br />
            within 24 hr response
          </Typography>
        );
      case 'emailPhoneCsmOwner':
        return (
          <Typography variant="body2">
            Principal and team
            <br />
            same day
          </Typography>
        );
      default:
        return null;
    }
  };

  const supportText = getSupportText(questionResponses.q25);

  // Compliance is ticked only if tax services values are actually used in pricing
  const complianceBronze = hasTaxServices && questionsPricing > 0 ? <CheckMark /> : <NotIncluded />;
  const complianceSilver = hasTaxServices && questionsPricing > 0 ? <CheckMark /> : <NotIncluded />;
  const complianceGold = <CheckMark />; // Gold always includes all services

  const corporateSecretarialBronze = hasCorporateSecretarial ? <CheckMark /> : <NotIncluded />;
  const corporateSecretarialSilver = hasCorporateSecretarial ? <CheckMark /> : <NotIncluded />;
  const corporateSecretarialGold = <CheckMark />; // Gold always includes all services

  const handleOpenSaveDialog = () => {
    setSaveError('');
    setSaveSuccess('');
    setOpenSaveDialog(true);
  };

  const handleCloseSaveDialog = () => {
    setOpenSaveDialog(false);
    setClientNameInput(clientName);
    setRevenueSegment('');
    setNotes('');
    setSaveError('');
  };

  const handleSavePrice = async () => {
    if (!clientNameInput.trim()) {
      setSaveError('Please enter a client name');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const priceData = {
        clientName: clientNameInput,
        revenueSegment,
        notes,
        questionResponses,
        serviceSelections,
        questionsPricing,
        questionsOnceOffFee,
        serviceCatalogPricing,
        serviceCatalogOnceOffFee,
        bronzeMonthly,
        silverMonthly,
        goldMonthly,
        totalMonthly: silverMonthly,
        totalOnceOff: questionsOnceOffFee + serviceCatalogOnceOffFee,
      };

      await createPrice(priceData);
      setSaveSuccess('Price saved successfully!');
      setTimeout(() => {
        handleCloseSaveDialog();
      }, 2000);
    } catch (error) {
      setSaveError(
        error?.message || 'Failed to save price. Please check your connection and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const pricingRows = [
    {
      feature: 'Compliance\nTax returns done right and lodged on time',
      bronze: complianceBronze,
      silver: complianceSilver,
      gold: complianceGold,
    },
    {
      feature: 'Company Secretarial',
      bronze: corporateSecretarialBronze,
      silver: corporateSecretarialSilver,
      gold: corporateSecretarialGold,
    },
    {
      feature: 'Financial Reports\nAnnual financial statements for preparing tax returns and use with external parties like banks.',
      bronze: hasFinancialReports ? <CheckMark /> : <NotIncluded />,
      silver: hasFinancialReports ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Tax Planning\nAnnual estimating and planning for tax minimisation',
      bronze: hasTaxPlanning ? <CheckMark /> : <NotIncluded />,
      silver: <CheckMark />,
      gold: <CheckMark />,
    },
    {
      feature: 'Reporting\nWatch the numbers and know what\'s going on.',
      bronze: hasReporting ? <Typography variant="body2">{reportingFrequency}</Typography> : <NotIncluded />,
      silver: hasReporting ? <Typography variant="body2">{reportingFrequency}</Typography> : <Typography variant="body2">Quarterly</Typography>,
      gold: hasReporting ? <Typography variant="body2">{reportingFrequency}</Typography> : <Typography variant="body2">Monthly</Typography>,
    },
    {
      feature: 'Business Meetings\nTalk about the numbers, understand the numbers or make smart decisions',
      bronze: hasBusinessMeetings ? <Typography variant="body2">{meetingsFrequency}</Typography> : <NotIncluded />,
      silver: hasBusinessMeetings ? <Typography variant="body2">{meetingsFrequency}</Typography> : <Typography variant="body2">Quarterly</Typography>,
      gold: hasBusinessMeetings ? <Typography variant="body2">{meetingsFrequency}</Typography> : <Typography variant="body2">Monthly</Typography>,
    },
    {
      feature: 'Access and Support\nAsk us any time any questions we are here to partner with you',
      bronze: supportText || <NotIncluded />,
      silver: supportText || <NotIncluded />,
      gold: supportText || <NotIncluded />,
    },
  ];

  return (
    <Container sx={{ py: 4, pb: 12 }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
        Pricing Quote for {clientName}
      </Typography>
      <Typography variant="body1" sx={{ mb: 6, textAlign: 'center', color: 'text.secondary' }}>
        Recommended pricing plans based on your requirements
      </Typography>

      <Box sx={{ position: 'relative', mb: 4 }}>
        <TableContainer component={Paper} sx={{ userSelect: 'none' }}>
          <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', minWidth: '280px' }}>
                Packages
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Bronze
                <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                  Compliance sorted
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Silver
                <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                  Compliance and know what's going on
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Gold
                <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                  Achieve results via expert advice
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pricingRows.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                <TableCell sx={{ fontWeight: 500, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                  {row.feature}
                </TableCell>
                <TableCell align="center">{row.bronze}</TableCell>
                <TableCell align="center" sx={{ filter: 'blur(4px)' }}>{row.silver}</TableCell>
                <TableCell align="center" sx={{ filter: 'blur(4px)' }}>{row.gold}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Price</TableCell>
              <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#CD7F32' }}>
                {formatCurrency(bronzeMonthly)}
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#C0C0C0', filter: 'blur(4px)' }}>
                {formatCurrency(silverMonthly)}
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700', filter: 'blur(4px)' }}>
                {formatCurrency(goldMonthly)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </TableContainer>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '65%',
          right: '0',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#666', textAlign: 'center' }}>
            Additional pricing tiers
            <br />
            available with a Pro plan
          </Typography>
        </Box>
      </Box>

      {/* Once-off Price Section */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            One-off Setup Fees:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#002060' }}>
            {formatCurrency(questionsOnceOffFee + serviceCatalogOnceOffFee)}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Additional setup and advisory fees based on your requirements
        </Typography>
      </Paper>

      {/* Save Price Dialog */}
      <Dialog open={openSaveDialog} onClose={handleCloseSaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Save Pricing Quote</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}

          <TextField
            fullWidth
            label="Client Name"
            placeholder="Enter client name"
            value={clientNameInput}
            onChange={(e) => setClientNameInput(e.target.value)}
            disabled={isSaving}
            sx={{ mb: 2 }}
            required
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Revenue Segment</InputLabel>
            <Select
              value={revenueSegment}
              label="Revenue Segment"
              onChange={(e) => setRevenueSegment(e.target.value)}
              disabled={isSaving}
            >
              <MenuItem value="">Select a segment...</MenuItem>
              <MenuItem value="micro">Micro ({'<'} $200k)</MenuItem>
              <MenuItem value="small">Small ($200k - $1m)</MenuItem>
              <MenuItem value="medium">Medium ($1m - $10m)</MenuItem>
              <MenuItem value="large">Large ($10m - $100m)</MenuItem>
              <MenuItem value="enterprise">Enterprise ({'>='} $100m)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Notes"
            placeholder="Optional notes about this pricing quote"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSaving}
            multiline
            rows={3}
          />

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Quote Summary:
            </Typography>
            <Typography variant="body2">
              <strong>Bronze Monthly:</strong> {formatCurrency(bronzeMonthly)}
            </Typography>
            <Typography variant="body2">
              <strong>Silver Monthly:</strong> {formatCurrency(silverMonthly)}
            </Typography>
            <Typography variant="body2">
              <strong>Gold Monthly:</strong> {formatCurrency(goldMonthly)}
            </Typography>
            {(questionsOnceOffFee > 0 || serviceCatalogOnceOffFee > 0) && (
              <Typography variant="body2">
                <strong>One-off Setup Fees:</strong>{' '}
                {formatCurrency(questionsOnceOffFee + serviceCatalogOnceOffFee)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePrice}
            variant="contained"
            disabled={isSaving || !clientNameInput.trim()}
          >
            {isSaving ? <CircularProgress size={24} /> : 'Save Quote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
