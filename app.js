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

app.use(express.static('public'));
app.use(express.json());
app.set('layout', './layouts/main');
app.engine("hbs", exphbs.engine({extname: 'hbs', defaultLayout: 'main'}));
app.set("view engine", "hbs");
app.set("views", "./server/views");

app.use('/', require('./server/routes/main.js'));

db.connect();
gfs.connect(db.conn);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`Server running on http://localhost:${PORT}`);
});

// TODO: When deploying, change Mongopay Secret Key and Webhook Secret Key to production keys.
