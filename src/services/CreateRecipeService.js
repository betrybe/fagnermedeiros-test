const Recipe = require('../models/Recipe');

class CreateRecipeService {
  static async execute({ name, ingredients, preparation, userId }) {
    const recipe = await Recipe.create({
      name,
      ingredients,
      preparation,
      userId,
    });

    return recipe;
  }
}

module.exports = CreateRecipeService;