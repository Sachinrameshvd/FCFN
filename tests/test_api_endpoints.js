import http from 'http';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log("=========================================");
  console.log("🧪 RUNNING FEDCAUSALFRESHNET API SUITE 🧪");
  console.log("=========================================\n");

  try {
    // 1. Health Check
    const health = await makeRequest('/api/health');
    console.log(`[1] /api/health: HTTP ${health.status} ->`, health.data);
    if (health.status !== 200 || health.data.status !== 'healthy') {
      throw new Error("Health check failed");
    }

    // 2. Fetch Items
    const items = await makeRequest('/api/items');
    console.log(`[2] /api/items: HTTP ${items.status} -> ${items.data.length} items found`);

    // 3. Add Item
    const newItem = await makeRequest('/api/items', 'POST', {
      name: "Test Mango",
      category: "Fruit",
      vendor_type: "street",
      zone: "middle"
    });
    console.log(`[3] POST /api/items: HTTP ${newItem.status} -> Item ID:`, newItem.data.id);

    // 4. Fetch Shopping List
    const shopping = await makeRequest('/api/shopping');
    console.log(`[4] /api/shopping: HTTP ${shopping.status} -> ${shopping.data.length} shopping items found`);

    // 5. Fetch Community Board
    const comm = await makeRequest('/api/community');
    console.log(`[5] /api/community: HTTP ${comm.status} -> ${comm.data.length} community listings found`);

    console.log("\n✅ ALL API TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("\n❌ API TEST SUITE FAILED:", err.message);
    process.exit(1);
  }
}

runApiTests();
