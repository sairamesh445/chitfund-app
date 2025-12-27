import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Delete as DeleteIcon } from '@mui/icons-material';
function PaataTable({ chitAmount }) {
  const [paata, setPaata] = useState([]);
  const [month, setMonth] = useState(new Date());
  const [amount, setAmount] = useState('');

  const fetchPaata = useCallback(async () => {
    try {
      console.log('Fetching PAATA data for chitAmount:', chitAmount);
      
      let data = [];
      
      // Try to fetch from backend with timeout
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const response = await Promise.race([
          fetch(`http://localhost:3001/api/paata?chitAmount=${chitAmount}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          timeoutPromise
        ]);
        
        console.log('PAATA API response status:', response.status);
        
        if (response.ok) {
          data = await response.json();
          console.log('PAATA data loaded from backend:', data);
        } else {
          throw new Error('Backend returned error status');
        }
      } catch (fetchError) {
        console.log('Backend not available, using localStorage fallback:', fetchError.message);
        
        // Fallback to localStorage
        data = JSON.parse(localStorage.getItem(`paata_${chitAmount}`) || '[]');
        console.log('PAATA data loaded from localStorage:', data);
      }
      
      // Ensure we have an array, even if empty
      if (!Array.isArray(data)) {
        console.warn('PAATA API did not return an array, using empty array');
        setPaata([]);
        return;
      }
      
      setPaata(data);
    } catch (error) {
      console.error('Error fetching paata data:', error);
      console.log('Server might not be running. Setting empty array'); // Debug log
      
      // Set empty array instead of fallback data
      setPaata([]);
    }
  }, [chitAmount]);

  useEffect(() => {
    fetchPaata();
  }, [fetchPaata]);

  const handleAddPaata = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(parseFloat(amount))) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!month) {
      alert('Please select a month');
      return;
    }

    try {
      // Create paata object without ID (server will generate it)
      const paataData = {
        chitAmount,
        month: format(month, 'yyyy-MM'),
        amount: parseFloat(amount),
        date: new Date().toISOString()
      };

      console.log('Adding PAATA data:', paataData);

      // Try to submit to backend, but handle gracefully if server is not running
      let newPaata;
      try {
        const response = await fetch('http://localhost:3001/api/paata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paataData),
        });

        console.log('PAATA add response status:', response.status);

        if (!response.ok) {
          // Check if response is HTML (server error page)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            throw new Error('Server is not running');
          }
          
          const errorText = await response.text();
          console.error('Add PAATA error response:', errorText);
          throw new Error('Failed to add paata: ' + errorText);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned invalid response format');
        }
        
        newPaata = await response.json();
        console.log('PAATA added successfully via backend:', newPaata);
      } catch (fetchError) {
        console.log('Backend not available, adding PAATA locally:', fetchError.message);
        
        // Fallback: Create paata locally without backend
        newPaata = {
          ...paataData,
          id: Date.now() + Math.random(), // Ensure unique ID
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage as backup
        const localPaata = JSON.parse(localStorage.getItem(`paata_${chitAmount}`) || '[]');
        localPaata.push(newPaata);
        localStorage.setItem(`paata_${chitAmount}`, JSON.stringify(localPaata));
        
        console.log('PAATA added locally:', newPaata);
      }
      
      // Update local state immediately
      setPaata(prevPaata => [...prevPaata, newPaata]);
      console.log('PAATA added successfully:', newPaata);
      
      // Refresh data to get the latest list
      fetchPaata();
      
      // Clear form
      setAmount('');
      setMonth(new Date());
      
    } catch (error) {
      console.error('Error adding paata:', error);
      alert('Failed to add paata: ' + error.message);
    }
  };

  const handleDeletePaata = async (id) => {
    if (!window.confirm('Are you sure you want to delete this paata record?')) {
      return;
    }

    // Optimistic UI update
    setPaata(prev => prev.filter(item => item.id !== id));

    try {
      const response = await fetch(`http://localhost:3001/api/paata/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete from server');
      }
      
      console.log('PAATA deleted successfully from backend');
    } catch (error) {
      console.log('Backend not available, deleting from localStorage:', error.message);
      
      // Fallback: Remove from localStorage
      const localPaata = JSON.parse(localStorage.getItem(`paata_${chitAmount}`) || '[]');
      const updatedPaata = localPaata.filter(item => item.id !== id);
      localStorage.setItem(`paata_${chitAmount}`, JSON.stringify(updatedPaata));
      
      console.log('PAATA deleted from localStorage');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant='h6' gutterBottom>
        Paata Management - {chitAmount} Chit
      </Typography>
      
      <Box 
        component='form' 
        onSubmit={handleAddPaata}
        display='flex' 
        gap={2} 
        mb={3}
        alignItems='flex-end'
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={['year', 'month']}
            label='Month'
            value={month}
            onChange={setMonth}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <TextField
          label='Paata Amount (₹)'
          type='number'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Button 
          type='submit' 
          variant='contained' 
          color='primary'
          disabled={!amount || !month}
        >
          Add Paata
        </Button>
      </Box>
      
      {/* Paata List Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell align="right">Amount (₹)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paata.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.month}</TableCell>
                <TableCell align="right">
                  ₹{new Intl.NumberFormat('en-IN').format(item.amount)}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeletePaata(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default PaataTable;
