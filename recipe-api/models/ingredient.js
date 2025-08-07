const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Vegetables', 'Fruits', 'Grains', 'Protein', 'Dairy', 'Spices', 'Other']
  },
  nutritionalValue: {
    calories: {
      type: Number,
      required: [true, 'Calorie content is required'],
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      required: [true, 'Protein content is required'],
      min: [0, 'Protein cannot be negative']
    },
    carbohydrates: {
      type: Number,
      required: [true, 'Carbohydrate content is required'],
      min: [0, 'Carbohydrates cannot be negative']
    },
    fat: {
      type: Number,
      required: [true, 'Fat content is required'],
      min: [0, 'Fat cannot be negative']
    }
  },
  isAllergenic: {
    type: Boolean,
    default: false
  },
  shelfLife: {
    type: Number,
    required: [true, 'Shelf life is required'],
    min: [1, 'Shelf life must be at least 1 day']
  },
  storageInstructions: {
    type: String,
    required: [true, 'Storage instructions are required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ingredient', ingredientSchema); 