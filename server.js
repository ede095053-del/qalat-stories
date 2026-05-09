const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'qalat_secret_2024';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://qalat:qalat2024@cluster0.llbk9as.mongodb.net/qalat?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

// ── Mongoose Schemas ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt:{ type: Date, default: Date.now }
});

const chapterSchema = new mongoose.Schema({
  title:   String,
  content: String,
  images:  [String],
  createdAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  name:   String,
  text:   String,
  userId: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

const storySchema = new mongoose.Schema({
  title:      String,
  authorId:   mongoose.Schema.Types.Mixed,
  authorName: String,
  genre:      String,
  language:   String,
  description:String,
  emoji:      String,
  color:      String,
  coverPhoto: String,
  reads:      { type: Number, default: 0 },
  likes:      { type: Number, default: 0 },
  likedBy:    [mongoose.Schema.Types.Mixed],
  trending:   { type: Boolean, default: false },
  chapters:   [chapterSchema],
  comments:   [commentSchema],
  createdAt:  { type: Date, default: Date.now }
});

const User  = mongoose.model('User',  userSchema);
const Story = mongoose.model('Story', storySchema);

// ── Auth middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── AUTH routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      if (exists.email === email) return res.status(400).json({ error: 'Email already registered' });
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    const token = jwt.sign({ id: user._id, username, email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, username, email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No account with that email' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });
    const token = jwt.sign({ id: user._id, username: user.username, email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id, username: user.username, email: user.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── STORY routes ──────────────────────────────────────────────────────────────
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/stories', authMiddleware, async (req, res) => {
  try {
    const story = await Story.create({
      ...req.body,
      authorId:   req.user.id,
      authorName: req.user.username
    });
    res.json(story);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/stories/:id/chapters', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (String(story.authorId) !== String(req.user.id))
      return res.status(403).json({ error: 'Not your story' });
    story.chapters.push(req.body);
    await story.save();
    res.json(story);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/stories/:id/like', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.likedBy.map(String).includes(String(req.user.id)))
      return res.json({ likes: story.likes, alreadyLiked: true });
    story.likedBy.push(req.user.id);
    story.likes += 1;
    await story.save();
    res.json({ likes: story.likes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/stories/:id/read', async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id, { $inc: { reads: 1 } }, { new: true }
    );
    res.json({ reads: story.reads });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Edit story info
app.put('/api/stories/:id', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (String(story.authorId) !== String(req.user.id))
      return res.status(403).json({ error: 'Not your story' });
    const { title, description, emoji, color } = req.body;
    if (title) story.title = title;
    if (description) story.description = description;
    if (emoji) story.emoji = emoji;
    if (color) story.color = color;
    await story.save();
    res.json(story);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Edit a chapter
app.put('/api/stories/:id/chapters/:chIndex', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (String(story.authorId) !== String(req.user.id))
      return res.status(403).json({ error: 'Not your story' });
    const ch = story.chapters[req.params.chIndex];
    if (!ch) return res.status(404).json({ error: 'Chapter not found' });
    if (req.body.title) ch.title = req.body.title;
    if (req.body.content) ch.content = req.body.content;
    await story.save();
    res.json(story);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete a chapter
app.delete('/api/stories/:id/chapters/:chIndex', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (String(story.authorId) !== String(req.user.id))
      return res.status(403).json({ error: 'Not your story' });
    story.chapters.splice(req.params.chIndex, 1);
    await story.save();
    res.json(story);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/stories/:id/comments', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    story.comments.push({ name: req.user.username, text: req.body.text, userId: req.user.id });
    await story.save();
    res.json(story.comments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Connect & Start ───────────────────────────────────────────────────────────
// Start server first so Render detects the open port
app.listen(PORT, () => console.log(`🚀 Qalat running on port ${PORT}`));

// Then connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err.message));
