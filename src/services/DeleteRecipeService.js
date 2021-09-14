const Recipe = require('../models/Recipe');

class ShowRecipeService {
  static async execute(recipeId) {
    await Recipe.findByIdAndDelete(recipeId);
  }
}

module.exports = ShowRecipeService;