const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    bug: {
        type: Schema.Types.ObjectId,
        ref: 'Bug',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);