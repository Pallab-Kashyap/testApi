const express = require("express")
const {fetchPublications,fetchSinglePublications} = require("../controller/publicationController");
const auth = require("../middleware/auth");
const router = express.Router();
// download in system
router.route('/').get( auth, fetchPublications);
router.route('/:id').get(fetchSinglePublications);


module.exports = router;