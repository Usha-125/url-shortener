const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;
const dataFilePath = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for CSS or client JS if any)
app.use(express.static(path.join(__dirname, 'public')));

// Serve views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Load or initialize DB
let urlDatabase = {};
if (fs.existsSync(dataFilePath)) {
  urlDatabase = JSON.parse(fs.readFileSync(dataFilePath));
}

// API: GET all URLs
app.get('/urls', (req, res) => {
  res.json(urlDatabase);
});

// API: POST create a short URL
app.post('/urls', (req, res) => {
  const { shortCode, longUrl } = req.body;
  if (!shortCode || !longUrl) {
    return res.status(400).json({ error: 'Both shortCode and longUrl are required' });
  }
  if (urlDatabase[shortCode]) {
    return res.status(409).json({ error: 'Short code already exists' });
  }
  urlDatabase[shortCode] = { longUrl, clicks: 0 };
  fs.writeFileSync(dataFilePath, JSON.stringify(urlDatabase, null, 2));
  res.status(201).json({ message: 'Short URL created' });
});

// API: DELETE a short URL
app.delete('/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  if (urlDatabase[shortCode]) {
    delete urlDatabase[shortCode];
    fs.writeFileSync(dataFilePath, JSON.stringify(urlDatabase, null, 2));
    res.json({ message: 'Deleted successfully' });
  } else {
    res.status(404).json({ error: 'Short URL not found' });
  }
});

// API: PUT update a short URL or code
app.put('/urls/:shortCode', (req, res) => {
  const oldCode = req.params.shortCode;
  const { newCode, newLongUrl } = req.body;

  if (!urlDatabase[oldCode]) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  if (newCode && newCode !== oldCode && urlDatabase[newCode]) {
    return res.status(409).json({ error: 'New short code already taken' });
  }

  const clicks = urlDatabase[oldCode].clicks;
  delete urlDatabase[oldCode];

  urlDatabase[newCode || oldCode] = {
    longUrl: newLongUrl || urlDatabase[oldCode].longUrl,
    clicks
  };

  fs.writeFileSync(dataFilePath, JSON.stringify(urlDatabase, null, 2));
  res.json({ message: 'Updated successfully' });
});

// Redirect route for short URLs (optional, you can skip)
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const urlEntry = urlDatabase[shortCode];
  if (urlEntry) {
    urlEntry.clicks++;
    fs.writeFileSync(dataFilePath, JSON.stringify(urlDatabase, null, 2));
    res.redirect(urlEntry.longUrl);
  } else {
    res.status(404).send('Short URL not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
