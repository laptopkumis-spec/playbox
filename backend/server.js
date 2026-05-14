const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/api/ping', (req, res) => res.json({ message: 'pong', env: process.env.VITE_API_BASE_URL }));
app.use('/api', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.APP_ENV === 'local' ? err.message : undefined
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.APP_PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
