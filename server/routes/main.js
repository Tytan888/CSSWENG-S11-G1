const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Donation = require('../models/donation.js');
const imageController = require('../controller/image_controller.js');
const projectController = require('../controller/project_controller.js');
const childController = require('../controller/child_controller.js');
const eventController = require('../controller/event_controller.js');
const file_upload = require('../controller/middleware/file_upload.js');

//test for image upload
const Test = require('../models/test_img.js');


/* NOTE: TEST CODE FOR PAYMONGO CHECKOUT API */
router.post('/donate/submit', async (req, res) => {
    const fetch = require('node-fetch');

    // TODO: Change both urls, success_url and cancel_url, to the actual urls of the website.
    // TODO: Change the authorization key to the actual secret key of the website.
    // TODO: Change name and description to match the donation.
    const url = 'https://api.paymongo.com/v1/checkout_sessions';
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: 'Basic c2tfdGVzdF9ReXByUVNBdXZRcm5zWEtoZDI1SFhybjc6'
        },
        body: JSON.stringify({
            data: {
                attributes: {
                    send_email_receipt: false,
                    show_description: true,
                    show_line_items: true,
                    success_url: process.env.WEBSITE_URL + '/donate/thanks',
                    cancel_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    line_items: [{ currency: 'PHP', amount: Number(req.body.amount), name: req.body.description, quantity: 1 }],
                    payment_method_types: ['card', 'gcash', 'paymaya', 'dob', 'dob_ubp'],
                    description: 'Pearl S. Buck Philippines'
                }
            }
        })
    };

    const checkout = await fetch(url, options)
        .then(ress => ress.json())
        .then(json => { console.log(res); res.json(json.data.attributes.checkout_url) })
        .catch(err => console.error('error:' + err));
});

router.post('/donate/log', async (req, res) => {

    // Verify webhook signature...
    // TODO: Change form te to li on deployment.
    const signature = req.get('Paymongo-Signature');
    const t = signature.substring(signature.indexOf("t=") + 2, signature.indexOf(","));
    const te = signature.substring(signature.indexOf("te=") + 3, signature.indexOf(",", signature.indexOf(",") + 1));
    const li = signature.substring(signature.indexOf("li=") + 3);

    var hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET_KEY);
    data = hmac.update(t + "." + JSON.stringify(req.body));
    gen_hmac = data.digest('hex');
    if (te == gen_hmac) {
        const donation = new Donation({ donation: req.body.data });
        const donationData = await donation.save();

        res.status(200);
        res.json({ status: 'OK' });

    } else {
        res.status(401).json({ status: 'Unauthorized Access' });
    }
});


/* routers for uploading images or files in general
router.post('/uploadImage', fileMiddleWare.fields([{name: 'image', maxCount:1}]),postEventController.postEventPhoto);
*/
router.get('/imageByName', imageController.getByName);
router.delete('/deleteByName', imageController.deleteByName);

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

router.get('/', async (req, res) => {
    res.render('index', {});
});

router.get("/donate", async (req, res) => {
    res.redirect('/donate/type'); 
});

router.get("/donate/type", async (req, res) => {
    res.render('donate-type', {});
});

router.get('/donate/select-:type', async (req, res) => {
    let displayLimit = 12
    let page = parseInt(req.query.page);
    if (Number.isNaN(page) || page < 1) {
        page = 1
    }
    let pages = [page];
    let min, max = false;
    let elements, message

    if (req.params.type == 'project') {
        elements = await projectController.getProjects(req, res, page, displayLimit);
        if (page == 1) {
            min = true
            let projectsNextNext = await projectController.getProjects(req, res, page + 2, displayLimit);
            if (projectsNextNext.length != 0) {
                pages.push(page + 2)
            }
        } else {
            pages.push(page - 1)
        }

        let projectsNext = await projectController.getProjects(req, res, page + 1, displayLimit);
        if (projectsNext.length == 0) {
            max = true
        } else {
            pages.push(page + 1)
        }
        message = "Fund this Project!"
    } else if (req.params.type == 'child') {
        elements = await childController.getChildren(req, res, page, displayLimit);
        if (page == 1) {
            min = true
            let childrenNextNext = await childController.getChildren(req, res, page + 2, displayLimit);
            if (childrenNextNext.length != 0) {
                pages.push(page + 2)
            }
        } else {
            pages.push(page - 1)
        }

        let childrenNext = await childController.getChildren(req, res, page + 1, displayLimit);
        if (childrenNext.length == 0) {
            max = true
        } else {
            pages.push(page + 1)
        }
        message = "Sponsor Me!"
    }
    pages.sort()
    res.render('donate-select', { elements, pages, min, max, type: req.params.type, message });
});

router.get('/donate/details/:id', async (req, res) => {
    let id = req.params.id
    let type = id.substring(0, id.indexOf('-'));
    let element
    if (type == 'Project') {
        element = await projectController.getProjectById(req, res, id)
        if(element == null){
            res.render('404', {});
            return;
        }
        res.render('donate-details', { name: element.name, description: element.description, mainPhoto: element.mainPhoto, id: element.id });
    } else if (type == 'Child') {
        element = await childController.getChildById(req, res, id)
        if(element == null){
            res.render('404', {});
            return;
        }
        res.render('donate-details', { name: element.name, age: element.age, gradelevel: element.gradelevel, mainPhoto: element.mainPhoto, id: element.id, location: element.location });
    }
});

router.get('/donate/thanks', async (req, res) => {
    res.render('donate-thanks');
});

module.exports = router;