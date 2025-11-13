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
        bugsAssigned: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Bug'
            }
        ],
        reportedBugs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Bug'
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