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

// Seed data if empty
function seedIfEmpty() {
  const db = readDB();
  if (db.products.length === 0) {
    db.products = [
    {
        "id": "seed-1",
        "title": "Wireless Headphones",
        "description": "Sample description for Wireless Headphones. This is test data for the flaky test detection research study.",
        "category": "Electronics",
        "createdAt": "2026-07-21T00:21:18.629Z",
        "status": "in-stock",
        "name": "Wireless Headphones",
        "sku": "SKU-1000",
        "quantity": "12",
        "price": "226.27",
        "supplier": "Supplier 1"
    },
    {
        "id": "seed-2",
        "title": "Office Chair",
        "description": "Sample description for Office Chair. This is test data for the flaky test detection research study.",
        "category": "Clothing",
        "createdAt": "2026-07-20T00:21:18.629Z",
        "status": "low-stock",
        "name": "Office Chair",
        "sku": "SKU-1001",
        "quantity": "11",
        "price": "394.53",
        "supplier": "Supplier 2"
    },
    {
        "id": "seed-3",
        "title": "Laptop Stand",
        "description": "Sample description for Laptop Stand. This is test data for the flaky test detection research study.",
        "category": "Food",
        "createdAt": "2026-07-19T00:21:18.629Z",
        "status": "out-of-stock",
        "name": "Laptop Stand",
        "sku": "SKU-1002",
        "quantity": "44",
        "price": "298.36",
        "supplier": "Supplier 3"
    },
    {
        "id": "seed-4",
        "title": "Mechanical Keyboard",
        "description": "Sample description for Mechanical Keyboard. This is test data for the flaky test detection research study.",
        "category": "Tools",
        "createdAt": "2026-07-18T00:21:18.629Z",
        "status": "in-stock",
        "name": "Mechanical Keyboard",
        "sku": "SKU-1003",
        "quantity": "3",
        "price": "71.27",
        "supplier": "Supplier 1"
    },
    {
        "id": "seed-5",
        "title": "USB Hub",
        "description": "Sample description for USB Hub. This is test data for the flaky test detection research study.",
        "category": "Office",
        "createdAt": "2026-07-17T00:21:18.629Z",
        "status": "low-stock",
        "name": "USB Hub",
        "sku": "SKU-1004",
        "quantity": "44",
        "price": "61.75",
        "supplier": "Supplier 2"
    },
    {
        "id": "seed-6",
        "title": "Monitor 27\"",
        "description": "Sample description for Monitor 27\". This is test data for the flaky test detection research study.",
        "category": "Electronics",
        "createdAt": "2026-07-16T00:21:18.629Z",
        "status": "out-of-stock",
        "name": "Monitor 27\"",
        "sku": "SKU-1005",
        "quantity": "39",
        "price": "124.15",
        "supplier": "Supplier 3"
    },
    {
        "id": "seed-7",
        "title": "Webcam HD",
        "description": "Sample description for Webcam HD. This is test data for the flaky test detection research study.",
        "category": "Clothing",
        "createdAt": "2026-07-15T00:21:18.630Z",
        "status": "in-stock",
        "name": "Webcam HD",
        "sku": "SKU-1006",
        "quantity": "61",
        "price": "323.43",
        "supplier": "Supplier 1"
    },
    {
        "id": "seed-8",
        "title": "Standing Desk",
        "description": "Sample description for Standing Desk. This is test data for the flaky test detection research study.",
        "category": "Food",
        "createdAt": "2026-07-14T00:21:18.630Z",
        "status": "low-stock",
        "name": "Standing Desk",
        "sku": "SKU-1007",
        "quantity": "55",
        "price": "140.21",
        "supplier": "Supplier 2"
    },
    {
        "id": "seed-9",
        "title": "Desk Lamp",
        "description": "Sample description for Desk Lamp. This is test data for the flaky test detection research study.",
        "category": "Tools",
        "createdAt": "2026-07-13T00:21:18.630Z",
        "status": "out-of-stock",
        "name": "Desk Lamp",
        "sku": "SKU-1008",
        "quantity": "79",
        "price": "289.01",
        "supplier": "Supplier 3"
    },
    {
        "id": "seed-10",
        "title": "Mouse Pad",
        "description": "Sample description for Mouse Pad. This is test data for the flaky test detection research study.",
        "category": "Office",
        "createdAt": "2026-07-12T00:21:18.630Z",
        "status": "in-stock",
        "name": "Mouse Pad",
        "sku": "SKU-1009",
        "quantity": "36",
        "price": "26.14",
        "supplier": "Supplier 1"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all
app.get('/api/products', (req, res) => {
  const db = readDB();
  let items = db.products;
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    items = items.filter(i => i.title && i.title.toLowerCase().includes(q) || (i.name && i.name.toLowerCase().includes(q)));
  }
  if (req.query.category) {
    items = items.filter(i => i.category === req.query.category);
  }
  res.json(items);
});

// GET one
app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const item = db.products.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create
app.post('/api/products', (req, res) => {
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
app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Inventory System' }));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Inventory System server running on http://localhost:3008'));
