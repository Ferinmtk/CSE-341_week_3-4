const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config(); // Ensure environment variables are loaded

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recipe API',
      version: '1.0.0',
      description: 'A simple Recipe API for managing recipes and ingredients, with GitHub OAuth authentication.',
    },
    servers: [
      {
        url: 'https://week-3-4-30dx.onrender.com', // Your production URL 
        description: 'Production server',
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}`, // Local development URL
        description: 'Development server',
      },
    ],
    // Define security schemes for session-based auth (after GitHub login)
    components: {
      securitySchemes: {
        cookieAuth: { // Name for the scheme
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid', // Default session cookie name for express-session
          description: 'Session cookie obtained after successful GitHub login.'
        }
      }
    },
    // Apply the security scheme globally or to specific paths
    security: [
      {
        cookieAuth: [] // Apply cookieAuth globally to protected routes
      }
    ]
  },
  // Path to the API docs files
  apis: ['./routes/*.js', './routes/auth.js'], // Explicitly include auth routes
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Optional: Serve the JSON specification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger documentation available at /api-docs`);
};

module.exports = setupSwagger;
