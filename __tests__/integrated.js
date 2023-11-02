//dependencies
const app = require('../app');
const supertest = require('supertest');
const request = supertest(app);

//database models
const db = require('../server/config/db.js');
const gfs = require('../server/config/gfs.js');
const About = require('../server/models/about.js');
const Child = require('../server/models/child.js');
const Donation = require('../server/models/donation.js');
const Event = require('../server/models/event.js');
const Project = require('../server/models/project.js');

//controller functions
const projectController = require('../server/controller/project_controller.js');
const childController = require('../server/controller/child_controller.js');
const donationController= require('../server/controller/donation_controller.js');
const eventController = require('../server/controller/event_controller.js');
const imageController = require('../server/controller/image_controller.js');

// setup of database connection
beforeAll(() => {
    db.url = "mongodb://localhost/test_pearldb";
    db.testConnect();
    gfs.connect(db.conn);
});
afterAll(async () => {
    await db.dropAllCollections();
    await db.conn.close();
});
afterEach(async () => {
    await db.removeAllCollections();
  });
//end of setup for database connection

describe("Get Project", () => {
    test.todo('should be success');
});

describe("CRUD Project", () => {
    test('should add project in the database',  async () =>{
        const project = {
            id: 1,
            name: "test project",
            category: "Education",
            description:"test description",
            location: "test location",
            raisedDonations: 0,
            requiredBudget: 1000,
            status: "Ongoing",
            mainPhoto : "__tests__/test_assets/image_asset.png",     
        }
        console.log(project.status);
        console.log(project);
        await request.post('/add_project').attach('mainPhoto', project.mainPhoto).field("id", project.id).field("name", project.name).field("category", project.category).field("description", project.description).field("location", project.location).field("raisedDonations", project.raisedDonations).field("requiredBudget", project.requiredBudget).field("status", project.status).expect(200);
        const obj =  await db.findOne(Project, {category: "Education"});
        console.log("test add project: "+ obj);
        expect(obj.name).toBeTruthy();
        return obj;
    });
});

describe("CRUD Child", () => {
    test('should add Child to database', async () => {
        const child = {
            id: 1,
            name: "test child",
            birthdate: "2020-01-01",
            gradelevel: "test gradelevel",
            location: "test location",
            mainPhoto : "__tests__/test_assets/image_asset.png",
        };
        const res = await request.post('/add_child').attach('mainPhoto', child.mainPhoto).field("id", child.id).field("name", child.name).field("birthdate", child.birthdate).field("gradelevel", child.gradelevel).field("location", child.location).expect(200);
        return res;
    });
});

describe("CRUD About", () => {
    test.todo('should add About to database');
});

describe("CRUD Contact", () => {
    test.todo('should add Contact to database');
});
describe("CRUD Event", () => {
    test.todo('should add Event to database');
});


describe("Donate", () => {
    test('should add donation to database', async () => {
        await request.post('/donate').send({name:"tester: rlaph", amount: 1000});
        return;
    });
}); 