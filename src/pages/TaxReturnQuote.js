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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createPrice, updatePrice } from '../services/priceApi';
import {
  calculateTaxReturnBronzePrice,
  calculateTaxReturnSilverPrice,
  calculateTaxReturnGoldPrice,
  calculateTaxReturnOnceOffFee,
  getTaxReturnOnceOffBreakdown,
  calculateTaxReturnUpfrontAnnualFee,
  getTaxReturnUpfrontAnnualBreakdown,
} from '../utils/taxReturnPricingCalculator';

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

export default function TaxReturnQuote() {
  const navigate = useNavigate();
  const [taxReturnResponses, setTaxReturnResponses] = useState({});

  // Load responses from localStorage and listen for changes
  useEffect(() => {
    const loadResponses = () => {
      try {
        const stored = localStorage.getItem('tax_return_responses');
        if (stored) {
          setTaxReturnResponses(JSON.parse(stored));
        }
      } catch {}
    };
    
    // Load initially
    loadResponses();
    
    // Also reload when window gains focus (user switches back to this tab/window)
    const handleFocus = () => loadResponses();
    window.addEventListener('focus', handleFocus);
    
    // Listen for storage events (if changed in another tab)
    const handleStorage = (e) => {
      if (e.key === 'tax_return_responses') {
        loadResponses();
      }
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const clientName = useSelector((state) => state.responses.clientName || 'Client');
  const activePriceId = useSelector((state) => state.responses.activePriceId);
  const organisation = useSelector((state) => state.auth.organisation);
  const pricingModifier = organisation?.pricingModifier ?? 200;

  const bronzeMonthly = calculateTaxReturnBronzePrice(taxReturnResponses, pricingModifier);
  const silverMonthly = calculateTaxReturnSilverPrice(taxReturnResponses, pricingModifier);
  const goldMonthly = calculateTaxReturnGoldPrice(taxReturnResponses, pricingModifier);
  // Once-off now includes both true once-off fees AND Upfront=YES recurring services
  // at their full annual amount (see calculateTaxReturnOnceOffFee).
  const onceOffPricing = calculateTaxReturnOnceOffFee(taxReturnResponses, pricingModifier);
  const onceOffBreakdown = getTaxReturnOnceOffBreakdown(taxReturnResponses, pricingModifier);
  // Retained for backwards compatibility with saved price records.
  const upfrontAnnualPricing = calculateTaxReturnUpfrontAnnualFee(taxReturnResponses, pricingModifier);
  const upfrontAnnualBreakdown = getTaxReturnUpfrontAnnualBreakdown(taxReturnResponses, pricingModifier);

  // Convert to annual prices
  const bronzeAnnual = bronzeMonthly * 12;
  const silverAnnual = silverMonthly * 12;
  const goldAnnual = goldMonthly * 12;

  // Merged single once-off figure (prior separate "upfront annual" is already
  // included in onceOffPricing).
  const totalOnceOffWithUpfront = onceOffPricing;

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [clientNameInput, setClientNameInput] = useState(clientName);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  const autoSaveTimerRef = useRef(null);

  const autoSavePricing = useCallback(async () => {
    if (!activePriceId) return;
    setAutoSaveStatus('saving');
    try {
      await updatePrice(activePriceId, {
        priceType: 'tax-return',
        questionResponses: taxReturnResponses,
        questionsPricing: silverMonthly,
        questionsOnceOffFee: onceOffPricing,
        upfrontAnnualFee: upfrontAnnualPricing,
        bronzeMonthly,
        silverMonthly,
        goldMonthly,
        totalMonthly: silverMonthly,
        totalOnceOff: onceOffPricing,
        totalOnceOffWithUpfront: totalOnceOffWithUpfront,
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [activePriceId, taxReturnResponses, onceOffPricing, upfrontAnnualPricing, totalOnceOffWithUpfront, bronzeMonthly, silverMonthly, goldMonthly]);

  useEffect(() => {
    if (!activePriceId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => autoSavePricing(), 1500);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [activePriceId, autoSavePricing]);

  const handleSavePrice = async () => {
    if (!clientNameInput.trim()) { setSaveError('Please enter a client name'); return; }
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const priceData = {
        clientName: clientNameInput,
        priceType: 'tax-return',
        notes,
        questionResponses: taxReturnResponses,
        questionsPricing: silverMonthly,
        questionsOnceOffFee: onceOffPricing,
        upfrontAnnualFee: upfrontAnnualPricing,
        bronzeMonthly,
        silverMonthly,
        goldMonthly,
        totalMonthly: silverMonthly,
        totalOnceOff: onceOffPricing,
        totalOnceOffWithUpfront: totalOnceOffWithUpfront,
      };
      if (activePriceId) {
        await updatePrice(activePriceId, priceData);
      } else {
        await createPrice(priceData);
      }
      setSaveSuccess('Price saved successfully!');
      setTimeout(() => {
        setOpenSaveDialog(false);
        setClientNameInput(clientName);
        setNotes('');
        setSaveError('');
      }, 1500);
    } catch (error) {
      setSaveError(error?.message || 'Failed to save price. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Determine which services were selected ───────────────────────────────
  // ID scheme matches the rebuilt taxReturnQuestions.js (q1 … q24)
  const r = taxReturnResponses;
  const pos = (v) => parseInt(v, 10) > 0;
  const incomeSel = r.q2 && r.q2 !== 'none';
  const cgtSel    = r.q3 && r.q3 !== 'none';
  const bizSel    = r.q4 && r.q4 !== 'none';
  const dedSel    = r.q5 && r.q5 !== 'none';

  const hasIndividualReturns = pos(r.q1);

  // Income items (shared delivery q2, individual counts)
  const hasDividends      = incomeSel && pos(r.q2_dividends);
  const hasInterest       = incomeSel && pos(r.q2_interest);
  const hasManagedFunds   = incomeSel && pos(r.q2_managedFunds);
  const hasRentalProperty = incomeSel && pos(r.q2_rentalProperty);

  // Capital gains (shared delivery q3)
  const hasCgtShares    = cgtSel && pos(r.q3_cgtShares);
  const hasCgtProperty  = cgtSel && pos(r.q3_cgtProperty);
  const hasBalancingAdj = cgtSel && pos(r.q3_balancingAdj);

  // Business schedules (shared delivery q4)
  const hasBusinessNoGst   = bizSel && pos(r.q4_noGst);
  const hasBusinessWithGst = bizSel && pos(r.q4_withGst);

  // Deductions (shared delivery q5)
  const hasDeductionsStd = dedSel && pos(r.q5_standard);
  const hasMotorLogBook  = dedSel && pos(r.q5_motorLogBook);
  const hasMotorCPK      = dedSel && pos(r.q5_motorCPK);

  // BAS & TPAR
  const hasBas  = r.q6 && r.q6 !== 'none' && r.q6_frequency;
  const hasTpar = r.q7 && r.q7 !== 'none';

  // Payroll
  const hasWorkersComp = r.q8 && r.q8 !== 'none';
  const hasSalaryPayroll = r.q9_salary && r.q9_salary !== 'none'
    && r.q9_salaryCounts && typeof r.q9_salaryCounts === 'object'
    && Object.values(r.q9_salaryCounts).some(pos);
  const hasTimesheetPayroll = r.q9_timesheet && r.q9_timesheet !== 'none'
    && r.q9_timesheetCounts && typeof r.q9_timesheetCounts === 'object'
    && Object.values(r.q9_timesheetCounts).some(pos);
  const hasSuper = r.q10 && r.q10 !== 'none' && r.q10_frequency;
  const hasStp   = r.q11 && r.q11 !== 'none' && r.q11_frequency;
  const hasLsl   = r.q12 && r.q12 !== 'none';

  // Advisory
  const hasTaxPlanning    = r.q13 && r.q13 !== 'none';
  const hasTaxStructuring = r.q14 === 'yes';

  // Meetings
  const hasAnnualTaxMeeting = r.q15 === 'yes';
  const hasAdviceMeeting    = r.q16 === 'yes';

  // ATO
  const hasAtoPayment = r.q17 && r.q17 !== 'none';

  // Xero
  const hasXeroSetup      = r.q18 === 'yes';
  const hasXeroTraining   = r.q19 && r.q19 !== 'none';
  const hasXeroSupport    = r.q20 && r.q20 !== 'none';
  const xeroSupportAdvanced = r.q20 === 'advanced';

  // Prior year & amendments
  const hasPriorYear    = r.q21 === 'yes';
  const hasAmendments   = r.q22 && r.q22 !== 'none';
  const hasReturnNotNec = r.q23 === 'yes';
  const hasFinalReturn  = r.q24 === 'yes';

  const pricingRows = [
    // ── TAX RETURNS ──────────────────────────────────────────────────────────
    { feature: 'Tax Returns', isCategory: true },
    {
      feature: 'Individual Tax Returns',
      bronze: hasIndividualReturns ? <CheckMark /> : <NotIncluded />,
      silver: hasIndividualReturns ? <CheckMark /> : <NotIncluded />,
      gold:   hasIndividualReturns ? <CheckMark /> : <NotIncluded />,
    },

    // ── INCOME ITEMS ─────────────────────────────────────────────────────────
    { feature: 'Income Items', isCategory: true },
    { feature: 'Dividends not reported to ATO', bronze: hasDividends ? <CheckMark /> : <NotIncluded />, silver: hasDividends ? <CheckMark /> : <NotIncluded />, gold: hasDividends ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Interest not reported to ATO',  bronze: hasInterest ? <CheckMark /> : <NotIncluded />,  silver: hasInterest ? <CheckMark /> : <NotIncluded />,  gold: hasInterest ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Managed Funds',                 bronze: hasManagedFunds ? <CheckMark /> : <NotIncluded />, silver: hasManagedFunds ? <CheckMark /> : <NotIncluded />, gold: hasManagedFunds ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Rental Property',               bronze: <NotIncluded />, silver: hasRentalProperty ? <CheckMark /> : <NotIncluded />, gold: hasRentalProperty ? <CheckMark /> : <NotIncluded /> },

    // ── CAPITAL GAINS ─────────────────────────────────────────────────────────
    { feature: 'Capital Gains', isCategory: true },
    { feature: 'CGT — Shares and equities', bronze: hasCgtShares ? <CheckMark /> : <NotIncluded />, silver: hasCgtShares ? <CheckMark /> : <NotIncluded />, gold: hasCgtShares ? <CheckMark /> : <NotIncluded /> },
    { feature: 'CGT — Property sales',      bronze: <NotIncluded />, silver: hasCgtProperty ? <CheckMark /> : <NotIncluded />, gold: hasCgtProperty ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Balancing adjustment',      bronze: <NotIncluded />, silver: hasBalancingAdj ? <CheckMark /> : <NotIncluded />, gold: hasBalancingAdj ? <CheckMark /> : <NotIncluded /> },

    // ── BUSINESS SCHEDULES ────────────────────────────────────────────────────
    { feature: 'Business Schedules', isCategory: true },
    { feature: 'Business Schedule — no GST',   bronze: <NotIncluded />, silver: hasBusinessNoGst ? <CheckMark /> : <NotIncluded />,   gold: hasBusinessNoGst ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Business Schedule — with GST', bronze: <NotIncluded />, silver: hasBusinessWithGst ? <CheckMark /> : <NotIncluded />, gold: hasBusinessWithGst ? <CheckMark /> : <NotIncluded /> },

    // ── DEDUCTIONS ────────────────────────────────────────────────────────────
    { feature: 'Deductions', isCategory: true },
    { feature: 'Deductions — more than 3 standard', bronze: hasDeductionsStd ? <CheckMark /> : <NotIncluded />, silver: hasDeductionsStd ? <CheckMark /> : <NotIncluded />, gold: hasDeductionsStd ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Motor Vehicle — log book',          bronze: hasMotorLogBook ? <CheckMark /> : <NotIncluded />,  silver: hasMotorLogBook ? <CheckMark /> : <NotIncluded />,  gold: hasMotorLogBook ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Motor Vehicle — Cents per km',      bronze: hasMotorCPK ? <CheckMark /> : <NotIncluded />,     silver: hasMotorCPK ? <CheckMark /> : <NotIncluded />,     gold: hasMotorCPK ? <CheckMark /> : <NotIncluded /> },

    // ── BAS & TPAR ────────────────────────────────────────────────────────────
    { feature: 'BAS & TPAR', isCategory: true },
    { feature: 'BAS',  bronze: <NotIncluded />, silver: hasBas ? <CheckMark /> : <NotIncluded />,  gold: hasBas ? <CheckMark /> : <NotIncluded /> },
    { feature: 'TPAR', bronze: <NotIncluded />, silver: hasTpar ? <CheckMark /> : <NotIncluded />, gold: hasTpar ? <CheckMark /> : <NotIncluded /> },

    // ── PAYROLL SERVICES ──────────────────────────────────────────────────────
    { feature: 'Payroll Services', isCategory: true },
    { feature: 'Workers Compensation',     bronze: hasWorkersComp ? <CheckMark /> : <NotIncluded />,      silver: hasWorkersComp ? <CheckMark /> : <NotIncluded />,      gold: hasWorkersComp ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Payroll — Salary',         bronze: <NotIncluded />, silver: hasSalaryPayroll ? <CheckMark /> : <NotIncluded />,    gold: hasSalaryPayroll ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Payroll — Timesheet',      bronze: <NotIncluded />, silver: hasTimesheetPayroll ? <CheckMark /> : <NotIncluded />, gold: hasTimesheetPayroll ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Super Prep & Lodgement',   bronze: <NotIncluded />, silver: hasSuper ? <CheckMark /> : <NotIncluded />, gold: hasSuper ? <CheckMark /> : <NotIncluded /> },
    { feature: 'STP Reporting',            bronze: <NotIncluded />, silver: hasStp ? <CheckMark /> : <NotIncluded />,   gold: hasStp ? <CheckMark /> : <NotIncluded /> },
    { feature: 'LSL Construction',         bronze: <NotIncluded />, silver: hasLsl ? <CheckMark /> : <NotIncluded />,   gold: hasLsl ? <CheckMark /> : <NotIncluded /> },

    // ── ADVISORY ──────────────────────────────────────────────────────────────
    { feature: 'Advisory Services', isCategory: true },
    { feature: 'Tax Planning / Review',    bronze: <NotIncluded />, silver: hasTaxPlanning ? <CheckMark /> : <NotIncluded />,    gold: hasTaxPlanning ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Tax Structuring Advice',   bronze: hasTaxStructuring ? <Typography variant="body2">Once-off</Typography> : <NotIncluded />, silver: <NotIncluded />, gold: <NotIncluded /> },

    // ── MEETINGS ──────────────────────────────────────────────────────────────
    { feature: 'Meetings', isCategory: true },
    { feature: 'Annual Tax Meeting', bronze: hasAnnualTaxMeeting ? <CheckMark /> : <NotIncluded />, silver: hasAnnualTaxMeeting ? <CheckMark /> : <NotIncluded />, gold: hasAnnualTaxMeeting ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Advice Meeting',     bronze: <NotIncluded />, silver: hasAdviceMeeting ? <CheckMark /> : <NotIncluded />, gold: hasAdviceMeeting ? <CheckMark /> : <NotIncluded /> },

    // ── XERO ──────────────────────────────────────────────────────────────────
    { feature: 'Xero', isCategory: true },
    { feature: 'Xero Setup',     bronze: hasXeroSetup ? <Typography variant="body2">Once-off</Typography> : <NotIncluded />,    silver: <NotIncluded />, gold: <NotIncluded /> },
    { feature: 'Xero Training',  bronze: hasXeroTraining ? <Typography variant="body2">Once-off</Typography> : <NotIncluded />, silver: <NotIncluded />, gold: <NotIncluded /> },
    { feature: 'Xero Support',   bronze: <NotIncluded />, silver: (hasXeroSupport && !xeroSupportAdvanced) ? <CheckMark /> : <NotIncluded />, gold: hasXeroSupport ? <CheckMark /> : <NotIncluded /> },

    // ── ATO PAYMENT PLANS ─────────────────────────────────────────────────────
    { feature: 'ATO & Prior Year', isCategory: true },
    { feature: 'ATO Payment Plans',     bronze: hasAtoPayment ? <Typography variant="body2">Once-off</Typography> : <NotIncluded />,    silver: <NotIncluded />, gold: <NotIncluded /> },
    { feature: 'Prior Year Lodgements', bronze: hasPriorYear ? <Typography variant="body2">Once-off</Typography> : <NotIncluded />,    silver: <NotIncluded />, gold: <NotIncluded /> },
    { feature: 'Amended Returns',       bronze: hasAmendments ? <Typography variant="body2">Once-off</Typography> : <NotIncluded />,   silver: <NotIncluded />, gold: <NotIncluded /> },
    { feature: 'Return Not Necessary',  bronze: hasReturnNotNec ? <Typography variant="body2">Once-off</Typography> : <NotIncluded />, silver: <NotIncluded />, gold: <NotIncluded /> },
    { feature: 'Final Return',          bronze: hasFinalReturn ? <Typography variant="body2">Once-off</Typography> : <NotIncluded />,  silver: <NotIncluded />, gold: <NotIncluded /> },

    // ── SUPPORT ───────────────────────────────────────────────────────────────
    { feature: 'Support Services', isCategory: true },
    { feature: 'Team / Email Support', bronze: (r.q25 === 'emailTeam' || r.q25 === 'emailPhoneTeamCsm' || r.q25 === 'emailPhoneCsmOwner') ? <CheckMark /> : <NotIncluded />, silver: (r.q25 === 'emailTeam' || r.q25 === 'emailPhoneTeamCsm' || r.q25 === 'emailPhoneCsmOwner') ? <CheckMark /> : <NotIncluded />, gold: (r.q25 === 'emailTeam' || r.q25 === 'emailPhoneTeamCsm' || r.q25 === 'emailPhoneCsmOwner') ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Client Service Manager', bronze: <NotIncluded />, silver: (r.q25 === 'emailPhoneTeamCsm' || r.q25 === 'emailPhoneCsmOwner') ? <CheckMark /> : <NotIncluded />, gold: (r.q25 === 'emailPhoneTeamCsm' || r.q25 === 'emailPhoneCsmOwner') ? <CheckMark /> : <NotIncluded /> },
    { feature: 'Principal / Owner', bronze: <NotIncluded />, silver: <NotIncluded />, gold: r.q25 === 'emailPhoneCsmOwner' ? <CheckMark /> : <NotIncluded /> },
  ];

  return (
    <Container sx={{ py: 4, pb: 12 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
        Tax Return Quote for {clientName}
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
        Recommended tax return pricing plans based on your requirements
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
              {pricingRows.map((row, index) =>
                row.isCategory ? (
                  <TableRow key={index} sx={{ backgroundColor: '#e8eef4' }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 600, fontSize: '0.85rem', py: 0.5 }}>
                      {row.feature}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                    <TableCell sx={{ fontSize: '0.8rem', pl: 3, py: 0.25, color: 'text.secondary' }}>
                      {row.feature}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.25 }}>{row.bronze}</TableCell>
                    <TableCell align="center" sx={{ py: 0.25 }}>{row.silver}</TableCell>
                    <TableCell align="center" sx={{ py: 0.25 }}>{row.gold}</TableCell>
                  </TableRow>
                )
              )}
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
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Upfront Payment Options:</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#002060' }}>
            {formatCurrency(totalOnceOffWithUpfront)}
          </Typography>
        </Stack>
        
        {/* True Once-off Fees (non-recurring services) */}
        {onceOffBreakdown.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#002060' }}>
              One-off Setup Fees:
            </Typography>
            {onceOffBreakdown.map((item, index) => (
              <Box
                key={index}
                sx={{ py: 0.75, borderBottom: index < onceOffBreakdown.length - 1 ? '1px solid #e0e0e0' : 'none' }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        )}

        {/* Upfront Annual Payment Option (for recurring services) */}
        {upfrontAnnualBreakdown.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#002060' }}>
              Upfront Annual Payment (Alternative to Monthly):
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Client can choose to pay upfront for the year instead of monthly installments
            </Typography>
            {upfrontAnnualBreakdown.map((item, index) => (
              <Box
                key={index}
                sx={{ py: 0.75, borderBottom: index < upfrontAnnualBreakdown.length - 1 ? '1px solid #e0e0e0' : 'none' }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        )}

        {onceOffBreakdown.length === 0 && upfrontAnnualBreakdown.length === 0 && (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            No one-off fees or upfront payment options for this quote
          </Typography>
        )}
      </Paper>

      {/* Save Dialog */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Tax Return Quote</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}
          <TextField
            fullWidth
            placeholder="Client Name"
            value={clientNameInput}
            onChange={(e) => setClientNameInput(e.target.value)}
            disabled={isSaving}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            placeholder="Optional notes about this pricing quote"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSaving}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Quote Summary:</Typography>
            <Typography variant="body2"><strong>Bronze Annual:</strong> {formatCurrency(bronzeAnnual)}</Typography>
            <Typography variant="body2"><strong>Silver Annual:</strong> {formatCurrency(silverAnnual)}</Typography>
            <Typography variant="body2"><strong>Gold Annual:</strong> {formatCurrency(goldAnnual)}</Typography>
            {onceOffPricing > 0 && (
              <Typography variant="body2"><strong>One-off Fees:</strong> {formatCurrency(onceOffPricing)}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSavePrice} variant="contained" disabled={isSaving || !clientNameInput.trim()}>
            {isSaving ? <CircularProgress size={24} /> : 'Save Quote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
