// frontend/index.js
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, 'dist');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
