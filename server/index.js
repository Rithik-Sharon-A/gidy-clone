const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

require('dotenv').config();

// Validate required env vars before starting
const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('Set these in Render Dashboard -> Your Service -> Environment');
  process.exit(1);
}

const app = express();

// Connect to MongoDB
connectDB();

// Middleware - allow localhost for dev, CLIENT_URL for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Profile API' }));

app.use('/api', require('./routes/routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
