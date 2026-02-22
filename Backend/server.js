const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://fitness-tracker-wheat-one.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options('*', cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entries'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});