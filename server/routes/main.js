const express = require('express');
const router = express.Router();
const imageController = require('../controller/image_controller.js');
const projectController = require('../controller/project_controller.js');
const childController = require('../controller/child_controller.js');
const eventController = require('../controller/event_controller.js');
const newsletterController = require('../controller/newsletter_controller.js');
const singletonController = require('../controller/singleton_controller.js');
const donationController = require('../controller/donation_controller.js');
const file_upload = require('../controller/middleware/file_upload.js');

router.get('/', async (req, res) => {
    res.render('index', {index: await singletonController.getIndex(),
        projects: await projectController.getProjectsByAmount(3),
        newsletter: await newsletterController.getNewslettersByAmount(3),
        foot: await singletonController.getFooter()});
});

router.get('/404', async (req, res) => {
    res.render('404', {foot: await singletonController.getFooter()});
});

router.get('/imageByName', imageController.getByName);
router.delete('/deleteByName', imageController.deleteByName);

// TODO: Also for adding, editing, and deleting projects, make sure only admins can access these pages and authenticate them.
router.get("/get_project", projectController.getProject);
router.post("/add_project", file_upload.single('mainPhoto'), projectController.addProject);
router.put("/edit_project", file_upload.single('mainPhoto'), projectController.updateProject, imageController.deleteByName);
router.delete("/delete_project", projectController.deleteProject, imageController.deleteByName);

// TODO: Also for adding, editing, and deleting events, make sure only admins can access these pages and authenticate them.
router.get("/get_event", eventController.getEvent);
router.post("/add_event", file_upload.single('mainPhoto'), eventController.addEvent);
router.put("/edit_event", file_upload.single('mainPhoto'), eventController.updateEvent, imageController.deleteByName);
router.delete("/delete_event", eventController.deleteEvent, imageController.deleteByName);

// TODO: Also for adding, editing, and deleting children, make sure only admins can access these pages and authenticate them.
router.get("/get_child", childController.getChild);
router.post("/add_child", file_upload.single('mainPhoto'), childController.addChild)
router.put("/edit_child", file_upload.single('mainPhoto'), childController.updateChild, imageController.deleteByName);
router.delete("/delete_child", childController.deleteChild, imageController.deleteByName);

// TODO: Also for adding, editing, and deleting newsletters, make sure only admins can access these pages and authenticate them.
router.get("/get_newsletter", newsletterController.getNewsletter);
router.post("/add_newsletter", file_upload.array('photos', 10), newsletterController.addNewsletter);
router.put("/edit_newsletter", file_upload.array('photos', 10), newsletterController.updateNewsletter, imageController.deleteByNames);
router.delete("/delete_newsletter", newsletterController.deleteNewsletter, imageController.deleteByNames);

router.get("/get_singleton", singletonController.getSingleton);
router.put("/edit_others", file_upload.single('frontpagePhoto'), singletonController.updateOthers);

router.get("/donate", donationController.donationRedirect);
router.get("/donate/type", donationController.donationType);
router.get('/donate/select-:type', donationController.donationSelect);
router.get('/donate/details/:id', donationController.donationDetails);
router.post('/donate/submit', donationController.submitDonation);
router.post('/donate/log', donationController.logDonation);
router.post('/donate/register', donationController.registerSponsor, childController.updateSponsor);
router.get('/donate/thanks', donationController.donationThanks);
router.get("/donate/fail", donationController.donationFail);

