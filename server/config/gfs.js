/**
 * This module contains all of the functions that are used to handle requests
 * and operations related to the singleton schema.
 * @module server/config/gfs
 * 
 * @requires {@link gridfs-stream}
 * @requires {@link mongoose}
 */
const fs = require('gridfs-stream');
const mongoose = require('mongoose');
/**
 * This object contains all of the functions that are used to parse file types 
 * (the webapp only accepts image type) and upload files on the database.
 * 
 * @typedef {object} Grid
 * @memberof module:server/config/gfs
 * @inner
 * 
 * @property {Function} connect - connects to the database and creates a gridfsBucket instance which stores the file uploads.
 * @property {Object} gfs - Saves the connection information.
 * @property {Object} stream - saves the gridfsBucket instance
 * @property {Object} grid - saves the collection uploads of the gridfsBucket instance
 * @property {Function} findOne - Searches for a single document in the database.
 * @property {Function} delete - Deletes a single document in the database.
 * @property {Function} deleteFiles - Deletes all documents in the database.
 * @property {Function} dropBucket - Drops the collection from the database. This is used in testing.
 * @property {Function} createReadStream - Creates a read stream for the file for rendering images stored in the database.
 * 

*/
const Grid = {
    connect: async function (conn) {
        let gfs;

        await conn.once('open', () => {
            // Init Stream

            gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
                bucketName: 'uploads'
            });

            this.gfs = fs(conn.db, mongoose.mongo);
            this.stream = gridfsBucket;
            this.grid = this.gfs.collection('uploads');
        });
    },

    gfs: null,
    grid: null,
    stream: null,

    findOne: async function (query) {
        return await this.grid.findOne(query);
    },

    delete: async function (query) {
        return await this.stream.delete(query);
    },
    deleteFiles: async function (query) {
        const cursor =  this.stream.find({});
        var files = [];
        for await(const doc of cursor) {
            files.push(doc.filename);
            await this.delete(doc._id);
        }

    },
    dropBucket: async function () {
        return await this.stream.drop();
    },

    createReadStream: async function (query) {
        return await this.stream.openDownloadStream(query);
    }
}

module.exports = Grid;
