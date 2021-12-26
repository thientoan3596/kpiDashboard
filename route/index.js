const express = require('express');
const indexController = require('../controllers/index/indexController')

const router = express.Router();
// router.get('/js')

router.get('/index', indexController.index_get);
router.get('/', indexController.index_get);
router.get('/about', indexController.about_get);
module.exports = router;