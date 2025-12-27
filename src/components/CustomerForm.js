import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function CustomerForm({ chitAmount, onAddCustomer }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    chitAmount: chitAmount || '10L'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  // Update chitAmount when prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      chitAmount: chitAmount || '10L'
    }));
  }, [chitAmount]);

  // Prevent form resubmission on page load
  useEffect(() => {
    // Clear any form data that might be stored by browser
    const navigationEntries = performance.getEntriesByType('navigation');
    const isRefresh = navigationEntries.length > 0 && 
                     (navigationEntries[0].type === 'reload' || 
                      window.performance?.navigation?.type === 1);
    
    if (isRefresh) {
      // Page was refreshed - completely clear form
      console.log('PAGE REFRESH DETECTED - Clearing CustomerForm');
      setFormData({
        name: '',
        address: '',
        phone: '',
        chitAmount: chitAmount || '10L'
      });
      setIsSubmitting(false);
      setLastSubmissionTime(0);
    }
    
    // Clear any POST data that browser might have cached
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [chitAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('CustomerForm handleSubmit called');
    
    // IMMEDIATE FORM DISABLE - Prevent any further submissions
    if (isSubmitting) {
      console.log('CUSTOMER FORM BLOCKED: Already submitting');
      return;
    }
    
    // Multiple layers of duplicate prevention
    const currentTime = Date.now();
    
    // Prevent rapid successive submissions (within 5 seconds)
    if (currentTime - lastSubmissionTime < 5000) {
      console.log('CUSTOMER FORM BLOCKED: Too rapid submission');
      return;
    }
    
    // Validate form data
    if (!formData.name || !formData.phone) {
      console.log('CUSTOMER FORM BLOCKED: Invalid form data');
      return;
    }
    
    // Prevent empty submissions
    if (formData.name.trim() === '' || formData.phone.trim() === '') {
      console.log('CUSTOMER FORM BLOCKED: Empty form data');
      return;
    }
    
    // IMMEDIATELY DISABLE FORM AND MARK SUBMISSION
    setIsSubmitting(true);
    setLastSubmissionTime(currentTime);
    
    // Clear form immediately to prevent resubmission
    const originalFormData = { ...formData };
    setFormData({
      name: '',
      address: '',
      phone: '',
      chitAmount: formData.chitAmount
    });
    
    try {
      console.log('Submitting customer:', originalFormData);
      
      await onAddCustomer({
        name: originalFormData.name.trim(),
        address: originalFormData.address.trim(),
        phone: originalFormData.phone.trim(),
        chitAmount: originalFormData.chitAmount
      });
      
      // Multiple methods to prevent resubmission
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clear any form data that might be stored
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('customerFormData');
        localStorage.removeItem('customerFormData');
      }
      
      console.log('Customer submitted successfully');
    } catch (error) {
      console.error('Error adding customer:', error);
      
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
        Add New Customer
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Customer Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          id="address"
          label="Address"
          name="address"
          multiline
          rows={2}
          value={formData.address}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="phone"
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="chit-amount-label">Chit Amount</InputLabel>
          <Select
            labelId="chit-amount-label"
            id="chitAmount"
            name="chitAmount"
            value={formData.chitAmount}
            label="Chit Amount"
            onChange={handleChange}
          >
            <MenuItem value="10L">10 Lakhs</MenuItem>
            <MenuItem value="5L">5 Lakhs</MenuItem>
            <MenuItem value="1L">1 Lakh</MenuItem>
          </Select>
        </FormControl>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{ mt: 3, mb: 2 }}
        >
          {isSubmitting ? 'Adding Customer...' : 'Add Customer'}
        </Button>
      </Box>
    </Paper>
  );
}

export default CustomerForm;
