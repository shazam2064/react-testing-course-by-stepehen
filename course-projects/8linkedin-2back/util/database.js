const mongoose = require('mongoose');

require('dotenv').config();
const mongoDb = process.env.MONGO_DB;
const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoCluster = process.env.MONGO_CLUSTER;
const MONGODB_URI = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoCluster}/${mongoDb}?retryWrites=true&w=majority&ssl=true`

const mongoConnect = callback => {
    console.log('MONGODB_URI: ', MONGODB_URI.replace(mongoPass, '*****'));
    mongoose.connect(MONGODB_URI)
        .then(result => {
            console.log('The MongoDB connection was successful with models: ', result.models);
            callback();
        })
        .catch(err => {
            console.log('There was a MongoDB connection error: ', err);
        });
}

// -----------------------------------------------------------------------------------------------
module.exports = {
    mongoConnect,
};
