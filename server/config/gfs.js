const fs = require('gridfs-stream');
const db = require('../config/db.js');
const mongoose = require('mongoose');


const Grid = {
    connect: async function (conn) {
        let gfs;

        await conn.once('open', () => {
            // Init Stream

            gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
                bucketName: 'uploads'
            });

            gfs = fs(conn.db, mongoose.mongo);
            this.stream = gridfsBucket;
            this.grid = gfs.collection('uploads');
        });
    },

    grid: null,
    stream: null,

    findOne: async function (query) {
        return await this.grid.findOne(query);
    },

    createReadStream: async function (query) {
        return await this.stream.openDownloadStream(query);
    }
}

module.exports = Grid;
