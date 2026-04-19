import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Box,
  TextField,
  TablePagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getPrices, deletePrice, getPrice, createPrice } from '../services/priceApi';
import { loadSavedPrice } from '../features/questions/responsesSlice';
import { getRevenueSegmentLabel } from '../constants/revenueSegments';

const getServiceTypeLabel = (price) => {
  // Use the dedicated serviceType field if available
  if (price?.serviceType === 'bookkeeping') return 'Bookkeeping';
  if (price?.serviceType === 'accounting') return 'Accounting';
  
  // Fallback: check questionResponses for old data
  const questionResponses = price?.questionResponses || price;
  
  // If we have q2b (bookkeeping specific), it's bookkeeping
  if (questionResponses?.q2b) return 'Bookkeeping';
  
  // Check if they answered the first accounting-specific question (q4)
  if (questionResponses?.q4 !== undefined) return 'Accounting';
  
  // Fallback: check the old serviceType field in questionResponses if it exists
  const serviceType = questionResponses?.serviceType;
  if (serviceType === 'bookkeeping') return 'Bookkeeping';
  if (serviceType === 'accounting' || serviceType === 'taxAccounting') return 'Accounting';
  
  // If q1 is a service type value (old data), use it
  if (questionResponses?.q1 === 'bookkeeping') return 'Bookkeeping';
  if (questionResponses?.q1 === 'accounting' || questionResponses?.q1 === 'taxAccounting') return 'Accounting';
  
  // Debug: log what we're getting to understand the data structure
  console.warn('⚠️ No service type found. price:', price);
  return 'Unknown';
};

