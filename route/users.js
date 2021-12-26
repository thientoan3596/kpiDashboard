const express = require('express');
const router = express.Router();
const loginController = require('../controllers/users/loginController')
const registerController = require('../controllers/users/registerController')
const profileController = require('../controllers/users/profileController')

//Const
router.post('/profile/changepassword', profileController.change_password)
router.post('/profile/changeusername', profileController.change_username);

router.route('/profile')
    .get(profileController.profile_get)

router.delete('/logout', require('../controllers/users/logoutController').logout)

router
    .route('/login')
    .get(loginController.login_index)
    .post(loginController.login_auth);

router
    .route('/register')
    .get(registerController.register_get)
    .post(registerController.register_post);
module.exports = router;