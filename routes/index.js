const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');
const UserController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');


router.get('/status', AppController.getStatus);

router.get('/stats', AppController.stats);

router.post('/users', UserController.postNew);

router.get('/connect', AuthController.getConnect);
// router.get('/disconnect', AuthController.getDisconnect);
// router.get('/user/me', UserController.getMe);

module.exports = router;
