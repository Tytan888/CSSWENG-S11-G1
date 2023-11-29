/**
 * This module contains all of the functions that are used to handle requests
 * and operations related to the singleton schema.
 * @module server/controller/image_controller
 * 
 * @requires {@link module:server/config/gfs}
 */
const gfs = require('../config/gfs.js');
/**
 * This object to be exported contains all of the functions that are used to render or delete images.
 * 
 * @typedef {object} Img
 * @memberof module:server/controller/image_controller
 * @inner
 * 
 * @property {Function} getByName - Handles GET requests ro render an image.
 * @property {Function} deleteByName - Handles DELETE requests to delete one image given a filename.
 * @property {Function} deleteByNames - Handles DELETE requests to delete multiple images given an array of filenames.
*/
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
      //file data can only be streamed, not sent
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