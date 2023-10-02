const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const donationSchema = new Schema({
    donation: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('Donation', donationSchema);