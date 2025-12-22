const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const path = require('path');
const { createFolder } = require('./util/file'); // Import the createFolder function

const imagesDir = path.join(__dirname, 'images');
createFolder(imagesDir);

app.use('/images', express.static(imagesDir));

const multer = require('./middleware/multer.middleware');
app.use(multer);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get('/', (req, res) => {
    res.redirect("/doc");
});

const apiRoutes = require('./routes');
app.use(apiRoutes);

const errorHandler = require('./middleware/error-handler.middleware');
app.use(errorHandler.globalResponse);

// -----------------------------------------------------------------------------------------------
module.exports = app;

if (require.main === module) {
    const { mongoConnect } = require('./util/database.js');
    const PORT = process.env.PORT_NUMBER;
    mongoConnect(() => {
        app.listen(PORT, () => {
            console.log(`The server is listening on port ${PORT}`);
        });
    });
}