export default function SavedPrices() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOwner = useSelector((state) => state.auth.isOwner);
  const isManager = useSelector((state) => state.auth.isManager);
  const canSeeAllQuotes = isOwner || isManager; // Owners and managers can see all quotes
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [priceToClone, setPriceToClone] = useState(null);
  const [cloneNameInput, setCloneNameInput] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrices = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching prices for page:', pageNum);
      const data = await getPrices({ 
        sortBy: 'updatedAt:desc', 
        limit: rowsPerPage, 
        page: pageNum + 1 // API uses 1-based pages
      });
      setPrices(data.results || []);
      setTotalResults(data.totalResults || 0);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
      setError('Failed to load saved prices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage]);

  // Fetch when page changes
  useEffect(() => {
    fetchPrices(page);
  }, [page, fetchPrices]);

  // Refetch prices when the page becomes visible (on tab focus)
  useEffect(() => {
    const handleFocus = () => {
      console.log('📄 Page focused, resetting pagination and refreshing...');
      setPage(0); // Reset to page 0
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLoadPrice = async (priceId) => {
    try {
      const priceData = await getPrice(priceId);
      dispatch(loadSavedPrice({
        priceId: priceData.id,
        clientName: priceData.clientName,
        questionResponses: priceData.questionResponses,
        questionsPricing: priceData.questionsPricing,
        questionsOnceOffFee: priceData.questionsOnceOffFee,
        serviceCatalogPricing: priceData.serviceCatalogPricing,
        serviceCatalogOnceOffFee: priceData.serviceCatalogOnceOffFee,
        serviceSelections: priceData.serviceSelections,
        serviceType: priceData.serviceType,
      }));
      
      // Determine service type - use the serviceType field from database first
      let isBookkeeping = priceData.serviceType === 'bookkeeping';
      
      // Fallback for old data that doesn't have serviceType field
      if (!priceData.serviceType) {
        const qResp = priceData.questionResponses;
        // Check for bookkeeping-specific questions
        if (qResp?.q2b) {
          isBookkeeping = true;
        } else if (qResp?.q4 !== undefined) {
          isBookkeeping = false;
        } else if (qResp?.serviceType === 'bookkeeping') {
          isBookkeeping = true;
        }
      }
      
      if (isBookkeeping) {
        navigate('/bookkeeping-questions');
      } else {
        navigate('/questions');
      }
    } catch (err) {
      console.error('Failed to load price:', err);
      setError('Failed to load the selected price. Please try again.');
    }
  };

  const handleDeleteClick = (price) => {
    setPriceToDelete(price);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!priceToDelete) return;
    try {
      setDeleting(true);
      await deletePrice(priceToDelete.id);
      setDeleteDialogOpen(false);
      setPriceToDelete(null);
      // Reset pagination to page 0 after delete
      console.log('🗑️ Price deleted, resetting to page 0');
      setPage(0);
    } catch (err) {
      console.error('Failed to delete price:', err);
      setError('Failed to delete the price. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPriceToDelete(null);
  };

  const handleCloneClick = (price) => {
    setPriceToClone(price);
    setCloneNameInput(`${price.clientName || 'Untitled'} (Copy)`);
    setCloneDialogOpen(true);
  };

  const handleCloneConfirm = async () => {
    if (!cloneNameInput.trim() || !priceToClone) return;
    try {
      setIsCloning(true);
      // Fetch the full price data
      const originalPrice = await getPrice(priceToClone.id);
      // Create a new price with the cloned data
      const clonedPriceData = {
        clientName: cloneNameInput,
        questionResponses: originalPrice.questionResponses,
        questionsPricing: originalPrice.questionsPricing,
        questionsOnceOffFee: originalPrice.questionsOnceOffFee,
        serviceCatalogPricing: originalPrice.serviceCatalogPricing,
        serviceCatalogOnceOffFee: originalPrice.serviceCatalogOnceOffFee,
        serviceSelections: originalPrice.serviceSelections,
        revenueSegment: originalPrice.revenueSegment,
      };
      await createPrice(clonedPriceData);
      setCloneDialogOpen(false);
      setPriceToClone(null);
      setCloneNameInput('');
      // Refresh the list to show the new clone
      fetchPrices();
    } catch (err) {
      console.error('Failed to clone price:', err);
      setError('Failed to clone the pricing. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleCloneCancel = () => {
    setCloneDialogOpen(false);
    setPriceToClone(null);
    setCloneNameInput('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null || value === 0) return '—';
    return `$${Number(value).toFixed(2)}`;
  };

  const getSearchableDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const fullMonthDate = date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    // Return both formats so search works with "Apr" or "April"
    return `${formattedDate} ${fullMonthDate}`;
  };

  const filteredPrices = prices.filter((price) => {
    const query = searchQuery.toLowerCase();
    const clientName = (price.clientName || '').toLowerCase();
    const serviceType = getServiceTypeLabel(price).toLowerCase();
    
    // Determine actual revenue segment from question responses
    // q1 is the revenue segment for accounting/bookkeeping
    const revenueSegmentValue = price.questionResponses?.q1;
    const validSegments = ['micro', 'small', 'medium', 'large', 'enterprise'];
    const actualRevenueSegment = validSegments.includes(revenueSegmentValue) 
      ? revenueSegmentValue 
      : (price.revenueSegment || 'unknown');
    const revenueSegment = getRevenueSegmentLabel(actualRevenueSegment).toLowerCase();
    const date = getSearchableDate(price.createdAt).toLowerCase();
    
    return (
      clientName.includes(query) ||
      serviceType.includes(query) ||
      revenueSegment.includes(query) ||
      date.includes(query)
    );
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading saved prices...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Proposals
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Manage your client pricing quotes
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {prices.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by client name, type, or revenue segment..."
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      )}

      {prices.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '20px' }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            backgroundColor: 'background.default', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <ContentCopyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No saved prices yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            Create a new pricing to get started. Your question responses and calculated prices will be automatically saved.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client Name</TableCell>
                {canSeeAllQuotes && <TableCell>Created By</TableCell>}
                <TableCell>Type</TableCell>
                <TableCell>Monthly</TableCell>
                <TableCell>Once Off</TableCell>
                <TableCell>Revenue Segment</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Packages</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPrices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).filter(price => getServiceTypeLabel(price) !== 'Unknown').map((price) => (
                <TableRow
                  key={price.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    height: 40,
                    '&:hover': { 
                      backgroundColor: 'background.default',
                    },
                  }}
                  onClick={() => handleLoadPrice(price.id)}
                >
                  <TableCell sx={{ py: 0.5 }}>
                    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '1rem' }}>
                      {price.clientName || 'Untitled'}
                    </Typography>
                  </TableCell>
                  {canSeeAllQuotes && (
                    <TableCell sx={{ py: 0.5, fontSize: '0.875rem' }}>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                        {price.userId?.name || price.userId?.email || 'Unknown'}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell sx={{ py: 0.5, fontSize: '0.875rem' }}>
                    <Chip
                      label={getServiceTypeLabel(price)}
                      size="small"
                      sx={{ 
                        fontWeight: 600, 
                        height: 24,
                        backgroundColor: getServiceTypeLabel(price) === 'Bookkeeping' ? '#0891b2' : '#6d28d9',
                        color: '#ffffff',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 0.5, fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(price.questionsPricing + price.serviceCatalogPricing)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 0.5, fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(price.questionsOnceOffFee + price.serviceCatalogOnceOffFee)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 0.5, fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {(() => {
                        // Determine actual revenue segment from question responses
                        const revenueSegmentValue = price.questionResponses?.q1;
                        const validSegments = ['micro', 'small', 'medium', 'large', 'enterprise'];
                        const actualRevenueSegment = validSegments.includes(revenueSegmentValue) 
                          ? revenueSegmentValue 
                          : (price.revenueSegment || 'unknown');
                        return getRevenueSegmentLabel(actualRevenueSegment);
                      })()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 0.5, fontSize: '0.875rem' }}>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                      {formatDate(price.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Load the price data first, then navigate to packages page
                        const isBookkeeping = price.serviceType === 'bookkeeping' || price.questionResponses?.q2b;
                        // Store the responses in localStorage for bookkeeping
                        if (isBookkeeping) {
                          localStorage.setItem('bookkeeping_responses', JSON.stringify(price.questionResponses || {}));
                          // Also dispatch to Redux for client name
                          dispatch(loadSavedPrice({
                            priceId: price.id,
                            clientName: price.clientName,
                            questionResponses: price.questionResponses,
                            questionsPricing: price.questionsPricing,
                            questionsOnceOffFee: price.questionsOnceOffFee,
                            serviceCatalogPricing: price.serviceCatalogPricing,
                            serviceCatalogOnceOffFee: price.serviceCatalogOnceOffFee,
                            serviceSelections: price.serviceSelections,
                            serviceType: price.serviceType,
                          }));
                          navigate('/bookkeeping-quote');
                        } else {
                          dispatch(loadSavedPrice({
                            priceId: price.id,
                            clientName: price.clientName,
                            questionResponses: price.questionResponses,
                            questionsPricing: price.questionsPricing,
                            questionsOnceOffFee: price.questionsOnceOffFee,
                            serviceCatalogPricing: price.serviceCatalogPricing,
                            serviceCatalogOnceOffFee: price.serviceCatalogOnceOffFee,
                            serviceSelections: price.serviceSelections,
                            serviceType: price.serviceType,
                          }));
                          navigate('/accounting-quote');
                        }
                      }}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.25,
                        px: 1,
                      }}
                    >
                      Show
                    </Button>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 0.5 }}>
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <Tooltip title="Clone">
                        <IconButton
                          size="small"
                          sx={{ 
                            padding: '4px',
                            backgroundColor: 'background.default',
                            '&:hover': { backgroundColor: 'primary.light', color: 'white' },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloneClick(price);
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          sx={{ 
                            padding: '4px',
                            backgroundColor: 'background.default',
                            color: 'error.main',
                            '&:hover': { backgroundColor: 'error.main', color: 'white' },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(price);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredPrices.length === 0 && searchQuery && (
            <Box sx={{ p: 3, textAlign: 'center', backgroundColor: 'background.default' }}>
              <Typography color="text.secondary">
                No proposals match "{searchQuery}"
              </Typography>
            </Box>
          )}
          <TablePagination
            component="div"
            count={filteredPrices.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          />
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Pricing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the pricing for{' '}
            <strong>{priceToDelete?.clientName || 'Untitled'}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Pricing Dialog */}
      <Dialog open={cloneDialogOpen} onClose={handleCloneCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Clone Pricing</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a copy of the pricing for <strong>{priceToClone?.clientName || 'Untitled'}</strong>.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Client Name"
            type="text"
            fullWidth
            variant="outlined"
            value={cloneNameInput}
            onChange={(e) => setCloneNameInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleCloneConfirm(); }}
            placeholder="Enter client name for the clone"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloneCancel} disabled={isCloning}>Cancel</Button>
          <Button
            onClick={handleCloneConfirm}
            variant="contained"
            color="primary"
            disabled={!cloneNameInput.trim() || isCloning}
          >
            {isCloning ? 'Cloning...' : 'Clone'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
