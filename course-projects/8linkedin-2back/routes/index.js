const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const commentRoutes = require('./comment.routes');
const jobRoutes = require('./job.routes');
const applicationRoutes = require('./application.routes');
const conversationRoutes = require('./conversation.routes');
const connectionRoutes = require('./connection.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/conversations', conversationRoutes);
router.use('/connections', connectionRoutes);

module.exports = router;