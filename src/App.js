import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from './features/auth/authSlice';
import { setClientName } from './features/questions/responsesSlice';
import { useAuth } from '@workos-inc/authkit-react';
import { createPrice } from './services/priceApi';
import theme from './theme';
import Home from './pages/Home';
import About from './pages/About';
import Questions from './pages/Questions';
import ServiceCatalog from './pages/ServiceCatalog';
import Pricing from './pages/Pricing';
import PricingQuote from './pages/PricingQuote';
import ServiceValuesEditor from './pages/ServiceValuesEditor';
import Login from './features/auth/Login';
import ProtectedRoute from './features/auth/ProtectedRoute';

function AppContent() {
  const storedUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [clientNameInput, setClientNameInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (user && storedUser?.id !== user.id) {
      dispatch(loginSuccess(user));
      // Get JWT token from backend for this WorkOS user
      getJWTToken(user);
    }

    // Only logout if there's a token in localStorage but no stored user
    // This prevents clearing the test login token
    if (!user && storedUser && !localStorage.getItem('token')) {
      dispatch(logout());
    }
  }, [dispatch, isLoading, storedUser, user]);

  const getJWTToken = async (workosUser) => {
    try {
      // Get the ID token from WorkOS
      const response = await fetch('http://localhost:4000/v1/auth/workos-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workosUserId: workosUser.id,
          email: workosUser.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tokens && data.tokens.access) {
          localStorage.setItem('token', data.tokens.access.token);
        }
      }
    } catch (error) {
      console.error('Error getting JWT token:', error);
    }
  };

  const activeUser = user ?? storedUser;

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

  return (
    <>
      <AppBar position="fixed" sx={{ boxShadow: 'none' }}>
        <Toolbar>
          <Button color="inherit" component={Link} to="/questions">Questions</Button>
          <Button color="inherit" component={Link} to="/pricing-quote">Pricing</Button>
          <Button color="inherit" component={Link} to="/service-values-editor">Settings</Button>
          {activeUser && (
            <>
              <Typography sx={{ flexGrow: 1, ml: 2 }}>{activeUser.email}</Typography>
              <Button color="inherit" onClick={() => signOut({ returnTo: window.location.origin })}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <div style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/pricing-quote" element={<PricingQuote />} />
          <Route path="/service-values-editor" element={<ProtectedRoute><ServiceValuesEditor /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
        </Routes>
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
