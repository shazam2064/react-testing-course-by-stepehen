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
        status: {
            type: String,
            default: 'I am new!'
        },
        questions: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Question'
            }
        ],
        answers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Answer'
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