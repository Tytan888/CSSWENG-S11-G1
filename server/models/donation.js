const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const donationSchema = new Schema({
    donation: {
        type: Object,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Donation', donationSchema);