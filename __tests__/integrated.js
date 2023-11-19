//dependencies
const app = require('../app');
//database models
const db = require('../server/config/db.js');
const gfs = require('../server/config/gfs.js');
const Child = require('../server/models/child.js');
const Event = require('../server/models/event.js');
const Project = require('../server/models/project.js');
const Newsletter = require('../server/models/newsletter.js');
const Singleton = require('../server/models/singleton.js');
const Staff = require('../server/models/staff.js');
const Trustee = require('../server/models/trustee.js');
const Admin = require('../server/models/admin.js');
//controllers
const singletonController = require('../server/controller/singleton_controller.js');
const adminController = require('../server/controller/admin_controller.js');
//access http request functions
const supertest = require('supertest');
const request = supertest(app);
//mock jsonwebtoken for admin access
var cookie ="";
// setup of database connection
beforeAll( async () => {
    db.testConnect();
    gfs.connect(db.conn);
    //for authorization
    await adminController.initializeAdmin();
    const admin = await db.findMany(Admin,{username: "admin"});
    console.log("admin "+admin);
    const res = await request.post('/admin/submit').send({username: "admin", password: "admin"}).expect(200);
    console.log("res "+res.headers['set-cookie']);
    cookie = res.headers['set-cookie'];
});
//clean up database to start with a clean slate when executing a new  test run
afterAll(async () => {
    gfs.dropBucket();
    await db.dropAllCollections();
    await db.conn.close();
});
//clean up database after each test, dont delete admin for authentication
afterEach(async () => {
    await db.removeAllCollections();
    await gfs.deleteFiles();
  });
