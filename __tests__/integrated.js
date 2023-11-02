//dependencies
const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const request = supertest(app);

//database models
const db = require('../server/config/db');
const gfs = require('../server/config/gfs');
const About = require('../server/models/about');
const Child = require('../server/models/child');
const Donation = require('../server/models/donation');
const Event = require('../server/models/event');
const Project = require('../server/models/project');

//controller functions
const projectController = require('../server/controller/project_controller');
const childController = require('../server/controller/child_controller');
const donationController= require('../server/controller/donation_controller');
const eventController = require('../server/controller/event_controller');
const imageController = require('../server/controller/image_controller');

async function removeAllCollections() {
    //this function is taken from https://www.freecodecamp.org/news/end-point-testing/
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany();
    }
  }
  async function dropAllCollections() {
    //this function is taken from https://www.freecodecamp.org/news/end-point-testing/

    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
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
}
beforeAll(() => {
    db.url = "mongodb://localhost/test_pearldb";
    db.testConnect();
    gfs.connect(db.conn);
});
afterAll(async () => {
    await dropAllCollections();
    await mongoose.connection.close();

});

afterEach(async () => {
    await removeAllCollections();
  });
describe("Get Project", () => {
    test.todo('should be success');
});

describe("Add Project", done => {
    test('should add project in the database', async () =>{
        const project = {
            id: 1,
            name: "test project",
            category: "test category project",
            description:"test description",
            location: "test location",
            raisedDonations: 0,
            requiredBudget: 1000,
            status: "Ongoing",
            mainPhoto : "./test_assets/image_asset.png"
        }
        console.log(project.status);
        console.log(project);
        await request.post('/add_project').attach('mainPhoto', project.mainPhoto).field("id", project.id).field("name", project.name).field("category", project.category).field("description", project.description).field("location", project.location).field("raisedDonations", project.raisedDonations).field("requiredBudget", project.requiredBudget).field("status", project.status);
        const obj =  db.findOne(Project, {name: "test project"});
        console.log("test add project: "+ user);
        expect(obj.name).toBeTruthy();
        done();
    });
});

describe("Edit Project", () => {
    test.todo('should be success');
});

describe("Remove Project", () => {
    test.todo('should be success');
});

describe("Donate", () => {
    test('should add donation to database', async () => {
        await request.post('/donate').send({name:"tester: rlaph", amount: 1000});
        return;
    });
}); 