const Recipe = require('../models/Recipe');
const AppError = require('../errors/AppError');

class UpdateImageRecipeService {
  static async execute({ imageName, recipeId }) {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    const imageUrl = `localhost:3000/src/uploads/${imageName}`;
    recipe.image = imageUrl;

    await recipe.save();

    return recipe;
  }
}

module.exports = UpdateImageRecipeService;