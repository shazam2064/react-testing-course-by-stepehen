const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classificationSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            }
        ]
    }, {
    timestamps: true
});

module.exports = mongoose.model('Classification', classificationSchema);