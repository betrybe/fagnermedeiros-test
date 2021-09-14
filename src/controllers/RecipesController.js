const Joi = require('joi');

const AppError = require('../errors/AppError');
const CreateRecipeService = require('../services/CreateRecipeService');
const ListRecipesService = require('../services/ListRecipeService');

class RecipesController {
  static async create(request, response) {
    const userId = request.user.id;
    const { name, ingredients, preparation } = request.body;
    
    const schema = Joi.object({
      name: Joi.string().required(),
      ingredients: Joi.string().required(),
      preparation: Joi.string().required(),
    });

    const { error } = schema.validate({ name, ingredients, preparation });

    if (error) {
      throw new AppError('Invalid entries. Try again.');
    }

    const recipe = await CreateRecipeService.execute({ name, ingredients, preparation, userId });

    return response.status(201).json({ recipe });
  }

  static async index(request, response) {
    const recipes = await ListRecipesService.execute();

    return response.json(recipes);
  }
}

module.exports = RecipesController;