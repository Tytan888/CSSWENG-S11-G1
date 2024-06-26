/**
 * @fileoverview This file serves as the main driver for the application.
 * @module app
 * @requires {@link path}
 * @requires {@link express}
 * @requires {@link exphbs}
 * @requires {@link moment}
 * @requires {@link cookie-parser}
 * @requires {@link module:server/routes/main}
 * 
 * @exports app
 */

/* Import all needed modules. */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const express = require('express');
const exphbs = require('express-handlebars');
const moment = require('moment');
const cookies = require("cookie-parser");
const router = require('./server/routes/main.js');

/* Initialize the web server. */
const app = express();

/* Set up web server. */
app.use(express.static('public'));
app.use(express.json());
app.use(cookies());
app.set('layout', './layouts/main');
app.engine("hbs", exphbs.engine({
    extname: 'hbs', defaultLayout: 'main', helpers: {
        /** 
         * This helper simply increments the value passed to it by 1.
         * 
         * @param {number} value The value to be incremented by 1.
         * @returns {number} The value passed to the helper incremented by 1.
         * 
         * @example
         * // returns 2
         * {{inc 1}}
         * 
         * 
         */
        inc: function (value) {
            return parseInt(value) + 1;
        },

        /**
         * This helper takes in a String and capitalizes the first letter of the String.
         * 
         * @param {string} value The String to be capitalized.
         * @returns {string} The String passed to the helper with the first letter capitalized.
         * 
         * @example
         * // returns 'Hello'
         * {{cap 'hello'}}
         */
        cap: function (value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        },

        /**
         * This helper simply takes in a number and returns twelve divided by that number.
         * 
         * @param {number} value The number to be divided by twelve.
         * @returns {number} Twelve divided by the number passed to the helper.
         * 
         * @example
         * // returns 4
         * {{tw_len 3}}
         */
        tw_len: function (value) {
            return 12 / Math.min(value.length, 3);
        },

        /**
         * This helper takes in an array and returns the last element of the array.
         * 
         * @param {Array} value The array to get the last element from.
         * @returns {any} The last element of the array passed to the helper.
         * 
         * @example
         * // returns 'c'
         * {{last ['a', 'b', 'c']}}
         */
        last: function (value) {
            return value[value.length - 1];
        },

        /**
         * This helper takes in a series of values. Whether the first value is equal to any of the other values,
         * the helper returns options.fn(this). Otherwise, it returns options.inverse(this).
         * 
         * @param {any} value The value to be compared to the other values.
         * @param {...string} options The other values to be compared to the first value.
         * @returns {boolean} Whether the first value is equal to any of the other values.
         * 
         * @example
         * // returns options.fn(this)
         * {{includes 'a' 'a' 'b' 'c'}}
         */
        includes: function () {
            const options = arguments[arguments.length - 1];
            const action = arguments[0];
            let res = false;
            for (var i = 1; i < arguments.length - 1; i++) {
                if (arguments[i] == action) {
                    res = true;
                    break;
                }
            }
            if (res) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        },

        /**
         * This helper takes in a string. If the string is empty, the helper returns 'None'. Otherwise, it returns the string.
         * 
         * @param {string} value The string to be checked.
         * @returns {string} 'None' if the string is empty. Otherwise, it returns the string.
         * 
         * @example
         * // returns 'None'
         * {{none ''}}
         */
        none: function (value) {
            return (value.length == 0) ? "None" : value;
        },

        /**
         * This helper takes in a number in unix time and returns the date and time in the format YYYY/MM/DD, hh:mm:ss A.
         * 
         * @param {number} value The number in unix time to be converted.
         * @returns {string} The date and time in the format YYYY/MM/DD, hh:mm:ss A.
         * 
         * @example
         * // returns '2022/01/01, 12:00:00 AM'
         * {{unix 1640995200}}
         */
        unix: function (value) {
            let date = new Date(value * 1000);
            date = moment(date).format('YYYY/MM/DD, hh:mm:ss A');
            return date;
        },

        /**
         * This helpers takes in a number in centavos and formats it as a currency in php.
         * 
         * @param {number} value The number to be formatted.
         * @returns {string} The number formatted as a currency in php.
         * 
         * @example
         * // returns '₱1,000.00'
         * {{money 100000}}
         */
        money: function (value) {
            return "₱" + (value / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },

        /**
         * This helper takes in a description of a donation and returns the id of its associated project or child.
         * 
         * @param {string} value The description of the donation.
         * @returns {string} The id of the project or child associated with the donation.
         * 
         * @example
         * // returns '655b8c21779144de29dda1af'
         * {{extractId 'Project Funding for Test Project (655b8c21779144de29dda1af)'}}
         */
        extractId: function (value) {
            return value.slice(value.indexOf('(') + 1, value.indexOf(')'));
        },

        /**
         * This helper takes in a description of a donation and returns the name of its associated project or child.
         * 
         * @param {string} value The description of the donation.
         * @returns {string} The name of the project or child associated with the donation.
         * 
         * @example
         * // returns 'Test Project'
         * {{extractId 'Project Funding for Test Project (655b8c21779144de29dda1af)'}}
         */
        extractName: function (value) {
            return value.slice(value.indexOf('for ') + 4, value.indexOf(' ('));
        },

        /**
         * This helper takes in a string and returns the string in lowercase.
         * 
         * @param {string} value The string to be converted to lowercase.
         * @returns {string} The string passed to the helper in lowercase.
         * 
         * @example
         * // returns 'hello'
         * {{small 'HELLO'}}
         */
        small: function (value) {
            return value.toLowerCase();
        }
    }
}));

/** Set up web server even more. */
app.set("view engine", "hbs");
app.set("views", "./server/views");
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/** Set up main route. */
app.use('/', router);
module.exports = app;

// TODO: When deploying, change Mongopay Secret Key and Webhook Secret Key to production keys.
