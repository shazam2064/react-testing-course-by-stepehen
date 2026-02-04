const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const path = require("path");
const fs = require("fs");

exports.getConversations = async (req, res, next) => {
    // #swagger.description = 'Retrieve all conversations'
    // #swagger.tags = ['Conversations']
    console.log('the getConversations controller was called');
    Conversation.find()
        .populate('participants')
        .populate({
            path: 'lastMessage',
            populate: {
                path: 'sender'
            }
        })
        .populate({
            path: 'messages',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'sender'
            }
        })
        .then(conversations => {
            res.status(200).json({
                message: 'Conversations fetched successfully',
                conversations
            });
        })
        .catch(err => {
            handleError(err, next, 'Conversations fetch failed');
        });
};

exports.getConversation = async (req, res, next) => {
    // #swagger.description = 'Retrieve a single conversation by ID with its messages'
    // #swagger.tags = ['Conversations']
    const conversationId = req.params.conversationId;
    console.log('the getConversation controller was called with conversationId: ', conversationId);

    try {
        const conversation = await Conversation
            .findById(conversationId)
            .populate('participants')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender'
                }
            })
            .populate({
                path: 'messages',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'sender'
                }
            });

        if (!conversation) {
            throwError(404, '', 'Conversation not found');
        }

        res.status(200).json({
            message: 'Conversation fetched successfully',
            conversation
        });
    } catch (err) {
        handleError(err, next, 'Conversation fetch failed');
    }
};

exports.createConversation = async (req, res, next) => {
    // #swagger.description = 'Create a new conversation with an initial message'
    // #swagger.tags = ['Conversations'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the createConversation controller was called');
    let participants = req.body.participants;
    const text = req.body.text;

    // safely parse stringified participants
    if (typeof participants === 'string') {
        try {
            participants = JSON.parse(participants);
        } catch (err) {
            return res.status(400).json({
                message: 'Invalid data: participants must be an array of user ids'
            });
        }
    }

    if (!text || !Array.isArray(participants) || participants.length < 2) {
        return res.status(400).json({
            message: 'Invalid data: A message and at least two participants are required'
        });
    }

    try {
        const conversation = new Conversation({ participants });
        const savedConversation = await conversation.save();

        const message = new Message({
            conversation: savedConversation._id,
            sender: req.userId,
            text
        });
        const savedMessage = await message.save();

        savedConversation.lastMessage = savedMessage._id;
        await savedConversation.save();

        // Use atomic updates to avoid loading full user documents (prevents validation errors)
        for (const participantId of participants) {
            const updateResult = await User.updateOne(
                { _id: participantId },
                { $addToSet: { conversations: savedConversation._id } }
            );

            // If no document matched the participant id, return 404 so caller receives a response
            if (updateResult.matchedCount === 0) {
                // roll back created message/conversation to avoid dangling data
                try {
                    await Message.findByIdAndDelete(savedMessage._id);
                    await Conversation.findByIdAndDelete(savedConversation._id);
                } catch (cleanupErr) {
                    // ignore cleanup errors, we will still respond with 404
                }
                return res.status(404).json({
                    message: `User with ID ${participantId} not found`
                });
            }
        }

        return res.status(201).json({
            message: 'Conversation created successfully',
            conversation: savedConversation
        });
    } catch (err) {
        // return JSON error so tests receive a response and don't hang
        console.log('Conversation creation failed', err);
        return res.status(err.statusCode || 500).json({ message: err.message || 'Conversation creation failed' });
    }
};

exports.updateConversationWithNewMessage = async (req, res, next) => {
    // #swagger.description = 'Update an existing conversation with a new message'
    // #swagger.tags = ['Conversations'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the updateConversation controller was called');
    const conversationId = req.params.conversationId;
    const text = req.body.text;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return validation errors instead of throwing so tests receive a response
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    if (!text || (typeof text === 'string' && text.trim() === '')) {
        // return a consistent JSON response instead of throwing
        return res.status(400).json({
            message: 'Invalid data: Message text is required'
        });
    }

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const oldLastMessage = conversation.lastMessage;

        const message = new Message({
            conversation: conversationId,
            sender: req.userId,
            text
        });
        const savedMessage = await message.save();

        if (oldLastMessage) {
            conversation.messages.push(oldLastMessage);
        }

        conversation.lastMessage = savedMessage._id;
        const updatedConversation = await conversation.save();

        return res.status(200).json({
            message: 'Conversation updated successfully with a new message',
            conversation: updatedConversation
        });
    } catch (err) {
        console.log('Conversation update failed', err);
        return res.status(err.statusCode || 500).json({ message: err.message || 'Conversation update failed' });
    }
};

exports.markConversationAsRead = async (req, res, next) => {
    // #swagger.description = 'Mark a conversation as read'
    // #swagger.tags = ['Conversations'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the markConversationAsRead controller was called');
    const conversationId = req.params.conversationId;

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throwError(404, '', 'Conversation not found');
        }

        const lastMessage = await Message.findById(conversation.lastMessage);
        if (!lastMessage) {
            throwError(404, '', 'Last message not found');
        }

        lastMessage.read = true;
        await lastMessage.save();

        res.status(200).json({
            message: 'Conversation marked as read successfully',
            conversation
        });
    } catch (err) {
        handleError(err, next, 'Marking conversation as read failed');
    }
};

exports.deleteConversation = async (req, res, next) => {
    // #swagger.description = 'Delete a conversation'
    // #swagger.tags = ['Conversations'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the deleteConversation controller was called');
    const conversationId = req.params.conversationId;

    try {
        const conversation = await Conversation.findById(conversationId).populate('messages');
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const messageDeletionPromises = conversation.messages.map(message =>
            Message.findByIdAndDelete(message._id)
        );

        if (conversation.lastMessage) {
            messageDeletionPromises.push(Message.findByIdAndDelete(conversation.lastMessage));
        }

        await Promise.all(messageDeletionPromises);

        const deleted = await Conversation.findByIdAndDelete(conversationId);
        if (!deleted) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Use atomic updates to remove conversation id from users without loading full user docs
        const participantUpdatePromises = (conversation.participants || []).map(participantId =>
            User.updateOne({ _id: participantId }, { $pull: { conversations: deleted._id } })
        );

        await Promise.all(participantUpdatePromises);

        return res.status(200).json({
            message: 'Conversation deleted successfully',
            conversation: deleted
        });
    } catch (err) {
        console.log('Conversation delete failed', err);
        return res.status(err.statusCode || 500).json({ message: err.message || 'Conversation delete failed' });
    }
};