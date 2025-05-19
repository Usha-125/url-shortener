const express = require('express');
const app = express();
const PORT = 3000;

// Home route
app.get('/', (req, res) => {
  res.send('URL Shortener Home');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
