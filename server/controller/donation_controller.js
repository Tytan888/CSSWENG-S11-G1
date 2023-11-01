const Donation = require('../models/donation.js');
const projectController = require('../controller/project_controller.js');
const childController = require('../controller/child_controller.js');
const crypto = require('crypto');

const Don = {

    donationRedirect: async function (req, res) {
        res.redirect('/donate/type');
    },

    donationType: async function (req, res) {
        res.render('donate-type', {});
    },

    donationSelect: async function (req, res) {
        let displayLimit = 12
        let page = parseInt(req.query.page);
        if (Number.isNaN(page) || page < 1) {
            page = 1
        }
        let pages = [page];
        let min, max = false;
        let elements, message

        if (req.params.type == 'project') {
            elements = await projectController.getProjectsByPage(req, res, page, displayLimit);
            if (page == 1) {
                min = true
                let projectsNextNext = await projectController.getProjectsByPage(req, res, page + 2, displayLimit);
                if (projectsNextNext.length != 0) {
                    pages.push(page + 2)
                }
            } else {
                pages.push(page - 1)
            }

            let projectsNext = await projectController.getProjectsByPage(req, res, page + 1, displayLimit);
            if (projectsNext.length == 0) {
                max = true
            } else {
                pages.push(page + 1)
            }
            message = "Fund this Project!"
        } else if (req.params.type == 'child') {
            elements = await childController.getChildrenByPage(req, res, page, displayLimit);
            if (page == 1) {
                min = true
                let childrenNextNext = await childController.getChildrenByPage(req, res, page + 2, displayLimit);
                if (childrenNextNext.length != 0) {
                    pages.push(page + 2)
                }
            } else {
                pages.push(page - 1)
            }

            let childrenNext = await childController.getChildrenByPage(req, res, page + 1, displayLimit);
            if (childrenNext.length == 0) {
                max = true
            } else {
                pages.push(page + 1)
            }
            message = "Sponsor Me!"
        }else{
            res.redirect('/404');
            return;
        }
        pages.sort()
        res.render('donate-select', { elements, pages, min, max, type: req.params.type, message });
    },

    donationDetails: async function (req, res) {
        let id = req.params.id
        let type = id.substring(0, id.indexOf('-'));
        let element
        if (type == 'Project') {
            element = await projectController.getProjectById(req, res, id)
            if (element == null) {
                res.redirect('/404');
                return;
            }
            res.render('donate-details', { name: element.name, description: element.description, mainPhoto: element.mainPhoto, id: element.id });
        } else if (type == 'Child') {
            element = await childController.getChildById(req, res, id)
            if (element == null) {
                res.redirect('/404');
                return;
            }
            res.render('donate-details', { name: element.name, age: element.age, gradelevel: element.gradelevel, mainPhoto: element.mainPhoto, id: element.id, location: element.location });
        } else {
            res.redirect('/404');
            return;
        }
    },

    submitDonation: async function (req, res) {
        const fetch = require('node-fetch');

        // TODO: Change both urls, success_url and cancel_url, to the actual urls of the website.
        // TODO: Change the authorization key to the actual secret key of the website.
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
                        cancel_url: process.env.WEBSITE_URL + '/donate/fail',
                        line_items: [{ currency: 'PHP', amount: Number(req.body.amount), name: req.body.description, quantity: 1 }],
                        payment_method_types: ['card', 'gcash', 'paymaya'],
                        description: 'Pearl S. Buck Philippines'
                    }
                }
            })
        };

        const checkout = await fetch(url, options)
            .then(ress => ress.json())
            .then(json => { res.json(json.data.attributes.checkout_url) })
            .catch(err => console.error('error:' + err));
    },

    logDonation: async function (req, res) {

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
    },

    donationThanks: async function (req, res) {
        res.render('donate-thanks', {});
    },

    donationFail: async function (req, res) {
        res.render('donate-fail', {});
    }
};

module.exports = Don;