const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const trusteeSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Trustee', trusteeSchema);