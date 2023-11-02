const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const newsletterSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Education', 'Health', 'Livelihood', 'Psychosocial'],
        required: true
    },
    status: {
        type: String,
        enum: ['Past', 'Ongoing', 'Upcoming'],
        required: true
    },
    photos: {
        type: [String],
        validate: v => Array.isArray(v) && v.length > 0,
    }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);