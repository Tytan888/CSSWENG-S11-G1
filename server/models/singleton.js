const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const singletonSchema = new Schema({
    id: {
        type: String,
        enum: ['Singleton'],
        required: true,
        unique: true,
    },
    aboutUs: {
        type: String,
        required: true,
        default: "N/A"
    },
    mission: {
        type: String,
        required: true,
        default: "N/A"
    },
    vision: {
        type: String,
        required: true,
        default: "N/A"
    },
    projectsDescription: {
        type: String,
        required: true,
        default: "N/A"
    },
    newsletterDescription: {
        type: String,
        required: true,
        default: "N/A"
    },
    email:{
        type: String,
        required: true,
        default: "N/A"
    },
    facebook:{
        type: String,
        required: true,
        default: "N/A"
    },
    instagram:{
        type: String,
        required: true,
        default: "N/A"
    },
    twitter:{
        type: String,
        required: true,
        default: "N/A"
    },
    address:{
        type: String,
        required: true,
        default: "N/A"
    },
    phone:{
        type: String,
        required: true,
        default: "N/A"
    },
    frontpagePhoto: {
        type: String,
        required: true,
        default: "N/A"
    },
    staffPhoto: {
        type: String,
        required: true,
        default: "N/A"
    }
}, { collection: 'singleton' });

module.exports = mongoose.model('Singleton', singletonSchema);