const express = require('express');
const app = express();

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

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const productRoutes = require('./routes/product.routes');
app.use('/', productRoutes);

const cartRoutes = require('./routes/cart.routes');
app.use('/', cartRoutes);

const orderRoutes = require('./routes/order.routes');
app.use('/', orderRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/', userRoutes);

const errorHandler = require('./middleware/error-handler.middleware');
app.use(errorHandler.globalResponse);

// -----------------------------------------------------------------------------------------------
const { mongoConnect} = require('./util/database.js');
const PORT = 3032;
mongoConnect(() => {
    app.listen(PORT, () => {
        console.log(`The server is listening on port ${PORT}`);
    });
});

module.exports = app;