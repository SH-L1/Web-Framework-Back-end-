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

// ★ [수정됨] region_city_group 필드 추가
const CustomerSchema = new mongoose.Schema({
  uid: String,
  region_city_group: String, // 예: Gyeonggi-do
  region_city: String,       // 예: Yongin
  age: String,
  visit_days: Number,
  total_payment_may: Number,
  retained_90: String,
});

const UserConfigSchema = new mongoose.Schema({
  userId: { type: String, default: 'admin' },
  targetRegion: String,
  targetAge: String,
});

const MarketingActionSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.model('Customer', CustomerSchema, 'customers');
const UserConfig = mongoose.model('UserConfig', UserConfigSchema, 'user_configs');
const MarketingAction = mongoose.model('MarketingAction', MarketingActionSchema, 'marketing_actions');

// --- API 라우트 ---

app.get('/api/customers/all', async (req, res) => {
  try {
    const allCustomers = await Customer.find({});
    res.json(allCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/config', async (req, res) => {
  try {
    let config = await UserConfig.findOne({ userId: 'admin' });
    if (!config) {
      config = await UserConfig.create({ userId: 'admin', targetRegion: '전체', targetAge: '전체' });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const { targetRegion, targetAge } = req.body;
    const config = await UserConfig.findOneAndUpdate(
      { userId: 'admin' },
      { targetRegion, targetAge },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/marketing', async (req, res) => {
  try {
    const actions = await MarketingAction.find().sort({ createdAt: -1 });
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/marketing', async (req, res) => {
  try {
    const { content } = req.body;
    const newAction = await MarketingAction.create({ content });
    res.json(newAction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/marketing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await MarketingAction.findByIdAndDelete(id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});