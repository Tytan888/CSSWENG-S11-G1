const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Donation = require('../models/donation.js');
const imageController = require('../controller/image_controller.js');

//test for image upload
const gfs = require('../config/gfs.js');
const Test = require('../models/test.js');
const Project = require('../models/project.js');
const file_upload = require('../controller/middleware/file_upload.js');

/* NOTE: TEST CODE FOR PAYMONGO CHECKOUT API */
router.post('/donate', async (req, res) => {
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
                    success_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    cancel_url: 'https://music.youtube.com/watch?v=f9_dmfwIuKY',
                    line_items: [{ currency: 'PHP', amount: Number(req.body.amount), name: req.body.name, quantity: 1 }],
                    payment_method_types: ['card', 'gcash', 'paymaya', 'dob', 'dob_ubp'],
                    description: 'DESC HERE'
                }
            }
        })
    };

    const checkout = await fetch(url, options)
        .then(ress => ress.json())
        .then(json => { res.json(json.data.attributes.checkout_url) })
        .catch(err => console.error('error:' + err));
});

router.post('/log', async (req, res) => {

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

// testing image

router.post('/', file_upload.single('photo'), async (req, res) => {
    var filename = req.file.filename;
    await Test.create({ title: filename, code: 'test' });
    res.render('index', {});
});

router.get('/fileName', async (req, res) => {
    var filename = [];
    filename = await Test.find({ code: 'test' }, "title");
    console.log({ filename });
    if (filename != null) {
        res.set('Content-Type', 'application/json');
        res.send({ filename: filename });
    } else
        res.send(null);
});

//end of testing image 
// TODO: Also for adding, editing, and deleting projects, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting projects, the old image should be deleted from the database.
router.get("/get_project", async (req, res) => {
    const result = await Project.findOne({ id: req.query.id });
    if (result == null) {
        res.status(400);
        res.end();
    }
    else {
        res.status(200);
        res.json(result);
    }
});

router.post("/add_project", file_upload.single('mainPhoto'), async (req, res) => {
    let last = await Project.find().sort({ $natural: -1 }).limit(1);
    let newID = 1;
    const suffix = "Project-"
    if (last.length == 1)
        newID = parseInt(last[0].id.substring(suffix.length)) + 1;
    newID = suffix + newID.toString().padStart(7, "0");
    
    const result = await Project.create({ id: newID, name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status, mainPhoto: req.file.filename })

    if(result == null){
        res.status(400);
        res.end();
    }else{
        res.status(200);
        // TODO: Redirect to the correct page.
        res.redirect('/html/test_view_project.html?id=' + newID);
    }

});

// TODO: Change from post to put once finalized (rn the frontend is using post cuz vanilla html forms can't use put)
router.post("/edit_project", file_upload.single('mainPhoto'), async (req, res) => {
    let result;

    if(req.file == null)
        result = await Project.updateOne({id: req.body.id}, {  $set: {name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status}})
    else
        result = await Project.updateOne({id: req.body.id}, { $set: {name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status, mainPhoto: req.file.filename }})
    
        if(result == null){
        res.status(400);
        res.end();
    }else{
        res.status(200);
        // TODO: Redirect to the correct page.
        res.redirect('/html/test_view_project.html?id=' + req.body.id);
    }

});

router.delete("/delete_project", async (req, res) => {
    const result = await Project.deleteOne({ id: req.body.id });
    if (result == null) {
        res.status(400);
        res.end();
    }
    else {
        res.status(200);
        res.json(result);
    }
});

router.get('/', async (req, res) => {
    res.render('index', {});
});



module.exports = router;