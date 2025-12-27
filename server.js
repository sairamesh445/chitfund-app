const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    customers: [],
    chits: [],
    profits: []
  }, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read data
const readData = () => {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

// Helper function to write data
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Routes
app.get('/api/customers', (req, res) => {
  const { chitAmount } = req.query;
  const data = readData();
  let customers = data.customers;
  
  if (chitAmount) {
    customers = customers.filter(c => c.chitAmount === chitAmount);
  }
  
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const data = readData();
  
  // Generate hash for duplicate detection
  const generateHash = (customer) => {
    const customerData = `${customer.name.trim().toLowerCase()}_${customer.phone.trim()}_${customer.chitAmount}`;
    return Buffer.from(customerData).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  };
  
  const customerHash = generateHash(req.body);
  
  // Check for duplicates using hash
  const existingCustomer = data.customers.find(c => {
    const existingHash = generateHash(c);
    return existingHash === customerHash;
  });
  
  if (existingCustomer) {
    console.log('SERVER: Duplicate customer blocked', { hash: customerHash });
    return res.status(409).json({ 
      error: 'Customer with this name and phone already exists.',
      duplicate: true 
    });
  }
  
  // Check for recent submissions with same data (within 30 seconds)
  const thirtySecondsAgo = Date.now() - 30000;
  const recentDuplicate = data.customers.find(c => 
    c.name?.trim().toLowerCase() === req.body.name?.trim().toLowerCase() &&
    c.phone?.trim() === req.body.phone?.trim() &&
    c.chitAmount === req.body.chitAmount &&
    c.id && parseInt(c.id) > thirtySecondsAgo
  );
  
  if (recentDuplicate) {
    console.log('SERVER: Recent duplicate submission blocked');
    return res.status(409).json({ 
      error: 'Recent duplicate submission detected.',
      duplicate: true 
    });
  }
  
  const newCustomer = { 
    ...req.body, 
    id: Date.now().toString(),
    hash: customerHash,
    createdAt: new Date().toISOString()
  };
  
  data.customers.push(newCustomer);
  writeData(data);
  res.status(201).json(newCustomer);
});

app.delete('/api/customers/:id', (req, res) => {
  const data = readData();
  const customerId = req.params.id;
  
  // Delete customer
  data.customers = data.customers.filter(c => c.id !== customerId);
  
  // Delete associated chits
  data.chits = data.chits.filter(c => c.customerId !== customerId);
  
  writeData(data);
  res.status(204).send();
});

// Chits routes
app.get('/api/chits', (req, res) => {
  const { chitAmount, customerId } = req.query;
  const data = readData();
  let chits = data.chits;
  
  if (chitAmount) {
    chits = chits.filter(c => c.chitAmount === chitAmount);
  }
  
  if (customerId) {
    chits = chits.filter(c => c.customerId === customerId);
  }
  
  res.json(chits);
});

app.post('/api/chits', (req, res) => {
  const data = readData();
  
  // Generate hash for duplicate detection
  const generateHash = (chit) => {
    const chitData = `${chit.customerId}_${chit.amount}_${chit.date}_${chit.accountDetails.trim()}`;
    return Buffer.from(chitData).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  };
  
  const chitHash = generateHash(req.body);
  
  // Check for duplicates using hash
  const existingChit = data.chits.find(c => {
    const existingHash = generateHash(c);
    return existingHash === chitHash;
  });
  
  if (existingChit) {
    console.log('SERVER: Duplicate chit blocked', { hash: chitHash });
    return res.status(409).json({ 
      error: 'This chit record already exists.',
      duplicate: true 
    });
  }
  
  // Check for recent submissions with same data (within 30 seconds)
  const thirtySecondsAgo = Date.now() - 30000;
  const recentDuplicate = data.chits.find(c => 
    c.customerId === req.body.customerId &&
    c.amount === req.body.amount &&
    c.date === req.body.date &&
    c.chitAmount === req.body.chitAmount &&
    c.id && parseInt(c.id) > thirtySecondsAgo
  );
  
  if (recentDuplicate) {
    console.log('SERVER: Recent duplicate chit submission blocked');
    return res.status(409).json({ 
      error: 'Recent duplicate chit submission detected.',
      duplicate: true 
    });
  }
  
  const newChit = { 
    ...req.body, 
    id: Date.now().toString(),
    date: req.body.date || new Date().toISOString().split('T')[0],
    hash: chitHash,
    createdAt: new Date().toISOString()
  };
  
  data.chits.push(newChit);
  writeData(data);
  res.status(201).json(newChit);
});

app.delete('/api/chits/:id', (req, res) => {
  const data = readData();
  const chitId = req.params.id;
  
  data.chits = data.chits.filter(c => c.id !== chitId);
  writeData(data);
  res.status(204).send();
});

// Profits routes
app.get('/api/profits', (req, res) => {
  const { chitAmount } = req.query;
  const data = readData();
  let profits = data.profits;
  
  if (chitAmount) {
    profits = profits.filter(p => p.chitAmount === chitAmount);
  }
  
  res.json(profits);
});

app.post('/api/profits', (req, res) => {
  const data = readData();
  const newProfit = { 
    ...req.body, 
    id: Date.now().toString(),
    month: req.body.month || new Date().toISOString().slice(0, 7) // YYYY-MM format
  };
  
  data.profits.push(newProfit);
  writeData(data);
  res.status(201).json(newProfit);
});

app.delete('/api/profits/:id', (req, res) => {
  const data = readData();
  const profitId = req.params.id;
  
  data.profits = data.profits.filter(p => p.id !== profitId);
  writeData(data);
  res.status(204).send();
});

// Paata routes
app.get('/api/paata', (req, res) => {
  const { chitAmount } = req.query;
  const data = readData();
  let paata = data.paata || [];
  
  if (chitAmount) {
    paata = paata.filter(p => p.chitAmount === chitAmount);
  }
  
  res.json(paata);
});

app.post('/api/paata', (req, res) => {
  const data = readData();
  const newPaata = { 
    ...req.body, 
    id: Date.now().toString(),
    month: req.body.month || new Date().toISOString().slice(0, 7), // YYYY-MM format
    date: new Date().toISOString()
  };
  
  // Initialize paata array if it doesn't exist
  if (!data.paata) {
    data.paata = [];
  }
  
  data.paata.push(newPaata);
  writeData(data);
  res.status(201).json(newPaata);
});

app.delete('/api/paata/:id', (req, res) => {
  const data = readData();
  const paataId = req.params.id;
  
  if (!data.paata) {
    data.paata = [];
  }
  
  data.paata = data.paata.filter(p => p.id !== paataId);
  writeData(data);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
