const UpdateImageRecipeService = require('../services/UpdateImageRecipeService');

class RecipeImageController {
  static async update(request, response) {
    const recipeId = request.params.id;
    const imageName = request.file.filename;

    const recipe = await UpdateImageRecipeService.execute({ recipeId, imageName });

    return response.json(recipe);
  }
}

module.exports = RecipeImageController;