//end of setup for database connection
//start of tests
describe("LOGIN ADMIN", () => {
    test('should login admin', async () => {
        const response = await request.post('/admin/submit')
                                        .set('Cookie', cookie)
                                        .send({username: "admin", password: "admin"}).expect(200);
        return 1;
    });
    test('should not login admin wrong password', async () => {
        const res = await request.post('/admin/submit').send({username: "admin", password: "wrong password"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
    test('should not login admin wrong username', async () => {
        const res = await request.post('/admin/submit').send({username: "wrong username", password: "admin"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
    test('should not login admin wrong username and wrong password', async () => {
        const res = await request.post('/admin/submit').send({username: "wrong username", password: "wrong password"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
})

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
        await request.post('/admin/project/add').set('Cookie', cookie)
                                                .attach('mainPhoto', project.mainPhoto)
                                                .field("name", project.name)
                                                .field("category", project.category)
                                                .field("description", project.description)
                                                .field("location", project.location)
                                                .field("raisedDonations", project.raisedDonations)
                                                .field("requiredBudget", project.requiredBudget)
                                                .field("status", project.status)
                                                .expect(200);
        const obj =  await db.findOne(Project, {name: "test project"});
        expect(obj.name).toEqual("test project");
        expect(obj.category).toEqual("Education");
        expect(obj.description).toEqual("test description");
        expect(obj.location).toEqual("test location");
        expect(obj.raisedDonations).toEqual(0);
        expect(obj.requiredBudget).toEqual(1000);
        expect(obj.status).toEqual("Ongoing");
        expect(2).toEqual(2);
        return obj;
    });

    test('should update project in the database', async () => {
        const project = {
            name: "test project",
            category: "Education",
            description:"test description",
            location: "testlocation",
            raisedDonations: 0,
            requiredBudget: 1000,
            status: "Ongoing",
            mainPhoto : "__tests__/test_assets/image_asset.png",     
        };
        await request.post('/admin/project/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', project.mainPhoto)
                    .field("name", project.name)
                    .field("category", project.category)
                    .field("description", project.description)
                    .field("location", project.location)
                    .field("raisedDonations", project.raisedDonations)
                    .field("requiredBudget", project.requiredBudget)
                    .field("status", project.status)
                    expect(200);
        var obj =  await db.findOne(Project, {name: "test project"});
        const mainPhoto = obj.mainPhoto;
        const id = obj._id;

        await request.put('/admin/project/edit')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', project.mainPhoto)
                    .field("id", obj.id.toString())
                    .field("name","test update name")
                    .field("category", "Health")
                    .field("description", "test update description")
                    .field("location", "test update location")
                    .field("raisedDonations", 50)
                    .field("requiredBudget", 5000)
                    .field("status", "Past")
                    .expect(200);

        var newobj =  await db.findOne(Project, {name: "test project"});
        expect(newobj).toBeNull();
        obj =  await db.findOne(Project, {name: "test update name"});
        expect(obj.name).toEqual("test update name");
        expect(obj.category).toEqual("Health");
        expect(obj.description).toEqual("test update description");
        expect(obj.location).toEqual("test update location");
        expect(obj.raisedDonations).toEqual(50);
        expect(obj.requiredBudget).toEqual(5000);
        expect(obj.status).toEqual("Past");
        expect(obj.mainPhoto).not.toEqual(mainPhoto);
        expect(obj._id).toEqual(id);
        obj =  await db.findOne(Project, {name: "test project"});
        expect(obj).toBeNull();

        await request.get('/imageByName')
                    .set('Cookie', cookie)
                    .set("name", mainPhoto).expect(404);
        return obj;
    });
    test('should delete project in the database', async () => {
        const project = {
            name: "test project",
            category: "Education",
            description:"test description",
            location: "test location",
            raisedDonations: 0,
            requiredBudget: 1000,
            status: "Ongoing",
            mainPhoto : "__tests__/test_assets/image_asset.png",     
        };
        await request.post('/admin/project/add')
                    .attach('mainPhoto', project.mainPhoto)
                    .field("name", project.name)
                    .field("category", project.category)
                    .field("description", project.description)
                    .field("location", project.location)
                    .field("raisedDonations", project.raisedDonations)
                    .field("requiredBudget", project.requiredBudget)
                    .field("status", project.status)
                    .set('Cookie', cookie)
                    .expect(200);
        const obj =  await db.findOne(Project, {name: "test project"});
        const mainPhoto = obj.mainPhoto;
       // console.log("deleteid "+obj._id);
        await request.delete('/admin/project/delete').set('Cookie', cookie).send({id: obj._id});
        const newobj =  await db.findOne(Project, {name: "test project"});
        expect(newobj).toBeNull();

        const img = await request.get('/imageByName')
                                .set("name", mainPhoto)
                                .set('Cookie', cookie)
                                .expect(404);
        return obj;
    });
});
describe("Unauthorized CRUD Project", () => {
    test('should not add project in the database',  async () =>{
        await request.post('/admin/project/add')
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test project")
                    .field("category", "Education")
                    .field("description", "test description")
                    .field("location", "test location")
                    .field("raisedDonations", 0)
                    .field("requiredBudget", 1000)
                    .field("status", "Ongoing")
                    .expect(302);
    });
    test('should not update project in the database', async () => {
        await request.post('/admin/project/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test project")
                    .field("category", "Education")
                    .field("description", "test description")
                    .field("location", "test location")
                    .field("raisedDonations", 0)
                    .field("requiredBudget", 1000)
                    .field("status", "Ongoing")
                    .expect(200);
        const obj = await db.findOne(Project, {name: "test project"});
        await request.put('/admin/project/edit')
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("id", obj.id.toString())
                    .field("name","test update name")
                    .field("category", "Health")
                    .field("description", "test update description")
                    .field("location", "test update location")
                    .field("raisedDonations", 50)
                    .field("requiredBudget", 5000)
                    .field("status", "Past")
                    .expect(302);
        const newobj = await db.findOne(Project, {name: "test project"});
        expect(newobj.name).toEqual("test project");
        expect(newobj.category).toEqual("Education");
        expect(newobj.description).toEqual("test description");
        expect(newobj.location).toEqual("test location");
        expect(newobj.raisedDonations).toEqual(0);
        expect(newobj.requiredBudget).toEqual(1000);
        expect(newobj.status).toEqual("Ongoing");
        expect(newobj.mainPhoto).toBeTruthy();
        expect(newobj.mainPhoto).toEqual(obj.mainPhoto);
        expect(newobj.mainPhoto).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj._id).toEqual(obj._id);
    });
    test('should not delete project in the database', async () => {
        await request.post('/admin/project/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test project")
                    .field("category", "Education")
                    .field("description", "test description")
                    .field("location", "test location")
                    .field("raisedDonations", 0)
                    .field("requiredBudget", 1000)
                    .field("status", "Ongoing")
                    .expect(200);
        const obj = await db.findOne(Project, {name: "test project"});
        await request.delete('/admin/project/delete')
                    .send({id: obj._id})
                    .expect(302);
        const newobj = await db.findOne(Project, {_id: obj._id});
        expect(newobj.name).toEqual("test project");
        expect(newobj.category).toEqual("Education");
        expect(newobj.description).toEqual("test description");
        expect(newobj.location).toEqual("test location");
        expect(newobj.raisedDonations).toEqual(0);
        expect(newobj.requiredBudget).toEqual(1000);
        expect(newobj.status).toEqual("Ongoing");
        expect(newobj.mainPhoto).toBeTruthy();
        expect(newobj.mainPhoto).toEqual(obj.mainPhoto);
        expect(newobj.mainPhoto).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj._id).toEqual(obj._id);
    });
});

describe("CRUD Child", () => {
    test('should add Child to database', async () => {
        const child = {
            name: "test child",
            birthdate: "2020-01-01",
            gradelevel: "test gradelevel",
            location: "test location",
            mainPhoto : "__tests__/test_assets/image_asset.png",
        };
        await request.post('/admin/child/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', child.mainPhoto)
                    .field("name", child.name)
                    .field("birthdate", child.birthdate)
                    .field("gradelevel", child.gradelevel)
                    .field("location", child.location)
                    .expect(200);

        const res = await db.findOne(Child, {name: "test child"});
        expect(res).toBeTruthy();
        expect(res.name).toEqual(child.name);
        expect(res.gradelevel).toEqual(child.gradelevel);
        expect(res.location).toEqual(child.location);

        return res;
    });
    test('should update child in the database', async()=>{
        const child = {
            name: "test child",
            birthdate: "2020-01-01",
            gradelevel: "test gradelevel",
            location: "test location",
            mainPhoto : "__tests__/test_assets/image_asset.png",
        };
        await request.post('/admin/child/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', child.mainPhoto)
                                                    .field("name", child.name)
                                                    .field("birthdate", child.birthdate)
                                                    .field("gradelevel", child.gradelevel)
                                                    .field("location", child.location)
                                                    .expect(200);
        var obj = await db.findOne(Child, {name: "test child"});
        const mainPhoto = obj.mainPhoto;
        const id = obj._id;
        await request.put('/admin/child/edit')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', child.mainPhoto)
                                                    .field("id", obj.id.toString())
                                                    .field("name", "test update name")
                                                    .field("birthdate", "2021-01-01")
                                                    .field("gradelevel", "test update gradelevel")
                                                    .field("location", "test update location")
                                                    .expect(200);
        var newobj = await db.findOne(Child, {name: "test child"});
        expect(newobj).toBeNull();
        obj = await db.findOne(Child, {name: "test update name"});
        expect(obj.name).toEqual("test update name");
        expect(obj.gradelevel).toEqual("test update gradelevel");
        expect(obj.location).toEqual("test update location");
        expect(obj.mainPhoto).not.toEqual(mainPhoto);
        await request.get('/imageByName')
                    .set('Cookie', cookie)
                    .set("name", mainPhoto)
                    .expect(404);
        expect(obj._id).toEqual(id);
        obj = await db.findOne(Project, {name: "test child"});
        expect(obj).toBeNull();
        return obj;
    });
    test('should delete child in the database', async () => {
        const child = {
            name: "test child",
            birthdate: "2020-01-01",
            gradelevel: "test gradelevel",
            location: "test location",
            mainPhoto : "__tests__/test_assets/image_asset.png",
        };
        await request.post('/admin/child/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', child.mainPhoto)
                                                    .field("name", child.name)
                                                    .field("birthdate", child.birthdate)
                                                    .field("gradelevel", child.gradelevel)
                                                    .field("location", child.location)
                                                    .expect(200);
        const obj = await db.findOne(Child, {name: "test child"});
        const mainPhoto = obj.mainPhoto;
        await request.delete('/admin/child/delete').set('Cookie', cookie).send({id: obj._id});
        const newobj = await db.findOne(Child, {name: "test child"});
        expect(newobj).toBeNull();
        await request.get('/imageByName')
                    .set('Cookie', cookie)
                    .set("name", mainPhoto)
                    .expect(404);
        return obj;
    });
});
describe("Unauthorized CRUD Child", () => {
    test('should not add Child to database', async () => {
        await request.post('/admin/child/add')
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test child")
                    .field("birthdate", "2020-01-01")
                    .field("gradelevel", "test gradelevel")
                    .field("location", "test location")
                    .expect(302);
        const obj = await db.findOne(Child, {name: "test child"});
        expect(obj).toBeNull();
        return obj;
    });
    test('should not update child in the database', async()=>{
        await request.post('/admin/child/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test child")
                    .field("birthdate", "2020-01-01")
                    .field("gradelevel", "test gradelevel")
                    .field("location", "test location")
                    .expect(200);
        const obj = await db.findOne(Child, {name: "test child"});
        const mainPhoto = obj.mainPhoto;
        await request.put('/admin/child/edit')
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("id", obj.id.toString())
                    .field("name", "test update name")
                    .field("birthdate", "2021-01-01")
                    .field("gradelevel", "test update gradelevel")
                    .field("location", "test update location")
                    .expect(302);
        const newobj = await db.findOne(Child, {name: "test child"});
        expect(newobj.name).toEqual("test child");
        expect(newobj.gradelevel).toEqual("test gradelevel");
        expect(newobj.location).toEqual("test location");
        expect(newobj.mainPhoto).toBeTruthy();
        expect(newobj.mainPhoto).toEqual(obj.mainPhoto);
        expect(newobj.mainPhoto).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj._id).toEqual(obj._id);                
    });
    test('should not delete child in the database', async () => {
        await request.post('/admin/child/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test child")
                    .field("birthdate", "2020-01-01")
                    .field("gradelevel", "test gradelevel")
                    .field("location", "test location")
                    .expect(200);
        const obj = await db.findOne(Child, {name: "test child"});
        const mainPhoto = obj.mainPhoto;
        await request.delete('/admin/child/delete')
                    .send({id: obj._id})
                    .expect(302);
        const newobj = await db.findOne(Child, {name: "test child"});
        expect(newobj.name).toEqual("test child");
        expect(newobj.gradelevel).toEqual("test gradelevel");
        expect(newobj.location).toEqual("test location");
        expect(newobj.mainPhoto).toBeTruthy();
        expect(newobj.mainPhoto).toEqual(obj.mainPhoto);
        expect(newobj.mainPhoto).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj._id).toEqual(obj._id);
        return obj;
    });
});

describe("CRUD Event", () => {
    test('should add Event to database', async () =>{
        const event = {
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
    //    console.log("enddate "+event.endDate);
        await request.post('/admin/event/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', event.mainPhoto)
                    .field("name", event.name)
                    .field("category", event.category)
                    .field("status", event.status)
                    .field("location", event.location)
                    .field("startDate", event.startDate)
                    .field("endDate", event.endDate)
                    .expect(200);
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
    test('should update Event in the database', async () => {
        const event = {
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
        await request.post('/admin/event/add')
                    .set('Cookie', cookie).attach('mainPhoto', event.mainPhoto)
                                        .field("name", event.name)
                                        .field("category", event.category)
                                        .field("status", event.status)
                                        .field("location", event.location)
                                        .field("startDate", event.startDate)
                                        .field("endDate", event.endDate)
                                        .expect(200);
        var obj =  await db.findOne(Event, {name: "test event"});
        const mainPhoto = obj.mainPhoto;
        const id = obj._id;
        await request.put('/admin/event/edit').set('Cookie', cookie).attach('mainPhoto', event.mainPhoto)
                                        .field("id", obj.id.toString())
                                        .field("name", "test update name")
                                        .field("category", "Education")
                                        .field("status", "Past")
                                        .field("location", "test update location")
                                        .field("startDate", event.startDate)
                                        .field("endDate", event.endDate)
                                        .expect(200);
        obj = await db.findOne(Event, {name: "test update name"});
        expect(obj.name).toEqual("test update name");
        expect(obj.category).toEqual("Education");
        expect(obj.status).toEqual("Past");
        expect(obj.location).toEqual("test update location");
        expect(obj.mainPhoto).not.toEqual(mainPhoto);
        expect(obj._id).toEqual(id);
        await request.get('/imageByName').set('Cookie', cookie).set("name", mainPhoto).expect(404);
        obj = await db.findOne(Event, {name: "test event"});
        expect(obj).toBeNull(); 
        return obj;
    });
    test('should delete Event in the database', async () => {
        const event = {
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
        await request.post('/admin/event/add').set('Cookie', cookie).attach('mainPhoto', event.mainPhoto)
                                        .field("name", event.name)
                                        .field("category", event.category)
                                        .field("status", event.status)
                                        .field("location", event.location)
                                        .field("startDate", event.startDate)
                                        .field("endDate", event.endDate)
                                        .expect(200);
        var obj =  await db.findOne(Event, {name: "test event"});
        const mainPhoto = obj.mainPhoto;
        const id = obj._id;
        await request.delete('/admin/event/delete').set('Cookie', cookie).send({id: id}).expect(200);
        obj = await db.findOne(Event, {_id: id});
        expect(obj).toBeNull();
        await request.get('/imageByName').set('Cookie', cookie).set("name", mainPhoto).expect(404);
    });
});
describe("Unauthorized CRUD Event", () => {
    test('should not add Event to database', async () =>{
        var startDate = new Date(2023, 2);
        var endDate = new Date(2024, 6);
        startDate = startDate.toString();
        endDate = endDate.toString();
        await request.post('/admin/event/add')
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test event")
                    .field("category", "Health")
                    .field("status", "Ongoing")
                    .field("location", "test location")
                    .field("startDate", startDate)
                    .field("endDate", endDate)
                    .expect(302);
        const obj =  await db.findOne(Event, {name: "test event"});
        expect(obj).toBeNull();
    });
    test('should not update Event in the database', async () => {
        var startDate = new Date(2023, 2);
        var endDate = new Date(2024, 6);
        var updateStartDate = new Date(2025, 6);
        var updateEndDate = new Date(2026, 6);
        startDate = startDate.toString();
        endDate = endDate.toString();
        updateStartDate = updateStartDate.toString();
        updateEndDate = updateEndDate.toString();
        await request.post('/admin/event/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test event")
                    .field("category", "Health")
                    .field("status", "Ongoing")
                    .field("location", "test location")
                    .field("startDate", startDate)
                    .field("endDate", endDate)
                    .expect(200);
        const obj =  await db.findOne(Event, {name: "test event"});
        await request.put('/admin/event/edit')
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("id", obj.id.toString())
                    .field("name", "test update name")
                    .field("category", "Education")
                    .field("status", "Past")
                    .field("location", "test update location")
                    .field("startDate", updateStartDate)
                    .field("endDate", updateEndDate)
                    .expect(302);     
        const newobj =  await db.findOne(Event, {name: "test event"});
        expect(newobj.name).toEqual("test event");
        expect(newobj.category).toEqual("Health"); 
        expect(newobj.status).toEqual("Ongoing");
        expect(newobj.location).toEqual("test location");
        expect(newobj.mainPhoto).toBeTruthy();
        expect(newobj.mainPhoto).toEqual(obj.mainPhoto);
        expect(newobj.mainPhoto).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj._id).toEqual(obj._id);
    });
    test('should not delete Event in the database', async () => {
        var startDate = new Date(2023, 2);
        var endDate = new Date(2024, 6);
        startDate = startDate.toString();
        endDate = endDate.toString();
        await request.post('/admin/event/add')
                    .set('Cookie', cookie)
                    .attach('mainPhoto', "__tests__/test_assets/image_asset.png")
                    .field("name", "test event")
                    .field("category", "Health")
                    .field("status", "Ongoing")
                    .field("location", "test location")
                    .field("startDate", startDate)
                    .field("endDate", endDate)
                    .expect(200);
        const obj =  await db.findOne(Event, {name: "test event"});
        await request.delete('/admin/event/delete')
                    .send({id: obj._id})
                    .expect(302);
        const newobj =  await db.findOne(Event, {name: "test event"});
        expect(newobj.name).toEqual("test event");
        expect(newobj.category).toEqual("Health");
        expect(newobj.status).toEqual("Ongoing");
        expect(newobj.location).toEqual("test location");
        expect(newobj.mainPhoto).toBeTruthy();
        expect(newobj.mainPhoto).toEqual(obj.mainPhoto);
        expect(newobj.mainPhoto).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj._id).toEqual(obj._id);
    });
});

describe("CRUD Newsletter", ()=>{
    test('should add newsletter to database', async () => {
        const newsletter = {
            name: "test newsletter",
            category: "Education",
            status: "Ongoing",
            mainPhoto :"__tests__/test_assets/image_asset.png",     
        };
        await request.post('/admin/newsletter/add')
                                            .set('Cookie', cookie)
                                            .attach('photos', newsletter.mainPhoto)
                                            .attach('photos', newsletter.mainPhoto)
                                            .field("name", newsletter.name)
                                            .field("category", newsletter.category)
                                            .field("status", newsletter.status)
                                            .expect(200);
        const obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        expect(obj.name).toEqual(newsletter.name);
        expect(obj.category).toEqual(newsletter.category);
        expect(obj.status).toEqual(newsletter.status);
        expect(obj.photos.length).toEqual(2);
        expect(obj.photos[0]).toBeTruthy();
        expect(obj.photos[1]).toBeTruthy();
        expect(obj.photos[0]).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(obj.photos[1]).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(obj.photos[0]).not.toEqual(obj.photos[1]);
        return obj;
    });
    test('should update newsletter in the database', async () => {
        const newsletter = {
            name: "test newsletter",
            category: "Education",
            status: "Ongoing",
            mainPhoto : "__tests__/test_assets/image_asset.png",     
        };
        await request.post('/admin/newsletter/add').set('Cookie', cookie).attach('photos', newsletter.mainPhoto)
                                            .attach('photos', newsletter.mainPhoto)
                                            .field("name", newsletter.name)
                                            .field("category", newsletter.category)
                                            .field("status", newsletter.status)
                                            .expect(200);
        var obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        const mainPhoto = obj.photos;
        expect(mainPhoto.length).toEqual(2);
        const id = obj._id;
        await request.put('/admin/newsletter/edit').set('Cookie', cookie).attach('photos', newsletter.mainPhoto)
                                            .field("id", obj.id.toString())
                                            .field("name", "test update name")
                                            .field("category", "Health")
                                            .field("status", "Past")
                                            .expect(200);
        obj = await db.findOne(Newsletter, {name: "test update name"});
        expect(obj.name).toEqual("test update name");
        expect(obj.category).toEqual("Health");
        expect(obj.status).toEqual("Past");
        expect(obj.photos[0]).not.toEqual(mainPhoto);
        expect(obj.photos[1]).toBeUndefined();
        expect(obj._id).toEqual(id);
        await request.get('/imageByName').set('Cookie', cookie).set("name", mainPhoto[1]).expect(404);
        await request.get('/imageByName').set('Cookie', cookie).set("name", mainPhoto[0]).expect(404);
    });

    test('should delete newsletter in the database', async () => {
        const newsletter = {
            name: "test newsletter",
            category: "Education",
            status: "Ongoing",
            mainPhoto : "__tests__/test_assets/image_asset.png",     
        };
        await request.post('/admin/newsletter/add').set('Cookie', cookie).attach('photos', newsletter.mainPhoto)
                                            .attach('photos', newsletter.mainPhoto)
                                            .field("name", newsletter.name)
                                            .field("category", newsletter.category)
                                            .field("status", newsletter.status)
                                            .expect(200);
        var obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        const mainPhoto = obj.photos;
        expect(mainPhoto.length).toEqual(2);
        const id = obj._id;
        await request.delete('/admin/newsletter/delete').set('Cookie', cookie).send({id: id}).expect(200);
        obj = await db.findOne(Newsletter,{_id:id});
        expect(obj).toBeNull();
        await request.get('/imageByName').set('Cookie', cookie).set("name", mainPhoto[1]).expect(404);
        await request.get('/imageByName').set('Cookie', cookie).set("name", mainPhoto[0]).expect(404);
    });
});
describe("Unauthorized CRUD Newsletter", () => {
    test('should not add newsletter to database', async () => {
        await request.get('/admin/newsletter/add')
                    .attach('photos', "__tests__/test_assets/image_asset.png")
                    .field("name", "test newsletter")
                    .field("category", "Education")
                    .field("status", "Ongoing")
                    .expect(302);
        const obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        expect(obj).toBeNull();
    });
    test('should not update newsletter in the database', async () => {
        await request.post('/admin/newsletter/add')
                    .set('Cookie', cookie)
                    .attach('photos', "__tests__/test_assets/image_asset.png")
                    .attach('photos', "__tests__/test_assets/image_asset.png")
                    .field("name", "test newsletter")
                    .field("category", "Education")
                    .field("status", "Ongoing")
                    .expect(200);
        const obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        expect(obj.photos.length).toEqual(2);
        await request.put('/admin/newsletter/edit')
                    .attach('photos', "__tests__/test_assets/image_asset.png")
                    .field("id", obj.id.toString())
                    .field("name", "test update name")
                    .field("category", "Health")
                    .field("status", "Past")
                    .expect(302);
        const newobj =  await db.findOne(Newsletter, {name: "test newsletter"});
        expect(newobj.name).toEqual("test newsletter");
        expect(newobj.category).toEqual("Education");
        expect(newobj.status).toEqual("Ongoing");
        expect(newobj.photos.length).toEqual(2);
        expect(newobj.photos[0]).toBeTruthy();
        expect(newobj.photos[1]).toBeTruthy();
        expect(newobj.photos[0]).toEqual(obj.photos[0]);
        expect(newobj.photos[1]).toEqual(obj.photos[1]);
        expect(newobj.photos[0]).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj.photos[1]).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj.photos[0]).not.toEqual(newobj.photos[1]);
        expect(newobj._id).toEqual(obj._id);
    });
    test('should not delete newsletter in the database', async () => {
        await request.post('/admin/newsletter/add')
                    .set('Cookie', cookie)
                    .attach('photos', "__tests__/test_assets/image_asset.png")
                    .attach('photos', "__tests__/test_assets/image_asset.png")
                    .field("name", "test newsletter")
                    .field("category", "Education")
                    .field("status", "Ongoing")
                    .expect(200);
        const obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        expect(obj.photos.length).toEqual(2);
        await request.delete('/admin/newsletter/delete')
                    .send({id: obj._id})
                    .expect(302);
        const newobj =  await db.findOne(Newsletter, {name: "test newsletter"});
        expect(newobj.name).toEqual("test newsletter");
        expect(newobj.category).toEqual("Education");
        expect(newobj.status).toEqual("Ongoing");
        expect(newobj.photos.length).toEqual(2);
        expect(newobj.photos[0]).toBeTruthy();
        expect(newobj.photos[1]).toBeTruthy();
        expect(newobj.photos[0]).toEqual(obj.photos[0]);
        expect(newobj.photos[1]).toEqual(obj.photos[1]);
        expect(newobj.photos[0]).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj.photos[1]).not.toEqual("__tests__/test_assets/image_asset.png");
        expect(newobj.photos[0]).not.toEqual(newobj.photos[1]);
        expect(newobj._id).toEqual(obj._id);
    });
});

describe("CRUD Singleton", () => {
    test('should initialize singleton to database once', async () => {
        await singletonController.getIndex();
        await singletonController.getIndex();
        await singletonController.getIndex();
        const singleton = await db.findMany(Singleton, {});
        expect(singleton.length).toEqual(1);
        console.log("singleton "+singleton.length);

        
    });
    test('should update singleton to database for the first time', async () => {
        const mainPhoto = "__tests__/test_assets/image_asset.png";
        await singletonController.getIndex();
        //test for first update
        await request.put('/admin/other/edit').set('Cookie', cookie).attach('frontpagePhoto', mainPhoto)
                                            .field('aboutUs', 'test about us')
                                            .field('mission', 'test mission')
                                            .field('vision', 'test vision')
                                            .field('projectsDescription', 'test projects description')
                                            .field('newsletterDescription', 'test newsletter description')
                                            .field('email', 'test email')
                                            .field('facebook', 'test facebook')
                                            .field('instagram', 'test instagram')
                                            .field('twitter', 'test twitter')
                                            .field('address', 'test address')
                                            .field('phone', 'test phone')
                                            .expect(200);
        const singleton = await db.findOne(Singleton, {id: "Singleton"});
        expect(singleton.aboutUs).toEqual('test about us');
        expect(singleton.mission).toEqual('test mission');
        expect(singleton.vision).toEqual('test vision');
        expect(singleton.projectsDescription).toEqual('test projects description');
        expect(singleton.newsletterDescription).toEqual('test newsletter description');
        expect(singleton.email).toEqual('test email');
        expect(singleton.facebook).toEqual('test facebook');
        expect(singleton.instagram).toEqual('test instagram');
        expect(singleton.twitter).toEqual('test twitter');
        expect(singleton.address).toEqual('test address');
        expect(singleton.phone).toEqual('test phone');
    });
    test('should update rewrite previous updates in the singleton database', async () => {
        const mainPhoto = "__tests__/test_assets/image_asset.png";
        await singletonController.getIndex();
        //test for first update
        await request.put('/admin/other/edit').set('Cookie', cookie).attach('frontpagePhoto', mainPhoto)
                                            .field('aboutUs', 'test about us')
                                            .field('mission', 'test mission')
                                            .field('vision', 'test vision')
                                            .field('projectsDescription', 'test projects description')
                                            .field('newsletterDescription', 'test newsletter description')
                                            .field('email', 'test email')
                                            .field('facebook', 'test facebook')
                                            .field('instagram', 'test instagram')
                                            .field('twitter', 'test twitter')
                                            .field('address', 'test address')
                                            .field('phone', 'test phone')
                                            .expect(200);
        const singleton = await db.findOne(Singleton, {id: "Singleton"});
        const img = singleton.frontpagePhoto;        
        //test for second update
        await request.put('/admin/other/edit').set('Cookie', cookie).attach('frontpagePhoto', mainPhoto)
                                            .field('aboutUs', 'test about us2')
                                            .field('mission', 'test mission2')
                                            .field('vision', 'test vision2')
                                            .field('projectsDescription', 'test projects description2')
                                            .field('newsletterDescription', 'test newsletter description2')
                                            .field('email', 'test email2')
                                            .field('facebook', 'test facebook2')
                                            .field('instagram', 'test instagram2')
                                            .field('twitter', 'test twitter2')
                                            .field('address', 'test address2')
                                            .field('phone', 'test phone2')
                                            .expect(200);
        const singleton2 = await db.findOne(Singleton, {id: "Singleton"});
        const res = await db.findMany(Singleton, {});
        expect(res.length).toEqual(1);
        expect(singleton2.aboutUs).toEqual('test about us2');
        expect(singleton2.mission).toEqual('test mission2');
        expect(singleton2.vision).toEqual('test vision2');
        expect(singleton2.projectsDescription).toEqual('test projects description2');
        expect(singleton2.newsletterDescription).toEqual('test newsletter description2');
        expect(singleton2.email).toEqual('test email2');
        expect(singleton2.facebook).toEqual('test facebook2');
        expect(singleton2.instagram).toEqual('test instagram2');
        expect(singleton2.twitter).toEqual('test twitter2');
        expect(singleton2.address).toEqual('test address2');
        expect(singleton2.phone).toEqual('test phone2');
        expect(singleton2.frontpagePhoto).not.toEqual(img);
        await request.get('/imageByName').set("name", img).expect(404);
    });

    test.todo('should update staff photo');
});
describe("Unauthorized CRUD Singleton", () => {
    test('should not update singleton to database', async () => {
        const mainPhoto = "__tests__/test_assets/image_asset.png";
        await singletonController.initializeSingleton();
        //test for first update
        await request.put('/admin/other/edit').attach('frontpagePhoto', mainPhoto)
                                            .field('aboutUs', 'test about us')
                                            .field('mission', 'test mission')
                                            .field('vision', 'test vision')
                                            .field('projectsDescription', 'test projects description')
                                            .field('newsletterDescription', 'test newsletter description')
                                            .field('email', 'test email')
                                            .field('facebook', 'test facebook')
                                            .field('instagram', 'test instagram')
                                            .field('twitter', 'test twitter')
                                            .field('address', 'test address')
                                            .field('phone', 'test phone')
                                            .expect(302);
        const singleton = await db.findOne(Singleton, {id: "Singleton"});
        expect(singleton).toBeTruthy
        console.log("singleton "+singleton);
        expect(singleton.id).toEqual("Singleton");
        expect(singleton.aboutUs).not.toEqual('test about us');
        expect(singleton.mission).not.toEqual('test mission');
        expect(singleton.vision).not.toEqual('test vision');
        expect(singleton.projectsDescription).not.toEqual('test projects description');
        expect(singleton.newsletterDescription).not.toEqual('test newsletter description');
        expect(singleton.email).not.toEqual('test email');

    });
    
});

describe("CRUD Trustee", () => {
    test('should add trustee to database', async () => {
        await request.post('/admin/trustee/add')
                        .set('Cookie', cookie)
                        .send({name: "test name", position: "test position"})
                        .expect(200);
        const obj = await db.findOne(Trustee, {});
        expect(obj.name).toEqual("test name");
        expect(obj.position).toEqual("test position");


    });
    test('should update trustee in the database', async () => {
        await request.post('/admin/trustee/add')
                        .set('Cookie', cookie)
                        .send({name: "test name", position: "test position"})
                        .expect(200);
        const obj = await db.findOne(Trustee, {});
        await request.put('/admin/trustee/edit')
                        .set('Cookie', cookie)
                        .send({id: obj._id, name: "test update name", position: "test update position"})
                        .expect(200);
        const newobj = await db.findOne(Trustee, {});
        expect(newobj.name).toEqual("test update name");
        expect(newobj.position).toEqual("test update position");
    });
    test('should delete trustee in the database', async ()=>{
        await request.post('/admin/trustee/add')
                        .set('Cookie', cookie)
                        .send({name: "test name", position: "test position"})
                        .expect(200);
        const obj = await db.findOne(Trustee, {});
        await request.delete('/admin/trustee/delete')
                        .set('Cookie', cookie)
                        .send({id: obj._id})
                        .expect(200);
        const newobj = await db.findOne(Trustee, {id: obj._id});
        expect(newobj).toBeNull();
    });
});
describe("Unauthorized CRUD Trustee", () => {

});

describe("CRUD Staff", () => {
    test('should add staff to database', async () => {
        await request.post('/admin/staff/add')
                    .set('Cookie', cookie)
                    .send({name: "test name", position: "test position"})
                    .expect(200);
        const obj = await db.findOne(Staff, {});
        expect(obj.name).toEqual("test name");
        expect(obj.position).toEqual("test position");

    });
    test('should update staff in the database', async () => {
        await request.post('/admin/staff/add')
                    .set('Cookie', cookie)
                    .send({name: "test name", position: "test position"})
                    .expect(200);
        const obj = await db.findOne(Staff, {});
        await request.put('/admin/staff/edit')
                    .set('Cookie', cookie)
                    .send({id: obj._id, name: "test update name", position: "test update position"})
                    .expect(200);
        const newobj = await db.findOne(Staff, {_id: obj._id});
        expect(newobj.name).toEqual("test update name");
        expect(newobj.position).toEqual("test update position");
    });
    test ('should delete staff in the database', async () => {
        await request.post('/admin/staff/add')
                    .set('Cookie', cookie)
                    .send({name: "test name", position: "test position"})
                    .expect(200);
        const obj = await db.findOne(Staff, {});
        await request.delete('/admin/staff/delete')
                    .set('Cookie', cookie)
                    .send({id: obj._id})
                    .expect(200);
        const newobj = await db.findOne(Staff, {_id: obj._id});
        expect(newobj).toBeNull();
    });
});
describe("Unauthorized CRUD Staff", () => {
    test('should not add staff to database', async () => {
        await request.post('/admin/staff/add')
                    .send({name: "test name", position: "test position"})
                    .expect(302);
        const obj = await db.findOne(Staff, {});
        expect(obj).toBeNull();

    });
    test('should not update staff in the database', async () => {
        await request.post('/admin/staff/add')
                    .set('Cookie', cookie)
                    .send({name: "test name", position: "test position"})
                    .expect(200);
        const obj = await db.findOne(Staff, {});
        await request.put('/admin/staff/edit')
                    .send({id: obj._id, name: "test update name", position: "test update position"})
                    .expect(302);
        const newobj = await db.findOne(Staff, {_id: obj._id});
        expect(newobj.name).toEqual("test name");
        expect(newobj.position).toEqual("test position");
        expect(newobj._id).toEqual(obj._id);
    });
    test ('should not delete staff in the database', async () => {
    await request.post('/admin/staff/add')
                .set('Cookie', cookie)
                .send({name: "test name", position: "test position"})
                .expect(200);
    const obj = await db.findOne(Staff, {});
    await request.delete('/admin/staff/delete')
                .send({id: obj._id})
                .expect(302);
    const newobj = await db.findOne(Staff, {_id: obj._id});
    expect(newobj.name).toEqual("test name");
    expect(newobj.position).toEqual("test position");
    expect(newobj._id).toEqual(obj._id);
    });
});
describe("Unauthorized CRUD Staff", () => {
    test('should not add staff to database', async () => {
        await request.post('/admin/staff/add')
                    .send({name: "test name", position: "test position"})
                    .expect(302);
        const obj = await db.findOne(Staff, {});
        expect(obj).toBeNull();
    });
    test('should not update staff in the database', async () => {
        await request.post('/admin/staff/add')
                    .set('Cookie', cookie)
                    .send({name: "test name", position: "test position"})
                    .expect(200);
        const obj = await db.findOne(Staff, {});
        await request.put('/admin/staff/edit')
                    .send({id: obj._id, name: "test update name", position: "test update position"})
                    .expect(302);
        const newobj = await db.findOne(Staff, {_id: obj._id});
        expect(newobj.name).toEqual("test name");
        expect(newobj.position).toEqual("test position");
        expect(newobj._id).toEqual(obj._id);
    });
    test ('should not delete staff in the database', async () => {
        await request.post('/admin/staff/add')
                    .set('Cookie', cookie)
                    .send({name: "test name", position: "test position"})
                    .expect(200);
        const obj = await db.findOne(Staff, {});
        await request.delete('/admin/staff/delete')
                    .send({id: obj._id})
                    .expect(302);
        const newobj = await db.findOne(Staff, {_id: obj._id});
        expect(newobj.name).toEqual("test name");
        expect(newobj.position).toEqual("test position");
        expect(newobj._id).toEqual(obj._id);
        
    });
});
