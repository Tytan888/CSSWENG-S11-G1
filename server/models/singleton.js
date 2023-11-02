const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const singletonSchema = new Schema({
    mission: {
        type: String,
        required: true
    },
    vision: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    facebook:{
        type: String,
        required: true
    },
    instagram:{
        type: String,
        required: true
    },
    twitter:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    frontpagePhoto: {
        type: String,
        required: true
    },
    staffPhoto: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Singleton', singletonSchema);