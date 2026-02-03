const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Semaphore = require('../utils/semaphore');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev';

// Semaphore for limiting concurrent comments per user (1 at a time)
const userCommentSemaphores = new Map();

function getUserIdFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.sub;
  } catch (err) {
    return null;
  }
}

// Get or create semaphore for a user
function getUserSemaphore(userId) {
  if (!userCommentSemaphores.has(userId)) {
    userCommentSemaphores.set(userId, new Semaphore(1));
  }
  return userCommentSemaphores.get(userId);
}

// Create comment (protected by semaphore to limit concurrent operations per user)
router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { characterId, text } = req.body;
    if (!characterId || !text) return res.status(400).json({ success: false, message: 'Invalid body' });

    // Use semaphore to ensure only one comment creation per user at a time
    const semaphore = getUserSemaphore(userId);
    await semaphore.run(async () => {
      const comment = new Comment({ userId, characterId, text });
      await comment.save();

      const user = await User.findById(userId).select('-password');
      res.json({ success: true, comment: { ...comment.toObject(), user } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get comments for a character
router.get('/character/:id', async (req, res) => {
  try {
    const characterId = Number(req.params.id);
    const comments = await Comment.find({ characterId }).sort({ createdAt: -1 }).populate('userId', '-password');
    res.json({ success: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete comment (only owner)
router.delete('/:id', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(comment.userId) !== String(userId)) return res.status(403).json({ success: false, message: 'Forbidden' });

    await comment.remove();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update comment (only owner)
router.patch('/:id', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(comment.userId) !== String(userId)) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { text } = req.body;
    if (typeof text !== 'string' || text.trim().length === 0) return res.status(400).json({ success: false, message: 'Invalid text' });

    comment.text = text.trim();
    await comment.save();

    const user = await User.findById(userId).select('-password');
    res.json({ success: true, comment: { ...comment.toObject(), user } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
