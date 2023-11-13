//dependencies
const app = require('../app');
const jwt = require('jsonwebtoken');
//database models
const db = require('../server/config/db.js');
const gfs = require('../server/config/gfs.js');
const Child = require('../server/models/child.js');
const Donation = require('../server/models/donation.js');
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
    await adminController.initializeAdmin();
    const admin = await db.findMany(Admin,{username: "admin"});
    console.log("admin "+admin);
    const res = await request.post('/admin/submit').send({username: "admin", password: "admin"}).expect(200);
    console.log("res "+res.headers['set-cookie']);
    cookie = res.headers['set-cookie'];
    //token = res.body.token;
});

afterAll(async () => {
    gfs.dropBucket();
    await db.dropAllCollections();
    await db.conn.close();
});
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
    test('should not login admin', async () => {
        const res = await request.post('/admin/submit').send({username: "admin", password: "wrong password"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
    test('should not login admin', async () => {
        const res = await request.post('/admin/submit').send({username: "wrong username", password: "admin"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
    test('should not login admin', async () => {
        const res = await request.post('/admin/submit').send({username: "wrong username", password: "wrong password"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
    test('should not login admin', async () => {
        const res = await request.post('/admin/submit').send({username: "wrong username", password: "wrong password"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
    test('should not login admin', async () => {
        const res = await request.post('/admin/submit').send({username: "admin", password: "wrong password"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
    test('should not login admin', async () => {
        const res = await request.post('/admin/submit').send({username: "admin", password: "wrong password"}).expect(401);
        expect(res.body).toEqual({});
        return res;
    });
    test('should not login admin', async () => {
        const res = await request.post('/admin/submit').send({username: "admin", password: "wrong password"}).expect(401);
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
        await request.post('/admin/event/add').set('Cookie', cookie).attach('mainPhoto', event.mainPhoto)
                                        .field("name", event.name)
                                        .field("category", event.category)
                                        .field("status", event.status)
                                        .field("location", event.location)
                                        .field("startDate", event.startDate)
                                        .field("endDate", event.endDate)
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
        await request.post('/admin/newsletter/add').set('Cookie', cookie).attach('photos', newsletter.mainPhoto)
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

describe("CRUD Trustee", () => {
    test.todo('should add trustee to database');
    test.todo('should update trustee in the database');
    test.todo('should delete trustee in the database');
});

describe("CRUD Staff", () => {
    test.todo('should add staff to database');
    test.todo('should update staff in the database');
    test.todo('should delete staff in the database');
});

describe("CRUD Admin", () => {
    test.todo('should add admin to database');
    test.todo('should update admin in the database');
    test.todo('should delete admin in the database');
});