const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const staffSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Staff', staffSchema);