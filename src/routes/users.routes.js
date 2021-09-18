const { Router } = require('express');

const UsersController = require('../controllers/UsersController');
const UsersAdminController = require('../controllers/UsersAdminController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const isAdmin = require('../middlewares/isAdmin');

const usersRouter = Router();
usersRouter.post('/', UsersController.create);
usersRouter.post('/admin', ensureAuthenticated, isAdmin, UsersAdminController.create);

module.exports = usersRouter;