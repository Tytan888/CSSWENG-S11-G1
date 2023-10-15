const mongoose = require('mongoose');
const gfs = require('../config/gfs.js');
const connectDB = async () => {

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        gfs.connect(mongoose.connection);
        console.log(`MongoDB Connected: mongodb://${conn.connection.host}:27017/pearsbuck`);
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;