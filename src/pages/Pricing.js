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
import { createPrice, getPrices } from '../services/priceApi';

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

export default function Pricing() {
  const questionsPricing = useSelector((state) => state.responses?.questionsPricing || 0);
  const serviceCatalogPricing = useSelector((state) => state.responses?.serviceCatalogPricing || 0);
  const questionResponses = useSelector((state) => state.responses || {});
  const serviceSelections = useSelector((state) => state.responses?.serviceSelections || {});
  const questionsOnceOffFee = useSelector((state) => state.responses?.questionsOnceOffFee || 0);
  const serviceCatalogOnceOffFee = useSelector((state) => state.responses?.serviceCatalogOnceOffFee || 0);

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [clientName, setClientName] = useState('');
  const [revenueSegment, setRevenueSegment] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const bronzeMonthly = questionsPricing;
  const silverMonthly = questionsPricing + serviceCatalogPricing;
  const goldMonthly = calculateGoldMonthlyPricing();

  // Check if tax services are included (based on q4, q5, q6, q16, q17)
  const hasTaxServices =
    (questionResponses.q4 && questionResponses.q4 !== 'no') ||
    (questionResponses.q5 && questionResponses.q5 !== 'no') ||
    (questionResponses.q6 && questionResponses.q6 !== 'no') ||
    (questionResponses.q16 && questionResponses.q16 !== 'no') ||
    (questionResponses.q17 && questionResponses.q17 !== 'no');

  // Check if corporate secretarial services are included (based on q26)
  const hasCorporateSecretarial = questionResponses.q26 && questionResponses.q26 !== 'no';

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
    setClientName('');
    setRevenueSegment('');
    setNotes('');
    setSaveError('');
  };

  const handleSavePrice = async () => {
    if (!clientName.trim()) {
      setSaveError('Please enter a client name');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const priceData = {
        clientName,
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
      bronze: <CheckMark />,
      silver: <CheckMark />,
      gold: <CheckMark />,
    },
    {
      feature: 'Tax Planning\nAnnual estimating and planning for tax minimisation',
      bronze: <NotIncluded />,
      silver: <CheckMark />,
      gold: <CheckMark />,
    },
    {
      feature: 'Reporting\nWatch the numbers and know what\'s going on.',
      bronze: <NotIncluded />,
      silver: <Typography variant="body2">Quarterly</Typography>,
      gold: <Typography variant="body2">Monthly</Typography>,
    },
    {
      feature: 'Business Meetings\nTalk about the numbers, understand the numbers or make smart decisions',
      bronze: <NotIncluded />,
      silver: <Typography variant="body2">Quarterly</Typography>,
      gold: <Typography variant="body2">Monthly</Typography>,
    },
    {
      feature: 'Access and Support\nAsk us any time any questions we are here to partner with you',
      bronze: (
        <Typography variant="body2">
          Email the team
          <br />
          within 48 hr response
        </Typography>
      ),
      silver: (
        <Typography variant="body2">
          Email and phone team
          <br />
          within 24 hr response
        </Typography>
      ),
      gold: (
        <Typography variant="body2">
          Principal and team
          <br />
          same day
        </Typography>
      ),
    },
  ];

  return (
    <Container sx={{ py: 4, pb: 12 }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
        Pricing Plans
      </Typography>
      <Typography variant="body1" sx={{ mb: 6, textAlign: 'center', color: 'text.secondary' }}>
        Choose the right plan for your accounting needs
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
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
                <TableCell align="center">{row.silver}</TableCell>
                <TableCell align="center">{row.gold}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Price</TableCell>
              <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#CD7F32' }}>
                {bronzeMonthly > 0 ? formatCurrency(bronzeMonthly) : '$197'}
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#C0C0C0' }}>
                {silverMonthly > 0 ? formatCurrency(silverMonthly) : '$397'}
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700' }}>
                {formatCurrency(goldMonthly)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info Section */}
      <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          How Our Pricing Works
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Bronze Plan:</strong> Compliance sorted - includes tax returns, company secretarial, and financial reports with email support.
          </Typography>
          <Typography variant="body2">
            <strong>Silver Plan:</strong> Compliance and know what's going on - adds tax planning, quarterly reporting and meetings, with phone support.
          </Typography>
          <Typography variant="body2">
            <strong>Gold Plan:</strong> Achieve results via expert advice - includes everything plus principal access, same-day support, and monthly meetings and reporting.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Note: Prices shown are monthly recurring charges. Additional one-time setup and advisory fees may apply based on your specific requirements.
          </Typography>
        </Stack>
      </Paper>

      {/* CTA Section */}
      <Stack direction="row" spacing={2} sx={{ mt: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="outlined" sx={{ borderColor: '#CD7F32', color: '#CD7F32' }}>
          Choose Bronze
        </Button>
        <Button variant="contained" sx={{ backgroundColor: '#C0C0C0' }}>
          Choose Silver
        </Button>
        <Button variant="contained" sx={{ backgroundColor: '#FFD700', color: '#333' }}>
          Choose Gold
        </Button>
      </Stack>

      {/* Save Price Button */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleOpenSaveDialog}
          sx={{ px: 4, py: 1.5 }}
        >
          Save This Price Calculation
        </Button>
      </Box>

      {/* Save Price Dialog */}
      <Dialog open={openSaveDialog} onClose={handleCloseSaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Save Price Calculation</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}

          <TextField
            fullWidth
            label="Client Name"
            placeholder="Enter client name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
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
            placeholder="Optional notes about this pricing"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSaving}
            multiline
            rows={3}
          />

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Summary:
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
            disabled={isSaving || !clientName.trim()}
          >
            {isSaving ? <CircularProgress size={24} /> : 'Save Price'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
