const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, User, Post, Comment, Like, Follow } = require('./models');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'supersecretkey';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware for Auth
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = decoded.id;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, bio } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, bio });
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, SECRET_KEY);
  res.json({ token, userId: user.id, username: user.username });
});

// Post Routes
app.post('/api/posts', authenticate, async (req, res) => {
  const post = await Post.create({ content: req.body.content, UserId: req.userId });
  res.json(post);
});

app.get('/api/posts', async (req, res) => {
  const posts = await Post.findAll({
    include: [
      { model: User, attributes: ['id', 'username'] },
      { model: Comment, include: [{ model: User, attributes: ['username'] }] },
      { model: Like }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(posts);
});

app.delete('/api/posts/:id', authenticate, async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.UserId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });
  await post.destroy();
  res.json({ message: 'Post deleted' });
});

// Comment Routes
app.post('/api/posts/:id/comments', authenticate, async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    PostId: req.params.id,
    UserId: req.userId
  });
  res.json(comment);
});

// Like Routes
app.post('/api/posts/:id/like', authenticate, async (req, res) => {
  const existingLike = await Like.findOne({ where: { PostId: req.params.id, UserId: req.userId } });
  if (existingLike) {
    await existingLike.destroy();
    return res.json({ message: 'Unliked' });
  }
  await Like.create({ PostId: req.params.id, UserId: req.userId });
  res.json({ message: 'Liked' });
});

// User Search
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  const users = await User.findAll({
    where: { username: { [Op.like]: `%${q}%` } },
    attributes: ['id', 'username', 'bio'],
    limit: 10
  });
  res.json(users);
});

// Profile Update
app.put('/api/profile', authenticate, async (req, res) => {
  const { bio } = req.body;
  await User.update({ bio }, { where: { id: req.userId } });
  res.json({ message: 'Profile updated' });
});

// Follow Routes
app.post('/api/users/:id/follow', authenticate, async (req, res) => {
  if (req.userId == req.params.id) return res.status(400).json({ error: 'Cannot follow yourself' });
  const existingFollow = await Follow.findOne({ where: { followerId: req.userId, followingId: req.params.id } });
  if (existingFollow) {
    await existingFollow.destroy();
    return res.json({ message: 'Unfollowed' });
  }
  await Follow.create({ followerId: req.userId, followingId: req.params.id });
  res.json({ message: 'Followed' });
});

app.get('/api/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'username', 'bio'],
    include: [
      { model: User, as: 'Followers', attributes: ['id', 'username'] },
      { model: User, as: 'Following', attributes: ['id', 'username'] },
      { model: Post, order: [['createdAt', 'DESC']] }
    ]
  });
  res.json(user);
});

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
