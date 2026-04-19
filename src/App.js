import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem, Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout, setOrganisation } from './features/auth/authSlice';
import { setClientName, setActivePriceId, resetPriceState, updateResponse } from './features/questions/responsesSlice';
import { useAuth0 } from '@auth0/auth0-react';
import { createPrice } from './services/priceApi';
import * as authApi from './services/authApi';
import theme from './theme';
import About from './pages/About';
import Questions from './pages/Questions';
import BookkeepingQuestions from './pages/BookkeepingQuestions';
import ServiceCatalog from './pages/ServiceCatalog';
import Pricing from './pages/Pricing';
import PricingQuote from './pages/PricingQuote';
import BookkeepingQuote from './pages/BookkeepingQuote';
import AccountingQuote from './pages/AccountingQuote';
import ServiceValuesEditor from './pages/ServiceValuesEditor';
import Onboarding from './pages/Onboarding';
import PricingModifier from './pages/PricingModifier';
import SelectPlan from './pages/SelectPlan';
import BillingSettings from './pages/BillingSettings';
import UserManagement from './pages/UserManagement';
import PaymentRequired from './pages/PaymentRequired';
import InviteAccept from './pages/InviteAccept';
import InvitedUserOnboarding from './pages/InvitedUserOnboarding';
import SavedPrices from './pages/SavedPrices';
import Login from './features/auth/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './features/auth/ProtectedRoute';
import OwnerRoute from './features/auth/OwnerRoute';
import SubscriptionGuard from './components/SubscriptionGuard';

