const app = require('../app');
const supertest = require('supertest');
const request = supertest(app);

const db = require('../server/config/db');
const gfs = require('../server/config/gfs');
const projectController = require('../server/controller/project_controller');
const childController = require('../server/controller/child_controller');
const donationController= require('../server/controller/donation_controller');
const eventController = require('../server/controller/event_controller');
const imageController = require('../server/controller/image_controller');

beforeAll(() => {
    db.url = "mongodb://localhost:27017/test_pearldb";
    db.connect();
    gfs.connect(db.conn);
});
afterAll(async () => {
    await db.conn.dropDatabase();
    await db.conn.close();
});
describe("Get Project", () => {
    test.todo('should be success');
});

describe("Add Project", () => {
    test.todo('should be success');
});

describe("Edit Project", () => {
    test.todo('should be success');
});

describe("Remove Project", () => {
    test.todo('should be success');
});

describe("Get Newsletter", () => {
    test.todo('should be success');
});

describe("Add Newsletter", () => {
    test.todo('should be success');
});

describe("Edit Newsletter", () => {
    test.todo('should be success');
});

describe("Remove Newsletter", () => {
    test.todo('should be success');
});
