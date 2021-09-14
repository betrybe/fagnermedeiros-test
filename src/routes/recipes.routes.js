const { Router } = require('express');

const RecipesController = require('../controllers/RecipesController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const permission = require('../middlewares/permission');

const recipesRouter = Router();

recipesRouter.post('/', ensureAuthenticated, RecipesController.create);
recipesRouter.get('/', RecipesController.index);
recipesRouter.get('/:id', RecipesController.show);
recipesRouter.put('/:id', ensureAuthenticated, permission, RecipesController.update);
recipesRouter.delete('/:id', ensureAuthenticated, permission, RecipesController.delete);

module.exports = recipesRouter;