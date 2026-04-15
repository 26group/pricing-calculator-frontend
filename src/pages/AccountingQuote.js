import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';
import { calculateGoldMonthlyPricing } from '../utils/calculateGoldPricing';
import { calculateComplianceOnlyPrice } from '../utils/pricingCalculator';
import { createPrice, updatePrice } from '../services/priceApi';

const formatCurrency = (amount) =>
  amount == null
    ? 'N/A'
    : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CheckMark = () => <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />;

const NotIncluded = () => <CancelIcon sx={{ color: '#e0e0e0', fontSize: 28 }} />;

export default function AccountingQuote() {
  const navigate = useNavigate();
  const questionsPricing = useSelector((state) => state.responses?.questionsPricing || 0);
  const serviceCatalogPricing = useSelector((state) => state.responses?.serviceCatalogPricing || 0);
  const questionResponses = useSelector((state) => state.responses || {});
  const serviceSelections = useSelector((state) => state.responses?.serviceSelections || {});
  const questionsOnceOffFee = useSelector((state) => state.responses?.questionsOnceOffFee || 0);
  const serviceCatalogOnceOffFee = useSelector((state) => state.responses?.serviceCatalogOnceOffFee || 0);
  const clientName = useSelector((state) => state.responses?.clientName || '');
  const activePriceId = useSelector((state) => state.responses?.activePriceId);

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [clientNameInput, setClientNameInput] = useState(clientName);
  const [revenueSegment, setRevenueSegment] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  const autoSaveTimerRef = useRef(null);

  // Bronze only includes compliance (tax services) pricing
  const bronzeMonthly = calculateComplianceOnlyPrice(questionResponses);
  const silverMonthly = questionsPricing + serviceCatalogPricing;
  const goldMonthly = calculateGoldMonthlyPricing();

  // Auto-save pricing values to existing price record
  const autoSavePricing = useCallback(async () => {
    if (!activePriceId) return;
    try {
      setAutoSaveStatus('saving');
      const revenueSegmentValue = questionResponses?.q1 || undefined;
      await updatePrice(activePriceId, {
        priceType: 'accounting',
        questionsPricing,
        questionsOnceOffFee,
        serviceCatalogPricing,
        serviceCatalogOnceOffFee,
        serviceSelections,
        bronzeMonthly,
        silverMonthly,
        goldMonthly,
        totalMonthly: silverMonthly,
        totalOnceOff: questionsOnceOffFee + serviceCatalogOnceOffFee,
        revenueSegment: revenueSegmentValue,
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save pricing failed:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [activePriceId, questionsPricing, questionsOnceOffFee, serviceCatalogPricing, serviceCatalogOnceOffFee, serviceSelections, questionResponses, bronzeMonthly, silverMonthly, goldMonthly]);

  useEffect(() => {
    if (!activePriceId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => autoSavePricing(), 1500);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [activePriceId, autoSavePricing]);

  // Set revenue segment from Q1 response
  useEffect(() => {
    if (questionResponses?.q1) {
      setRevenueSegment(questionResponses.q1);
    }
  }, [questionResponses?.q1]);

  // =================== CHECK SERVICE CATEGORIES ===================

  // Q1: Tax Services - Individual returns, Business returns, SMSF, FBT, BAS, IAS, TPAR
  const hasTaxServices =
    (questionResponses.q2 && parseInt(questionResponses.q2, 10) > 0) || // Individual returns
    (questionResponses.q3 && parseInt(questionResponses.q3, 10) > 0) || // Business returns
    (questionResponses.q4 === 'yes') || // SMSF
    (questionResponses.q5 === 'yes') || // FBT
    (questionResponses.q6 && questionResponses.q6 !== 'no') || // BAS
    (questionResponses.q7 === 'yes') || // IAS
    (questionResponses.q8 && parseInt(questionResponses.q8, 10) > 0); // TPAR

  // Q2: Payroll Services - Workers Comp, Payroll Processing, Payroll Tax, Super, STP, LSL
  const hasPayrollServices =
    (questionResponses.q9 === 'yes') || // Workers Comp
    (questionResponses.q10 && (questionResponses.q10.salaryEmployees > 0 || questionResponses.q10.timesheetEmployees > 0)) || // Payroll
    (questionResponses.q11 === 'yes') || // Payroll Tax
    (questionResponses.q12 && questionResponses.q12 !== 'no') || // Super
    (questionResponses.q13 && questionResponses.q13 !== 'no') || // STP
    (questionResponses.q14 === 'yes'); // LSL

  // Q3: Advisory Services - Tax Planning, Tax Structuring, Xero Setup, Xero Training
  const hasAdvisoryServices =
    (questionResponses.q15 === 'yes') || // Tax Planning
    (questionResponses.q16 === 'yes') || // Tax Structuring
    (questionResponses.q17 === 'yes') || // Xero Setup
    (questionResponses.q17a === 'yes') || // Xero Training (initial)
    (questionResponses.q17b === 'yes'); // Xero Training (ongoing)

  // Q4: Reporting - Financial Statements, Statutory, Management
  const hasReporting =
    (questionResponses.q18 === 'yes') || // Financial Statements for Tax
    (questionResponses.q19 === 'yes') || // Statutory Financial Statements
    (questionResponses.q20 && questionResponses.q20 !== 'no'); // Management Financial Statements

  // Get reporting frequency
  const getReportingFrequency = () => {
    if (questionResponses.q20 === 'monthly') return 'Monthly';
    if (questionResponses.q20 === 'quarterly') return 'Quarterly';
    return null;
  };

  // Q5: Meetings - Review Numbers, Annual Tax, Business Meetings
  const hasMeetings =
    (questionResponses.q21 && questionResponses.q21 !== 'no') || // Review Numbers
    (questionResponses.q22 === 'yes') || // Annual Tax Meetings
    (questionResponses.q23 && questionResponses.q23 !== 'no'); // Business Meetings

  // Get meetings frequency
  const getMeetingsFrequency = () => {
    if (questionResponses.q21 === 'monthly' || questionResponses.q23 === 'monthly') return 'Monthly';
    if (questionResponses.q21 === 'quarterly' || questionResponses.q23 === 'quarterly') return 'Quarterly';
    return null;
  };

  // Q6: Support Services
  const hasSupportServices =
    questionResponses.q24 === 'yes' || // Team/Email Support
    questionResponses.q24a === 'yes' || // CSM Support
    questionResponses.q24b === 'yes'; // Principal/Owner Support

  // Get support level text
  const getSupportText = () => {
    if (questionResponses.q24b === 'yes') {
      return (
        <Typography variant="body2">
          Principal & CSM
          <br />
          Same day response
        </Typography>
      );
    }
    if (questionResponses.q24a === 'yes') {
      return (
        <Typography variant="body2">
          Email & Phone
          <br />
          Team & CSM
        </Typography>
      );
    }
    if (questionResponses.q24 === 'yes') {
      return (
        <Typography variant="body2">
          Email Only
          <br />
          Team support
        </Typography>
      );
    }
    return null;
  };

  // Q7: Corporate Secretarial & ATO Plans
  const hasCorporateSecretarial =
    (questionResponses.q25 === 'yes') || // ASIC Annual Return
    (questionResponses.q25a && parseInt(questionResponses.q25a, 10) > 0) || // ASIC Form Lodgements
    (questionResponses.q26 && questionResponses.q26 !== 'none'); // ATO Payment Plans

  // Q8: Prior Year Lodgements
  const hasPriorYearLodgements =
    questionResponses.q27 && Object.values(questionResponses.q27).some(v => parseInt(v, 10) > 0);

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
      const revenueSegmentValue = questionResponses?.q1 || '';
      const priceData = {
        clientName: clientNameInput,
        priceType: 'accounting',
        revenueSegment: revenueSegmentValue,
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
      feature: 'Tax Services\nIndividual & business returns, BAS, IAS, SMSF, FBT, TPAR',
      bronze: hasTaxServices ? <CheckMark /> : <NotIncluded />,
      silver: hasTaxServices ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Payroll Services\nWorkers Comp, payroll processing, super, STP',
      bronze: hasPayrollServices ? <CheckMark /> : <NotIncluded />,
      silver: hasPayrollServices ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
    },
    {
      feature: 'Advisory Services\nTax planning, structuring advice, Xero setup & training',
      bronze: hasAdvisoryServices ? <CheckMark /> : <NotIncluded />,
      silver: <CheckMark />,
      gold: <CheckMark />,
    },
    {
      feature: 'Financial Reporting\nFinancial statements and management reports',
      bronze: hasReporting ? <Typography variant="body2">{getReportingFrequency() || 'Annually'}</Typography> : <NotIncluded />,
      silver: hasReporting ? <Typography variant="body2">{getReportingFrequency() || 'Quarterly'}</Typography> : <Typography variant="body2">Quarterly</Typography>,
      gold: <Typography variant="body2">Monthly</Typography>,
    },
    {
      feature: 'Meetings\nReview numbers, annual tax, business strategy',
      bronze: hasMeetings ? <Typography variant="body2">{getMeetingsFrequency() || 'Annually'}</Typography> : <NotIncluded />,
      silver: hasMeetings ? <Typography variant="body2">{getMeetingsFrequency() || 'Quarterly'}</Typography> : <Typography variant="body2">Quarterly</Typography>,
      gold: <Typography variant="body2">Monthly</Typography>,
    },
    {
      feature: 'Support Services\nAccess to our team for your questions',
      bronze: getSupportText() || <NotIncluded />,
      silver: getSupportText() || (
        <Typography variant="body2">
          Email & Phone
          <br />
          Team & CSM
        </Typography>
      ),
      gold: (
        <Typography variant="body2">
          Principal & CSM
          <br />
          Same day response
        </Typography>
      ),
    },
    {
      feature: 'Corporate Secretarial\nASIC returns, form lodgements, ATO payment plans',
      bronze: hasCorporateSecretarial ? <CheckMark /> : <NotIncluded />,
      silver: hasCorporateSecretarial ? <CheckMark /> : <NotIncluded />,
      gold: <CheckMark />,
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
        Accounting Quote for {clientName}
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
        Recommended accounting packages based on your requirements
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
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Monthly Price</TableCell>
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
            One-off Setup & Advisory Fees:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#002060' }}>
            {formatCurrency(questionsOnceOffFee + serviceCatalogOnceOffFee)}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Setup fees, prior year lodgements, and advisory services
        </Typography>
      </Paper>

      {/* Save Price Dialog */}
      <Dialog open={openSaveDialog} onClose={handleCloseSaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Save Accounting Quote</DialogTitle>
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
                <strong>One-off Fees:</strong>{' '}
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
