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

    if (typeof participants === 'string') {
        participants = JSON.parse(participants);
    }

    if (!text || participants.length < 2) {
        throwError(400, '', 'Invalid data: A message and at least two participants are required');
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

        for (const participantId of participants) {
            const user = await User.findById(participantId);
            if (!user) {
                throwError(404, '', `User with ID ${participantId} not found`);
            }
            user.conversations.push(savedConversation._id);
            await user.save();
        }

        res.status(201).json({
            message: 'Conversation created successfully',
            conversation: savedConversation
        });
    } catch (err) {
        handleError(err, next, 'Conversation creation failed');
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
        throwError(422, '', 'Validation failed');
    }

    if (!text) {
        throwError(400, '', 'Invalid data: Message text is required');
    }

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throwError(404, '', 'Conversation not found');
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

        res.status(200).json({
            message: 'Conversation updated successfully with a new message',
            conversation: updatedConversation
        });
    } catch (err) {
        handleError(err, next, 'Conversation update failed');
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

    Conversation.findById(conversationId)
        .populate('messages')
        .then(conversation => {
            if (!conversation) {
                throwError(404, '', 'Conversation not found');
            }

            const messageDeletionPromises = conversation.messages.map(message =>
                Message.findByIdAndDelete(message._id)
            );

            if (conversation.lastMessage) {
                messageDeletionPromises.push(Message.findByIdAndDelete(conversation.lastMessage));
            }

            return Promise.all(messageDeletionPromises).then(() => conversation);
        })
        .then(conversation => {
            return Conversation.findByIdAndDelete(conversationId);
        })
        .then(conversation => {
            console.log('conversation deleted successfully', conversation);

            const participantPromises = conversation.participants.map(participantId =>
                User.findById(participantId)
            );

            return Promise.all(participantPromises).then(participants => {
                const updatePromises = participants.map(participant => {
                    if (participant) {
                        participant.conversations.pull(conversation._id);
                        return participant.save();
                    }
                });

                return Promise.all(updatePromises);
            });
        })
        .then(result => {
            res.status(200).json({
                message: 'Conversation deleted successfully',
                conversation: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Conversation delete failed');
        });
};