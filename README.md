# 🌱 AWTC Volunteer Web App

A web application to manage volunteer projects, allowing volunteers to register, sign up for projects, access resources, and communicate with coordinators.
The application is designed to be cross-platform, responsive, and accessible, with full CRUD functionalities.

Currently, the backend is functional with CRUD for projects, categories and reviews. The frontend is built in React and connects with the backend APIs.

---

## 📝 Scope & Features

# Users & Roles

### Volunteers
- Register and log in
- Edit profile
- Sign up for projects
- Access resources
- Leave comments

### Coordinators
- Create, edit, and delete projects
- Manage project enrollments
- Add resources
- Moderate comments

---

## Main Functionalities (Planned)
- User Management: Registration, login, profile editing, password recovery
- Project Management: Full CRUD for projects (name, description, dates, location, accessibility)
- Project Enrollments: Create, approve, reject, or complete enrollments
- Resource Management: Add documents, images, or videos related to projects
- Comments & Feedback: CRUD comments per project
- Filters & Search: Search by name, category, date, or accessibility
- Statistics & Dashboards: Number of enrolled volunteers, active projects, volunteer hours

---

## Implemented (Current State)
- Backend with CRUD for projects and categories
- Database configured with MySQL and Sequelize
- Seeders with example data
- RESTful API endpoints:
    - Projects: GET, POST, PUT /:id, DELETE /:id
    - Categories: GET, POST, PUT /:id, DELETE /:id
    - Reviews: GET, POST, PUT /:id, DELETE /:id

- Frontend in React (setup ready, connects to backend APIs)

---

## ⚡ Technologies

### Frontend
- React
- React Router
- Axios for API calls
- Tailwind CSS (or another UI library)

### Backend
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- Sequelize CLI for migrations and seeders

---

## 🚀 Getting Started

### Backend

1. Navigate to backend folder:
```bash
cd backend
npm install
```

2. Configure MySQL credentials in config/config.json

3. Run migrations and seeders:
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

4. Start the server:
```bash
node index.js
```

Server runs at: http://localhost:8080/

### Frontend

Navigate to frontend folder:
```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: http://localhost:5173/
Make sure the backend server is running so the frontend can fetch data.

---

## 📂 Project Structure
```bash
awtc/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── migrations/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   └── index.js
│
└── frontend/
    ├── public/
    ├── dist/
    ├── src/
    │   ├── components/
    │   └── pages/
    └── package.json
```

---

## 📌 API Endpoints (Current)

### Projects
- GET /api/projects – Get all projects
- POST /api/projects – Create a project
- PUT /api/projects/:id – Update a project
- DELETE /api/projects/:id – Delete a project

### Categories
- GET /api/categories – Get all categories
- POST /api/categories – Create a category
- PUT /api/categories/:id – Update a category
- DELETE /api/categories/:id – Delete a category

### Reviews
- GET /api/reviews – Get all reviews
- POST /api/reviews – Create a review
- PUT /api/reviews/:id – Update a review
- DELETE /api/reviews/:id – Delete a review

---

## ⚠️ Notes
- Backend is fully functional for projects, categories and reviews.
- Frontend is set up to connect with backend APIs.
- Additional features (user authentication, project enrollments, resources, comments, dashboards) are planned but not implemented yet.

---

## 📈 Diagrams

### E/R Diagram

![](https://github.com/Jeremy-Pacheco/AWTC/blob/develop/readme-img/ERD.png)

### Class Diagram

![](https://github.com/Jeremy-Pacheco/AWTC/blob/develop/readme-img/class-diagram.png)

### Use Case Diagram

![](https://github.com/Jeremy-Pacheco/AWTC/blob/develop/readme-img/use-case-diagram.png)

---

## 🔗 Useful Links

[GitHub Project](https://github.com/users/Jeremy-Pacheco/projects/2)

[Postman Workspace / Collection](https://documenter.getpostman.com/view/49651382/2sB3WpQ1PH)

[Figma](https://www.figma.com/design/vjAlUkbNwIuZIhn4Y4IYlx/AWillToChange?node-id=3-195&t=TTOPEcQyHpJGTaGN-1)

---

## Backend deployment

[Deployment of projects](https://awtc-production.up.railway.app/api/projects)

[Deployment of reviews](https://awtc-production.up.railway.app/api/reviews)

[Deployment of category](https://awtc-production.up.railway.app/api/categories)

---

## Frontend deployment 

[Deployment](https://awtc.netlify.app/)
