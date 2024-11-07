// Single routing
const router = express.Router();
const AppController = require('./controllers');

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);
