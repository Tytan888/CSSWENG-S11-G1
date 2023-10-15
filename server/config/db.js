const mongoose = require('mongoose');

// ccapdev-mongoose is the name of the database
const url = process.env.MONGODB_URI;

// additional connection options
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};
const database = {
    /*
        connects to database
    */
    conn: null,

    connect:  function () {
     mongoose.connect(url, options);
     conn = mongoose.connection;
     console.log(`MongoDB Connected: mongodb://27017/pearsbuck`);
    this.conn = conn;
    },
    /*
        inserts a single `doc` to the database based on the model `model`
    */
    insertOne: async function(model, doc) {
        return await model.create(doc);
    },
    /*
        inserts multiple `docs` to the database based on the model `model`
    */
    insertMany: async function(model, docs) {
        return await model.insertMany(docs);
    },
    /*
        searches for a single document based on the model `model`
        filtered through the object `query`
        limits the fields returned based on the string `projection`
        callback function is called after the execution of findOne() function
    */
    findOne: async function(model, query, projection) {
        return await model.findOne(query, projection);
    },
    /*
        searches for multiple documents based on the model `model`
        filtered through the object `query`
        limits the fields returned based on the string `projection`
        callback function is called after the execution of findMany() function
    */
    findMany: async function(model, query, projection) {
        return await model.find(query, projection);
    },
    /*
        updates the value defined in the object `update`
        on a single document based on the model `model`
        filtered by the object `filter`
    */
    updateOne: async function(model, filter, update) {
        return await model.updateOne(filter, update);
    },

    /*
        updates the value defined in the object `update`
        on multiple documents based on the model `model`
        filtered using the object `filter`
    */
    updateMany: async function(model, filter, update) {
        return await model.updateMany(filter, update);
    },

    /*
        deletes a single document based on the model `model`
        filtered using the object `conditions`
    */
    deleteOne: async function(model, conditions) {
        return await model.deleteOne(conditions);
    },

    /*
        deletes multiple documents based on the model `model`
        filtered using the object `conditions`
    */
    deleteMany: async function(model, conditions) {
        return await model.deleteMany(conditions);
    },

    sort: async function(model, query, projection, sort){
        return await model.find(query,projection).sort(sort);
    }

}

/*
    exports the object `database` (defined above)
    when another script exports from this file
*/
module.exports = database;
