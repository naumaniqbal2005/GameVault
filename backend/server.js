const express = require('express');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const membershipRoutes = require('./routes/membershipRoutes');

const app = express();
app.use(express.json()); 
app.use(cors());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/memberships', membershipRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });
  

const PORT = 5000;


app.get('/', (req, res) => {
    res.send('Hello from Node.js Backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});