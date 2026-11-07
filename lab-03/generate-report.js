const http = require("http");
const fs = require("fs");
const path = require("path");
const { startServer } = require("./server");

const TEST_PORT = 3031;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function makeRequest(method, endpointPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpointPath, BASE_URL);
    const options = {
      hostname: "127.0.0.1",
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          body: parsed
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const testCases = [
  { id: 1, name: "GET /books (Default Params)", method: "GET", path: "/books", body: null, expectedStatus: 200 },
  { id: 2, name: "GET /books?search_q=Clean (Search Filter)", method: "GET", path: "/books?search_q=Clean", body: null, expectedStatus: 200 },
  { id: 3, name: "GET /books?order_by=price&order=DESC (Sorting)", method: "GET", path: "/books?order_by=price&order=DESC", body: null, expectedStatus: 200 },
  { id: 4, name: "GET /books?limit=3&offset=2 (Pagination)", method: "GET", path: "/books?limit=3&offset=2", body: null, expectedStatus: 200 },
  { id: 5, name: "GET /books?min_price=20&max_price=35 (Price Range Filter)", method: "GET", path: "/books?min_price=20&max_price=35", body: null, expectedStatus: 200 },
  { id: 6, name: "GET /books?min_price=invalid (Invalid Filter Rejection)", method: "GET", path: "/books?min_price=invalid", body: null, expectedStatus: 400 },
  { id: 7, name: "GET /books/1 (Retrieve Book by ID)", method: "GET", path: "/books/1", body: null, expectedStatus: 200 },
  { id: 8, name: "GET /books/99999 (Non-existent ID)", method: "GET", path: "/books/99999", body: null, expectedStatus: 404 },
  { id: 9, name: "GET /books/invalid_id (Invalid ID Type)", method: "GET", path: "/books/invalid_id", body: null, expectedStatus: 400 },
  {
    id: 10,
    name: "POST /books (Valid Creation)",
    method: "POST",
    path: "/books",
    body: { title: "Site Reliability Engineering", author: "Betsy Beyer", price: 44.99 },
    expectedStatus: 201
  },
  {
    id: 11,
    name: "POST /books (Missing Title Validation)",
    method: "POST",
    path: "/books",
    body: { author: "Betsy Beyer", price: 44.99 },
    expectedStatus: 400
  },
  {
    id: 12,
    name: "POST /books (Missing Author Validation)",
    method: "POST",
    path: "/books",
    body: { title: "No Author Book", price: 29.99 },
    expectedStatus: 400
  },
  {
    id: 13,
    name: "POST /books (Non-numeric Price Validation)",
    method: "POST",
    path: "/books",
    body: { title: "Free Book", author: "Author", price: "Free" },
    expectedStatus: 400
  },
  {
    id: 14,
    name: "PUT /books/1 (Valid Update)",
    method: "PUT",
    path: "/books/1",
    body: { title: "Clean Code (Updated Edition)", author: "Robert C. Martin", price: 34.99 },
    expectedStatus: 200
  },
  {
    id: 15,
    name: "PUT /books/99999 (Update Non-existent ID)",
    method: "PUT",
    path: "/books/99999",
    body: { title: "Ghost Book", author: "Ghost Writer", price: 20.00 },
    expectedStatus: 404
  },
  { id: 16, name: "DELETE /books/1 (Delete Book by ID)", method: "DELETE", path: "/books/1", body: null, expectedStatus: 200 },
  { id: 17, name: "DELETE /books/99999 (Delete Non-existent ID)", method: "DELETE", path: "/books/99999", body: null, expectedStatus: 404 }
];

async function generateReport() {
  console.log("Starting test server on port " + TEST_PORT + "...");
  const server = await startServer(TEST_PORT);

  let markdown = `# Lab 3 REST API - Test Execution Report\n\n`;
  markdown += `**Execution Date:** ${new Date().toISOString()}\n`;
  markdown += `**Base URL:** \`${BASE_URL}\`\n\n`;
  markdown += `| # | Test Case Name | Method | Endpoint | Expected | Received | Result |\n`;
  markdown += `|---|---|---|---|---|---|---|\n`;

  const details = [];

  for (const tc of testCases) {
    try {
      const res = await makeRequest(tc.method, tc.path, tc.body);
      const isPassed = res.statusCode === tc.expectedStatus;
      const statusIcon = isPassed ? "PASSED" : "FAILED";

      markdown += `| ${tc.id} | ${tc.name} | \`${tc.method}\` | \`${tc.path}\` | \`${tc.expectedStatus}\` | \`${res.statusCode}\` | **${statusIcon}** |\n`;

      details.push(`### Test ${tc.id}: ${tc.name}
- **Request:** \`${tc.method} ${tc.path}\`
${tc.body ? `- **Payload:** \`\`\`json\n${JSON.stringify(tc.body, null, 2)}\n\`\`\`` : ""}
- **Status Code:** \`${res.statusCode}\` (Expected: \`${tc.expectedStatus}\`)
- **Response Body:**
\`\`\`json
${JSON.stringify(res.body, null, 2)}
\`\`\`
`);
    } catch (err) {
      markdown += `| ${tc.id} | ${tc.name} | \`${tc.method}\` | \`${tc.path}\` | \`${tc.expectedStatus}\` | ERROR | **FAILED** |\n`;
      details.push(`### Test ${tc.id}: ${tc.name}\n- **Error:** ${err.message}\n`);
    }
  }

  markdown += `\n---\n\n## Detailed Request & Response Payloads\n\n` + details.join("\n\n");

  const outputPath = path.join(__dirname, "TEST_RESULTS.md");
  fs.writeFileSync(outputPath, markdown, "utf-8");
  console.log(`Report successfully written to ${outputPath}`);

  server.close();
}

generateReport().catch((err) => {
  console.error("Error generating report:", err);
  process.exit(1);
});

