require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'https://growwpaisa.com', // You can replace '*' with your frontend domain if needed
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());

// Import Routes
const userRouter = require('./routes/authRoute');
const walletRouter = require('./routes/walletRoute');
const clickRouter = require('./routes/click');
const postbackRouter = require('./routes/postback');
const CampaignRouter = require('./routes/campaignRoute');

// Mount the routers
app.use('/auth/user', userRouter); // This will handle /auth/user/users
app.use('/api/wallet', walletRouter);
app.use('/click', clickRouter);
app.use('/postback', postbackRouter);
app.use('/campaign', CampaignRouter);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
