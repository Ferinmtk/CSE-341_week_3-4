const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config(); // Load environment variables

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
        url: 'https://cse-341-week-3-4.onrender.com', // Correct production URL
        description: 'Production server',
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}`, // Local dev fallback
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie obtained after successful GitHub login.',
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './routes/auth.js'], // Include all relevant route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('✅ Swagger UI available at /api-docs');
};

module.exports = setupSwagger;
