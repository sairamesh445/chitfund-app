import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Typography, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Select,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function ChitForm({ customers, chitAmount, onAddChit }) {
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    date: new Date(),
    accountDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const [filteredCustomers, setFilteredCustomers] = useState(
    customers.filter(c => c.chitAmount === chitAmount)
  );

  // Prevent form resubmission on page load
  useEffect(() => {
    // Clear any form data that might be stored by browser
    const navigationEntries = performance.getEntriesByType('navigation');
    const isRefresh = navigationEntries.length > 0 && 
                     (navigationEntries[0].type === 'reload' || 
                      window.performance?.navigation?.type === 1);
    
    if (isRefresh) {
      // Page was refreshed - completely clear form
      console.log('PAGE REFRESH DETECTED - Clearing ChitForm');
      setFormData({
        customerId: '',
        amount: '',
        date: new Date(),
        accountDetails: ''
      });
      setIsSubmitting(false);
      setLastSubmissionTime(0);
    }
    
    // Clear any POST data that browser might have cached
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Update filtered customers when customers or chitAmount changes
  useEffect(() => {
    const filtered = customers.filter(customer => customer.chitAmount === chitAmount);
    setFilteredCustomers(filtered);
    
    // Reset customer selection if the current selection is not in the filtered list
    if (formData.customerId && !filtered.some(c => c.id === formData.customerId)) {
      setFormData(prev => ({ ...prev, customerId: '' }));
    }
  }, [customers, chitAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date || new Date()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('ChitForm handleSubmit called');
    
    // IMMEDIATE FORM DISABLE - Prevent any further submissions
    if (isSubmitting) {
      console.log('CHIT FORM BLOCKED: Already submitting');
      return;
    }
    
    // Multiple layers of duplicate prevention
    const currentTime = Date.now();
    
    // Prevent rapid successive submissions (within 5 seconds)
    if (currentTime - lastSubmissionTime < 5000) {
      console.log('CHIT FORM BLOCKED: Too rapid submission');
      return;
    }
    
    // Validate form data
    if (!formData.customerId || !formData.amount) {
      console.log('CHIT FORM BLOCKED: Invalid form data');
      return;
    }
    
    // Prevent empty submissions
    const customerIdStr = String(formData.customerId || '');
    const amountStr = String(formData.amount || '');
    
    if (customerIdStr.trim() === '' || amountStr.trim() === '') {
      console.log('CHIT FORM BLOCKED: Empty form data');
      return;
    }
    
    // IMMEDIATELY DISABLE FORM AND MARK SUBMISSION
    setIsSubmitting(true);
    setLastSubmissionTime(currentTime);
    
    // Clear form immediately to prevent resubmission
    const originalFormData = { ...formData };
    setFormData({
      customerId: '',
      amount: '',
      date: formData.date,
      accountDetails: ''
    });
    
    try {
      console.log('Submitting chit:', originalFormData);
      
      const formattedDate = originalFormData.date ? 
        new Date(originalFormData.date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
        
      console.log('Calling onAddChit with data:', {
        customerId: originalFormData.customerId,
        amount: parseFloat(originalFormData.amount),
        date: formattedDate,
        accountDetails: originalFormData.accountDetails.trim(),
        chitAmount
      });
          
      await onAddChit({
        customerId: originalFormData.customerId,
        amount: parseFloat(originalFormData.amount),
        date: formattedDate,
        accountDetails: originalFormData.accountDetails.trim(),
        chitAmount
      });
      
      console.log('onAddChit completed successfully');
      
      // Multiple methods to prevent resubmission
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clear any form data that might be stored
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('chitFormData');
        localStorage.removeItem('chitFormData');
      }
      
      console.log('Chit submitted successfully');
    } catch (error) {
      console.error('Error adding chit:', error);
      
      // Restore form data on error to allow retry
      setFormData(originalFormData);
      setLastSubmissionTime(0);
      
      // Re-throw error to show user
      throw error;
    } finally {
      // Always clear submitting state after a delay
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Add New Chit Record - {chitAmount} Chit
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="customer-label">Customer</InputLabel>
          <Select
            labelId="customer-label"
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            label="Customer"
            displayEmpty
          >
            <MenuItem value="" disabled>
              <em> </em>
            </MenuItem>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name} ({customer.phone || 'No phone'})
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No customers found for {chitAmount} chit</MenuItem>
            )}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                margin="normal"
                required
              />
            )}
          />
        </LocalizationProvider>

        <TextField
          margin="normal"
          required
          fullWidth
          id="amount"
          label="Amount (₹)"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          inputProps={{
            step: '0.01',
            min: '0'
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              margin="normal"
              fullWidth
              id="accountDetails"
              label="Account Details"
              name="accountDetails"
              multiline
              rows={2}
              value={formData.accountDetails}
              onChange={handleChange}
              placeholder="Bank name, account number, etc."
              required
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{ mt: 3, mb: 2 }}
        >
          {isSubmitting ? 'Adding Chit...' : 'Add Chit Record'}
        </Button>
      </Box>
    </Paper>
  );
}

export default ChitForm;
