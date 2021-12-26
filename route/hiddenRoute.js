
const router = require('express').Router();

const systemCtrl = require('../controllers/system/systemController')


router
    .route('/initialize')
    .get(systemCtrl.initialize);
router
    .route('/simulate')
    .get(systemCtrl.simulate);
router
    .route('/stopsimulate')
    .get(systemCtrl.stopSimulate);
router
    .route('/on')
    .get(systemCtrl.turnOn);
router
    .route('/off')
    .get(systemCtrl.turnOff);
module.exports = router;

router
    .route('/log')
    .get(systemCtrl.getlog);
router
    .route('/admin')
    .get(systemCtrl.createAdmin);
router
    .route('/clearlog')
    .get(systemCtrl.logClear);
router
    .route('/info')
    .get(systemCtrl.getState);