const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./models');

db.sequelize.sync({ force: false }).then(() => {
    console.log('Database updated without dropping data!');
}).catch((err) => {
    console.log('Error: ' + err.message);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
