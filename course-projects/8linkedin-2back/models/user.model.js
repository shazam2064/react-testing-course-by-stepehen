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
        headline: { type: String },
        about: { type: String },
        location: { type: String },
        experience: [
            new mongoose.Schema({
                title: String,
                company: String,
                role: String,
                startDate: Date,
                description: String,
                endDate: Date,
            }, { _id: false })
        ],
        education: [
            new mongoose.Schema({
                school: String,
                degree: String,
                fieldOfStudy: String,
                startDate: Date,
                endDate: Date,
            }, { _id: false })
        ],
        skills: [String],
        connections: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Connection'
            }
        ],
        jobs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Job'
            }
        ],
        applications: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Application'
            }
        ],
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post'
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
        conversations: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Conversation'
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