const express =  require('express')
const router = express.Router();
const {removeUserAuthToken,deleteUser,updateUserPublication,updatePublication} = require('../controller/webhookController')
const checkServerToken = require('../middleware/checkServerToken')
router.route('/update_user')
    .post(checkServerToken, removeUserAuthToken)
    .delete(checkServerToken, deleteUser)

router.route('/update_user_publication')
    .post(checkServerToken, updateUserPublication)
    // .delete(deleteUserPublication)

router.route('/update_publication')
    .post(checkServerToken, updatePublication)

module.exports = router