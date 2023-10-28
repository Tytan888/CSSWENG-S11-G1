const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const childSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    gradelevel: {
        type: String,
        required: true
    },
    mainPhoto: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Child', childSchema);