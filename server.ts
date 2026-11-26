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

  CREATE TABLE IF NOT EXISTS shopping_list (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_board (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    donor_id TEXT DEFAULT 'You',
    expiry_at DATETIME,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_requests (
    id TEXT PRIMARY KEY,
    item_needed TEXT NOT NULL,
    requester TEXT NOT NULL,
    location TEXT NOT NULL,
    urgency TEXT DEFAULT 'Urgent',
    reason TEXT,
    status TEXT DEFAULT 'pending',
    fulfilled_by TEXT,
    responder_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_items_expiry ON items(expiry_at, status);
  CREATE INDEX IF NOT EXISTS idx_items_zone ON items(zone);
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

const commCount = db.prepare("SELECT COUNT(*) as count FROM community_board").get() as { count: number };
if (commCount.count === 0) {
  const insertComm = db.prepare("INSERT INTO community_board (id, name, donor_id, expiry_at, location) VALUES (?, ?, ?, ?, ?)");
  insertComm.run('comm-1', 'Tomatoes (5 nos)', 'Node-44', new Date(Date.now() + 86400000 * 2).toISOString(), 'T. Nagar, Chennai');
  insertComm.run('comm-2', 'Drumsticks', 'Node-12', new Date(Date.now() + 86400000 * 3).toISOString(), 'Adyar, Chennai');
}

const reqCount = db.prepare("SELECT COUNT(*) as count FROM community_requests").get() as { count: number };
if (reqCount.count === 0) {
  const insertReq = db.prepare("INSERT INTO community_requests (id, item_needed, requester, location, urgency, reason, status, fulfilled_by, responder_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertReq.run('req-1', '2 Fresh Lemons & Ginger Piece', 'Plot 04 · Adyar (Flat 2B)', 'Adyar, Chennai', 'Urgent (Cooking Now!)', 'Making evening rasam & lemon tea, ran out of lemons!', 'fulfilled', 'Plot 02 · Kotturpuram (Lakshmi)', 'I have extra lemons from my terrace tree! Kept 3 on the shoe rack outside Flat 2B.');
  insertReq.run('req-2', '1 Packet Natural Set Curd (500ml)', 'Plot 01 · Anna Nagar', 'Anna Nagar, Chennai', 'Today', 'Need for dinner curd rice, supermarket delivery got delayed.', 'pending', null, null);
  insertReq.run('req-3', 'Few Stems of Fresh Mint (Pudina)', 'Plot 03 · Besant Nagar', 'Besant Nagar, Chennai', 'Urgent (Cooking Now!)', 'Garnishing biryani, vendor ran out of mint this afternoon.', 'pending', null, null);
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



  app.delete("/api/items/:id", (req, res) => {
    const item = db.prepare("SELECT name, category FROM items WHERE id = ?").get(req.params.id) as any;
    if (item) {
      const shopId = `shop-${Date.now()}`;
      db.prepare("INSERT INTO shopping_list (id, name, category, priority) VALUES (?, ?, ?, ?)")
        .run(shopId, item.name, item.category, 'medium');
    }
    db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Shopping List (SQLite Persisted)
  app.get("/api/shopping", (req, res) => {
    const list = db.prepare("SELECT * FROM shopping_list ORDER BY added_at DESC").all();
    res.json(list);
  });

  app.post("/api/shopping/sync-expired", (req, res) => {
    const now = new Date().toISOString();
    const expiredItems = db.prepare("SELECT * FROM items WHERE expiry_at < ?").all(now) as any[];

    expiredItems.forEach(item => {
      const existing = db.prepare("SELECT id FROM shopping_list WHERE LOWER(name) = LOWER(?)").get(item.name);
      if (!existing) {
        const shopId = `shop-exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        db.prepare("INSERT INTO shopping_list (id, name, category, priority) VALUES (?, ?, ?, ?)")
          .run(shopId, item.name, item.category, 'high');
      }
    });

    if (expiredItems.length > 0) {
      db.prepare("DELETE FROM items WHERE expiry_at < ?").run(now);
    }

    res.json({ count: expiredItems.length });
  });

  app.delete("/api/shopping/:id", (req, res) => {
    db.prepare("DELETE FROM shopping_list WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Causal SCM Graph (DoWhy Chennai Micro-Climate DAG)
  app.get("/api/causal/graph", (req, res) => {
    res.json({
      nodes: [
        {
          id: "humidity",
          label: "Chennai Coastal Humidity (92% RH)",
          type: "confounder",
          description: "High ambient coastal moisture enters during door openings, accelerating bacterial and fungal spore germination on produce surfaces.",
          x: 90,
          y: 60
        },
        {
          id: "ethylene",
          label: "Ethylene Gas Trapping",
          type: "confounder",
          description: "Ripening hormones emitted by climacteric fruits (apples, tomatoes) pool in stagnant shelf micro-zones, inducing premature rotting.",
          x: 90,
          y: 170
        },
        {
          id: "door",
          label: "Door Opening Thermal Shock",
          type: "confounder",
          description: "Frequent ambient air ingress creates severe thermal gradients and condensation cycles.",
          x: 90,
          y: 280
        },
        {
          id: "zone",
          label: "Chamber Shelf Zone",
          type: "treatment",
          description: "Target physical micro-climate placement: Back Chiller [do(Zone=Back)] vs Middle vs Door Balcony.",
          x: 295,
          y: 90
        },
        {
          id: "airflow",
          label: "Laminar Airflow (0.45 m/s)",
          type: "mediator",
          description: "Fluid jet streams disrupt stagnant moisture boundary layers and dilute ethylene concentration.",
          x: 295,
          y: 250
        },
        {
          id: "freshness",
          label: "Freshness Lifespan (Days)",
          type: "outcome",
          description: "Cellular firmness, nutrient retention, and invariant days before tissue breakdown occurs.",
          x: 515,
          y: 170
        }
      ],
      edges: [
        { source: "humidity", target: "freshness", label: "Fungal Spore Proliferation (+0.74 corr)" },
        { source: "humidity", target: "zone", label: "Confounder Backdoor Path" },
        { source: "door", target: "freshness", label: "Thermal Shock Decay" },
        { source: "door", target: "zone", label: "Confounder Backdoor Path" },
        { source: "ethylene", target: "freshness", label: "Hormonal Ripening Trigger" },
        { source: "zone", target: "airflow", label: "Fluid Jet Deflection" },
        { source: "airflow", target: "freshness", label: "Direct Physical Mechanism" },
        { source: "zone", target: "freshness", label: "True Causal Treatment Effect (+2.86d)" }
      ]
    });
  });

  // Community Board (SQLite Persisted)
  app.get("/api/community", (req, res) => {
    const board = db.prepare("SELECT * FROM community_board ORDER BY created_at DESC").all();
    res.json(board);
  });

  app.post("/api/community/share", (req, res) => {
    const { name, expiry_at, location } = req.body;
    const commId = `comm-user-${Date.now()}`;
    const donor = 'You';
    const loc = location || 'T. Nagar, Chennai';
    db.prepare("INSERT INTO community_board (id, name, donor_id, expiry_at, location) VALUES (?, ?, ?, ?, ?)")
      .run(commId, name, donor, expiry_at, loc);
    res.json({ id: commId, name, donor_id: donor, expiry_at, location: loc });
  });

  // Community Requests / Borrow Wishlist (Two-way P2P Exchange)
  app.get("/api/community/requests", (req, res) => {
    try {
      const requests = db.prepare("SELECT * FROM community_requests ORDER BY created_at DESC").all();
      res.json(requests);
    } catch (e) {
      console.error("Error fetching community requests:", e);
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.post("/api/community/requests", (req, res) => {
    try {
      const { item_needed, requester, location, urgency, reason } = req.body;
      const id = `req-${Date.now()}`;
      const reqName = requester || 'Plot 04 · Adyar (You)';
      const reqLoc = location || 'Adyar, Chennai';
      const reqUrg = urgency || 'Urgent (Cooking Now!)';
      const reqReason = reason || 'Ran out of ingredient while preparing dinner';
      
      db.prepare(`
        INSERT INTO community_requests (id, item_needed, requester, location, urgency, reason, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `).run(id, item_needed, reqName, reqLoc, reqUrg, reqReason);
      
      const newReq = db.prepare("SELECT * FROM community_requests WHERE id = ?").get(id);
      res.json(newReq);
    } catch (e) {
      console.error("Error creating community request:", e);
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  app.post("/api/community/requests/:id/respond", (req, res) => {
    try {
      const { responder_name, responder_note } = req.body;
      const respName = responder_name || 'Plot 04 · Adyar (You)';
      const respNote = responder_note || 'I have extra in my fridge! Kept outside door.';
      
      db.prepare(`
        UPDATE community_requests 
        SET status = 'fulfilled', fulfilled_by = ?, responder_note = ? 
        WHERE id = ?
      `).run(respName, respNote, req.params.id);

      const updated = db.prepare("SELECT * FROM community_requests WHERE id = ?").get(req.params.id);
      res.json(updated);
    } catch (e) {
      console.error("Error responding to community request:", e);
      res.status(500).json({ error: "Failed to respond to request" });
    }
  });

  app.post("/api/community/requests/:id/complete", (req, res) => {
    try {
      db.prepare(`
        UPDATE community_requests 
        SET status = 'completed' 
        WHERE id = ?
      `).run(req.params.id);

      const updated = db.prepare("SELECT * FROM community_requests WHERE id = ?").get(req.params.id);
      res.json(updated);
    } catch (e) {
      console.error("Error completing community request:", e);
      res.status(500).json({ error: "Failed to complete request" });
    }
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

  app.get("/api/health", (req, res) => {
    try {
      const itemCheck = db.prepare("SELECT COUNT(*) as count FROM items").get() as { count: number };
      res.json({
        status: "healthy",
        database: "connected",
        item_count: itemCheck.count,
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      res.status(500).json({ status: "unhealthy", error: e.message });
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
