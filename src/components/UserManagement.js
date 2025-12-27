import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const UserManagement = () => {
  const [users, setUsers] = useState({});
  const [newUser, setNewUser] = useState({ userId: '', password: '', confirmPassword: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('appUsers') || '{}');
    setUsers(storedUsers);
  };

  const handleAddUser = () => {
    setError('');
    setSuccess('');

    if (!newUser.userId.trim() || !newUser.password.trim()) {
      setError('User ID and Password are required');
      return;
    }

    if (newUser.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const updatedUsers = { ...users };
    if (updatedUsers[newUser.userId]) {
      setError('User ID already exists');
      return;
    }

    updatedUsers[newUser.userId] = newUser.password;
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setNewUser({ userId: '', password: '', confirmPassword: '' });
    setDialogOpen(false);
    setSuccess('User created successfully!');
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm(`Are you sure you want to delete user "${userId}"?`)) {
      const updatedUsers = { ...users };
      delete updatedUsers[userId];
      localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setSuccess('User deleted successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewUser({ userId: '', password: '', confirmPassword: '' });
    setError('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add New User
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(users).map(([userId]) => (
              <TableRow key={userId}>
                <TableCell>{userId}</TableCell>
                <TableCell>
                  <Chip 
                    label="Active" 
                    color="success" 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>System User</TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteUser(userId)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {Object.keys(users).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No users found. Click "Add New User" to create the first user.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="User ID"
              value={newUser.userId}
              onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={newUser.confirmPassword}
              onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
              margin="normal"
              required
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
