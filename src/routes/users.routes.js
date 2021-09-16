const { Router } = require('express');

const UsersController = require('../controllers/UsersController');
const UsersAdminController = require('../controllers/UsersAdminController');

const usersRouter = Router();

usersRouter.post('/', UsersController.create);
usersRouter.post('/admin', UsersAdminController.create);

module.exports = usersRouter;