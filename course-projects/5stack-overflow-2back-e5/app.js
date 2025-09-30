const express = require('express');
const app = express();
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'images')));

const multer = require('./middleware/multer.middleware');
app.use(multer);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const feedRoutes = require('./routes/feed.routes');
app.use('/feed', feedRoutes);

const questionRoutes = require('./routes/question.routes');
app.use('/', questionRoutes);

const answerRoutes = require('./routes/answer.routes');
app.use('/', answerRoutes);

const tagRoutes = require('./routes/tag.routes');
app.use('/', tagRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/', userRoutes);

const errorHandler = require('./middleware/error-handler.middleware');
app.use(errorHandler.globalResponse);

// -----------------------------------------------------------------------------------------------
const { mongoConnect} = require('./util/database.js');
const PORT = process.env.PORT_NUMBER;
mongoConnect(() => {
    app.listen(PORT, () => {
        console.log(`The server is listening on port ${PORT}`);
    });
});
