const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const PORT = 3000;

const dataFilePath = path.join(__dirname, 'data.json');

// ✅ Use single declaration
let urlDatabase = {};

// ✅ Load from file when server starts
if (fs.existsSync(dataFilePath)) {
  const data = fs.readFileSync(dataFilePath);
  urlDatabase = JSON.parse(data);
}

// Middleware
app.use(express.json()); // To parse JSON body
app.use(express.static('views')); // Serve static files like index.html

// Generate a short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Handle POST request to shorten URL
app.post('/shorten', (req, res) => {
  const { longUrl } = req.body;
  const shortCode = generateShortCode();
  urlDatabase[shortCode] = { longUrl, clicks: 0 };

  // Save to JSON file
  fs.writeFileSync(dataFilePath, JSON.stringify(urlDatabase, null, 2));

  res.json({ shortUrl: `http://localhost:${PORT}/${shortCode}` });
});

// Handle redirect when user visits short URL
app.get('/:shortCode', (req, res) => {
  const record = urlDatabase[req.params.shortCode];

  if (record) {
    record.clicks += 1;

    // Save updated click count
    fs.writeFileSync(dataFilePath, JSON.stringify(urlDatabase, null, 2));

    res.redirect(record.longUrl);
  } else {
    res.status(404).send('❌ Short URL not found');
  }
});

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
