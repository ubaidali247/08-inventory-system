const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3008;
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ============================================================
// FLAKINESS INJECTION LAYER
// Controls which endpoints behave unreliably and how often
// Used for: MSc Dissertation - AI-Assisted Flaky Test Detection
// ============================================================
const FLAKY_CONFIG = {
  enabled: true,
  slowEndpoints: ['/api/products', '/api/products/:id'],  // GET endpoints that randomly slow down
  errorEndpoints: ['/api/products'],                       // POST endpoint that randomly errors
  slowProbability: 0.35,    // 35% chance of slow response
  errorProbability: 0.25,   // 25% chance of server error on POST
  slowDelayMs: {
    min: 3000,
    max: 8000
  }
};

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldBeFlaky(probability) {
  return FLAKY_CONFIG.enabled && Math.random() < probability;
}

// Flakiness middleware for GET /api/products
function flakyGetMiddleware(req, res, next) {
  if (shouldBeFlaky(FLAKY_CONFIG.slowProbability)) {
    const delay = randomDelay(FLAKY_CONFIG.slowDelayMs.min, FLAKY_CONFIG.slowDelayMs.max);
    console.log(`[FLAKY] Injecting ${delay}ms delay on GET /api/products`);
    setTimeout(next, delay);
  } else {
    next();
  }
}

// ============================================================

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { products: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function seedIfEmpty() {
  const db = readDB();
  if (db.products.length === 0) {
    db.products = [
    {
        "id": "seed-1",
        "title": "Wireless Headphones",
        "description": "Sample description for research study item 1.",
        "category": "Electronics",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "sku": "SKU-1000",
        "quantity": "10",
        "price": "9.99",
        "supplier": "Supplier 1",
        "status": "in-stock"
    },
    {
        "id": "seed-2",
        "title": "Office Chair",
        "description": "Sample description for research study item 2.",
        "category": "Clothing",
        "createdAt": "2024-02-02T10:00:00.000Z",
        "sku": "SKU-1001",
        "quantity": "15",
        "price": "19.99",
        "supplier": "Supplier 2",
        "status": "in-stock"
    },
    {
        "id": "seed-3",
        "title": "Laptop Stand",
        "description": "Sample description for research study item 3.",
        "category": "Food",
        "createdAt": "2024-03-03T10:00:00.000Z",
        "sku": "SKU-1002",
        "quantity": "20",
        "price": "29.99",
        "supplier": "Supplier 3",
        "status": "in-stock"
    },
    {
        "id": "seed-4",
        "title": "Mechanical Keyboard",
        "description": "Sample description for research study item 4.",
        "category": "Tools",
        "createdAt": "2024-04-04T10:00:00.000Z",
        "sku": "SKU-1003",
        "quantity": "25",
        "price": "39.99",
        "supplier": "Supplier 1",
        "status": "in-stock"
    },
    {
        "id": "seed-5",
        "title": "USB Hub",
        "description": "Sample description for research study item 5.",
        "category": "Electronics",
        "createdAt": "2024-05-05T10:00:00.000Z",
        "sku": "SKU-1004",
        "quantity": "30",
        "price": "49.99",
        "supplier": "Supplier 2",
        "status": "in-stock"
    },
    {
        "id": "seed-6",
        "title": "Monitor 27\"",
        "description": "Sample description for research study item 6.",
        "category": "Clothing",
        "createdAt": "2024-06-06T10:00:00.000Z",
        "sku": "SKU-1005",
        "quantity": "35",
        "price": "59.99",
        "supplier": "Supplier 3",
        "status": "in-stock"
    },
    {
        "id": "seed-7",
        "title": "Webcam HD",
        "description": "Sample description for research study item 7.",
        "category": "Food",
        "createdAt": "2024-07-07T10:00:00.000Z",
        "sku": "SKU-1006",
        "quantity": "40",
        "price": "69.99",
        "supplier": "Supplier 1",
        "status": "in-stock"
    },
    {
        "id": "seed-8",
        "title": "Standing Desk",
        "description": "Sample description for research study item 8.",
        "category": "Tools",
        "createdAt": "2024-08-08T10:00:00.000Z",
        "sku": "SKU-1007",
        "quantity": "45",
        "price": "79.99",
        "supplier": "Supplier 2",
        "status": "in-stock"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all - with flakiness injection
app.get('/api/products', flakyGetMiddleware, (req, res) => {
  const db = readDB();
  let items = db.products;
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    items = items.filter(i => (i.title && i.title.toLowerCase().includes(q)) || (i.name && i.name.toLowerCase().includes(q)));
  }
  if (req.query.category) {
    items = items.filter(i => i.category === req.query.category);
  }
  res.json(items);
});

// GET one - with flakiness injection
app.get('/api/products/:id', (req, res) => {
  if (shouldBeFlaky(FLAKY_CONFIG.slowProbability * 0.5)) {
    const delay = randomDelay(2000, 5000);
    console.log(`[FLAKY] Injecting ${delay}ms delay on GET /api/products/${req.params.id}`);
    setTimeout(() => {
      const db = readDB();
      const item = db.products.find(i => i.id === req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    }, delay);
  } else {
    const db = readDB();
    const item = db.products.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  }
});

// POST create - with flakiness injection (random 500 errors)
app.post('/api/products', (req, res) => {
  if (shouldBeFlaky(FLAKY_CONFIG.errorProbability)) {
    console.log(`[FLAKY] Injecting 500 error on POST /api/products`);
    return res.status(500).json({ error: 'Internal server error - flaky injection' });
  }
  const db = readDB();
  const item = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  db.products.push(item);
  writeDB(db);
  res.status(201).json(item);
});

// PUT update
app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.products[idx] = { ...db.products[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(db);
  res.json(db.products[idx]);
});

// DELETE
app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.products.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Deleted successfully' });
});

// Reset endpoint for testing
app.post('/api/reset', (req, res) => {
  const initial = { products: [] };
  writeDB(initial);
  seedIfEmpty();
  res.json({ message: 'Database reset' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Inventory System', flakyEnabled: FLAKY_CONFIG.enabled }));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Inventory System server running on http://localhost:3008 [FLAKY MODE: ' + FLAKY_CONFIG.enabled + ']'));
