const { Router } = require('express');

const usersRouter = require('./users.routes');
const sessionsRouter = require('./sessions.routes');
const recipesRouter = require('./recipes.routes');

const routes = Router();

routes.use('/users', usersRouter);
routes.use('/login', sessionsRouter);
routes.use('/recipes', recipesRouter);

module.exports = routes;