const express =  require('express')
const router = express.Router();
const {removeUserAuthToken,deleteUser,deletePublicationForUser,updateUserPublication,updatePublication,deletePublication} = require('../controller/webhookController')
const checkServerToken = require('../middleware/checkServerToken');
router.route('/update_user')
    .post(checkServerToken, removeUserAuthToken)
    .delete(checkServerToken, deleteUser)

router.route('/update_user_publication')
    .post(checkServerToken, updateUserPublication)
    .delete(checkServerToken, deletePublicationForUser)

router.route('/update_publication')
    .post(checkServerToken, updatePublication)
    .delete(checkServerToken, deletePublication)

module.exports = router