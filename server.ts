import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("data/fridge.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    vendor_type TEXT CHECK(vendor_type IN ('street', 'supermarket')) DEFAULT 'street',
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_at DATETIME,
    zone TEXT DEFAULT 'middle',
    pos_x REAL,
    pos_y REAL,
    status TEXT DEFAULT 'fresh'
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES items(id)
  );

  CREATE TABLE IF NOT EXISTS federated_nodes (
    id TEXT PRIMARY KEY,
    location TEXT,
    last_sync DATETIME,
    contribution_count INTEGER DEFAULT 0
  );
`);

// Seed initial data if empty
const itemCount = db.prepare("SELECT COUNT(*) as count FROM items").get() as { count: number };
if (itemCount.count === 0) {
  const insert = db.prepare("INSERT INTO items (name, category, vendor_type, zone, expiry_at) VALUES (?, ?, ?, ?, ?)");
  const now = new Date();
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  insert.run("Tomato", "Vegetable", "street", "front", threeDays);
  insert.run("Milk", "Dairy", "supermarket", "back", threeDays);
  insert.run("Apple", "Fruit", "supermarket", "middle", sevenDays);

  const seedNodes = db.prepare("INSERT INTO federated_nodes (id, location, last_sync, contribution_count) VALUES (?, ?, ?, ?)");
  seedNodes.run("node_chennai", "Chennai", new Date().toISOString(), 142);
  seedNodes.run("node_trichy", "Trichy", new Date().toISOString(), 89);
  seedNodes.run("node_madurai", "Madurai", new Date().toISOString(), 115);
  seedNodes.run("node_coimbatore", "Coimbatore", new Date().toISOString(), 97);
  seedNodes.run("node_lalgudi", "Lalgudi", new Date().toISOString(), 64);
}

function calculateExpiry(category: string, zone: string, vendorType: string) {
  const baseDays: Record<string, number> = {
    'Vegetable': 5,
    'Fruit': 7,
    'Dairy': 4,
    'Greens': 3,
    'Meat': 2,
    'Bakery': 3
  };
  const base = baseDays[category] || 5;

  const zoneModifiers: Record<string, number> = {
    'front': -1,
    'middle': 0,
    'back': 2
  };
  const zoneMod = zoneModifiers[zone] || 0;

  const vendorMod = vendorType === 'street' ? -1 : 0;

  // Humidity penalty for Tamil Nadu (simulated)
  const humidityPenalty = -1;

  return Math.max(1, base + zoneMod + vendorMod + humidityPenalty);
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/items", (req, res) => {
    const items = db.prepare("SELECT * FROM items ORDER BY expiry_at ASC").all();
    res.json(items);
  });

  app.post("/api/items", (req, res) => {
    const { name, category, vendor_type, zone } = req.body;
    const days = calculateExpiry(category, zone, vendor_type);
    const expiry_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const status = days <= 1 ? "expiring soon" : "fresh";

    const info = db.prepare("INSERT INTO items (name, category, vendor_type, zone, expiry_at, status) VALUES (?, ?, ?, ?, ?, ?)")
      .run(name, category, vendor_type, zone, expiry_at, status);
    res.json({ id: info.lastInsertRowid });
  });

  // Mock data for new features
  let shoppingList: any[] = [];
  let communityBoard: any[] = [
    { id: 'comm-1', name: 'Tomatoes (5 nos)', donor_id: 'Node-44', expiry_at: new Date(Date.now() + 86400000 * 2).toISOString(), location: 'T. Nagar, Chennai' },
    { id: 'comm-2', name: 'Drumsticks', donor_id: 'Node-12', expiry_at: new Date(Date.now() + 86400000 * 3).toISOString(), location: 'Adyar, Chennai' }
  ];

  app.delete("/api/items/:id", (req, res) => {
    const item = db.prepare("SELECT name, category FROM items WHERE id = ?").get(req.params.id) as any;
    if (item) {
      shoppingList.push({ id: `shop-${Date.now()}`, name: item.name, category: item.category, priority: 'medium' });
    }
    db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Shopping List
  app.get("/api/shopping", (req, res) => res.json(shoppingList));

  app.post("/api/shopping/sync-expired", (req, res) => {
    const now = new Date().toISOString();
    const expiredItems = db.prepare("SELECT * FROM items WHERE expiry_at < ?").all(now) as any[];

    expiredItems.forEach(item => {
      // Check if already in shopping list to avoid duplicates
      const exists = shoppingList.find(s => s.name.toLowerCase() === item.name.toLowerCase());
      if (!exists) {
        shoppingList.push({
          id: `shop-exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: item.name,
          category: item.category,
          priority: 'high'
        });
      }
    });

    if (expiredItems.length > 0) {
      db.prepare("DELETE FROM items WHERE expiry_at < ?").run(now);
    }

    res.json({ count: expiredItems.length });
  });

  app.delete("/api/shopping/:id", (req, res) => {
    shoppingList = shoppingList.filter(i => String(i.id) !== String(req.params.id));
    res.json({ success: true });
  });

  // Community Board
  app.get("/api/community", (req, res) => res.json(communityBoard));
  app.post("/api/community/share", (req, res) => {
    const { name, expiry_at, location } = req.body;
    const newItem = { id: `comm-user-${Date.now()}`, name, donor_id: 'You', expiry_at, location };
    communityBoard.push(newItem);
    res.json(newItem);
  });

  // Market Trends
  app.get("/api/market", (req, res) => {
    res.json([
      { market: 'Koyambedu', item: 'Tomato', price: '₹40/kg', trend: 'up' },
      { market: 'Koyambedu', item: 'Onion', price: '₹35/kg', trend: 'down' },
      { market: 'Uzhavar Sandhai', item: 'Brinjal', price: '₹25/kg', trend: 'stable' },
      { market: 'Uzhavar Sandhai', item: 'Ladies Finger', price: '₹30/kg', trend: 'up' }
    ]);
  });

  // Weather/Humidity Alerts (Simulated)
  app.get("/api/weather", (req, res) => {
    res.json({
      location: "Chennai",
      humidity: 92,
      alert: "High Humidity Alert: Coastal moisture levels are peaking. Fungal risk increased for street-vendor greens.",
      recommendation: "Move all leafy greens to the 'Back' zone for maximum airflow."
    });
  });

  app.patch("/api/items/:id/zone", (req, res) => {
    const { zone } = req.body;
    const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id) as any;
    if (item) {
      const days = calculateExpiry(item.category, zone, item.vendor_type);
      const expiry_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const status = days <= 1 ? "expiring soon" : "fresh";

      db.prepare("UPDATE items SET zone = ?, expiry_at = ?, status = ? WHERE id = ?")
        .run(zone, expiry_at, status, req.params.id);
    }
    res.json({ success: true });
  });

  app.get("/api/federated/status", (req, res) => {
    const nodes = db.prepare("SELECT * FROM federated_nodes").all();
    res.json(nodes);
  });

  // Proxy for Causal Prediction (Python Backend)
  app.get("/api/predict/:id", async (req, res) => {
    const { id } = req.params;
    const { target_zone } = req.query;
    try {
      const response = await fetch(`http://localhost:8000/predict/${id}?target_zone=${target_zone}`);
      if (!response.ok) throw new Error(`Python backend error: ${response.statusText}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn("Causal prediction proxy failed:", error);
      res.status(503).json({ error: "Causal engine unreachable" });
    }
  });

  app.get("/api/impact", async (req, res) => {
    try {
      const response = await fetch("http://localhost:8000/api/impact");
      if (!response.ok) throw new Error(`Python backend error: ${response.statusText}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn("Impact proxy failed:", error);
      res.status(503).json({ error: "Impact service unreachable" });
    }
  });

  app.get("/api/forecast", async (req, res) => {
    try {
      const response = await fetch("http://localhost:8000/api/forecast");
      if (!response.ok) throw new Error(`Python backend error: ${response.statusText}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn("Forecast proxy failed:", error);
      res.status(503).json({ error: "Forecast service unreachable" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
