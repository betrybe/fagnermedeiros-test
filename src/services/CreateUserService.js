const AppError = require('../errors/AppError');
const User = require('../models/User');

class CreateUserService {
  static async execute({ name, email, password }) {
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      throw new AppError('Email already registered', 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    user.password = undefined;

    return user;
  }
}

module.exports = CreateUserService;