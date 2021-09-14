const { isValidObjectId } = require('mongoose');

const AppError = require('../errors/AppError');
const Recipe = require('../models/Recipe');

class ShowRecipeService {
  static async execute(recipeId) {
    const isValid = isValidObjectId(recipeId);

    if (!isValid) {
      throw new AppError('recipe not found', 404);
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      throw new AppError('recipe not found', 404);
    }

    return recipe;
  }
}

module.exports = ShowRecipeService;