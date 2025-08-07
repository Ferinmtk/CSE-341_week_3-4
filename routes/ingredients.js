const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth'); // Corrected path
const ingredientsController = require('../controllers/ingredientsController');

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: API for managing ingredients. Requires authentication (session cookie).
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - nutritionalValue
 *         - shelfLife
 *         - storageInstructions
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the ingredient
 *           example: 605c72ef9b1e8f001c8e4d2a
 *         name:
 *           type: string
 *           description: Name of the ingredient
 *           minLength: 2
 *           example: Carrot
 *         category:
 *           type: string
 *           description: Category of the ingredient
 *           enum: [Vegetables, Fruits, Grains, Protein, Dairy, Spices, Other]
 *           example: Vegetables
 *         nutritionalValue:
 *           type: object
 *           required: [calories, protein, carbohydrates, fat]
 *           properties:
 *             calories:
 *               type: number
 *               format: float
 *               minimum: 0
 *               example: 41
 *             protein:
 *               type: number
 *               format: float
 *               minimum: 0
 *               example: 0.9
 *             carbohydrates:
 *               type: number
 *               format: float
 *               minimum: 0
 *               example: 10
 *             fat:
 *               type: number
 *               format: float
 *               minimum: 0
 *               example: 0.2
 *         isAllergenic:
 *           type: boolean
 *           default: false
 *           example: false
 *         shelfLife:
 *           type: integer
 *           description: Shelf life in days
 *           minimum: 1
 *           example: 14
 *         storageInstructions:
 *           type: string
 *           description: How to store the ingredient
 *           example: Keep refrigerated
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the ingredient was added
 *           example: 2023-01-15T10:30:00Z
 *     IngredientInput:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - nutritionalValue
 *         - shelfLife
 *         - storageInstructions
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the ingredient
 *           minLength: 2
 *           example: Carrot
 *         category:
 *           type: string
 *           description: Category of the ingredient
 *           enum: [Vegetables, Fruits, Grains, Protein, Dairy, Spices, Other]
 *           example: Vegetables
 *         nutritionalValue:
 *           type: object
 *           required: [calories, protein, carbohydrates, fat]
 *           properties:
 *             calories:
 *               type: number
 *               format: float
 *               minimum: 0
 *               example: 41
 *             protein:
 *               type: number
 *               format: float
 *               minimum: 0
 *               example: 0.9
 *             carbohydrates:
 *               type: number
 *               format: float
 *               minimum: 0
 *               example: 10
 *             fat:
 *               type: number
 *               format: float
 *               minimum: 0
 *               example: 0.2
 *         isAllergenic:
 *           type: boolean
 *           default: false
 *           example: false
 *         shelfLife:
 *           type: integer
 *           description: Shelf life in days
 *           minimum: 1
 *           example: 14
 *         storageInstructions:
 *           type: string
 *           description: How to store the ingredient
 *           example: Keep refrigerated
 *   securitySchemes:
 *     cookieAuth: # Defined here for clarity, though defined globally in swagger.js
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid # Default session cookie name for express-session
 */

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     summary: Get all ingredients
 *     tags: [Ingredients]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of ingredients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       401:
 *         description: Unauthorized (user not logged in)
 *       500:
 *         description: Server error
 */
router.get('/', ensureAuthenticated, ingredientsController.getAllIngredients);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   get:
 *     summary: Get a single ingredient by ID
 *     tags: [Ingredients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the ingredient to retrieve
 *         required: true
 *         schema:
 *           type: string
 *           example: 605c72ef9b1e8f001c8e4d2a
 *     responses:
 *       200:
 *         description: Details of the ingredient
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ingredient not found
 *       500:
 *         description: Server error
 */
router.get('/:id', ensureAuthenticated, ingredientsController.getIngredientById);

/**
 * @swagger
 * /api/ingredients:
 *   post:
 *     summary: Create a new ingredient
 *     tags: [Ingredients]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IngredientInput'
 *     responses:
 *       201:
 *         description: Ingredient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Invalid request data (e.g., missing fields, validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', ensureAuthenticated, ingredientsController.createIngredient);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   put:
 *     summary: Update an existing ingredient
 *     tags: [Ingredients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the ingredient to update
 *         required: true
 *         schema:
 *           type: string
 *           example: 605c72ef9b1e8f001c8e4d2a
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IngredientInput' # Can reuse input schema
 *     responses:
 *       200:
 *         description: Ingredient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ingredient not found
 *       500:
 *         description: Server error
 */
router.put('/:id', ensureAuthenticated, ingredientsController.updateIngredient);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   delete:
 *     summary: Delete an ingredient
 *     tags: [Ingredients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the ingredient to delete
 *         required: true
 *         schema:
 *           type: string
 *           example: 605c72ef9b1e8f001c8e4d2a
 *     responses:
 *       200:
 *         description: Ingredient deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ingredient deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ingredient not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', ensureAuthenticated, ingredientsController.deleteIngredient);

module.exports = router;
