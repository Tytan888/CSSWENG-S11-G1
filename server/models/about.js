const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const aboutSchema = new Schema({
    mission: {
        type: String,
        required: true
    },
    vision: {
        type: String,
        required: true
    },
    history: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
    /* Add image.
    icon: {
        type: String,
        required: true
    }*/
});

module.exports = mongoose.model('About', aboutSchema);