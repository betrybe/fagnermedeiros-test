const Joi = require('joi');

const CreateUserService = require('../services/CreateUserService');
const AppError = require('../errors/AppError');

class UsersController {
  static async create(request, response) {
    const { name, email, password } = request.body;

    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate({ name, email, password });

    if (error) {
      throw new AppError('Invalid entries. Try again.', 400);
    }

    const user = await CreateUserService.execute({ name, email, password });

    return response.status(201).json({ user });
  }
}

module.exports = UsersController;