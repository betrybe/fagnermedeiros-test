const { Router } = require('express');
const multer = require('multer');

const RecipesController = require('../controllers/RecipesController');
const RecipeImageController = require('../controllers/RecipeImageController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const permission = require('../middlewares/permission');
const uploadConfig = require('../config/upload');

const recipesRouter = Router();

recipesRouter.post('/', ensureAuthenticated, RecipesController.create);
recipesRouter.get('/', RecipesController.index);
recipesRouter.get('/:id', RecipesController.show);
recipesRouter.put('/:id', ensureAuthenticated, permission, RecipesController.update);
recipesRouter.delete('/:id', ensureAuthenticated, permission, RecipesController.delete);

const upload = multer(uploadConfig);
recipesRouter.put('/:id/image', 
  ensureAuthenticated, 
  permission, 
  upload.single('image'), 
  RecipeImageController.update);

module.exports = recipesRouter;