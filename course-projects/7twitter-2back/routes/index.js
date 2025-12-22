const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const tweetRoutes = require('./tweet.routes');
const commentRoutes = require('./comment.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tweets', tweetRoutes);
router.use('/comments', commentRoutes);

module.exports = router;