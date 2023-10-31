const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const imageController = require('../controller/image_controller.js');
const projectController = require('../controller/project_controller.js');
const childController = require('../controller/child_controller.js');
const eventController = require('../controller/event_controller.js');
const donationController = require('../controller/donation_controller.js');
const file_upload = require('../controller/middleware/file_upload.js');

//test for image upload
const Test = require('../models/test_img.js');
const donation = require('../models/donation.js');

// testing image

router.post('/', file_upload.single('photo'), async (req, res) => {
    var filename = req.file.filename;
    await Test.create({ title: filename, code: 'test' });
    res.render('index', {});
});

router.get('/fileName', async (req, res) => {
    var filename = [];
    filename = await Test.find({ code: 'test' }, "title");
    if (filename != null) {
        res.set('Content-Type', 'application/json');
        res.send({ filename: filename });
    } else
        res.send(null);
});

//end of testing image 

router.get('/', async (req, res) => {
    res.render('index', {});
});

router.get('/404', async (req, res) => {
    res.render('404', {});
});

router.get('/imageByName', imageController.getByName);
router.delete('/deleteByName', imageController.deleteByName);

// TODO: Also for adding, editing, and deleting projects, make sure only admins can access these pages and authenticate them.
router.get("/get_project", projectController.getProject);
router.post("/add_project", file_upload.single('mainPhoto'), projectController.addProject);
router.put("/edit_project", file_upload.single('mainPhoto'), projectController.updateProject, imageController.deleteByName);
router.delete("/delete_project", projectController.deleteProject, imageController.deleteByName);

// TODO: Also for adding, editing, and deleting children, make sure only admins can access these pages and authenticate them.
router.get("/get_child", childController.getChild);
router.post("/add_child", file_upload.single('mainPhoto'), childController.addChild)
router.put("/edit_child", file_upload.single('mainPhoto'), childController.updateChild, imageController.deleteByName);
router.delete("/delete_child", childController.deleteChild, imageController.deleteByName);

// TODO: Also for adding, editing, and deleting events, make sure only admins can access these pages and authenticate them.
router.get("/get_event", eventController.getEvent);
router.post("/add_event", file_upload.array('photos', 10), eventController.addEvent);
router.put("/edit_event", file_upload.array('photos', 10), eventController.updateEvent, imageController.deleteByNames);
router.delete("/delete_event", eventController.deleteEvent, imageController.deleteByNames);

router.get("/donate", donationController.donationRedirect);
router.get("/donate/type", donationController.donationType);
router.get('/donate/select-:type', donationController.donationSelect);
router.get('/donate/details/:id', donationController.donationDetails);
router.post('/donate/submit', donationController.submitDonation);
router.post('/donate/log', donationController.logDonation);
router.get('/donate/thanks', donationController.donationThanks);
router.get("/donate/fail", donationController.donationFail);

router.get("/project/view/:id", async (req, res) => {
    let id = req.params.id
    let element = await projectController.getProjectById(req, res, id)
    if (element == null) {
        res.redirect('/404');
        return;
    }
    res.render('project-view', { name: element.name, description: element.description, category: element.category, location: element.location, status: element.status, mainPhoto: element.mainPhoto, progress: element.raisedDonations / element.requiredBudget * 100, raisedDonations: element.raisedDonations.toLocaleString("en-US"), requiredBudget: element.requiredBudget.toLocaleString("en-US"), id: element.id });

});

router.get("/project/explore", async (req, res) => {
    const healthProject = await projectController.getProjectsByFilters(req, res, { category: 'Health' }, 1);
    const livelihoodProject = await projectController.getProjectsByFilters(req, res, { category: 'Livelihood' }, 1);
    const psychosocialProject = await projectController.getProjectsByFilters(req, res, { category: 'Psychosocial' }, 1);
    const educationProject = await projectController.getProjectsByFilters(req, res, { category: 'Education' }, 1);
    if(healthProject.length == 1){
        healthPhoto = healthProject[0].mainPhoto;
    }else{
        healthPhoto = "default.jpg";
    }
    if(livelihoodProject.length == 1){
        livelihoodPhoto = livelihoodProject[0].mainPhoto;
    }else{
        livelihoodPhoto = "default.jpg";
    }
    if(psychosocialProject.length == 1){
        psychosocialPhoto = psychosocialProject[0].mainPhoto;
    }else{
        psychosocialPhoto = "default.jpg";
    }
    if(educationProject.length == 1){
        educationPhoto = educationProject[0].mainPhoto;
    }else{
        educationPhoto = "default.jpg";
    }
    const ongoingProjects = await projectController.getProjectsByFilters(req, res, { status: 'Ongoing' }, 3);
    const pastProjects = await projectController.getProjectsByFilters(req, res, { status: 'Past' }, 3);
    const upcomingProjects = await projectController.getProjectsByFilters(req, res, { status: 'Upcoming' }, 3);
    res.render('project-explore', {healthPhoto, livelihoodPhoto, psychosocialPhoto, educationPhoto, ongoingProjects, ongoing3: ongoingProjects.length == 3, ongoing2: ongoingProjects.length == 2, ongoing1: ongoingProjects.length == 1, pastProjects, past3: pastProjects.length == 3, past2: pastProjects.length == 2, past1: pastProjects.length == 1, upcomingProjects, upcoming3: upcomingProjects.length == 3, upcoming2: upcomingProjects.length == 2, upcoming1: upcomingProjects.length == 1});
});

router.use((req, res, next) => {
    res.redirect('/404');
})

module.exports = router;