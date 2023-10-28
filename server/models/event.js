const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const eventSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    photos: {
        type: [String],
        validate: v => Array.isArray(v) && v.length > 0,
    }
});

module.exports = mongoose.model('Event', eventSchema);