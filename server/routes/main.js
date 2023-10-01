express = require('express');

const router = express.Router();

/* NOTE: TEST CODE FOR PAYMONGO API
router.post('/donate', async (req, res) => {
    console.log(req.body);

    const fetch = require('node-fetch');

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
                    line_items: [{ currency: 'PHP', amount: Number(req.body.amount), name: req.body.name, quantity: 1 }],
                    payment_method_types: ['card', 'gcash', 'paymaya', 'dob', 'dob_ubp'],
                    description: 'DESC HERE'
                }
            }
        })
    };

    const checkout = await fetch(url, options)
        .then(ress => ress.json())
        .then(json =>{ console.log(json); res.json(json.data.attributes.checkout_url)})
        .catch(err => console.error('error:' + err));
});
*/

module.exports = router;