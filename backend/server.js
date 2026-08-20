require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const { startDailyReportJob } = require('./src/utils/scheduler');

const authRoutes = require('./src/routes/auth');
const brandRoutes = require('./src/routes/brands');
const modelRoutes = require('./src/routes/models');
const linkRoutes = require('./src/routes/links');
const sessionRoutes = require('./src/routes/sessions');
const reportRoutes = require('./src/routes/reports');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serves uploaded photos

app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Copper Shop Quality Check backend running on port ${PORT}`);
    startDailyReportJob();
  });
});
