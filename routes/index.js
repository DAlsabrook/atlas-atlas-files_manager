const express = require('express');
const router = express.Router();
const { getStatus, stats } = require('../controllers/AppController');

router.get('/status', getStatus);

router.get('/stats', stats);

module.exports = router;
