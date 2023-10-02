const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const contactSchema = new Schema({
    phoneNum: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    socialMedia: {
        facebook: {
            type: String,
            required: true
        },
        instagram: {
            type: String,
            required: true
        },
        twitter: {
            type: String,
            required: true
        }
    },
    board: [{ name: String, position: String, about: String /* , image: String <-- TODO: Add image.*/ }]
});

module.exports = mongoose.model('Contact', contactSchema);