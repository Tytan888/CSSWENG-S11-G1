const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const childSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    gradelevel: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    mainPhoto: {
        type: String,
        required: true
    },
    sponsor: {
        name: { type: String},
        email: { type: String },
        phone: { type: String },
        time: { type: Date }
    }
});

module.exports = mongoose.model('Child', childSchema);