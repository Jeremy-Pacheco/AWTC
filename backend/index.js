const express = require('express');
const app = express();
const projectRoutes = require('./routes/project.routes');
const reviewRoutes = require('./routes/reviews.routes');
const categoryRoutes = require('./routes/category.routes');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./models');

db.sequelize.sync({ force: false }).then(() => {
    console.log('Database updated without dropping data!');
}).catch((err) => {
    console.log('Error: ' + err.message);
});


app.use(express.json());
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);

const path = require('path');

// Servir frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
