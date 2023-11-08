const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const hbs = require('handlebars');
const moment = require('moment');

const app = express();


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
        },
        none: function(value){
            return (value.length == 0) ? "None" : value;
        },
        unix: function(value){
            let date = new Date(value * 1000);
            date = moment(date).format('MMMM Do YYYY, hh:mm:ss A');
            return date;
        },
        money: function(value){
            return "₱" + (value / 100).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        },
        extractId: function(value){
            return value.slice(value.indexOf('(') + 1, value.indexOf(')'));
        },
        extractName: function(value){
            return value.slice(value.indexOf('for ') + 4, value.indexOf(' ('));
        }
    }
}));
app.set("view engine", "hbs");
app.set("views", "./server/views");

app.use('/', require('./server/routes/main.js'));

module.exports = app;

// TODO: When deploying, change Mongopay Secret Key and Webhook Secret Key to production keys.
