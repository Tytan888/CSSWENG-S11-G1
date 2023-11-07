const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const db = require('./server/config/db.js');
const gfs = require('./server/config/gfs.js');
const exphbs = require('express-handlebars');
const hbs = require('handlebars');

const app = express();
const PORT = process.env.PORT;
const URL = process.env.MONGODB_URI;

app.use(express.static('public'));
app.use(express.json());
app.set('layout', './layouts/main');
app.engine("hbs", exphbs.engine({
    extname: 'hbs', defaultLayout: 'main', helpers: {
        inc: function (value) {
            return parseInt(value) + 1;
        },
        cap: function (value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
        tw_len: function (value) {
            return 12 / Math.min(value.length, 3);
        },
        last: function (value) {
            return value[value.length - 1];
        },
        includes: function () {
            const options = arguments[arguments.length - 1];
            const action = arguments[0];
            let res = false;
            for(var i = 1; i < arguments.length - 1; i++) {
                if(arguments[i] == action) {
                    res = true;
                    break;
                }
            }
            if(res) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        }
    }
}));
app.set("view engine", "hbs");
app.set("views", "./server/views");

app.use('/', require('./server/routes/main.js'));

db.url = URL;
db.connect();
gfs.connect(db.conn);

module.exports = app;

// TODO: When deploying, change Mongopay Secret Key and Webhook Secret Key to production keys.
