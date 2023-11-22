const Donation = require('../models/donation.js');
const utilityController = require('../controller/utility_controller.js');
const singletonController = require('../controller/singleton_controller.js');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Don = {

    donationRedirect: async function (req, res) {
        res.redirect('/donate/type');
    },

    donationType: async function (req, res) {
        res.render('donate_type', { foot: await singletonController.getFooter() });
    },

    donationSelect: async function (req, res) {
        let displayLimit = 12
        let page = parseInt(req.query.page);
        if (Number.isNaN(page) || page < 1) {
            page = 1
        }
        let pages = [page];
        let min, max = false;

        let elements = await utilityController.getElementsByPage(req.params.type, page, displayLimit);
        let elementsNext = await utilityController.getElementsByPage(req.params.type, page + 1, displayLimit);
        if (elementsNext.length == 0) {
            max = true
        } else {
            pages.push(page + 1)
        }
        if (page == 1) {
            min = true;
            let elementNextNext = await utilityController.getElementsByPage(req.params.type, page + 2, displayLimit);
            if (elementNextNext.length != 0) {
                pages.push(page + 2)
            }
        } else {
            pages.push(page - 1)
        }

        let message, noneMessage;

        if (req.params.type == 'project') {
            message = "Fund this Project!"
            noneMessage = "No projects available for funding at the moment."
        } else if (req.params.type == 'child') {
            message = "Sponsor Me!"
            noneMessage = "No children available for sponsorship at the moment."
        } else {
            res.redirect('/404');
            return;
        }

        pages.sort()
        res.render('donate_select', {
            elements, pages, min, max, type: req.params.type, message, noneMessage, type: req.params.type,
            foot: await singletonController.getFooter()
        });
    },

    donationDetails: async function (req, res) {
        let id = req.params.id
        let type = req.params.type
        let element = await utilityController.getElementById(type, id)
        if (element == null) {
            res.redirect('/404');
            return;
        }
        if (type == "child") {
            const sponsored = await utilityController.isChildWithSponsor(element._id);
            if (sponsored) {
                res.redirect('/404');
                return;
            }
        }
        if (type == 'project') {
            res.render('donate_details', {
                name: element.name, description: element.description, type: type,
                mainPhoto: element.mainPhoto, id: element._id, foot: await singletonController.getFooter()
            });
        } else if (type == 'child') {
            res.render('donate_details', {
                name: element.name, age: element.age, gradelevel: element.gradelevel, type: type,
                mainPhoto: element.mainPhoto, id: element._id, location: element.location, description: element.description,
                foot: await singletonController.getFooter()
            });
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
                authorization: 'Basic ' + process.env.PAYMONGO_SECRET_KEY_HASH
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        send_email_receipt: false,
                        show_description: true,
                        show_line_items: true,
                        success_url: process.env.WEBSITE_URL + '/donate/thanks',
                        cancel_url: process.env.WEBSITE_URL + '/donate/fail',
                        line_items: [{ currency: 'PHP', amount: Number(req.body.amount), name: 'Donation for Pearl S. Buck Philippines', quantity: 1 }],
                        payment_method_types: ['card', 'gcash', 'paymaya'],
                        description: req.body.description
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
        res.render('donate_thanks', { foot: await singletonController.getFooter() });
    },

    donationFail: async function (req, res) {
        res.render('donate_fail', { foot: await singletonController.getFooter() });
    },

    getAllDonations: async function (type) {
        const donations = await Donation.find({ deleted: false }).lean();
        const projectDonations = [];
        const childDonations = [];
        donations.forEach(donation => {
            if (donation.donation.attributes.data.attributes.description.startsWith('Project Funding')) {
                projectDonations.push(donation);
            } else if (donation.donation.attributes.data.attributes.description.startsWith('Initial Sponsorship')) {
                childDonations.push(donation);
            };
        });
        if (type == 'donation')
            return projectDonations;
        else if (type == 'sponsor')
            return childDonations;
    },
    deleteDonation: async function (req, res) {
        const model = Donation;
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await model.findOne({ _id: req.body.id, deleted: false });
            if (resultFind == null) {
                res.status(400);
                res.end();
            }
            else {
                const result = await model.updateOne({ _id: req.body.id }, { $set: { deleted: true } })
                if (result == null) {
                    res.status(400);
                    res.end();
                }
                else {
                    res.end();
                    res.status(200);
                }
            }
        } else {
            res.status(400);
            res.end();
        }
    }
};

module.exports = Don;