import React, { useState, useEffect } from 'react';
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
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Delete as DeleteIcon } from '@mui/icons-material';

function ProfitTable({ chitAmount }) {
  const [profits, setProfits] = useState([]);
  const [month, setMonth] = useState(new Date());
  const [amount, setAmount] = useState('');
  
  // Calculate profits with carry-forward logic
  const calculateProfitsWithCarryForward = (profits) => {
    if (!profits || profits.length === 0) return [];

    // Sort profits by month in ascending order
    const sortedProfits = [...profits].sort((a, b) => 
      new Date(a.month) - new Date(b.month)
    );

    let carryForward = 0;
    const result = [];
    const deductionAmount = chitAmount === '10L' ? 50000 : 
                          chitAmount === '5L' ? 25000 : 5000;

    for (let i = 0; i < sortedProfits.length; i++) {
      const current = { ...sortedProfits[i] };
      
      // Calculate current month's total
      let currentTotal = parseFloat(current.amount) + carryForward;
      let carryOver = 0;

      // Apply deduction if total is positive
      if (currentTotal > deductionAmount) {
        carryOver = currentTotal - deductionAmount;
        currentTotal = deductionAmount;
      } else {
        carryOver = 0;
      }

      // Update carry forward for next month
      carryForward = carryOver;

      // Add calculated values to result
      result.push({
        ...current,
        calculatedAmount: currentTotal,
        carryForward: carryOver
      });
    }

    return result;
  };
  
  const calculatedProfits = calculateProfitsWithCarryForward(profits);

  useEffect(() => {
    fetchProfits();
  }, [chitAmount]);

  const fetchProfits = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/profits?chitAmount=${chitAmount}`);
      const data = await response.json();
      setProfits(data);
    } catch (error) {
      console.error('Error fetching profits:', error);
    }
  };

  const handleAddProfit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!amount || isNaN(parseFloat(amount))) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!month) {
      alert('Please select a month');
      return;
    }

    try {
      const newProfit = {
        id: Date.now(), // Generate a unique ID
        chitAmount,
        month: format(month, 'yyyy-MM'),
        amount: parseFloat(amount),
        date: new Date().toISOString()
      };

      // Update local state immediately for better UX
      setProfits(prev => [...prev, newProfit]);
      setAmount('');
      setMonth(new Date());

      // Then send to server
      const response = await fetch('http://localhost:3001/api/profits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add profit');
      }
      
      // Refresh the list from server to ensure consistency
      fetchProfits();
    } catch (error) {
      console.error('Error adding profit:', error);
    }
  };

  const handleDeleteProfit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this profit record?')) {
      return;
    }

    try {
      console.log('Attempting to delete profit with ID:', id);
      
      // Optimistic UI update
      setProfits(prev => prev.filter(profit => profit.id !== id));
      
      const response = await fetch(`http://localhost:3001/api/profits/${id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        // If the server responds with an error, revert the optimistic update
        fetchProfits();
        const errorText = await response.text();
        console.error('Delete failed with status:', response.status, 'Response:', errorText);
      }
      
      console.log('Successfully deleted profit with ID:', id);
      
    } catch (error) {
      console.error('Error in handleDeleteProfit:', error);
      alert('Failed to delete profit. Please check the console for details.');
      // Re-fetch to ensure UI is in sync with server
      fetchProfits();
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Profit Management - {chitAmount} Chit
      </Typography>
      
      <Box 
        component="form" 
        onSubmit={handleAddProfit}
        display="flex" 
        gap={2} 
        mb={3}
        alignItems="flex-end"
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={['year', 'month']}
            label="Month"
            value={month}
            onChange={setMonth}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <TextField
          label="Profit Amount (₹)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={!amount || !month}
        >
          Add Profit
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell align="right">Profit Amount (₹)</TableCell>
              <TableCell align="right">Calculated (₹)</TableCell>
              <TableCell align="right">Carry Forward (₹)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calculatedProfits.length > 0 ? (
              calculatedProfits.map((profit) => (
                <TableRow key={profit.id}>
                  <TableCell>{profit.month}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('en-IN').format(profit.amount)}
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('en-IN').format(profit.calculatedAmount || 0)}
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('en-IN').format(profit.carryForward || 0)}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteProfit(profit.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No profit records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ProfitTable;
