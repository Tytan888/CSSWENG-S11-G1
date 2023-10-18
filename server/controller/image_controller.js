const gfs = require('../config/gfs.js');
const db = require('../config/db.js');
const Event = require('../models/event.js');

const Img = {

  getByName: async function (req, res) {
    try {
      const filename = req.query.name;
      // Find the file by filename

      const file = await gfs.findOne({ filename: filename });
      if (!file) {
        return res.status(404).send('File not found');
      }

      // Now we have the ObjectId of the file
      const readStream = await gfs.createReadStream(file._id);

      // Set appropriate headers for image response
      res.set('Content-Type', file.contentType);
      readStream.pipe(res);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Server Error');
    }

  },
  //get image filename associated with event



};

module.exports = Img;