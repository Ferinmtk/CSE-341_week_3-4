const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth'); // Corrected path
const recipesController = require('../controllers/recipesController');

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: API for managing recipes. Requires authentication (session cookie).
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RecipeIngredient:
 *       type: object
 *       required:
 *         - ingredient
 *         - quantity
 *         - unit
 *       properties:
 *         ingredient:
 *           type: string
 *           description: ID of the ingredient used
 *           example: 605c72ef9b1e8f001c8e4d2a # Example Ingredient ID
 *         quantity:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 200
 *         unit:
 *           type: string
 *           enum: [g, kg, ml, l, tsp, tbsp, cup, piece]
 *           example: g
 *     Recipe:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - ingredients
 *         - instructions
 *         - prepTime
 *         - cookTime
 *         - servings
 *         - difficulty
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the recipe
 *           example: 605c72ef9b1e8f001c8e4d3b
 *         title:
 *           type: string
 *           description: Title of the recipe
 *           minLength: 3
 *           example: Simple Pasta Bake
 *         description:
 *           type: string
 *           description: A short description of the recipe
 *           example: A quick and easy pasta bake perfect for weeknights.
 *         ingredients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RecipeIngredient'
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *           description: Steps to prepare the recipe
 *           example: ["Boil pasta.", "Mix sauce.", "Combine and bake."]
 *         prepTime:
 *           type: integer
 *           description: Preparation time in minutes
 *           minimum: 1
 *           example: 15
 *         cookTime:
 *           type: integer
 *           description: Cooking time in minutes
 *           minimum: 0
 *           example: 30
 *         servings:
 *           type: integer
 *           description: Number of servings
 *           minimum: 1
 *           example: 4
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           example: Easy
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the recipe was added
 *           example: 2023-01-16T11:00:00Z
 *     RecipeInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - ingredients
 *         - instructions
 *         - prepTime
 *         - cookTime
 *         - servings
 *         - difficulty
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the recipe
 *           minLength: 3
 *           example: Simple Pasta Bake
 *         description:
 *           type: string
 *           description: A short description of the recipe
 *           example: A quick and easy pasta bake perfect for weeknights.
 *         ingredients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RecipeIngredient'
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           description: Steps to prepare the recipe
 *           example: ["Boil pasta.", "Mix sauce.", "Combine and bake."]
 *         prepTime:
 *           type: integer
 *           description: Preparation time in minutes
 *           minimum: 1
 *           example: 15
 *         cookTime:
 *           type: integer
 *           description: Cooking time in minutes
 *           minimum: 0
 *           example: 30
 *         servings:
 *           type: integer
 *           description: Number of servings
 *           minimum: 1
 *           example: 4
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           example: Easy
 *   securitySchemes:
 *     cookieAuth: # Defined here for clarity, though defined globally in swagger.js
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', ensureAuthenticated, recipesController.getAllRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get a single recipe by ID
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the recipe to retrieve
 *         required: true
 *         schema:
 *           type: string
 *           example: 605c72ef9b1e8f001c8e4d3b
 *     responses:
 *       200:
 *         description: Details of the recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.get('/:id', ensureAuthenticated, recipesController.getRecipeById);

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeInput'
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid request data (e.g., missing fields, validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', ensureAuthenticated, recipesController.createRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update an existing recipe
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the recipe to update
 *         required: true
 *         schema:
 *           type: string
 *           example: 605c72ef9b1e8f001c8e4d3b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeInput' # Reuse input schema
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.put('/:id', ensureAuthenticated, recipesController.updateRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     tags: [Recipes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the recipe to delete
 *         required: true
 *         schema:
 *           type: string
 *           example: 605c72ef9b1e8f001c8e4d3b
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recipe deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', ensureAuthenticated, recipesController.deleteRecipe);

module.exports = router;
