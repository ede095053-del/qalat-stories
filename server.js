const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'qalat_secret_2024';
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const STORIES_FILE = path.join(__dirname, 'data', 'stories.json');

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

// ── helpers ──────────────────────────────────────────────────────────────────
function ensureData() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
  if (!fs.existsSync(STORIES_FILE)) fs.writeFileSync(STORIES_FILE, '[]');
}

function readJSON(file) {
  ensureData();
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return []; }
}

function writeJSON(file, data) {
  ensureData();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

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

// ── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  const users = readJSON(USERS_FILE);
  if (users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email already registered' });
  if (users.find(u => u.username === username))
    return res.status(400).json({ error: 'Username already taken' });

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), username, email, password: hashed, createdAt: Date.now() };
  users.push(user);
  writeJSON(USERS_FILE, users);

  const token = jwt.sign({ id: user.id, username, email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, username, email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'No account with that email' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Wrong password' });

  const token = jwt.sign({ id: user.id, username: user.username, email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, username: user.username, email } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, email: user.email });
});

// ── STORIES ──────────────────────────────────────────────────────────────────
app.get('/api/stories', (req, res) => {
  res.json(readJSON(STORIES_FILE));
});

app.post('/api/stories', authMiddleware, (req, res) => {
  const stories = readJSON(STORIES_FILE);
  const story = {
    ...req.body,
    id: Date.now(),
    authorId: req.user.id,
    authorName: req.user.username,
    reads: 0, likes: 0,
    likedBy: [],
    trending: false,
    createdAt: Date.now(),
    comments: [],
    chapters: req.body.chapters || []
  };
  stories.unshift(story);
  writeJSON(STORIES_FILE, stories);
  res.json(story);
});

app.post('/api/stories/:id/chapters', authMiddleware, (req, res) => {
  const stories = readJSON(STORIES_FILE);
  const story = stories.find(s => String(s.id) === String(req.params.id));
  if (!story) return res.status(404).json({ error: 'Story not found' });
  if (String(story.authorId) !== String(req.user.id))
    return res.status(403).json({ error: 'Not your story' });
  story.chapters.push({ ...req.body, createdAt: Date.now() });
  writeJSON(STORIES_FILE, stories);
  res.json(story);
});

app.post('/api/stories/:id/like', authMiddleware, (req, res) => {
  const stories = readJSON(STORIES_FILE);
  const story = stories.find(s => String(s.id) === String(req.params.id));
  if (!story) return res.status(404).json({ error: 'Story not found' });
  story.likedBy = story.likedBy || [];
  if (story.likedBy.includes(req.user.id)) {
    return res.json({ likes: story.likes, alreadyLiked: true });
  }
  story.likedBy.push(req.user.id);
  story.likes = (story.likes || 0) + 1;
  writeJSON(STORIES_FILE, stories);
  res.json({ likes: story.likes });
});

app.post('/api/stories/:id/read', (req, res) => {
  const stories = readJSON(STORIES_FILE);
  const story = stories.find(s => String(s.id) === String(req.params.id));
  if (!story) return res.status(404).json({ error: 'Story not found' });
  story.reads = (story.reads || 0) + 1;
  writeJSON(STORIES_FILE, stories);
  res.json({ reads: story.reads });
});

app.post('/api/stories/:id/comments', authMiddleware, (req, res) => {
  const stories = readJSON(STORIES_FILE);
  const story = stories.find(s => String(s.id) === String(req.params.id));
  if (!story) return res.status(404).json({ error: 'Story not found' });
  story.comments = story.comments || [];
  story.comments.push({
    name: req.user.username,
    text: req.body.text,
    userId: req.user.id,
    createdAt: Date.now()
  });
  writeJSON(STORIES_FILE, stories);
  res.json(story.comments);
});

// serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Qalat running on http://localhost:${PORT}`));
