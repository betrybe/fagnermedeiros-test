const Joi = require('joi');

const AuthenticateUserService = require('../services/AuthenticateUserService');
const AppError = require('../errors/AppError');

class SessionsController {
  static async create(request, response) {
    const { email, password } = request.body;

    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate({ email, password });

    if (error) {
      throw new AppError('All fields must be filled', 401);
    }

    const { token } = await AuthenticateUserService.execute({ email, password });

    return response.json({ token });
  }
}

module.exports = SessionsController;