const { Schema, model } = require('mongoose');

const RecipeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  preparation: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
},
{
  timestamps: true,
});  

module.exports = model('Recipe', RecipeSchema);