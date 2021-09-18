const AppError = require('../errors/AppError');

async function isAdmin(request, response, next) {
  const { role } = request.user;

  if (role === 'admin') {
    next();
  } else {
    throw new AppError('Only admins can register new admins', 403);
  }      
}

module.exports = isAdmin;