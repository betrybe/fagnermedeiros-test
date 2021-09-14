const { Router } = require('express');

const SessionsController = require('../controllers/SessionsController');

const sessionsRouter = Router();

sessionsRouter.post('/', SessionsController.create);

module.exports = sessionsRouter;