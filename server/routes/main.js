const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const Donation = require('../models/donation.js')

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
        const donation = new Donation({donation: req.body.data});
        const donationData = await donation.save();

        res.status(200);
        res.json({ status: 'OK' });

    } else {
        res.status(401).json({ status: 'Unauthorized Access' });
    }
});

module.exports = router;