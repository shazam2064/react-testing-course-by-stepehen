const randomPort = Math.floor(Math.random() * (9999 - 3000 + 1)) + 3000;
process.env.PORT_NUMBER = randomPort;
console.log(`Using random port: ${randomPort}`);

const app = require('../app');

module.exports = {
    randomPort,
    app,
};