const Recipe = require('../models/Recipe');

class ListRecipesService {
  static async execute() {
    const recipes = await Recipe.find();

    return recipes;
  } 
}

module.exports = ListRecipesService;