const { Router } = require('express');

const RecipesController = require('../controllers/RecipesController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const recipesRouter = Router();

recipesRouter.post('/', ensureAuthenticated, RecipesController.create);

module.exports = recipesRouter;