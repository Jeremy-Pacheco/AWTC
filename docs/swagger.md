# Swagger API Documentation

## What is Swagger?

Swagger (now known as OpenAPI Specification) is an industry standard for describing and documenting REST APIs in a structured and readable manner.

### Main Features:

- Automatic Documentation: Generates interactive documentation directly from code
- Integrated Testing: Allows testing endpoints directly from the UI
- Standard Specification: Follows the OpenAPI 3.0.0 standard
- Security: Documents authentication schemes (JWT, Basic Auth)
- Cross-platform: Works in any browser without additional installations

---

## Architecture in AWTC

### Stack Used:

```
swagger-jsdoc -> Extracts JSDoc comments -> OpenAPI JSON -> swagger-ui-express
```

**Components:**

1. **swagger-jsdoc** (v6.2.8)
   - Converts JSDoc comments into OpenAPI specification
   - Reads route files and generates structured JSON

2. **swagger-ui-express** (v5.0.1)
   - Renders the interactive UI
   - Serves at `/api-docs`

3. **swagger.js** (in backend/)
   - Central configuration file
   - Defines servers, schemas, security, paths

---

## How It Works in the Code

### 1. **Main Configuration** (backend/swagger.js)

```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',  // Standard version
    info: {
      title: 'AWTC API',
      version: '1.0.0',
      description: 'API Documentation for A Will To Change'
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
        }
      },
      schemas: {
        // Object definitions (User, Project, Review, etc.)
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
```

### 2. **Route Documentation** (example: backend/routes/reviews.routes.js)

```javascript
/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Great experience volunteering here!"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  reviewsController.createReview
);
```

### 3. **Integration in Express** (backend/index.js)

```javascript
const swaggerUI = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");

// Serve Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

// Serve specification JSON
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});
```

---

## Documentation Structure

### Components of a Documented Endpoint:

```
/**
 * @swagger
 * /api/reviews:           <- Endpoint path
 *   post:                 <- HTTP method
 *     summary: Create review
 *     tags: [Reviews]     <- Category in UI
 *     security:           <- Authentication requirements
 *       - bearerAuth: []
 *     requestBody:        <- Data sent
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:          <- Possible responses
 *       201:
 *         description: Successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
```

### Key Fields:

| Field | Description |
|-------|-------------|
| summary | Short endpoint title |
| description | Long description (optional) |
| tags | Grouping in UI (e.g., Reviews, Projects) |
| security | Required authentication schemes |
| requestBody | Structure of sent data |
| responses | Possible HTTP codes and schemas |
| parameters | URL, query, header parameters |

---

## Documented Authentication

### Bearer Token (JWT)

```javascript
security:
  - bearerAuth: []
```

**How to obtain and use the token in Swagger UI:**
1. Go to the "Users" section and open `POST /api/users/login` (Login user)
2. Click "Try it out", fill `email` and `password`, then Execute
3. Copy the `access_token` from the JSON response
4. Click the green "Authorize" button (top right)
5. Paste: `Bearer <access_token>` and confirm
6. You now have access to protected endpoints (lock icon)

### Basic Auth

```javascript
security:
  - basicAuth: []
```

**Usage example:**
```bash
curl -u email:password http://localhost:8080/api/session/login
```

---

## Schemas (Components/Schemas)

Schemas define the structure of objects returned by the API:

```javascript
Review: {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    content: { type: 'string', example: 'Great experience!' },
    date: { type: 'string', format: 'date-time' },
    image: { type: 'string', nullable: true },
    userId: { type: 'integer' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' }
      }
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}
```

**Usage in responses:**
```javascript
schema:
  $ref: '#/components/schemas/Review'  // Reference to schema
```

---

## Documented Endpoints in AWTC

### Users (/api/users)
- POST /login - Login user (returns `access_token`)
- GET / - Get all (admin only)
- GET /:id - Get user
- PUT /:id - Update profile
- DELETE /:id - Delete user
- POST /:id/profile-image - Upload profile picture

### Projects (/api/projects)
- POST / - Create project (coordinator/admin)
- GET / - Get all
- GET /:id - Get details
- PUT /:id - Update (coordinator/admin)
- DELETE /:id - Delete (admin)
- POST /:id/register - Sign up
- POST /:id/unregister - Unregister
- GET /:id/volunteers - List volunteers

### Reviews (/api/reviews)
- POST / - Create review (requires auth)
- GET / - Get all
- PUT /:id - Update (requires auth)
- DELETE /:id - Delete (requires auth)

### Categories (/api/categories)
- POST / - Create category (admin/coordinator)
- GET / - Get all
- PUT /:id - Update
- DELETE /:id - Delete

### Contacts (/api/contacts)
- POST / - Create contact (public)
- GET / - Get all (admin only)
- GET /:id - Get details
- PUT /:id - Update
- DELETE /:id - Delete

### Session (/api/session)
- POST /login - Login with email/password
- POST /logout - Logout

---

## Accessing Swagger UI

### Development:
```
http://localhost:8080/api-docs
```

### Production:
```
http://209.97.187.131:8080/api-docs
```

### UI Features:

- Exploration - View all endpoints grouped by tag
- Testing - Test each endpoint directly
- Models - See response structure
- Authentication - "Authorize" button to add JWT token
- Code - Generate code in multiple languages

---

## Lifecycle

### 1. Development
Write JSDoc comments in routes:
```javascript
/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews
 */
```

### 2. Processing
swagger-jsdoc reads comments and generates OpenAPI specification

### 3. Visualization
swagger-ui-express renders the interactive interface

### 4. Testing
Developers use Swagger UI to test endpoints

---

## How to Add Documentation to a New Endpoint

### Step 1: Write JSDoc comment in the route

```javascript
/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.delete("/:id", authMiddleware, reviewsController.deleteReview);
```

### Step 2: Update schemas in swagger.js (if necessary)

```javascript
Review: {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    content: { type: 'string' }
    // ... more properties
  }
}
```

### Step 3: Verify in Swagger UI

Reload `http://localhost:8080/api-docs` and search for your endpoint

---

## Troubleshooting

### Endpoint does not appear in Swagger UI
- Verify that the route file is listed in swagger.js -> apis
- Confirm that the @swagger comment is valid

### Response schema not displayed
- Use `$ref: '#/components/schemas/SchemaName'`
- Verify that the schema is defined in swagger.js

### JWT token not working in UI
- Click on "Authorize" (top right)
- Paste the token without "Bearer " (JWT only)
- Click "Authorize"

---

## Useful References

- OpenAPI 3.0 Spec: https://spec.openapis.org/oas/v3.0.3
- swagger-jsdoc Docs: https://github.com/Surnet/swagger-jsdoc
- swagger-ui-express Docs: https://github.com/scottie1984/swagger-ui-express

---

## Documentation Status in AWTC

| Module | Status | Endpoints |
|--------|--------|-----------|
| Users | Documented | 7 |
| Projects | Documented | 9 |
| Reviews | Documented | 4 |
| Categories | Documented | 4 |
| Contacts | Documented | 5 |
| Session | Documented | 2 |
| Total | Complete | 31 |

API Documentation Complete and Ready for Production
