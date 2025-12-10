const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AWTC API',
      version: '1.0.0',
      description: 'API Documentation for A Will To Change',
      contact: {
        name: 'AWTC Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development Server'
      },
      {
        url: 'http://209.97.187.131:8080',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        basicAuth: {
          type: 'http',
          scheme: 'basic'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Project Name' },
            description: { type: 'string' },
            categoryId: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['active', 'inactive', 'completed'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Education' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            content: { type: 'string', example: 'Great experience volunteering here!' },
            date: { type: 'string', format: 'date-time' },
            image: { type: 'string', nullable: true, example: '/images/review-image.jpg' },
            userId: { type: 'integer', example: 1 },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Admin' },
                email: { type: 'string', format: 'email', example: 'admin@awtc.es' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            message: { type: 'string' },
            status: { type: 'string', enum: ['new', 'read', 'resolved'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: [
    './routes/project.routes.js',
    './routes/reviews.routes.js',
    './routes/category.routes.js',
    './routes/user.routes.js',
    './routes/contact.routes.js',
    './routes/session.routes.js'
  ]
};

const swaggerSpecs = swaggerJsdoc(options);

module.exports = swaggerSpecs;
