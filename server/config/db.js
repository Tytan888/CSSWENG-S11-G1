const mongoose = require('mongoose');


// Additional Connection Options
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};

const database = {

    conn: null,
    url: null,

    /*
        This function connects to the database.
    */
    connect: function () {
        mongoose.connect(this.url, options);
        conn = mongoose.connection;
        console.log(`MongoDB Connected: ${this.url}`);
        this.conn = conn;
    },
    testConnect: function () {
        mongoose.createConnection("mongodb://localhost/test_pearldb", options);
        conn = mongoose.connection;
        console.log(`MongoDB Connected: ${this.url}`);
        this.conn = conn;
    },

    dropAllCollections: async function() {
        //this function is taken from https://www.freecodecamp.org/news/end-point-testing/
    
        const collections = Object.keys(this.conn.collections);
        for (const collectionName of collections) {
          const collection = this.conn.collections[collectionName];
          try {
            await collection.drop();
          } catch (error) {
            // This error happens when you try to drop a collection that's already dropped. Happens infrequently.
            // Safe to ignore.
            if (error.message === "ns not found") return;
      
            // This error happens when you use it.todo.
            // Safe to ignore.
            if (error.message.includes("a background operation is currently running"))
              return;
    
            console.log(error.message);
          }
        }
    },
    removeAllCollections: async function () {
        //this function is taken from https://www.freecodecamp.org/news/end-point-testing/
        const collections = Object.keys(this.conn.collections);
        for (const collectionName of collections) {
          const collection = this.conn.collections[collectionName];
          await collection.deleteMany();
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
