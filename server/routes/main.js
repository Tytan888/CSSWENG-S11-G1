const express = require('express');
const crypto = require('crypto');

const router = express.Router();

/* NOTE: TEST CODE FOR VERIFYING PAYMONGO WEBHOOKS
var hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET_KEY);
data = hmac.update('1696175870.{"data":{"id":"evt_NcBrLSTvoC6jRSwVNuHoBG1U","type":"event","attributes":{"type":"checkout_session.payment.paid","livemode":false,"data":{"id":"cs_F7Cvd8EKZFJCpy6sPGpCqxFr","type":"checkout_session","attributes":{"billing":{"address":{"city":null,"country":null,"line1":null,"line2":null,"postal_code":null,"state":null},"email":null,"name":null,"phone":null},"billing_information_fields_editable":"enabled","cancel_url":null,"checkout_url":"https://checkout.paymongo.com/cs_F7Cvd8EKZFJCpy6sPGpCqxFr_client_aBBdYyZwSiQ8EPZfZ7VCwjpx#cGtfdGVzdF9ja3BWb3VzZ01HUk1FV2Zxc00xWnc4TmQ=","client_key":"cs_F7Cvd8EKZFJCpy6sPGpCqxFr_client_aBBdYyZwSiQ8EPZfZ7VCwjpx","customer_email":null,"description":"DESC HERE","line_items":[{"amount":3000000,"currency":"PHP","description":null,"images":[],"name":"131sdcdsfdsf","quantity":1}],"livemode":false,"merchant":"Test","paid_at":1696175851,"payments":[{"id":"pay_DVwc8Nddcf3a5jxwrQTUd9dp","type":"payment","attributes":{"access_url":null,"amount":3000000,"balance_transaction_id":"bal_txn_iJSe4mnsiyKRHUDgR9WESioa","billing":{"address":{"city":"Test","country":"AL","line1":"Test","line2":"","postal_code":"123","state":"Test"},"email":"XD@gmmmmmail.com","name":"Niah","phone":""},"currency":"PHP","description":"DESC HERE","disputed":false,"external_reference_number":null,"fee":106500,"foreign_fee":30000,"livemode":false,"net_amount":2863500,"origin":"api","payment_intent_id":"pi_zQEko5R94Ar2xFaq745CzxAh","payout":null,"source":{"id":"card_2L7JgqgLanAce3yAivNNKYm3","type":"card","brand":"visa","country":"US","last4":"4345"},"statement_descriptor":"Test","status":"paid","tax_amount":null,"metadata":null,"refunds":[],"taxes":[],"available_at":1696496400,"created_at":1696175851,"credited_at":1697014800,"paid_at":1696175851,"updated_at":1696175851}}],"payment_intent":{"id":"pi_zQEko5R94Ar2xFaq745CzxAh","type":"payment_intent","attributes":{"amount":3000000,"capture_type":"automatic","client_key":"pi_zQEko5R94Ar2xFaq745CzxAh_client_zEVJDeV56XBDnp5HuB9trBdL","currency":"PHP","description":"DESC HERE","livemode":false,"statement_descriptor":"Test","status":"processing","last_payment_error":null,"payment_method_allowed":["dob","card","paymaya","gcash"],"payments":[{"id":"pay_DVwc8Nddcf3a5jxwrQTUd9dp","type":"payment","attributes":{"access_url":null,"amount":3000000,"balance_transaction_id":"bal_txn_iJSe4mnsiyKRHUDgR9WESioa","billing":{"address":{"city":"Test","country":"AL","line1":"Test","line2":"","postal_code":"123","state":"Test"},"email":"XD@gmmmmmail.com","name":"Niah","phone":""},"currency":"PHP","description":"DESC HERE","disputed":false,"external_reference_number":null,"fee":106500,"foreign_fee":30000,"livemode":false,"net_amount":2863500,"origin":"api","payment_intent_id":"pi_zQEko5R94Ar2xFaq745CzxAh","payout":null,"source":{"id":"card_2L7JgqgLanAce3yAivNNKYm3","type":"card","brand":"visa","country":"US","last4":"4345"},"statement_descriptor":"Test","status":"paid","tax_amount":null,"metadata":null,"refunds":[],"taxes":[],"available_at":1696496400,"created_at":1696175851,"credited_at":1697014800,"paid_at":1696175851,"updated_at":1696175851}}],"next_action":null,"payment_method_options":{"card":{"request_three_d_secure":"any"}},"metadata":null,"setup_future_usage":null,"created_at":1696175728,"updated_at":1696175850}},"payment_method_types":["dob","paymaya","card","dob_ubp","gcash"],"payment_method_used":"card","reference_number":null,"send_email_receipt":false,"show_description":true,"show_line_items":true,"status":"active","success_url":null,"created_at":1696175728,"updated_at":1696175728,"metadata":null}},"previous_data":{},"created_at":1696175851,"updated_at":1696175851}}}');
gen_hmac = data.digest('hex');
console.log("hmac : " + gen_hmac);
*/

/* NOTE: TEST CODE FOR PAYMONGO CHECKOUT API
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