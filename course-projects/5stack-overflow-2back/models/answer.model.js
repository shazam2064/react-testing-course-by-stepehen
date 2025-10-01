const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
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
        questionId: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Answer', answerSchema);