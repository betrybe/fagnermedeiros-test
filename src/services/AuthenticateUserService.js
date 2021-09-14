const { sign } = require('jsonwebtoken');

const authConfig = require('../config/auth');
const AppError = require('../errors/AppError');
const User = require('../models/User');

class AuthenticateUserService {
  static async execute({ email, password }) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('Incorrect username or password', 401);
    }

    const isPasswordMatch = user.password === password;

    if (!isPasswordMatch) {
      throw new AppError('Incorrect username or password', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({
      // eslint-disable-next-line no-underscore-dangle
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    }, secret, {
      expiresIn,
    });

    return { token };
  }
}

module.exports = AuthenticateUserService;