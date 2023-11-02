//dependencies
const app = require('../app');
const supertest = require('supertest');
const request = supertest(app);

//database models
const db = require('../server/config/db.js');
const gfs = require('../server/config/gfs.js');
const Child = require('../server/models/child.js');
const Donation = require('../server/models/donation.js');
const Event = require('../server/models/event.js');
const Project = require('../server/models/project.js');

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
        await request.post('/add_project').attach('mainPhoto', project.mainPhoto).field("id", project.id).field("name", project.name).field("category", project.category).field("description", project.description).field("location", project.location).field("raisedDonations", project.raisedDonations).field("requiredBudget", project.requiredBudget).field("status", project.status).expect(200);
        const obj =  await db.findOne(Project, {name: "test project"});
        expect(obj.name).toBeTruthy();
        return obj;
    });

    test.todo('should update project in the database');
    test.todo('should delete project in the database');
    test.todo('should get project in the database');
    test.todo('should have unique id');
    test.todo('should not be able to send with non image file upload');
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
    test.todo('should update child in the database');
    test.todo('should delete child in the database');
    test.todo('should get child in the database');
    test.todo('should have unique id');
    test.todo('should not be able to send with non image file upload');
});

describe("CRUD Contact", () => {
    test.todo('should add Contact to database');
    test.todo('should update Contact in the database');
    test.todo('should delete Contact in the database');
    test.todo('should get Contact in the database');
});
describe("CRUD Event", () => {
    test('should add Event to database', async () =>{
        const event = {
            id: 1,
            name: "test event",
            mainPhoto: "__tests__/test_assets/image_asset.png",
            category: "Health",
            status: "Ongoing",
            location:"test location",
            startDate: new Date(2023, 2),
            endDate: new Date(2024, 6),
        };
        event.startDate = event.startDate.toString();
        event.endDate = event.endDate.toString();
        console.log("enddate "+event.endDate);
        await request.post('/add_event').attach('mainPhoto', event.mainPhoto).field("id", event.id).field("name", event.name).field("category", event.category).field("status", event.status).field("location", event.location).field("startdate", event.startDate).field("enddate", event.endDate).expect(200);
        const obj =  await db.findOne(Event, {name: "test event"});
        expect(obj.name).toBeTruthy();
        expect(obj.id).toBeTruthy();
        expect(obj.category).toBeTruthy();
        expect(obj.status).toBeTruthy();
        expect(obj.location).toBeTruthy();
        expect(obj.startDate).toBeTruthy();
        expect(obj.endDate).toBeTruthy();
        expect(obj.name).toBe(event.name);
        expect(obj.mainPhoto).toBeTruthy();
        return obj;
    
    });
    test.todo('should update Event in the database');
    test.todo('should delete Event in the database');
    test.todo('should get Event in the database');
    test.todo('should not be able to send with non image file upload');
});


describe("Donate", () => {
    test('should add donation to database', async () => {
        await request.post('/donate').send({name:"tester: rlaph", amount: 1000});
        return;
    });
    test.todo('should update donate in the database');
    test.todo('should delete donate in the database');
    test.todo('should get donate in the database');
    test.todo('should have unique id');
    test.todo('should not be able to send negative amount');
    test.todo('should not be able to send 0 amount');
    
}); 