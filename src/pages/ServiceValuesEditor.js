import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { serviceValuesAccounting } from '../constants/accountingServicesValues';

const API_URL = 'http://localhost:4000/v1';

// Helper to format camelCase to Title Case
const formatLabel = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

export default function ServiceValuesEditor() {
  const navigate = useNavigate();
  const storedUser = useSelector((state) => state.auth.user);
  const [serviceValues, setServiceValues] = useState(null);
  const [editedValues, setEditedValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    fetchServiceValues();
  }, [storedUser, navigate]);

  const fetchServiceValues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/service-values`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServiceValues(data);
        setEditedValues(data.data);
      } else if (response.status === 404) {
        // No data in DB yet, use the default values from constants
        setServiceValues(null);
        setEditedValues(serviceValuesAccounting);
      } else {
        setError('Failed to load service values');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/service-values`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: editedValues }),
      });

      if (response.ok) {
        const data = await response.json();
        setServiceValues(data);
        setSuccess('Service values updated successfully');
      } else {
        setError('Failed to save service values');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleValueChange = (categoryKey, serviceKey, segmentKey, field, value) => {
    setEditedValues((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)); // Deep clone
      if (segmentKey) {
        updated[categoryKey][serviceKey][segmentKey][field] = value;
      } else {
        updated[categoryKey][serviceKey][field] = value;
      }
      return updated;
    });
  };

  const handleRevenueSegmentChange = (segmentKey, value) => {
    setEditedValues((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.revenueSegments[segmentKey] = value;
      return updated;
    });
  };

  const renderServiceField = (categoryKey, serviceKey, segmentKey, fieldData, fieldName) => {
    const value = fieldData[fieldName];
    
    return (
      <TextField
        key={fieldName}
        label={formatLabel(fieldName)}
        size="small"
        type="number"
        value={value === null ? '' : value}
        onChange={(e) => {
          const newValue = e.target.value === '' ? null : parseFloat(e.target.value);
          handleValueChange(categoryKey, serviceKey, segmentKey, fieldName, newValue);
        }}
        sx={{ minWidth: 100, width: 120 }}
      />
    );
  };

  const renderServiceEntry = (categoryKey, serviceKey, serviceData) => {
    // Check if this service has segment-based pricing (micro, small, medium, large)
    const hasSegments = serviceData.micro || serviceData.small || serviceData.medium || serviceData.large || serviceData.all;
    // Check for non-segment keys like salary/timesheets
    const nonSegmentKeys = Object.keys(serviceData).filter(
      (k) => typeof serviceData[k] === 'object' && serviceData[k] !== null && !['micro', 'small', 'medium', 'large', 'all'].includes(k)
    );

    if (hasSegments) {
      const segments = ['all', 'micro', 'small', 'medium', 'large'].filter((s) => serviceData[s]);
      return (
        <Box key={serviceKey} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
            {formatLabel(serviceKey)}
          </Typography>
          {segments.map((segmentKey) => (
            <Box key={segmentKey} sx={{ mb: 2, pl: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#666' }}>
                {formatLabel(segmentKey)}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {renderServiceField(categoryKey, serviceKey, segmentKey, serviceData[segmentKey], 'monthly')}
                {renderServiceField(categoryKey, serviceKey, segmentKey, serviceData[segmentKey], 'yearly')}
              </Stack>
            </Box>
          ))}
        </Box>
      );
    } else if (nonSegmentKeys.length > 0) {
      // Handle services like payrollProcessing with salary/timesheets
      return (
        <Box key={serviceKey} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
            {formatLabel(serviceKey)}
          </Typography>
          {nonSegmentKeys.map((subKey) => (
            <Box key={subKey} sx={{ mb: 2, pl: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#666' }}>
                {formatLabel(subKey)}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {renderServiceField(categoryKey, serviceKey, subKey, serviceData[subKey], 'monthly')}
                {renderServiceField(categoryKey, serviceKey, subKey, serviceData[subKey], 'yearly')}
              </Stack>
            </Box>
          ))}
        </Box>
      );
    } else {
      // Flat service (like corporateSecretarial items)
      return (
        <Box key={serviceKey} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
            {formatLabel(serviceKey)}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {renderServiceField(categoryKey, serviceKey, null, serviceData, 'monthly')}
            {renderServiceField(categoryKey, serviceKey, null, serviceData, 'yearly')}
          </Stack>
        </Box>
      );
    }
  };

  const renderCategory = (categoryKey, categoryData) => {
    return (
      <Paper key={categoryKey} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{formatLabel(categoryKey)}</Typography>
        {Object.entries(categoryData).map(([serviceKey, serviceData]) =>
          renderServiceEntry(categoryKey, serviceKey, serviceData)
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Container sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3, pb: 8 }} maxWidth="lg">
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Service Values Editor
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Edit the accounting service values that are used throughout the application
          </Typography>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, position: 'sticky', top: 0, zIndex: 10 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Last updated: {serviceValues ? new Date(serviceValues.updatedAt).toLocaleString() : 'Never (using defaults)'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Version: {serviceValues?.version || 'Not saved yet'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 32, 96, 0.4)',
                },
              }}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </Stack>
        </Paper>

        <Divider />

        {editedValues && Object.entries(editedValues)
          .filter(([categoryKey]) => categoryKey !== 'revenueSegments')
          .map(([categoryKey, categoryData]) =>
            renderCategory(categoryKey, categoryData)
          )}
      </Stack>
    </Container>
  );
}
