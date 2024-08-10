const { Router } = require('express')
const { get_device_token, logout } = require('../controller/authController');
const {deviceCount} = require('../middleware/deviceCountMiddleware');
const auth = require('../middleware/auth');


const router = Router();

router.route('/get_device_token').post(deviceCount, get_device_token)
router.route('/logout').post( auth, logout)

module.exports = router