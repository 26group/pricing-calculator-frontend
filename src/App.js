import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem } from '@mui/material';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from './features/auth/authSlice';
import { setClientName } from './features/questions/responsesSlice';
import { useAuth0 } from '@auth0/auth0-react';
import { createPrice } from './services/priceApi';
import theme from './theme';
import Home from './pages/Home';
import About from './pages/About';
import Questions from './pages/Questions';
import ServiceCatalog from './pages/ServiceCatalog';
import Pricing from './pages/Pricing';
import PricingQuote from './pages/PricingQuote';
import ServiceValuesEditor from './pages/ServiceValuesEditor';
import Onboarding from './pages/Onboarding';
import SelectPlan from './pages/SelectPlan';
import BillingSettings from './pages/BillingSettings';
import UserManagement from './pages/UserManagement';
import PaymentRequired from './pages/PaymentRequired';
import Login from './features/auth/Login';
import ProtectedRoute from './features/auth/ProtectedRoute';
import SubscriptionGuard from './components/SubscriptionGuard';

function AppContent() {
  const storedUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, logout: auth0Logout } = useAuth0();
  const [openModal, setOpenModal] = useState(false);
  const [clientNameInput, setClientNameInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  const [tokenReady, setTokenReady] = useState(!!localStorage.getItem('token'));

  // Check onboarding status
  const checkOnboardingStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOnboardingComplete(null);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/v1/organisations/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOnboardingComplete(true);
        // Check if subscription plan is selected
        if (!data.selectedPlanId) {
          // Organisation exists but no plan selected - redirect to plan selection
          if (!location.pathname.startsWith('/onboarding')) {
            navigate('/onboarding/select-plan');
          }
        }
      } else if (response.status === 404) {
        setOnboardingComplete(false);
        // Redirect to onboarding if not already there
        if (!location.pathname.startsWith('/onboarding') && location.pathname !== '/login') {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    
    // Skip token fetching on login page - Login.js handles it
    if (location.pathname === '/login') return;

    if (user && storedUser?.id !== user.sub) {
      dispatch(loginSuccess({
        id: user.sub,
        email: user.email,
        name: user.name,
      }));
      // Get JWT token from backend for this Auth0 user
      getJWTToken(user);
    }

    // Only logout if there's a token in localStorage but no stored user
    // This prevents clearing the test login token
    if (!user && storedUser && !localStorage.getItem('token')) {
      dispatch(logout());
    }
  }, [dispatch, isLoading, storedUser, user, location.pathname]);

  // Check onboarding status when token becomes ready or user changes
  useEffect(() => {
    // Skip on login page - Login.js handles redirects there
    if (location.pathname === '/login') return;
    
    if (tokenReady && (user || storedUser)) {
      checkOnboardingStatus();
    }
  }, [tokenReady, user, storedUser, location.pathname]);

  const getJWTToken = async (auth0User) => {
    try {
      // Get the ID token from Auth0
      const response = await fetch('http://localhost:4000/v1/auth/auth0-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth0UserId: auth0User.sub,
          email: auth0User.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tokens && data.tokens.access) {
          localStorage.setItem('token', data.tokens.access.token);
          setTokenReady(true);
        }
      }
    } catch (error) {
      console.error('Error getting JWT token:', error);
    }
  };

  const activeUser = user ? { id: user.sub, email: user.email, name: user.name } : storedUser;

  const handleNewPriceClick = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setClientNameInput('');
  };

  const handleClientNameSubmit = async () => {
    if (clientNameInput.trim()) {
      try {
        setIsCreating(true);
        const priceData = {
          clientName: clientNameInput,
        };
        const response = await createPrice(priceData);
        dispatch(setClientName(clientNameInput));
        setOpenModal(false);
        setClientNameInput('');
        setIsCreating(false);
        navigate('/questions');
      } catch (error) {
        console.error('Error creating price record:', error);
        setIsCreating(false);
        alert('Error creating price record. Please try again.');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleClientNameSubmit();
    }
  };

  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const settingsMenuOpen = Boolean(settingsAnchorEl);

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ boxShadow: 'none' }}>
        <Toolbar>
          <Button color="inherit" component={Link} to="/questions">Questions</Button>
          <Button color="inherit" component={Link} to="/pricing-quote">Pricing</Button>
          <Button 
            color="inherit" 
            onClick={handleSettingsClick}
            aria-controls={settingsMenuOpen ? 'settings-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={settingsMenuOpen ? 'true' : undefined}
          >
            Settings
          </Button>
          <Menu
            id="settings-menu"
            anchorEl={settingsAnchorEl}
            open={settingsMenuOpen}
            onClose={handleSettingsClose}
          >
            <MenuItem onClick={() => { handleSettingsClose(); navigate('/service-values-editor'); }}>
              Service Values
            </MenuItem>
            <MenuItem onClick={() => { handleSettingsClose(); navigate('/settings/billing'); }}>
              Billing & Subscription
            </MenuItem>
            <MenuItem onClick={() => { handleSettingsClose(); navigate('/settings/users'); }}>
              User Management
            </MenuItem>
          </Menu>
          {activeUser && (
            <>
              <Typography sx={{ flexGrow: 1, ml: 2 }}>{activeUser.email}</Typography>
              <Button color="inherit" onClick={() => auth0Logout({ logoutParams: { returnTo: window.location.origin } })}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <div style={{ paddingTop: '64px' }}>
        <SubscriptionGuard>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/pricing-quote" element={<PricingQuote />} />
            <Route path="/service-values-editor" element={<ProtectedRoute><ServiceValuesEditor /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/onboarding/select-plan" element={<ProtectedRoute><SelectPlan /></ProtectedRoute>} />
            <Route path="/settings/billing" element={<ProtectedRoute><BillingSettings /></ProtectedRoute>} />
            <Route path="/settings/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/settings/select-plan" element={<ProtectedRoute><SelectPlan /></ProtectedRoute>} />
            <Route path="/payment-required" element={<ProtectedRoute><PaymentRequired /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </SubscriptionGuard>
      </div>
      <Dialog open={openModal} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Price Quote</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Client Name"
            type="text"
            fullWidth
            variant="outlined"
            value={clientNameInput}
            onChange={(e) => setClientNameInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mt: 2 }}
            placeholder="Enter client name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button 
            onClick={handleClientNameSubmit} 
            variant="contained" 
            color="primary"
            disabled={!clientNameInput.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Continue'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
