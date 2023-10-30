const gfs = require('../config/gfs.js');

const Img = {

  getByName: async function (req, res) {
    try {
      // Find the file by filename...
      const filename = req.query.name;

      const file = await gfs.findOne({ filename: filename });
      if (!file) {
        return res.status(404).send('File not found');
      }

      // Now we have the ObjectId of the file.
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

  deleteByName: async function (req, res) {
    try {
      const filename = res.locals.name;
      const file = await gfs.findOne({ filename: filename });

      if (!file) {
        return res.status(404).send('File not found');
      }

      await gfs.delete(file._id);
      res.status(200)
      if (res.locals.id != null) {
        res.json(res.locals.id);
      } else {
        res.end();
      }
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Server Error');
    }
  },
  deleteByNames: async function (req, res) {
    console.log(res.locals.names);
    try {
      for (let filename of res.locals.names) {
        const file = await gfs.findOne({ filename: filename });
        if (!file) {
          return res.status(404).send('File not found');
        }
        await gfs.delete(file._id);
      }

      res.status(200)

      if (res.locals.id != null) {
        res.json(res.locals.id);
      } else {
        res.end();
      }

    } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Server Error');
    }
  }
};

module.exports = Img;