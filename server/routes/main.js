const express = require('express');
const router = express.Router();
const imageController = require('../controller/image_controller.js');
const requestController = require('../controller/request_controller.js');
const singletonController = require('../controller/singleton_controller.js');
const donationController = require('../controller/donation_controller.js');
const informationController = require('../controller/information_controller.js');
const adminController = require('../controller/admin_controller.js');
const file_upload = require('../controller/middleware/file_upload.js');

singletonController.initializeSingleton();
adminController.initializeAdmin();

router.get('/imageByName', imageController.getByName);
router.delete('/deleteByName', imageController.deleteByName);

router.get('/', informationController.infoIndex);
router.get('/404', informationController.info404);
router.get("/about", informationController.infoAbout);
router.get("/:type/explore", informationController.infoExplore);
router.get("/:type/search", informationController.infoSearch);
router.get("/:type/view/:id", informationController.infoView);

router.get("/donate", donationController.donationRedirect);
router.get("/donate/type", donationController.donationType);
router.get('/donate/select/:type', donationController.donationSelect);
router.get('/donate/details/:type/:id', donationController.donationDetails);
router.post('/donate/submit', donationController.submitDonation);
router.post('/donate/log', donationController.logDonation);
router.post('/donate/register', donationController.registerSponsor, requestController.updateSponsor);
router.get('/donate/thanks', donationController.donationThanks);
router.get("/donate/fail", donationController.donationFail);

router.get('/admin/login', adminController.adminLogin);
router.post('/admin/submit', adminController.adminSubmit);
router.all('/admin*', adminController.adminAuth);

router.get("/admin/other/get", singletonController.getOthers);
router.put("/admin/other/edit", file_upload.single('frontpagePhoto'), singletonController.updateOthers, imageController.deleteByName);
router.get("/admin/staff/get-group", singletonController.getStaffPhoto);
router.put("/admin/staff/edit-group", file_upload.single('staffPhoto'), singletonController.updateStaffPhoto, imageController.deleteByName);

router.get("/admin/:type/get", requestController.getElement);

router.post("/admin/:type(newsletter)/add", file_upload.array('photos', 10), requestController.addElement);
router.post("/admin/:type(trustee|staff)/add", requestController.addElement);
router.post("/admin/:type/add", file_upload.single('mainPhoto'), requestController.addElement);

router.put("/admin/:type(newsletter)/edit", file_upload.array('photos', 10), requestController.updateElement, imageController.deleteByNames);
router.put("/admin/:type(trustee|staff)/edit", requestController.updateElement);
router.put("/admin/:type/edit", file_upload.single('mainPhoto'), requestController.updateElement, imageController.deleteByName);

router.delete("/admin/:type(newsletter)/delete", requestController.deleteElement, imageController.deleteByNames);
router.delete("/admin/:type(trustee|staff)/delete", requestController.deleteElement);
router.delete("/admin/:type/delete", requestController.deleteElement, imageController.deleteByName);

router.get('/admin/menu', adminController.adminMenu);
router.get('/admin/:type/:action?/:id?', adminController.adminMain);

router.use((req, res) => {
    res.redirect('/404');
})

module.exports = router;