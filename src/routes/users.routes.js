const { Router } = require('express');

const UsersController = require('../controllers/UsersController');

const usersRouter = Router();

usersRouter.post('/', UsersController.create);

module.exports = usersRouter;