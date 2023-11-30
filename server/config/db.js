/**
 * This module contains all of the functions to connect to the database and perform CRUD operations.
 * @module server/config/db
 * 
 * @requires {@link mongoose}
 */

const mongoose = require('mongoose');
/**
 * This object contains all of the functions that are used to parse file types 
 * (the webapp only accepts image type) and upload files on the database.
 * 
 * @typedef {object} database
 * @memberof module:server/config/db
 * @inner
 * 
 * @property {Function} conn - Saves the connection to the database to access it in other files.
 * @property {Function} connect - Connects to the database.
 * @property {Function} testConnect - Connects to the test database.
 * @property {Function} dropAllCollections - Drops the collection from the database. This is used in testing.
 * @property {Function} removeAllCollections - Removes all documents from the collection. This is used in testing.
 * @property {Function} insertOne   - Inserts a single document to the database.
 * @property {Function} insertMany - Inserts multiple documents to the database.
 * @property {Function} findOne - Searches for a single document in the database.
 * @property {Function} findMany - Searches for multiple documents in the database.
 * @property {Function} updateOne - Updates a single document in the database.
 * @property {Function} updateMany - Updates multiple documents in the database.
 * @property {Function} deleteOne - Deletes a single document in the database.
 * @property {Function} deleteMany - Deletes multiple documents in the database.
*/

/* Simply some additional connection options. */
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};

const database = {

    conn: null,
    /*
        This function connects to the database.
    */
    connect: function () {
        mongoose.connect(process.env.MONGODB_URI, options);
        conn = mongoose.connection;
        console.log(`MongoDB Connected: ${process.env.MONGODB_URI}`);
        this.conn = conn;
    },
    testConnect: function () {
        mongoose.connect(process.env.TEST_MONGODB_URI, options);
        conn = mongoose.connection;
        console.log(`MongoDB Connected: ${process.env.TEST_MONGODB_URI}`);
        this.conn = conn;
    },

    dropAllCollections: async function () {
        /* This function is taken from https://www.freecodecamp.org/news/end-point-testing/ */

        const collections = Object.keys(this.conn.collections);
        for (const collectionName of collections) {
            const collection = this.conn.collections[collectionName];
            try {
                await collection.drop();
            } catch (error) {
                /* This error happens when you try to drop a collection that's already dropped. 
                Happens infrequently. Safe to ignore. */
                if (error.message === "Collection not found.") return;

                if (error.message.includes("A background operation is currently running."))
                    return;

                console.log(error.message);
            }
        }
    },
    removeAllCollections: async function () {
        /* This function is taken from https://www.freecodecamp.org/news/end-point-testing/ */
        const collections = Object.keys(this.conn.collections);
        for (const collectionName of collections) {
            if (collectionName != "admins") {
                const collection = this.conn.collections[collectionName];
                await collection.deleteMany();
            }

        }

    },
    /*
        This function inserts a single `doc` to the database based on the model `model`.
    */
    insertOne: async function (model, doc) {
        return await model.create(doc);
    },

    /*
        This function inserts multiple `docs` to the database based on the model `model`.
    */
    insertMany: async function (model, docs) {
        return await model.insertMany(docs);
    },

    /*
        This function searches for a single document based on the model `model`,
        filtered through the object `query`,
        and limits the fields returned based on the string `projection`,
        whlie the callback function is called after the execution of findOne() function.
    */
    findOne: async function (model, query, projection) {
        return await model.findOne(query, projection);
    },

    /*
        This function searches for multiple documents based on the model `model`,
        filtered through the object `query`,
        limits the fields returned based on the string `projection`,
        while callback function is called after the execution of findMany() function.
    */
    findMany: async function (model, query, projection) {
        return await model.find(query, projection);
    },

    /*
        This function updates the value defined in the object `update`
        on a single document based on the model `model`,
        filtered by the object `filter`.
    */
    updateOne: async function (model, filter, update) {
        return await model.updateOne(filter, update);
    },

    /*
        This function updates the value defined in the object `update`
        on multiple documents based on the model `model`,
        filtered using the object `filter`.
    */
    updateMany: async function (model, filter, update) {
        return await model.updateMany(filter, update);
    },

    /*
        This function deletes a single document based on the model `model`,
        filtered using the object `conditions`.
    */
    deleteOne: async function (model, conditions) {
        return await model.deleteOne(conditions);
    },

    /*
        This function deletes multiple documents based on the model `model`,
        filtered using the object `conditions`.
    */
    deleteMany: async function (model, conditions) {
        return await model.deleteMany(conditions);
    },

    sort: async function (model, query, projection, sort) {
        return await model.find(query, projection).sort(sort);
    }

}

/*
    Exports the object `database` (defined above) to be used
    another script that uses the exports from this file.
*/
module.exports = database;
