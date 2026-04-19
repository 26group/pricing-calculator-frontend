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
import { calculateBookkeepingBronzePrice, calculateBookkeepingSilverPrice, calculateBookkeepingGoldPrice, calculateBookkeepingOnceOffFee, getBookkeepingOnceOffBreakdown } from '../utils/bookkeepingPricingCalculator';

// Helper components
const CheckMark = () => <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
const NotIncluded = () => <CancelIcon sx={{ color: '#e0e0e0', fontSize: 20 }} />;

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

  // Calculate pricing from bookkeeping responses with modifier using tier-specific calculators
  const bronzeMonthly = calculateBookkeepingBronzePrice(bookkeepingResponses, bookkeepingPricingModifier);
  const silverMonthly = calculateBookkeepingSilverPrice(bookkeepingResponses, bookkeepingPricingModifier);
  const goldMonthly = calculateBookkeepingGoldPrice(bookkeepingResponses, bookkeepingPricingModifier);
  const onceOffPricing = calculateBookkeepingOnceOffFee(bookkeepingResponses, bookkeepingPricingModifier);
  const onceOffBreakdown = getBookkeepingOnceOffBreakdown(bookkeepingResponses, bookkeepingPricingModifier);

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
        questionsPricing: silverMonthly,
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
  }, [activePriceId, bookkeepingResponses, onceOffPricing, bronzeMonthly, silverMonthly, goldMonthly]);

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
        questionsPricing: silverMonthly,
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
    // PAYROLL SERVICES CATEGORY
    { feature: 'Payroll Services', isCategory: true },
    { feature: 'Salaried Employees', bronze: hasPayroll ? <CheckMark /> : <NotIncluded />, silver: hasPayroll ? <CheckMark /> : <NotIncluded />, gold: hasPayroll ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Timesheet Employees', bronze: hasPayroll ? <CheckMark /> : <NotIncluded />, silver: hasPayroll ? <CheckMark /> : <NotIncluded />, gold: hasPayroll ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Super Prep & Lodgement', bronze: (bookkeepingResponses.q6 && bookkeepingResponses.q6 !== 'no') ? <CheckMark /> : <NotIncluded />, silver: (bookkeepingResponses.q6 && bookkeepingResponses.q6 !== 'no') ? <CheckMark /> : <NotIncluded />, gold: (bookkeepingResponses.q6 && bookkeepingResponses.q6 !== 'no') ? <CheckMark /> : <NotIncluded /> },
    { feature: 'STP Reporting', bronze: (bookkeepingResponses.q7 && bookkeepingResponses.q7 !== 'no') ? <CheckMark /> : <NotIncluded />, silver: (bookkeepingResponses.q7 && bookkeepingResponses.q7 !== 'no') ? <CheckMark /> : <NotIncluded />, gold: (bookkeepingResponses.q7 && bookkeepingResponses.q7 !== 'no') ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Workers Compensation', bronze: bookkeepingResponses.q8 === 'yes' ? <CheckMark /> : <NotIncluded />, silver: bookkeepingResponses.q8 === 'yes' ? <CheckMark /> : <NotIncluded />, gold: bookkeepingResponses.q8 === 'yes' ? <CheckMark /> : <NotIncluded /> },
    
    // BOOKKEEPING SERVICES CATEGORY
    { feature: 'Bookkeeping Services', isCategory: true },
    { feature: 'Bank & CC Transactions', bronze: hasTransactions ? <CheckMark /> : <NotIncluded />, silver: hasTransactions ? <CheckMark /> : <NotIncluded />, gold: hasTransactions ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Multi-Line Transactions', bronze: (bookkeepingResponses.q10 && bookkeepingResponses.q10.invoices) ? <CheckMark /> : <NotIncluded />, silver: (bookkeepingResponses.q10 && bookkeepingResponses.q10.invoices) ? <CheckMark /> : <NotIncluded />, gold: (bookkeepingResponses.q10 && bookkeepingResponses.q10.invoices) ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Accounts Payable', bronze: hasAccountsPayable ? <CheckMark /> : <NotIncluded />, silver: hasAccountsPayable ? <CheckMark /> : <NotIncluded />, gold: hasAccountsPayable ? <CheckMark /> : <NotIncluded /> },
    
    // ACCOUNTS RECEIVABLE CATEGORY
    { feature: 'Accounts Receivable', isCategory: true },
    { feature: 'Single Line Invoices', bronze: hasAccountsReceivable ? <CheckMark /> : <NotIncluded />, silver: hasAccountsReceivable ? <CheckMark /> : <NotIncluded />, gold: hasAccountsReceivable ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Multi-Line AR Invoices', bronze: (bookkeepingResponses.q15 && bookkeepingResponses.q15.invoices) ? <CheckMark /> : <NotIncluded />, silver: (bookkeepingResponses.q15 && bookkeepingResponses.q15.invoices) ? <CheckMark /> : <NotIncluded />, gold: (bookkeepingResponses.q15 && bookkeepingResponses.q15.invoices) ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Debtor Management', bronze: <NotIncluded />, silver: hasDebtorManagement ? <CheckMark /> : <NotIncluded />, gold: hasDebtorManagement ? <CheckMark /> : <NotIncluded /> },
    
    // COMPLIANCE LODGEMENTS CATEGORY
    { feature: 'Compliance Lodgements', isCategory: true },
    { feature: 'TPAR', bronze: bookkeepingResponses.q12 === 'yes' ? <CheckMark /> : <NotIncluded />, silver: bookkeepingResponses.q12 === 'yes' ? <CheckMark /> : <NotIncluded />, gold: bookkeepingResponses.q12 === 'yes' ? <CheckMark /> : <NotIncluded /> },
    { feature: 'LSL Construction', bronze: bookkeepingResponses.q13 === 'yes' ? <CheckMark /> : <NotIncluded />, silver: bookkeepingResponses.q13 === 'yes' ? <CheckMark /> : <NotIncluded />, gold: bookkeepingResponses.q13 === 'yes' ? <CheckMark /> : <NotIncluded /> },
    { feature: 'BAS/IAS Lodgements', bronze: hasCompliance ? <CheckMark /> : <NotIncluded />, silver: hasCompliance ? <CheckMark /> : <NotIncluded />, gold: hasCompliance ? <CheckMark /> : <NotIncluded /> },
    
    // REPORTING CATEGORY
    { feature: 'Reporting', isCategory: true },
    { feature: 'Financial Reports', bronze: <NotIncluded />, silver: hasReporting ? <Typography variant="body2">Quarterly</Typography> : <NotIncluded />, gold: hasReporting ? <Typography variant="body2">Monthly</Typography> : <NotIncluded /> },
    { feature: 'Management Meetings', bronze: <NotIncluded />, silver: hasMeetings ? <Typography variant="body2">Quarterly</Typography> : <NotIncluded />, gold: hasMeetings ? <Typography variant="body2">Monthly</Typography> : <NotIncluded /> },
    
    // EOFY CATEGORY
    { feature: 'Year End', isCategory: true },
    { feature: 'EOFY Workpapers', bronze: hasEOFY ? <CheckMark /> : <NotIncluded />, silver: hasEOFY ? <CheckMark /> : <NotIncluded />, gold: hasEOFY ? <CheckMark /> : <NotIncluded /> },
    
    // SUPPORT SERVICES CATEGORY (hard-coded per tier)
    { feature: 'Support Services', isCategory: true },
    { feature: 'Team / Email Support', bronze: <CheckMark />, silver: <NotIncluded />, gold: <NotIncluded /> },
    { feature: 'Client Service Manager', bronze: <NotIncluded />, silver: <CheckMark />, gold: <NotIncluded /> },
    { feature: 'Principal / Owner', bronze: <NotIncluded />, silver: <NotIncluded />, gold: <CheckMark /> },
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
                  Service Category
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Bronze
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                    Compliance essentials
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Silver
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                    Stay informed & compliant
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  Gold
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                    Full service & advisory
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pricingRows.map((row, index) => (
                row.isCategory ? (
                  <TableRow 
                    key={index} 
                    sx={{ backgroundColor: '#e8eef4' }}
                  >
                    <TableCell 
                      colSpan={4}
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.85rem',
                        py: 0.5,
                      }}
                    >
                      {row.feature}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow 
                    key={index} 
                    sx={{ '&:hover': { backgroundColor: '#fafafa' } }}
                  >
                    <TableCell 
                      sx={{ 
                        fontSize: '0.8rem',
                        pl: 3,
                        py: 0.25,
                        color: 'text.secondary',
                      }}
                    >
                      {row.feature}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.25 }}>{row.bronze}</TableCell>
                    <TableCell align="center" sx={{ py: 0.25 }}>{row.silver}</TableCell>
                    <TableCell align="center" sx={{ py: 0.25 }}>{row.gold}</TableCell>
                  </TableRow>
                )
              ))}
              <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', py: 1 }}>Monthly Price</TableCell>
                <TableCell align="center" sx={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#CD7F32', py: 1 }}>
                  {formatCurrency(bronzeMonthly)}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#757575', py: 1 }}>
                  {formatCurrency(silverMonthly)}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#DAA520', py: 1 }}>
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
        {onceOffBreakdown.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            {onceOffBreakdown.map((item, index) => (
              <Box
                key={index}
                sx={{
                  py: 0.75,
                  borderBottom: index < onceOffBreakdown.length - 1 ? '1px solid #e0e0e0' : 'none',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            No one-off fees for this quote
          </Typography>
        )}
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
