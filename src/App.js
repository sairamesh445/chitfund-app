import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Tabs, Tab, Box, Snackbar, Alert, Button, IconButton } from '@mui/material';
import CustomerForm from './components/CustomerForm';
import CustomerList from './components/CustomerList';
import ChitForm from './components/ChitForm';
import ChitList from './components/ChitList';
import PaataTable from './components/PaataTable';
import ProfitTable from './components/ProfitTable';
import UserManagement from './components/UserManagement';
import LoginDialog from './components/LoginDialog';
import LogoutIcon from '@mui/icons-material/Logout';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Generate unique hash for customer data
const generateCustomerHash = (customer) => {
  const data = `${customer.name.trim().toLowerCase()}_${customer.phone.trim()}_${customer.chitAmount}`;
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
};

// Check for exact duplicate customer (more precise check)
const isExactDuplicateCustomer = (newCustomer, existingCustomers) => {
  return existingCustomers.some(existing => {
    return existing.name.trim().toLowerCase() === newCustomer.name.trim().toLowerCase() &&
           existing.phone.trim() === newCustomer.phone.trim() &&
           existing.chitAmount === newCustomer.chitAmount;
  });
};

// Generate unique hash for chit data
const generateChitHash = (chit) => {
  const data = `${chit.customerId}_${chit.amount}_${chit.date}_${chit.accountDetails.trim()}`;
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
};

// Global submission tracking system
const submissionTracker = {
  lastCustomerSubmission: null,
  lastChitSubmission: null,
  isSubmitting: false,
  
  generateSubmissionKey(data, type) {
    const key = type === 'customer' 
      ? `${data.name}_${data.phone}_${data.chitAmount}`
      : `${data.customerId}_${data.amount}_${data.date}`;
    return `${type}_${key}_${Math.floor(Date.now() / 10000)}`; // 10-second window.
  },
  
  canSubmit(data, type) {
    if (this.isSubmitting) {
      console.log('BLOCKED: System is currently submitting');
      return false;
    }
    
    const key = this.generateSubmissionKey(data, type);
    const lastKey = type === 'customer' ? this.lastCustomerSubmission : this.lastChitSubmission;
    
    if (lastKey === key) {
      console.log('BLOCKED: Duplicate submission detected', key);
      return false;
    }
    
    return true;
  },
  
  markSubmission(data, type) {
    const key = this.generateSubmissionKey(data, type);
    if (type === 'customer') {
      this.lastCustomerSubmission = key;
    } else {
      this.lastChitSubmission = key;
    }
    this.isSubmitting = true;
    
    // Auto-clear after 15 seconds
    setTimeout(() => {
      this.clearSubmission(type);
    }, 15000);
  },
  
  clearSubmission(type) {
    if (type === 'customer') {
      this.lastCustomerSubmission = null;
    } else {
      this.lastChitSubmission = null;
    }
    this.isSubmitting = false;
  }
};

// Clear submission tracking on page load
if (typeof window !== 'undefined') {
  // Clear all tracking on fresh page load
  window.addEventListener('load', () => {
    submissionTracker.clearSubmission('customer');
    submissionTracker.clearSubmission('chit');
  });
  
  window.addEventListener('beforeunload', () => {
    submissionTracker.clearSubmission('customer');
    submissionTracker.clearSubmission('chit');
  });
}

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
    },
    text: {
      primary: '#000000',
      secondary: 'rgba(0, 0, 0, 0.7)',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#000000 !important',
          opacity: '1 !important',
          fontWeight: 500,
          '&.Mui-selected': {
            color: '#1976d2 !important',
            fontWeight: 600,
          },
          '&.MuiTab-textColorInherit': {
            opacity: '1 !important',
            color: '#000000 !important',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
  },
});