function AppContent() {
  const storedUser = useSelector((state) => state.auth.user);
  const organisation = useSelector((state) => state.auth.organisation);
  const isOwner = useSelector((state) => state.auth.isOwner);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAuthenticated, logout: auth0Logout } = useAuth0();
  const [openModal, setOpenModal] = useState(false);
  const [clientNameInput, setClientNameInput] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  const [tokenReady, setTokenReady] = useState(!!localStorage.getItem('token'));

  // Check if user is on bookkeeper plan
  const isBookkeeper = organisation?.planType === 'bookkeeper';

  // Check onboarding status
  const checkOnboardingStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOnboardingComplete(null);
      return;
    }

    try {
      // Add timestamp to prevent browser caching
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/v1'}/organisations/me?_t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      // Handle session expired
      if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.setItem('sessionExpired', 'true');
        sessionStorage.setItem('sessionExpiredMessage', 'Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      console.log('🔍 checkOnboardingStatus response status:', response.status, 'ok:', response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('📦 App.js org data:', { isOwner: data.isOwner, isManager: data.isManager, owner: data.owner, name: data.name, planType: data.planType });
        console.log('📦 App.js: Setting isOwner to:', data.isOwner, 'isManager to:', data.isManager);
        console.log('📦 Full organisation data:', JSON.stringify(data, null, 2));
        setOnboardingComplete(true);
        
        // Set organisation and owner/manager status in Redux
        console.log('📦 DISPATCHING setOrganisation with isOwner:', data.isOwner, 'isManager:', data.isManager);
        dispatch(setOrganisation({
          organisation: data,
          isOwner: data.isOwner || false,
          isManager: data.isManager || false,
        }));
        console.log('📦 DISPATCH COMPLETE');
        
        // Check if plan type is selected (new onboarding flow uses planType)
        if (!data.planType) {
          // Organisation exists but no plan type selected - redirect to onboarding
          if (!location.pathname.startsWith('/onboarding')) {
            navigate('/onboarding');
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
      // Store email in localStorage for persistence
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
      }
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/v1'}/auth/auth0-callback`, {
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
          if (data.tokens.refresh) {
            localStorage.setItem('refreshToken', data.tokens.refresh.token);
          }
          setTokenReady(true);
        }
      }
    } catch (error) {
      console.error('Error getting JWT token:', error);
    }
  };

  // Get active user - prefer Auth0 user, then stored user from Redux, then localStorage
  const storedEmail = localStorage.getItem('userEmail');
  const activeUser = user 
    ? { id: user.sub, email: user.email, name: user.name } 
    : storedUser 
      ? storedUser 
      : storedEmail 
        ? { email: storedEmail } 
        : null;
  
  // Check if logged in - token in localStorage is the most reliable indicator
  const isLoggedIn = !!localStorage.getItem('token') || isAuthenticated || !!storedUser;

  const handleLogout = async () => {
    // Call backend logout endpoint first to invalidate refresh token
    await authApi.logout();
    
    // Then clear local state
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('refreshToken');
    dispatch(logout());
    
    if (isAuthenticated) {
      // Auth0 logout
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    } else {
      // Non-Auth0 (test login) - just navigate to login
      navigate('/login');
    }
  };

  const handleNewPriceClick = () => {
    // For bookkeeper plan, automatically set service type to bookkeeping
    if (isBookkeeper) {
      setServiceType('bookkeeping');
    }
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setClientNameInput('');
    setServiceType('');
  };

  const handleClientNameSubmit = async () => {
    if (clientNameInput.trim() && serviceType) {
      try {
        setIsCreating(true);
        // Reset previous price state
        dispatch(resetPriceState());
        const priceData = {
          clientName: clientNameInput,
          serviceType: serviceType,
          questionResponses: {},
        };
        const response = await createPrice(priceData);
        dispatch(setClientName(clientNameInput));
        dispatch(setActivePriceId(response.id));
        dispatch(updateResponse({ questionId: 'serviceType', value: serviceType }));
        setOpenModal(false);
        setClientNameInput('');
        setServiceType('');
        setIsCreating(false);
        // Navigate to appropriate questions page based on service type
        if (serviceType === 'bookkeeping') {
          navigate('/bookkeeping-questions');
        } else {
          navigate('/questions');
        }
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
      {isLoggedIn && (
      <AppBar position="fixed" sx={{ boxShadow: 'none', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Link to="/clients" style={{ display: 'flex', alignItems: 'center', marginRight: '24px' }}>
            <img src="/logo-icon.svg" alt="Accountable" style={{ height: '32px', width: '32px' }} />
          </Link>
          <Button color="inherit" component={Link} to="/clients" sx={{ fontWeight: 600 }}>Proposals</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" size="small" onClick={handleNewPriceClick} sx={{ mr: 2 }}>Create Pricing</Button>
          <Button 
            color="inherit" 
            onClick={handleSettingsClick}
            aria-controls={settingsMenuOpen ? 'settings-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={settingsMenuOpen ? 'true' : undefined}
            sx={{ fontWeight: 600 }}
          >
            Menu
          </Button>
          {activeUser?.email && (
            <Typography sx={{ ml: 3, color: 'text.secondary', fontWeight: 500 }}>{activeUser.email}</Typography>
          )}
          <Menu
            id="settings-menu"
            anchorEl={settingsAnchorEl}
            open={settingsMenuOpen}
            onClose={handleSettingsClose}
          >
            {console.log('🔧 Menu rendering, isOwner:', isOwner)}
            {isOwner && (
              <MenuItem onClick={() => { handleSettingsClose(); navigate('/settings/pricing-modifier'); }}>
                Pricing Modifier
              </MenuItem>
            )}
            {isOwner && (
              <MenuItem onClick={() => { handleSettingsClose(); navigate('/settings/billing'); }}>
                Billing & Subscription
              </MenuItem>
            )}
            {isOwner && (
              <MenuItem onClick={() => { handleSettingsClose(); navigate('/settings/users'); }}>
                User Management
              </MenuItem>
            )}
            <MenuItem onClick={() => { handleSettingsClose(); handleLogout(); }}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      )}
      <div style={{ paddingTop: isLoggedIn ? '64px' : '0px' }}>
        <SubscriptionGuard>
          <Routes>
            <Route path="/" element={<ProtectedRoute><SavedPrices /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/clients" element={<ProtectedRoute><SavedPrices /></ProtectedRoute>} />
            <Route path="/questions" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
            <Route path="/bookkeeping-questions" element={<ProtectedRoute><BookkeepingQuestions /></ProtectedRoute>} />
            <Route path="/pricing-quote" element={<ProtectedRoute><PricingQuote /></ProtectedRoute>} />
            <Route path="/bookkeeping-quote" element={<ProtectedRoute><BookkeepingQuote /></ProtectedRoute>} />
            <Route path="/accounting-quote" element={<ProtectedRoute><AccountingQuote /></ProtectedRoute>} />
            <Route path="/service-values-editor" element={<ProtectedRoute><ServiceValuesEditor /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/settings/billing" element={<ProtectedRoute><OwnerRoute><BillingSettings /></OwnerRoute></ProtectedRoute>} />
            <Route path="/settings/pricing-modifier" element={<ProtectedRoute><OwnerRoute><PricingModifier /></OwnerRoute></ProtectedRoute>} />
            <Route path="/settings/users" element={<ProtectedRoute><OwnerRoute><UserManagement /></OwnerRoute></ProtectedRoute>} />
            <Route path="/settings/select-plan" element={<ProtectedRoute><SelectPlan /></ProtectedRoute>} />
            <Route path="/payment-required" element={<ProtectedRoute><PaymentRequired /></ProtectedRoute>} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="/invited-onboarding" element={<ProtectedRoute><InvitedUserOnboarding /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
          <FormControl sx={{ mt: 3 }} fullWidth>
            <FormLabel id="service-type-label">What services do you provide?</FormLabel>
            <RadioGroup
              aria-labelledby="service-type-label"
              name="service-type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              {!isBookkeeper && (
                <FormControlLabel value="accounting" control={<Radio />} label="Accounting" />
              )}
              <FormControlLabel value="bookkeeping" control={<Radio />} label="Bookkeeping" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button 
            onClick={handleClientNameSubmit} 
            variant="contained" 
            color="primary"
            disabled={!clientNameInput.trim() || !serviceType || isCreating}
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
