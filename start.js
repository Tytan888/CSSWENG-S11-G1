
const app = require('./app.js')
const PORT = process.env.PORT || 3000;
const db = require('./server/config/db.js');
const gfs = require('./server/config/gfs.js');

db.url = URL;
db.connect();
gfs.connect(db.conn, process.env.MONGODB_URI);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(`Server running on http://localhost:${PORT}`);
});