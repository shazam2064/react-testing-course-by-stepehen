const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    tweet: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);