const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        votes: {
            type: Number,
            default: 0
        },
        voters: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                vote: {
                    type: String,
                    enum: ['up', 'down'],
                    required: true
                }
            }
        ],
        views: {
            type: Number,
            default: 0
        },
        tags: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Tag'
            }
        ],
        answers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Answer'
            }
        ],
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);