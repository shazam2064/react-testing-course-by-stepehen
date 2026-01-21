const express = require('express');
const { body } = require('express-validator');
const conversationController = require('../controllers/conversation.controller');
const isAuth = require('../middleware/is-auth.middleware');

const router = express.Router();
router.get('/', isAuth, conversationController.getConversations);
router.get('/:conversationId', isAuth, conversationController.getConversation);
router.post('/', isAuth, [
    body('participants').isArray().withMessage('Participants must be an array')
], conversationController.createConversation);
router.put('/:conversationId', isAuth, conversationController.updateConversationWithNewMessage);
router.put('/read/:conversationId', isAuth, conversationController.markConversationAsRead);
router.delete('/:conversationId', isAuth, conversationController.deleteConversation);

module.exports = router;