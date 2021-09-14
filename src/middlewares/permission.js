const { isValidObjectId } = require('mongoose');

const AppError = require('../errors/AppError');
const Recipe = require('../models/Recipe');

async function permission(request, response, next) {
  const recipeId = request.params.id;
  const { id: userId, role } = request.user;

  const isValid = isValidObjectId(recipeId);
  if (!isValid) {
    throw new AppError('Recipe not found', 404);
  }

  const recipe = await Recipe.findById(recipeId);
  
  if (!recipe) {
    throw new AppError('Recipe not found', 404);
  }
  
  const isRecipeLoggedUser = userId === recipe.userId.toString();
  
  if (isRecipeLoggedUser || role === 'admin') {
    next();
  } else {
    throw new AppError('User does not have permission', 401);
  }      
}

module.exports = permission;