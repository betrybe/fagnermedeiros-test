const { Router } = require('express');

const RecipesController = require('../controllers/RecipesController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const recipesRouter = Router();

recipesRouter.post('/', ensureAuthenticated, RecipesController.create);
recipesRouter.get('/', RecipesController.index);
recipesRouter.get('/:id', RecipesController.show);
recipesRouter.put('/:id', ensureAuthenticated, RecipesController.update);

module.exports = recipesRouter;