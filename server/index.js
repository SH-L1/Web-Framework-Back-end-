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
  region_city_group: String,
  region_city: String,
  age: String,
  visit_days: Number,
  total_payment_may: Number,
  retained_90: String,
});

const UserConfigSchema = new mongoose.Schema({
  userId: String,
  targetRegion: String,
  targetAge: String,
});

const MarketingActionSchema = new mongoose.Schema({
  userId: String, 
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String, 
});

const Customer = mongoose.model('Customer', CustomerSchema, 'customers');
const UserConfig = mongoose.model('UserConfig', UserConfigSchema, 'user_configs');
const MarketingAction = mongoose.model('MarketingAction', MarketingActionSchema, 'marketing_actions');
const User = mongoose.model('User', UserSchema, 'users');

app.get('/api/customers/all', async (req, res) => {
  try {
    const allCustomers = await Customer.find({});
    res.json(allCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    
    if (!user) {
      user = await User.create({ username, password });
    } else {
      if (user.password !== password) {
        return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
      }
    }
    res.json({ userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/config/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let config = await UserConfig.findOne({ userId });
    if (!config) {
      config = await UserConfig.create({ userId, targetRegion: '전체', targetAge: '전체' });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const { userId, targetRegion, targetAge } = req.body;
    const config = await UserConfig.findOneAndUpdate(
      { userId },
      { targetRegion, targetAge },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/marketing/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const actions = await MarketingAction.find({ userId }).sort({ createdAt: -1 });
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/marketing', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const newAction = await MarketingAction.create({ userId, content });
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