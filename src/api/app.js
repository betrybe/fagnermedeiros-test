const express = require('express');
const path = require('path');
require('dotenv').config();
require('express-async-errors');

const routes = require('../routes');
const AppError = require('../errors/AppError');
require('../database');

const app = express();

// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '..', 'uploads')));
app.use(routes);

app.use((err, request, response, _) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({ message: err.message });
  }

  return response.status(500).json({ message: 'Internal server error' });
});

module.exports = app;