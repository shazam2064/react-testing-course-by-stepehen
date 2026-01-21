require('dotenv').config();
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
    info: {
        title: 'LinkedIn Clone API',
        description: 'API documentation for the LinkedIn Clone project, managing authentication, users, connections, conversations, and applications.',
    },
    servers: [],
    tags: [
        {
            name: 'Auth',
            description: 'Manages signup, email verification, and login tasks.',
        },
        {
            name: 'Users',
            description: 'Handles user creation, updates, deletion, and retrieval.',
        },
        {
            name: 'Connections',
            description: 'Provides endpoints for managing user connections (follow requests, approvals, etc.).',
        },
        {
            name: 'Conversations',
            description: 'Handles messaging between users, including unread messages and conversation updates.',
        },
        {
            name: 'Applications',
            description: 'Manages job applications, including creation, updates, and retrieval.',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    host: 'localhost:3072',
    schemes: ['http'],
    definitions: {
        User: {
            _id: 'string',
            name: 'string',
            email: 'string',
            connections: ['string'],
            conversations: ['string'],
            applications: ['string'],
        },
        Connection: {
            _id: 'string',
            sender: 'string',
            receiver: 'string',
            status: 'string',
            createdAt: 'string',
        },
        Conversation: {
            _id: 'string',
            participants: ['string'],
            messages: ['string'],
            lastMessage: 'string',
            createdAt: 'string',
        },
        Application: {
            _id: 'string',
            job: {
                _id: 'string',
                title: 'string',
            },
            status: 'string',
            createdAt: 'string',
        },
    },
};

if (process.env.RENDER) {
    doc.servers.push({
        url: process.env.RENDER_EXTERNAL_URL,
    });
} else {
    doc.servers.push({
        url: `http://localhost:${process.env.PORT || 3072}`,
    });
}

const outputFile = './swagger-output.json';
const routes = ['./routes/index.js'];

swaggerAutogen(outputFile, routes, doc)
    .then(() => {
        require('./app.js');
    });