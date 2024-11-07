const express = require('express');
const router = express.Router();
const { getStatus, stats } = require('../controllers/AppController');
const UserController = require('../controllers/UsersController');


router.get('/status', getStatus);

router.get('/stats', stats);

router.post('/users', UserController.postNew);

module.exports = router;
