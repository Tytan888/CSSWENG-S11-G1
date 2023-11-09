const express = require('express');
const router = express.Router();
const imageController = require('../controller/image_controller.js');
const projectController = require('../controller/project_controller.js');
const childController = require('../controller/child_controller.js');
const eventController = require('../controller/event_controller.js');
const newsletterController = require('../controller/newsletter_controller.js');
const staffController = require('../controller/staff_controller.js');
const trusteeController = require('../controller/trustee_controller.js');
const singletonController = require('../controller/singleton_controller.js');
const donationController = require('../controller/donation_controller.js');
const informationController = require('../controller/information_controller.js');
const adminController = require('../controller/admin_controller.js');
const file_upload = require('../controller/middleware/file_upload.js');

singletonController.initializeSingleton();
adminController.initializeAdmin();

router.get('/', async (req, res) => {
    res.render('index', {
        index: await singletonController.getIndex(),
        projects: await projectController.getProjectsByAmount(3),
        newsletter: await newsletterController.getNewslettersByAmount(3),
        foot: await singletonController.getFooter()
    });
});

router.get('/404', async (req, res) => {
    res.render('404', { foot: await singletonController.getFooter() });
});

router.get('/imageByName', imageController.getByName);
router.delete('/deleteByName', imageController.deleteByName);

router.get("/:type/explore", informationController.infoExplore);
router.get("/:type/search", informationController.infoSearch);
router.get("/:type/view/:id", informationController.infoView);

router.get("/donate", donationController.donationRedirect);
router.get("/donate/type", donationController.donationType);
router.get('/donate/select/:type', donationController.donationSelect);
router.get('/donate/details/:type/:id', donationController.donationDetails);
router.post('/donate/submit', donationController.submitDonation);
router.post('/donate/log', donationController.logDonation);
router.post('/donate/register', donationController.registerSponsor, childController.updateSponsor);
router.get('/donate/thanks', donationController.donationThanks);
router.get("/donate/fail", donationController.donationFail);

//NOTE: SECURE ALL ADMIN PAGES WITH AUTHENTICATION
router.get('/admin/login', adminController.adminLogin);
router.post('/admin/submit', adminController.adminSubmit);
router.all('/admin*', adminController.adminAuth);

// TODO: Also for adding, editing, and deleting projects, make sure only admins can access these pages and authenticate them.
router.get("/admin/project/get", projectController.getProject);
router.post("/admin/project/add", file_upload.single('mainPhoto'), projectController.addProject);
router.put("/admin/project/edit", file_upload.single('mainPhoto'), projectController.updateProject, imageController.deleteByName);
router.delete("/admin/project/delete", projectController.deleteProject, imageController.deleteByName);

// TODO: Also for adding, editing, and deleting events, make sure only admins can access these pages and authenticate them.
router.get("/admin/event/get", eventController.getEvent);
router.post("/admin/event/add", file_upload.single('mainPhoto'), eventController.addEvent);
router.put("/admin/event/edit", file_upload.single('mainPhoto'), eventController.updateEvent, imageController.deleteByName);
router.delete("/admin/event/delete", eventController.deleteEvent, imageController.deleteByName);

// TODO: Also for adding, editing, and deleting children, make sure only admins can access these pages and authenticate them.
router.get("/admin/child/get", childController.getChild);
router.post("/admin/child/add", file_upload.single('mainPhoto'), childController.addChild)
router.put("/admin/child/edit", file_upload.single('mainPhoto'), childController.updateChild, imageController.deleteByName);
router.delete("/admin/child/delete", childController.deleteChild, imageController.deleteByName);

// TODO: Also for adding, editing, and deleting newsletters, make sure only admins can access these pages and authenticate them.
router.get("/admin/newsletter/get", newsletterController.getNewsletter);
router.post("/admin/newsletter/add", file_upload.array('photos', 10), newsletterController.addNewsletter);
router.put("/admin/newsletter/edit", file_upload.array('photos', 10), newsletterController.updateNewsletter, imageController.deleteByNames);
router.delete("/admin/newsletter/delete", newsletterController.deleteNewsletter, imageController.deleteByNames);

// TODO: Also for adding, editing, and deleting staffs, make sure only admins can access these pages and authenticate them.
router.get("/admin/staff/get", staffController.getStaff);
router.post("/admin/staff/add", staffController.addStaff);
router.put("/admin/staff/edit", staffController.updateStaff);
router.delete("/admin/staff/delete", staffController.deleteStaff);

// TODO: Also for adding, editing, and deleting newsletters, make sure only admins can access these pages and authenticate them.
router.get("/admin/trustee/get", trusteeController.getTrustee);
router.post("/admin/trustee/add", trusteeController.addTrustee);
router.put("/admin/trustee/edit", trusteeController.updateTrustee);
router.delete("/admin/trustee/delete", trusteeController.deleteTrustee);

router.get("/admin/other/get", singletonController.getOthers);
router.put("/admin/other/edit", file_upload.single('frontpagePhoto'), singletonController.updateOthers, imageController.deleteByName);
router.get("/admin/staff/get-group", singletonController.getStaffPhoto);
router.put("/admin/staff/edit-group", file_upload.single('staffPhoto'), singletonController.updateStaffPhoto, imageController.deleteByName);

router.get('/admin/menu', adminController.adminMenu);
router.get('/admin/:type/:action?/:id?', adminController.adminMain);

router.use((req, res) => {
    res.redirect('/404');
})

module.exports = router;