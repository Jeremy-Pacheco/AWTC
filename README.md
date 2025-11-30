# 🌱 AWTC Volunteer Web App

A web application to manage volunteer projects, allowing volunteers to register, sign up for projects, access resources, and communicate with coordinators.
The application is designed to be cross-platform, responsive, and accessible, with full CRUD functionalities.

**Status**: Backend is fully functional with CRUD operations for projects, categories, reviews, users, and contacts. Frontend is built in React + TypeScript with responsive UI and connects with backend APIs.

---

## 📝 Scope & Features

### Users & Roles

#### Volunteers
- Register and log in
- Edit profile with profile image
- Sign up for projects
- Access resources
- Leave reviews and comments
- View project details and volunteer opportunities

#### Coordinators
- Create, edit, and delete projects
- Manage project enrollments and volunteer status
- Add resources and project images
- Moderate reviews and comments
- View volunteer statistics

#### Admin
- Complete system management
- User role management
- Project and category oversight
- Contact and review moderation
- Dashboard access

---

## ✅ Fully Implemented Features
- **User Management**: Registration, login, profile editing with image upload, password hashing (bcrypt)
- **Project Management**: Full CRUD for projects with categories, descriptions, dates, locations, and images
- **Project Enrollments**: Users can enroll/volunteer for projects with status tracking (pending, accepted, rejected, completed)
- **Reviews & Ratings**: Users can leave reviews with images for completed projects
- **Categories**: Full CRUD for project categorization
- **Contact Management**: CRUD for contact submissions
- **User Bans**: System to ban users from specific projects
- **Dashboard**: Admin dashboard with statistics and data overview
- **API Documentation**: Swagger/OpenAPI documentation at `/api-docs`
- **Session Management**: Express session with secure cookies
- **Authentication**: JWT and session-based authentication with role middleware
- **File Uploads**: Multer integration for profile images and project/review images

---

## 📈 Planned Features (Future)
- Advanced search and filtering (by name, category, date, accessibility)
- Volunteer hours tracking and certificates
- Email notifications and reminders
- Advanced dashboards with charts and analytics
- Resource library per project
- Chat/messaging system

---

## ⚡ Technologies

### Frontend
- **React** 19.1.1 with TypeScript
- **React Router** 7.9.5 for navigation
- **Vite** 7.1.7 for fast development and building
- **Tailwind CSS** 4.1.16 for styling
- **Framer Motion** 12.23.24 for animations
- **GSAP** 3.13.0 for advanced animations
- **Axios** (via API module) for HTTP requests
- **FontAwesome & Heroicons** for icons

### Backend
- **Node.js** with Express 5.1.0
- **Sequelize** 6.37.7 ORM for MySQL
- **MySQL2** 3.15.3 database driver
- **JWT** (jsonwebtoken 9.0.2) for token-based authentication
- **Bcrypt** 6.0.0 for password hashing
- **Multer** 2.0.2 for file uploads
- **Express Session** 1.18.2 for session management
- **Swagger** (swagger-jsdoc, swagger-ui-express) for API documentation
- **CORS** 2.8.5 for cross-origin requests
- **Dotenv** 16.4.5 for environment configuration
- **Nodemon** 3.1.10 for development auto-reload

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- MySQL (v5.7+ or v8.0)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
npm install
```

2. Configure environment and database:
   - Create `.env.development` file in backend folder with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=awtc_db
DB_PORT=3306
NODE_ENV=development
PORT=8080
SESSION_SECRET=your_session_secret
```
   - Update `config/config.json` with your MySQL credentials

3. Run migrations and seeders:
```bash
npm run migrate
npm run seed
```

4. Start the server:
```bash
npm run dev    # Development mode with nodemon
npm start      # Production mode
```

