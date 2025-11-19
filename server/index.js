require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB에 성공적으로 연결되었습니다.'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

const CustomerSchema = new mongoose.Schema({
  uid: String,
  region_city: String,
  age: String,
  visit_days: Number,
  total_payment_may: Number,
  retained_90: String,
});

const Customer = mongoose.model('Customer', CustomerSchema, 'customers');

app.get('/api/customers/all', async (req, res) => {
  try {
    const allCustomers = await Customer.find({});
    res.json(allCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/churn-risk', async (req, res) => {
  try {
    const churnRiskCustomers = await Customer.find({ retained_90: '0' });
    res.json(churnRiskCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});