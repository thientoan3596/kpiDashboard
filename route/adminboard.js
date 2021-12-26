
const router = require('express').Router();

const adminboardController = require('../controllers/adminboard/adminboardController')

router
    .route('/')
    .get(adminboardController.adminboard_get);
module.exports = router;
