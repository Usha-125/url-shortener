const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to serve static files (like CSS, JS, images) from 'views' folder
app.use(express.static('views'));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Home route - serves index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
