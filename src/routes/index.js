const { Router } = require('express');

const usersRouter = require('./users.routes');
const sessionsRouter = require('./sessions.routes');

const routes = Router();

routes.use('/users', usersRouter);
routes.use('/login', sessionsRouter);

module.exports = routes;