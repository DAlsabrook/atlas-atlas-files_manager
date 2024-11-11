const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');
const UserController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');
const { route } = require('../server');


router.get('/status', AppController.getStatus);

router.get('/stats', AppController.stats);

router.post('/users', UserController.postNew);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);

router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
// router.put('/files/:id/publish', FilesController.putPublish);
// router.put('/files/:id/publish', FilesController.putUnpublish);


module.exports = router;
