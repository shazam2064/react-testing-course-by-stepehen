require('dotenv').config();
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
    info: {
        title: 'Twitter Clone API',
        description: 'API documentation for the Twitter Clone project, managing authentication, users, tweets, and comments.',
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
            name: 'Tweets',
            description: 'Provides CRUD endpoints for managing tweets, likes, and retweets.',
        },
        {
            name: 'Comments',
            description: 'Provides CRUD endpoints for managing comments on tweets.',
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
        Tweet: {
            _id: 'string',
            text: 'string',
            creator: 'string',
            createdAt: 'string',
            image: 'string',
            likes: ['string'],
            retweets: ['string'],
        },
        User: {
            _id: 'string',
            name: 'string',
            email: 'string',
            tweets: ['string'],
        },
        Comment: {
            _id: 'string',
            text: 'string',
            creator: 'string',
            tweet: 'string',
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