function App() {
  const [chitAmount, setChitAmount] = useState('10L');
  const [customers, setCustomers] = useState([]);
  const [chits, setChits] = useState({ '10L': [], '5L': [], '1L': [] });
  const [filteredChits, setFilteredChits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChitAmountChange = (event, newValue) => {
    setChitAmount(newValue);
    setFilteredChits(chits[newValue] || []);
  };

  // Check authentication on app load
  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    
    // Check if there are any users in the system
    const existingUsers = JSON.parse(localStorage.getItem('appUsers') || '{}');
    
    // If no users exist, create a default admin user
    if (Object.keys(existingUsers).length === 0) {
      const defaultUsers = {
        'admin': 'admin123'
      };
      localStorage.setItem('appUsers', JSON.stringify(defaultUsers));
    }
    
    if (loggedInUser) {
      setIsLoggedIn(true);
      setCurrentUser(loggedInUser);
    } else {
      setLoginDialogOpen(true);
    }
  }, []);

  // Fetch customers and chits from the backend
  useEffect(() => {
    if (!isLoggedIn) return; // Only fetch data if user is logged in
    
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for chitAmount:', chitAmount);
        
        let customersData = [];
        let chitsData = [];
        
        // Try to fetch from backend with timeout
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 5000)
          );
          
          const [customersRes, chitsRes] = await Promise.race([
            Promise.all([
              fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/customers?chitAmount=${chitAmount}`),
              fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/chits?chitAmount=${chitAmount}`)
            ]),
            timeoutPromise
          ]);
          
          console.log('Customers response status:', customersRes.status);
          console.log('Chits response status:', chitsRes.status);
          
          if (customersRes.ok && chitsRes.ok) {
            customersData = await customersRes.json();
            chitsData = await chitsRes.json();
            console.log('Data loaded from backend successfully');
          } else {
            throw new Error('Backend returned error status');
          }
        } catch (fetchError) {
          console.log('Backend not available, using localStorage fallback:', fetchError.message);
          
          // Fallback to localStorage
          customersData = JSON.parse(localStorage.getItem(`customers_${chitAmount}`) || '[]');
          chitsData = JSON.parse(localStorage.getItem(`chits_${chitAmount}`) || '[]');
          
          console.log('Data loaded from localStorage:', { customers: customersData.length, chits: chitsData.length });
        }
        
        setCustomers(customersData);
        setChits(prev => ({ ...prev, [chitAmount]: chitsData }));
        setFilteredChits(chitsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Don't show error immediately on login, just use empty data
        if (error.message === 'Request timeout') {
          console.log('Backend server not responding, using empty data');
          setCustomers([]);
          setChits(prev => ({ ...prev, [chitAmount]: [] }));
          setFilteredChits([]);
        } else {
          setSnackbar({ open: true, message: 'Failed to load data. Please check if the backend server is running.', severity: 'error' });
        }
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to allow UI to render first
    const timer = setTimeout(fetchData, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn, chitAmount]); // Add isLoggedIn as dependency

  const addCustomer = async (customer) => {
    console.log('Customer submission attempt:', customer);
    
    // Use more precise duplicate check
    if (isExactDuplicateCustomer(customer, customers)) {
      console.log('DUPLICATE BLOCKED: Exact customer already exists:', customer);
      throw new Error('Customer with this name and phone already exists.');
    }
    
    // Disable submission tracker temporarily for debugging
    // if (!submissionTracker.canSubmit(customer, 'customer')) {
    //   console.log('DUPLICATE BLOCKED: Submission tracker blocked');
    //   throw new Error('Duplicate submission detected. Please wait a moment before trying again.');
    // }
    
    // Mark this submission immediately
    // submissionTracker.markSubmission(customer, 'customer');
    
    // Add timestamp for additional uniqueness
    const timestamp = Date.now();
    const customerWithChitAmount = {
      ...customer,
      chitAmount,
      id: timestamp, // Generate a simple unique ID
      submissionTimestamp: timestamp // Add submission timestamp
    };
    
    try {
      console.log('Submitting customer to server:', customerWithChitAmount);
      
      // Try to submit to backend, but handle gracefully if server is not running
      let newCustomer;
      try {
        const response = await fetch('http://localhost:3001/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerWithChitAmount),
        });
        
        if (!response.ok) {
          if (response.status === 409) {
            const errorData = await response.json();
            console.log('Backend server error:', errorData);
            throw new Error(errorData.error || 'Duplicate customer detected.');
          }
          throw new Error('Failed to add customer. Please ensure the JSON server is running.');
        }
        
        newCustomer = await response.json();
        console.log('Customer added successfully via backend:', newCustomer);
      } catch (fetchError) {
        console.log('Backend server not available, using local storage fallback:', fetchError.message);
        
        // Fallback: Create customer locally without backend
        newCustomer = {
          ...customerWithChitAmount,
          id: timestamp + Math.random(), // Ensure unique ID
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage as backup
        const localCustomers = JSON.parse(localStorage.getItem(`customers_${chitAmount}`) || '[]');
        localCustomers.push(newCustomer);
        localStorage.setItem(`customers_${chitAmount}`, JSON.stringify(localCustomers));
        
        console.log('Customer added locally:', newCustomer);
      }
      
      setCustomers([...customers, newCustomer]);
      
      console.log('Customer added successfully:', newCustomer);
      
      // Clear submission tracking immediately after success
      // submissionTracker.clearSubmission('customer');
      
      // Clear any browser storage that might cause resubmission
      if (typeof window !== 'undefined') {
        localStorage.removeItem('customerFormData');
        sessionStorage.removeItem('customerFormData');
        // Clear any form data that browser might have cached
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      // Clear submission tracking on error to allow retry
      // submissionTracker.clearSubmission('customer');
      throw error;
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId) => {
    // Optimistic UI update
    setCustomers(customers.filter(customer => customer.id !== customerId));
    
    // Also delete associated chits for the current chit amount
    const currentChits = chits[chitAmount] || [];
    const chitsToDelete = currentChits.filter(chit => chit.customerId === customerId);
    if (chitsToDelete.length > 0) {
      setChits(prev => ({
        ...prev,
        [chitAmount]: prev[chitAmount].filter(chit => chit.customerId !== customerId)
      }));
      setFilteredChits(prevChits => prevChits.filter(chit => chit.customerId !== customerId));
    }
    
    // API call with fallback
    try {
      const response = await fetch(`http://localhost:3001/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
      } else {
        throw new Error('Failed to delete from server');
      }
    } catch (error) {
      console.log('Backend not available, deleting from localStorage:', error.message);
      
      // Fallback: Remove from localStorage
      const localCustomers = JSON.parse(localStorage.getItem(`customers_${chitAmount}`) || '[]');
      const updatedCustomers = localCustomers.filter(c => c.id !== customerId);
      localStorage.setItem(`customers_${chitAmount}`, JSON.stringify(updatedCustomers));
      
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
    }
  };

  // Handle delete chit
  const handleDeleteChit = (chitId) => {
    // Optimistic UI update
    setChits(prev => ({
      ...prev,
      [chitAmount]: prev[chitAmount].filter(chit => chit.id !== chitId)
    }));
    setFilteredChits(prevChits => prevChits.filter(chit => chit.id !== chitId));
    
    // API call with fallback
    (async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/chits/${chitId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setSnackbar({ open: true, message: 'Chit record deleted successfully!', severity: 'success' });
        } else {
          throw new Error('Failed to delete from server');
        }
      } catch (error) {
        console.log('Backend not available, deleting from localStorage:', error.message);
        
        // Fallback: Remove from localStorage
        const localChits = JSON.parse(localStorage.getItem(`chits_${chitAmount}`) || '[]');
        const updatedChits = localChits.filter(c => c.id !== chitId);
        localStorage.setItem(`chits_${chitAmount}`, JSON.stringify(updatedChits));
        
        setSnackbar({ open: true, message: 'Chit record deleted successfully!', severity: 'success' });
      }
    })();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const addChit = async (chit) => {
    console.log('Chit submission attempt:', chit);
    
    // Temporarily disable submission tracker for debugging
    // if (!submissionTracker.canSubmit(chit, 'chit')) {
    //   console.log('DUPLICATE BLOCKED: Submission tracker blocked');
    //   throw new Error('Duplicate submission detected. Please wait a moment before trying again.');
    // }
    
    // Mark this submission immediately
    // submissionTracker.markSubmission(chit, 'chit');
    
    const currentChitAmount = chit.chitAmount || chitAmount;
    const chitWithAmount = {
      ...chit,
      chitAmount: currentChitAmount,
      id: Date.now(), // Generate a simple unique ID
      date: chit.date || new Date().toISOString().split('T')[0]
    };
    
    try {
      console.log('Submitting chit to server:', chitWithAmount);
      
      // Try to submit to backend, but handle gracefully if server is not running
      let newChit;
      try {
        const response = await fetch('http://localhost:3001/api/chits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chitWithAmount)
        });
        
        if (!response.ok) {
          if (response.status === 409) {
            const errorData = await response.json();
            console.log('Backend server error:', errorData);
            throw new Error(errorData.error || 'Duplicate chit detected.');
          }
          throw new Error('Failed to add chit record. Please ensure the JSON server is running.');
        }
        
        newChit = await response.json();
        console.log('Chit added successfully via backend:', newChit);
      } catch (fetchError) {
        console.log('Backend server not available, using local storage fallback:', fetchError.message);
        
        // Fallback: Create chit locally without backend
        newChit = {
          ...chitWithAmount,
          id: Date.now() + Math.random(), // Ensure unique ID
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage as backup
        const localChits = JSON.parse(localStorage.getItem(`chits_${currentChitAmount}`) || '[]');
        localChits.push(newChit);
        localStorage.setItem(`chits_${currentChitAmount}`, JSON.stringify(localChits));
        
        console.log('Chit added locally:', newChit);
      }
      
      // Update the specific chit amount's chits
      setChits(prevChits => {
        const updatedChits = {
          ...prevChits,
          [currentChitAmount]: [...(prevChits[currentChitAmount] || []), newChit]
        };
        
        // Also update filtered chits to show the new chit immediately
        const newFilteredChits = updatedChits[currentChitAmount] || [];
        setFilteredChits(newFilteredChits);
        
        console.log('Updated chits state:', updatedChits);
        console.log('Updated filtered chits:', newFilteredChits);
        
        return updatedChits;
      });
      
      console.log('Chit added successfully:', newChit);
      
      // Clear submission tracking immediately after success
      // submissionTracker.clearSubmission('chit');
      
      // Clear any browser storage that might cause resubmission
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chitFormData');
        sessionStorage.removeItem('chitFormData');
        // Clear any form data that browser might have cached
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      return newChit;
    } catch (error) {
      console.error('Error adding chit:', error);
      // Clear submission tracking on error to allow retry
      // submissionTracker.clearSubmission('chit');
      throw error;
    }
  };

  const handleFilterChits = (customerId) => {
    if (!customerId) {
      setFilteredChits(chits[chitAmount] || []);
      return;
    }
    const currentChits = chits[chitAmount] || [];
    setFilteredChits(currentChits.filter(chit => chit.customerId.toString() === customerId.toString()));
  };

  // Login and logout handlers
  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    localStorage.setItem('currentUser', username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    localStorage.removeItem('currentUser');
    setLoginDialogOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chit Fund Management
          </Typography>
          
          {isLoggedIn && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Welcome, {currentUser}
              </Typography>
              <IconButton onClick={handleLogout} color="inherit" size="small">
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
        
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          bgcolor: 'white',
          '& .MuiTabs-root': {
            minHeight: 48,
          },
          '& .MuiTab-root': {
            color: 'black',
            fontSize: '1rem',
            textTransform: 'none',
            minHeight: 48,
            padding: '12px 16px',
            opacity: 1,
            '&.Mui-selected': {
              color: '#1976d2',
              fontWeight: 600
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#1976d2',
            height: 3
          }
        }}>
          <Tabs 
            value={chitAmount} 
            onChange={handleChitAmountChange} 
            variant="fullWidth"
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                color: '#000000 !important',
                fontSize: '1rem',
                textTransform: 'none',
                minHeight: 48,
                opacity: '1 !important',
                '&.Mui-selected': {
                  color: '#1976d2 !important',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2',
                height: 3
              }
            }}
          >
            <Tab label="10 Lakhs" value="10L" />
            <Tab label="5 Lakhs" value="5L" />
            <Tab label="1 Lakh" value="1L" />
          </Tabs>
        </Box>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Customers" />
          <Tab label="Chits" />
          <Tab label="Profits" />
          <Tab label="Paata" />
          <Tab label="Users" />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <Typography>Loading...</Typography>
          </Box>
        ) : (
          <>
            {tabValue === 0 && (
              <Box>
                <CustomerForm chitAmount={chitAmount} onAddCustomer={addCustomer} />
                <CustomerList customers={customers} onDeleteCustomer={handleDeleteCustomer} />
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <ChitForm 
                  customers={customers} 
                  chitAmount={chitAmount}
                  onAddChit={addChit} 
                />
                <ChitList 
                  chits={filteredChits} 
                  customers={customers} 
                  onFilter={handleFilterChits}
                  onDeleteChit={handleDeleteChit}
                />
              </Box>
            )}

            {tabValue === 2 && (
              <ProfitTable chitAmount={chitAmount} />
            )}

            {tabValue === 3 && (
              <PaataTable chitAmount={chitAmount} />
            )}

            {tabValue === 4 && (
              <UserManagement />
            )}
          </>
        )}
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <LoginDialog 
        open={loginDialogOpen} 
        onClose={() => setLoginDialogOpen(false)} 
        onLogin={handleLogin}
      />
      
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  );
}

export default App;
