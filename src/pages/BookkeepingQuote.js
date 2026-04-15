import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createPrice, updatePrice } from '../services/priceApi';
import { calculateBookkeepingMonthlyPrice, calculateBookkeepingOnceOffFee } from '../utils/bookkeepingPricingCalculator';

// Helper components
const CheckMark = () => <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />;
const NotIncluded = () => <CancelIcon sx={{ color: '#e0e0e0', fontSize: 28 }} />;

const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function BookkeepingQuote() {
  const navigate = useNavigate();

  // Get bookkeeping responses from localStorage (since bookkeeping uses local state)
  const [bookkeepingResponses, setBookkeepingResponses] = useState({});
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bookkeeping_responses');
      if (stored) {
        setBookkeepingResponses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookkeeping responses:', error);
    }
  }, []);

  // Get Redux state
  const questionResponses = useSelector((state) => state.responses);
  const clientName = useSelector((state) => state.responses.clientName || 'Client');
  const activePriceId = useSelector((state) => state.responses.activePriceId);
  
  // Get bookkeeping pricing modifier from organisation
  const organisation = useSelector((state) => state.auth.organisation);
  const bookkeepingPricingModifier = organisation?.bookkeepingPricingModifier ?? 100;

  // Calculate pricing from bookkeeping responses with modifier
  const monthlyPricing = calculateBookkeepingMonthlyPrice(bookkeepingResponses, bookkeepingPricingModifier);
  const onceOffPricing = calculateBookkeepingOnceOffFee(bookkeepingResponses, bookkeepingPricingModifier);

  // Tier pricing (Bronze = base, Silver = +15%, Gold = +30%)
  const bronzeMonthly = monthlyPricing;
  const silverMonthly = Math.round(monthlyPricing * 1.15 * 100) / 100;
  const goldMonthly = Math.round(monthlyPricing * 1.30 * 100) / 100;

  // Dialog state
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [clientNameInput, setClientNameInput] = useState(clientName);
  const [revenueSegment, setRevenueSegment] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  const autoSaveTimerRef = useRef(null);

  // Auto-save functionality
  const autoSavePricing = useCallback(async () => {
    if (!activePriceId) return;
    setAutoSaveStatus('saving');
    try {
      const revenueSegmentValue = bookkeepingResponses?.q1 || '';
      const priceData = {
        priceType: 'bookkeeping',
        questionResponses: bookkeepingResponses,
        revenueSegment: revenueSegmentValue,
        questionsPricing: monthlyPricing,
        questionsOnceOffFee: onceOffPricing,
        bronzeMonthly,
        silverMonthly,
        goldMonthly,
        totalMonthly: silverMonthly,
        totalOnceOff: onceOffPricing,
      };
      await updatePrice(activePriceId, priceData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save pricing failed:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [activePriceId, bookkeepingResponses, monthlyPricing, onceOffPricing, bronzeMonthly, silverMonthly, goldMonthly]);

  useEffect(() => {
    if (!activePriceId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => autoSavePricing(), 1500);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [activePriceId, autoSavePricing]);

  // Set revenue segment from Q1 response
  useEffect(() => {
    if (bookkeepingResponses?.q1) {
      setRevenueSegment(bookkeepingResponses.q1);
    }
  }, [bookkeepingResponses?.q1]);

  // Check which services are included
  const hasPayroll = bookkeepingResponses.q3 === 'yes' || bookkeepingResponses.q3 === 'yesSetup';
  const hasTransactions = bookkeepingResponses.q9 && bookkeepingResponses.q9 !== 'no';
  const hasAccountsPayable = bookkeepingResponses.q11 && bookkeepingResponses.q11 !== 'no';
  const hasAccountsReceivable = bookkeepingResponses.q14 && bookkeepingResponses.q14 !== 'no';
  const hasDebtorManagement = bookkeepingResponses.q16 && bookkeepingResponses.q16 !== 'no';
  const hasReporting = bookkeepingResponses.q17 && bookkeepingResponses.q17 !== 'no';
  const hasMeetings = bookkeepingResponses.q18 && bookkeepingResponses.q18 !== 'no';
  const hasCompliance = bookkeepingResponses.q19 && 
    (bookkeepingResponses.q19.basQuarterly || bookkeepingResponses.q19.basMonthly || bookkeepingResponses.q19.ias);
  const hasEOFY = bookkeepingResponses.q21 && bookkeepingResponses.q21 !== 'no';

  // Get support level text
  const getSupportText = (selection) => {
    switch (selection) {
      case 'emailOnly':
        return (
          <Typography variant="body2">
            Email Only
            <br />
            Unlimited
          </Typography>
        );
      case 'emailPhoneTeamCsm':
        return (
          <Typography variant="body2">
            Email & Phone
            <br />
            Team & CSM
          </Typography>
        );
      case 'emailPhoneCsmOwner':
        return (
          <Typography variant="body2">
            Email & Phone
            <br />
            CSM & Owner
          </Typography>
        );
      default:
        return null;
    }
  };

  const supportText = getSupportText(bookkeepingResponses.q20);

  // Get reporting frequency
  const reportingFrequency = bookkeepingResponses.q17 === 'monthly' ? 'Monthly' : 
                             bookkeepingResponses.q17 === 'quarterly' ? 'Quarterly' : null;
  
  // Get meetings frequency
  const meetingsFrequency = bookkeepingResponses.q18 === 'monthly' ? 'Monthly' :
                            bookkeepingResponses.q18 === 'quarterly' ? 'Quarterly' : null;

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
      const revenueSegmentValue = bookkeepingResponses?.q1 || '';
      const priceData = {
        clientName: clientNameInput,
        priceType: 'bookkeeping',
        revenueSegment: revenueSegmentValue,
        notes,
        questionResponses: bookkeepingResponses,
        questionsPricing: monthlyPricing,
        questionsOnceOffFee: onceOffPricing,
        bronzeMonthly,
        silverMonthly,
        goldMonthly,
        totalMonthly: silverMonthly,
        totalOnceOff: onceOffPricing,
      };

      if (activePriceId) {
        await updatePrice(activePriceId, priceData);
        setSaveSuccess('Price saved successfully!');
        setTimeout(() => {
          handleCloseSaveDialog();
        }, 2000);
      } else {
        await createPrice(priceData);
        setSaveSuccess('Price saved successfully!');
        setTimeout(() => {
          handleCloseSaveDialog();
          navigate('/saved-prices');
        }, 1500);
      }
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
      feature: 'Payroll Services\nProcessing payroll and employee payments',
      bronze: hasPayroll ? <CheckMark /> : <NotIncluded />,
      silver: hasPayroll ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Bookkeeping\nTransaction processing and reconciliation',
      bronze: hasTransactions ? <CheckMark /> : <NotIncluded />,
      silver: hasTransactions ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Accounts Payable\nManaging supplier bills and payments',
      bronze: hasAccountsPayable ? <CheckMark /> : <NotIncluded />,
      silver: hasAccountsPayable ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Accounts Receivable\nInvoicing and payment collection',
      bronze: hasAccountsReceivable ? <CheckMark /> : <NotIncluded />,
      silver: hasAccountsReceivable ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Debtor Management\nChasing overdue invoices',
      bronze: hasDebtorManagement ? <CheckMark /> : <NotIncluded />,
      silver: hasDebtorManagement ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Financial Reports\nManagement reporting to track performance',
      bronze: hasReporting ? <Typography variant="body2">{reportingFrequency}</Typography> : <NotIncluded />,
      silver: hasReporting ? <Typography variant="body2">{reportingFrequency}</Typography> : <Typography variant="body2">Quarterly</Typography>,
      gold: hasReporting ? <Typography variant="body2">{reportingFrequency}</Typography> : <Typography variant="body2">Monthly</Typography>,
    },
    {
      feature: 'Management Meetings\nReview and discuss the numbers',
      bronze: hasMeetings ? <Typography variant="body2">{meetingsFrequency}</Typography> : <NotIncluded />,
      silver: hasMeetings ? <Typography variant="body2">{meetingsFrequency}</Typography> : <Typography variant="body2">Quarterly</Typography>,
      gold: hasMeetings ? <Typography variant="body2">{meetingsFrequency}</Typography> : <Typography variant="body2">Monthly</Typography>,
    },
    {
      feature: 'BAS/IAS Lodgements\nCompliance lodgements on time',
      bronze: hasCompliance ? <CheckMark /> : <NotIncluded />,
      silver: hasCompliance ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'EOFY Workpapers\nYear-end preparation for your accountant',
      bronze: hasEOFY ? <CheckMark /> : <NotIncluded />,
      silver: hasEOFY ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Access and Support\nAsk us any time, we are here to help',
      bronze: supportText || <NotIncluded />,
      silver: supportText || <NotIncluded />,
      gold: supportText || <NotIncluded />,
    },
  ];

  return (
    <Container sx={{ py: 4, pb: 12 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
        Bookkeeping Quote for {clientName}
      </Typography>
      <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
        {activePriceId && autoSaveStatus === 'saving' && (
          <Chip icon={<CloudUploadIcon />} label="Saving..." size="small" color="info" variant="outlined" />
        )}
        {activePriceId && autoSaveStatus === 'saved' && (
          <Chip icon={<CloudDoneIcon />} label="Saved" size="small" color="success" variant="outlined" />
        )}
        {activePriceId && autoSaveStatus === 'error' && (
          <Chip label="Save failed" size="small" color="error" variant="outlined" />
        )}
      </Stack>
      <Typography variant="body1" sx={{ mb: 6, textAlign: 'center', color: 'text.secondary' }}>
        Recommended bookkeeping pricing plans based on your requirements
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
                    Essential services
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Silver
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                    Enhanced support
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Gold
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                    Full service package
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
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Price (Monthly)</TableCell>
                <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#CD7F32' }}>
                  {formatCurrency(bronzeMonthly)}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#C0C0C0' }}>
                  {formatCurrency(silverMonthly)}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700' }}>
                  {formatCurrency(goldMonthly)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Once-off Price Section */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            One-off Setup Fees:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#002060' }}>
            {formatCurrency(onceOffPricing)}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Setup, cleanup, and training fees based on your requirements
        </Typography>
      </Paper>

      {/* Save Price Dialog */}
      <Dialog open={openSaveDialog} onClose={handleCloseSaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Save Bookkeeping Quote</DialogTitle>
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
              <MenuItem value="micro">Micro ({'<'} $250K)</MenuItem>
              <MenuItem value="small">Small ($250K - $500K)</MenuItem>
              <MenuItem value="medium">Medium ($500K - $1M)</MenuItem>
              <MenuItem value="large">Large ($1M - $3M)</MenuItem>
              <MenuItem value="enterprise">Enterprise ($3M+)</MenuItem>
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
            {onceOffPricing > 0 && (
              <Typography variant="body2">
                <strong>One-off Setup Fees:</strong> {formatCurrency(onceOffPricing)}
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
