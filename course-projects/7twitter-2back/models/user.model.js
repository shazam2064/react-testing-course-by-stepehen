const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: false
        },
        tweets: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Tweet'
            }
        ],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        isAdmin: {
            type: Boolean,
            required: true
        },
        verificationToken: {
            type: String,
        },
        verificationTokenExpiration: {
            type: Date,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);