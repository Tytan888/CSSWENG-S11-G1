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
const Newsletter = require('../server/models/newsletter.js');
const Singleton = require('../server/models/singleton.js');


//controllers
const childController = require('../server/controller/child_controller.js');
const donationController = require('../server/controller/donation_controller.js');
const eventController = require('../server/controller/event_controller.js');
const projectController = require('../server/controller/project_controller.js');
const newsletterController = require('../server/controller/newsletter_controller.js');
const singletonController = require('../server/controller/singleton_controller.js');

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
//start of tests
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
        expect(obj.name).toEqual("test project");
        expect(obj.category).toEqual("Education");
        expect(obj.description).toEqual("test description");
        expect(obj.location).toEqual("test location");
        expect(obj.raisedDonations).toEqual(0);
        expect(obj.requiredBudget).toEqual(1000);
        expect(obj.status).toEqual("Ongoing");
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
        await request.post('/add_project').attach('mainPhoto', project.mainPhoto)
                                            .field("name", project.name)
                                            .field("category", project.category)
                                            .field("description", project.description)
                                            .field("location", project.location)
                                            .field("raisedDonations", project.raisedDonations)
                                            .field("requiredBudget", project.requiredBudget)
                                            .field("status", project.status)
                                            .expect(200);
        var obj =  await db.findOne(Project, {name: "test project"});
        const mainPhoto = obj.mainPhoto;
        const id = obj._id;
        await request.put('/edit_project').attach('mainPhoto', project.mainPhoto)
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
        await request.get('/imageByName').set("name", mainPhoto).expect(404);
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
        await request.post('/add_project').attach('mainPhoto', project.mainPhoto)
                                            .field("name", project.name)
                                            .field("category", project.category)
                                            .field("description", project.description)
                                            .field("location", project.location)
                                            .field("raisedDonations", project.raisedDonations)
                                            .field("requiredBudget", project.requiredBudget)
                                            .field("status", project.status).expect(200);
        const obj =  await db.findOne(Project, {name: "test project"});
        const mainPhoto = obj.mainPhoto;
       // console.log("deleteid "+obj._id);
        await request.delete('/delete_project').send({id: obj._id});
        const newobj =  await db.findOne(Project, {name: "test project"});
        expect(newobj).toBeNull();
        const img = await request.get('/imageByName').set("name", mainPhoto).expect(404);
        return obj;
    });
    test('should have unique id', async() =>{
        const project = {
            name: "test project",
            category: "Education",
            description:"test description",
            location: "test location",
            raisedDonations: 0,
            requiredBudget: 1000,
            status: "Ongoing",
            mainPhoto : "__tests__/test_assets/image_asset.png",     
        }
        await request.post('/add_project').attach('mainPhoto', project.mainPhoto)
                                            .field("name", project.name)
                                            .field("category", project.category)
                                            .field("description", project.description)
                                            .field("location", project.location)
                                            .field("raisedDonations", project.raisedDonations)
                                            .field("requiredBudget", project.requiredBudget)
                                            .field("status", project.status)
                                            .expect(200);
        const obj =  await db.findOne(Project, {name: "test project"});
        await request.post('/add_project').attach('mainPhoto', project.mainPhoto)
                                            .field("name", project.name+"1")
                                            .field("category", project.category)
                                            .field("description", project.description)
                                            .field("location", project.location)
                                            .field("raisedDonations", project.raisedDonations)
                                            .field("requiredBudget", project.requiredBudget)
                                            .field("status", project.status)
                                            .expect(200);
        const obj2 =  await db.findOne(Project, {name: "test project1"});
        await request.post('/add_project').attach('mainPhoto', project.mainPhoto)
                                            .field("name", project.name+"2")
                                            .field("category", project.category)
                                            .field("description", project.description)
                                            .field("location", project.location)
                                            .field("raisedDonations", project.raisedDonations)
                                            .field("requiredBudget", project.requiredBudget)
                                            .field("status", project.status)
                                            .expect(200);
        const obj3 =  await db.findOne(Project, {name: "test project2"});
       // console.log("obj1 "+obj._id+" obj2 "+obj2._id+" obj3 "+obj3._id);

        expect(obj._id).not.toEqual(obj2._id);
        expect(obj._id).not.toEqual(obj3._id);
        expect(obj2._id).not.toEqual(obj3._id);
        return obj;
        
    });
    test.todo('should not be able to send with non image file upload');
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
        await request.post('/add_child').attach('mainPhoto', child.mainPhoto)
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
        await request.post('/add_child').attach('mainPhoto', child.mainPhoto)
                                                    .field("name", child.name)
                                                    .field("birthdate", child.birthdate)
                                                    .field("gradelevel", child.gradelevel)
                                                    .field("location", child.location)
                                                    .expect(200);
        var obj = await db.findOne(Child, {name: "test child"});
        const mainPhoto = obj.mainPhoto;
        const id = obj._id;
        await request.put('/edit_child').attach('mainPhoto', child.mainPhoto)
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
        await request.get('/imageByName').set("name", mainPhoto).expect(404);
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
        await request.post('/add_child').attach('mainPhoto', child.mainPhoto)
                                                    .field("name", child.name)
                                                    .field("birthdate", child.birthdate)
                                                    .field("gradelevel", child.gradelevel)
                                                    .field("location", child.location)
                                                    .expect(200);
        const obj = await db.findOne(Child, {name: "test child"});
        const mainPhoto = obj.mainPhoto;
        await request.delete('/delete_child').send({id: obj._id});
        const newobj = await db.findOne(Child, {name: "test child"});
        expect(newobj).toBeNull();
        await request.get('/imageByName').set("name", mainPhoto).expect(404);
        return obj;
    });
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
        await request.post('/add_event').attach('mainPhoto', event.mainPhoto)
                                        .field("name", event.name)
                                        .field("category", event.category)
                                        .field("status", event.status)
                                        .field("location", event.location)
                                        .field("startdate", event.startDate)
                                        .field("enddate", event.endDate)
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
        await request.post('/add_event').attach('mainPhoto', event.mainPhoto)
                                        .field("name", event.name)
                                        .field("category", event.category)
                                        .field("status", event.status)
                                        .field("location", event.location)
                                        .field("startdate", event.startDate)
                                        .field("enddate", event.endDate)
                                        .expect(200);
        var obj =  await db.findOne(Event, {name: "test event"});
        const mainPhoto = obj.mainPhoto;
        const id = obj._id;
        await request.put('/edit_event').attach('mainPhoto', event.mainPhoto)
                                        .field("id", obj.id.toString())
                                        .field("name", "test update name")
                                        .field("category", "Education")
                                        .field("status", "Past")
                                        .field("location", "test update location")
                                        .field("startdate", event.startDate)
                                        .field("enddate", event.endDate)
                                        .expect(200);
        obj = await db.findOne(Event, {name: "test update name"});
        expect(obj.name).toEqual("test update name");
        expect(obj.category).toEqual("Education");
        expect(obj.status).toEqual("Past");
        expect(obj.location).toEqual("test update location");
        expect(obj.mainPhoto).not.toEqual(mainPhoto);
        expect(obj._id).toEqual(id);
        await request.get('/imageByName').set("name", mainPhoto).expect(404);
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
        await request.post('/add_event').attach('mainPhoto', event.mainPhoto)
                                        .field("name", event.name)
                                        .field("category", event.category)
                                        .field("status", event.status)
                                        .field("location", event.location)
                                        .field("startdate", event.startDate)
                                        .field("enddate", event.endDate)
                                        .expect(200);
        var obj =  await db.findOne(Event, {name: "test event"});
        const mainPhoto = obj.mainPhoto;
        const id = obj._id;
        await request.delete('/delete_event').send({id: id}).expect(200);
        obj = await db.findOne(Event, {_id: id});
        expect(obj).toBeNull();
        await request.get('/imageByName').set("name", mainPhoto).expect(404);
    });
    test('should get Event in the database', async () => {
        return false;
    });
    test('should have start date be earlier than the end date', async () => {  
        const event = {
            name: "test event",
            mainPhoto: "__tests__/test_assets/image_asset.png",
            category: "Health",
            status: "Ongoing",
            location:"test location",
            startDate: new Date(2024, 2),
            endDate: new Date(2023, 6),
        };
        event.startDate = event.startDate.toString();
        event.endDate = event.endDate.toString();
        await request.post('/add_event').attach('mainPhoto', event.mainPhoto)
                                        .field("name", event.name)
                                        .field("category", event.category)
                                        .field("status", event.status)
                                        .field("location", event.location)
                                        .field("startdate", event.startDate)
                                        .field("enddate", event.endDate)
                                        .expect(400);
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
        await request.post('/add_newsletter').attach('photos', newsletter.mainPhoto)
                                            .field("name", newsletter.name)
                                            .field("category", newsletter.category)
                                            .field("status", newsletter.status)
                                            .expect(200);
        const obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        expect(obj.name).toEqual(newsletter.name);
        expect(obj.category).toEqual(newsletter.category);
        expect(obj.status).toEqual(newsletter.status);
        return obj;
    });
    test('should update newsletter in the database', async () => {
        const newsletter = {
            name: "test newsletter",
            category: "Education",
            status: "Ongoing",
            mainPhoto : "__tests__/test_assets/image_asset.png",     
        };
        await request.post('/add_newsletter').attach('photos', newsletter.mainPhoto)
                                            .attach('photos', newsletter.mainPhoto)
                                            .field("name", newsletter.name)
                                            .field("category", newsletter.category)
                                            .field("status", newsletter.status)
                                            .expect(200);
        var obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        const mainPhoto = obj.photos;
        expect(mainPhoto.length).toEqual(2);
        const id = obj._id;
        await request.put('/edit_newsletter').attach('photos', newsletter.mainPhoto)
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
        console.log('newsletter updated img '+obj.photos[0]);
        await request.get('/imageByName').set("name", mainPhoto[1]).expect(404);
        await request.get('/imageByName').set("name", mainPhoto[0]).expect(404);
    });

    test('should delete newsletter in the database', async () => {
        const newsletter = {
            name: "test newsletter",
            category: "Education",
            status: "Ongoing",
            mainPhoto : "__tests__/test_assets/image_asset.png",     
        };
        await request.post('/add_newsletter').attach('photos', newsletter.mainPhoto)
                                            .attach('photos', newsletter.mainPhoto)
                                            .field("name", newsletter.name)
                                            .field("category", newsletter.category)
                                            .field("status", newsletter.status)
                                            .expect(200);
        var obj =  await db.findOne(Newsletter, {name: "test newsletter"});
        const mainPhoto = obj.photos;
        expect(mainPhoto.length).toEqual(2);
        const id = obj._id;
        await request.delete('/delete_newsletter').send({id: id}).expect(200);
        obj = await db.findOne(Newsletter,{_id:id});
        expect(obj).toBeNull();
        await request.get('/imageByName').set("name", mainPhoto[1]).expect(404);
        await request.get('/imageByName').set("name", mainPhoto[0]).expect(404);
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
        await request.put('/edit_others').attach('frontpagePhoto', mainPhoto)
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
        await request.put('/edit_others').attach('frontpagePhoto', mainPhoto)
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
        console.log("img "+img);        
        //test for second update
        await request.put('/edit_others').attach('frontpagePhoto', mainPhoto)
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