router.get("/:type/explore", async (req, res) => {
    let health, livelihood, psychosocial, education;
    let healthPhoto, livelihoodPhoto, psychosocialPhoto, educationPhoto;
    let ongoing, past, upcoming;
    if (req.params.type == 'project') {
        health = await projectController.getProjectsByFilters({ category: 'Health' }, 1);
        livelihood = await projectController.getProjectsByFilters({ category: 'Livelihood' }, 1);
        psychosocial = await projectController.getProjectsByFilters({ category: 'Psychosocial' }, 1);
        education = await projectController.getProjectsByFilters({ category: 'Education' }, 1);

        ongoing = await projectController.getProjectsByFilters({ status: 'Ongoing' }, 3);
        past = await projectController.getProjectsByFilters({ status: 'Past' }, 3);
        upcoming = await projectController.getProjectsByFilters({ status: 'Upcoming' }, 3);
    } else if (req.params.type == 'event') {
        health = await eventController.getEventsByFilters({ category: 'Health' }, 1);
        livelihood = await eventController.getEventsByFilters({ category: 'Livelihood' }, 1);
        psychosocial = await eventController.getEventsByFilters({ category: 'Psychosocial' }, 1);
        education = await eventController.getEventsByFilters({ category: 'Education' }, 1);

        ongoing = await eventController.getEventsByFilters({ status: 'Ongoing' }, 3);
        past = await eventController.getEventsByFilters({ status: 'Past' }, 3);
        upcoming = await eventController.getEventsByFilters({ status: 'Upcoming' }, 3);
    } else if (req.params.type == 'newsletter') {
        health = await newsletterController.getNewslettersByFilters({ category: 'Health' }, 1);
        livelihood = await newsletterController.getNewslettersByFilters({ category: 'Livelihood' }, 1);
        psychosocial = await newsletterController.getNewslettersByFilters({ category: 'Psychosocial' }, 1);
        education = await newsletterController.getNewslettersByFilters({ category: 'Education' }, 1);

        ongoing = await newsletterController.getNewslettersByFilters({ status: 'Ongoing' }, 3);
        past = await newsletterController.getNewslettersByFilters({ status: 'Past' }, 3);
        upcoming = await newsletterController.getNewslettersByFilters({ status: 'Upcoming' }, 3);
    } else {
        res.redirect('/404');
        return;
    }
    if (req.params.type == 'project' || req.params.type == 'event') {
        if (health.length == 1) {
            healthPhoto = health[0].mainPhoto;
        } else {
            healthPhoto = "default.jpg";
        }
        if (livelihood.length == 1) {
            livelihoodPhoto = livelihood[0].mainPhoto;
        } else {
            livelihoodPhoto = "default.jpg";
        }
        if (psychosocial.length == 1) {
            psychosocialPhoto = psychosocial[0].mainPhoto;
        } else {
            psychosocialPhoto = "default.jpg";
        }
        if (education.length == 1) {
            educationPhoto = education[0].mainPhoto;
        } else {
            educationPhoto = "default.jpg";
        }
    } else if (req.params.type == 'newsletter') {
        if (health.length == 1) {
            healthPhoto = health[0].photos[0];
        } else {
            healthPhoto = "default.jpg";
        }
        if (livelihood.length == 1) {
            livelihoodPhoto = livelihood[0].photos[0];
        } else {
            livelihoodPhoto = "default.jpg";
        }
        if (psychosocial.length == 1) {
            psychosocialPhoto = psychosocial[0].photos[0];
        } else {
            psychosocialPhoto = "default.jpg";
        }
        if (education.length == 1) {
            educationPhoto = education[0].photos[0];
        } else {
            educationPhoto = "default.jpg";
        }
    }
    res.render('explore', {
        healthPhoto, livelihoodPhoto, psychosocialPhoto, educationPhoto,
        ongoing, past, upcoming, type: req.params.type, foot: await singletonController.getFooter()
    });
});

router.get("/:type/view/:id", async (req, res) => {
    if (req.params.type == 'project') {
        let id = req.params.id
        let element = await projectController.getProjectById(id)
        if (element == null) {
            res.redirect('/404');
            return;
        }
        res.render('project-event-view', {
            name: element.name,
            description: element.description, category: element.category,
            location: element.location, status: element.status, mainPhoto: element.mainPhoto,
            progress: element.raisedDonations / element.requiredBudget * 100,
            raisedDonations: element.raisedDonations.toLocaleString("en-US"), 
            requiredBudget: element.requiredBudget.toLocaleString("en-US"),
            id: element.id, foot: await singletonController.getFooter()
        });
    } else if (req.params.type == 'event') {
        let id = req.params.id
        let element = await eventController.getEventById(id)
        if (element == null) {
            res.redirect('/404');
            return;
        }
        const startDate = (new Date(Date.UTC(element.startDate.getFullYear(), element.startDate.getMonth(), element.startDate.getDate()))).toISOString().slice(0, 10).replace(/-/g, '/');
        const endDate = (new Date(Date.UTC(element.endDate.getFullYear(), element.endDate.getMonth(), element.endDate.getDate()))).toISOString().slice(0, 10).replace(/-/g, '/');
        res.render('project-event-view', { name: element.name, category: element.category,
            location: element.location, status: element.status, mainPhoto: element.mainPhoto, 
            startDate, endDate, id: element.id, foot: await singletonController.getFooter() });
    } else if (req.params.type == 'newsletter') {
        let id = req.params.id
        let element = await newsletterController.getNewsletterById(id)
        if (element == null) {
            res.redirect('/404');
            return;
        }
        res.render('newsletter-view', { name: element.name, category: element.category,
            status: element.status, photos: element.photos, id: element.id,
            foot: await singletonController.getFooter() });
    }
});

router.use((req, res, next) => {
    res.redirect('/404');
})

module.exports = router;