/**
 * @fileoverview  This file is the entry point for the application as a whole.
 * @module start
 * @requires {@link module:app}
 * @requires {@link db}
 * @requires {@link gfs}
 * 
 * @exports start
 */

/* Import all needed modules. */
const app = require('./app.js')
const db = require('./server/config/db.js');
const gfs = require('./server/config/gfs.js');
const PORT = process.env.PORT || 3000;

/* Connect to the database and start the server. */
db.connect();
gfs.connect(db.conn);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`Server running on http://localhost:${PORT}`);
});