Server runs at: **http://localhost:8080/**
- API Documentation: http://localhost:8080/api-docs
- Dashboard: http://localhost:8080/ (requires login)

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd ../frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173/**

3. Build for production:
```bash
npm run build
```

**Important**: Make sure the backend server is running on port 8080 so the frontend can fetch data from the API.

### Default Credentials
After running seeders, an admin user is automatically created:
- **Email**: admin@awtc.com
- **Password**: adminawtc1234

---

## 📂 Project Structure

```
AWTC/
├── backend/
│   ├── config/                          # Configuration files
│   │   ├── config.json                 # Database config
│   │   ├── db.config.js                # Sequelize connection
│   │   ├── initAdmin.js                # Initial admin setup
│   │   └── sequelize.config.js         # Sequelize CLI config
│   ├── controllers/                     # Request handlers
│   │   ├── project.controller.js
│   │   ├── category.controller.js
│   │   ├── reviews.controller.js
│   │   ├── user.controller.js
│   │   ├── contact.controller.js
│   │   └── session.controller.js
│   ├── middlewares/                     # Express middlewares
│   │   ├── auth.middlewares.js         # JWT/Bearer auth
│   │   ├── requireAuth.js              # Session check
│   │   └── role.middlewares.js         # Role-based access
│   ├── models/                          # Sequelize models
│   │   ├── project.js
│   │   ├── category.js
│   │   ├── reviews.js
│   │   ├── user.js
│   │   ├── contact.js
│   │   ├── userproject.js
│   │   └── userprojectban.js
│   ├── migrations/                      # Database migrations
│   ├── seeders/                         # Initial data seeders
│   ├── routes/                          # API routes
│   ├── multer/                          # File upload config
│   ├── public/images/                   # Uploaded files
│   ├── views/                           # EJS templates (dashboard)
│   ├── utils/                           # Utility functions
│   ├── swagger.js                       # OpenAPI documentation
│   ├── index.js                         # Main server file
│   ├── package.json
│   └── .env.development                 # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/                  # React components
    │   │   ├── NavBar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Projects.tsx
    │   │   ├── Categories.tsx
    │   │   ├── VolunteerList.tsx
    │   │   ├── AuthModal.tsx
    │   │   ├── AlertModal.tsx
    │   │   ├── ConfirmModal.tsx
    │   │   └── ...
    │   ├── pages/                       # Page components
    │   │   ├── Home.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── AboutUs.tsx
    │   │   ├── Volunteering.tsx
    │   │   ├── MoreInfo.tsx
    │   │   ├── Privacy.tsx
    │   │   └── Terms.tsx
    │   ├── assets/                      # Static assets
    │   ├── api.ts                       # API client (Axios)
    │   ├── App.tsx                      # Main app component
    │   ├── main.tsx                     # Entry point
    │   └── index.css                    # Global styles
    ├── public/
    │   └── aboutUs/                     # Public assets
    ├── dist/                            # Built production files
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    └── README.md
```

---

## 📌 API Endpoints

### Authentication
- `POST /login` – User login (session-based)
- `POST /logout` – User logout
- `POST /api/users/signup` – User registration

### Projects
- `GET /api/projects` – Get all projects with filtering
- `GET /api/projects/:id` – Get project by ID
- `POST /api/projects` – Create project (Coordinator/Admin)
- `PUT /api/projects/:id` – Update project (Coordinator/Admin)
- `DELETE /api/projects/:id` – Delete project (Coordinator/Admin)

### Categories
- `GET /api/categories` – Get all categories
- `GET /api/categories/:id` – Get category by ID
- `POST /api/categories` – Create category (Coordinator/Admin)
- `PUT /api/categories/:id` – Update category (Coordinator/Admin)
- `DELETE /api/categories/:id` – Delete category (Coordinator/Admin)

### Reviews
- `GET /api/reviews` – Get all reviews
- `GET /api/reviews/:id` – Get review by ID
- `POST /api/reviews` – Create review (Volunteer)
- `PUT /api/reviews/:id` – Update review (Coordinator/Admin)
- `DELETE /api/reviews/:id` – Delete review (Coordinator/Admin)

### Users
- `GET /api/users` – Get all users (Admin)
- `GET /api/users/:id` – Get user by ID
- `POST /api/users` – Create user
- `PUT /api/users/:id` – Update user profile
- `PUT /api/users/:id/role` – Update user role (Admin)
- `DELETE /api/users/:id` – Delete user (Admin)

### Contacts
- `GET /api/contacts` – Get all contacts (Admin)
- `POST /api/contacts` – Create contact form submission
- `DELETE /api/contacts/:id` – Delete contact (Admin)

### Volunteering
- `GET /api/projects/:id/volunteers` – Get project volunteers
- `POST /api/projects/:id/volunteer` – Enroll in project
- `PUT /api/projects/:id/volunteer/:userId` – Update volunteer status
- `DELETE /api/projects/:id/volunteer/:userId` – Remove volunteer

### Dashboard (EJS Views)
- `GET /` – Dashboard overview (requires login)
- `GET /projects` – Projects management
- `GET /users` – Users management
- `GET /reviews` – Reviews management
- `GET /contacts` – Contacts management
- `GET /login` – Login page
- `GET /debug-models` – Model debugging endpoint (development only)
---

## ⚠️ Important Notes

### Database
- Backend uses **Sequelize ORM** with **MySQL**
- Migrations manage schema changes automatically
- Seeders populate initial data (categories, projects, admin user)
- Always run migrations before starting the app for the first time

### Authentication
- **Session-based** authentication for EJS views (dashboard)
- **JWT + Bearer tokens** for API endpoints
- Role-based access control: `Admin`, `Coordinator`, `Volunteer`
- Passwords are hashed with bcrypt for security

### File Uploads
- Profile images stored in `backend/public/images/`
- Project and review images also stored in the same directory
- Multer configured for secure file handling

### Frontend
- Built with **React 19** and **TypeScript** for type safety
- Uses **Vite** for fast development and production builds
- **Tailwind CSS** for responsive design
- **React Router** for page navigation
- All components in `/frontend/src/components/` and `/frontend/src/pages/`

### CORS Configuration
- Allowed origins configured in backend/index.js
- Default: localhost:5173, localhost:8080, and production URLs
- Add new URLs if deploying to different servers

### Backend Scripts
```bash
npm run dev          # Start with nodemon (development)
npm start            # Start production server
npm run migrate      # Run pending migrations
npm run seed         # Seed database with initial data
npm run migrate:prod # Migrate in production environment
npm run seed:prod    # Seed in production environment
```

### Frontend Scripts
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
```
---

## 📈 Diagrams

### E/R Diagram

![](/readme-img/ERD.png)

### Class Diagram

![](/readme-img/class-diagram.png)

### Use Case Diagram

![](/readme-img/use-case-diagram.png)

---

## 🔗 Useful Links

- **GitHub Repository**: [Jeremy-Pacheco/AWTC](https://github.com/Jeremy-Pacheco/AWTC)
- **GitHub Project Board**: [Project Planning](https://github.com/users/Jeremy-Pacheco/projects/2)
- **API Documentation**: [Postman Collection](https://documenter.getpostman.com/view/49651382/2sB3WpQ1PH)
- **Design Mockups**: [Figma Design](https://www.figma.com/design/vjAlUkbNwIuZIhn4Y4IYlx/AWillToChange?node-id=3-195&t=TTOPEcQyHpJGTaGN-1)

---

## 🚢 Deployment

### Frontend Deployment (Digital Ocean)
- **Production URL**: [http://209.97.187.131:5173/](http://209.97.187.131:5173/)
- **Hosted on**: DigitalOcean VPS