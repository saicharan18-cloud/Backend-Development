import http from "http";
import { initializeDBAndServer } from "./app.js";

const TEST_PORT = 3040;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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
          headers: res.headers,
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

let passed = 0;
let failed = 0;

function assert(description, condition, details = "") {
  if (condition) {
    console.log(`  PASS: ${description}`);
    passed++;
  } else {
    console.error(`  FAIL: ${description} ${details}`);
    failed++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("   LAB 3 REST API AUTOMATED TEST SUITE");
  console.log("==================================================\n");

  const server = await initializeDBAndServer(TEST_PORT);

  try {
    // 1. Root Welcome Route
    console.log("[Test Suite 1: Server Health]");
    const rootRes = await makeRequest("GET", "/");
    assert("GET / returns 200 OK", rootRes.statusCode === 200);
    assert("GET / returns welcome message", rootRes.body && rootRes.body.message.includes("running"));

    // 2. GET /books - Default params
    console.log("\n[Test Suite 2: GET /books Query Parameters & Filtering]");
    const booksRes = await makeRequest("GET", "/books");
    assert("GET /books returns 200 OK", booksRes.statusCode === 200);
    assert("GET /books returns data array and count", Array.isArray(booksRes.body.data) && booksRes.body.count > 0);

    // 3. GET /books?search_q=atomic
    const searchRes = await makeRequest("GET", "/books?search_q=atomic");
    assert("GET /books?search_q=atomic returns 200 OK", searchRes.statusCode === 200);
    assert("Search filters books with title matching 'atomic'",
      Array.isArray(searchRes.body.data) && searchRes.body.data.every(b => b.title.toLowerCase().includes("atomic")));

    // 4. GET /books?order_by=price&order=DESC
    const orderRes = await makeRequest("GET", "/books?order_by=price&order=DESC");
    assert("GET /books?order_by=price&order=DESC returns 200 OK", orderRes.statusCode === 200);
    const prices = orderRes.body.data.map(b => b.price);
    const isSortedDesc = prices.slice(1).every((p, i) => prices[i] >= p);
    assert("Books are sorted descending by price", isSortedDesc);

    // 5. GET /books?limit=3&offset=0
    const pageRes = await makeRequest("GET", "/books?limit=3&offset=0");
    assert("GET /books?limit=3&offset=0 returns 200 OK", pageRes.statusCode === 200);
    assert("Limit respects count of 3", pageRes.body.data.length === 3);

    // 6. GET /books?min_price=100&max_price=500
    const filterRes = await makeRequest("GET", "/books?min_price=100&max_price=500");
    assert("GET /books with min_price=100&max_price=500 returns 200 OK", filterRes.statusCode === 200);
    const inRange = filterRes.body.data.every(b => b.price >= 100 && b.price <= 500);
    assert("All books match BETWEEN 100 and 500 price range", inRange);

    // 7. GET /books with invalid non-numeric price filter
    const badFilterRes = await makeRequest("GET", "/books?min_price=invalid");
    assert("GET /books?min_price=invalid returns 400 Bad Request", badFilterRes.statusCode === 400);

    // 8. GET /books/:bookId - Valid ID
    console.log("\n[Test Suite 3: GET /books/:bookId]");
    const singleBookRes = await makeRequest("GET", "/books/1");
    assert("GET /books/1 returns 200 OK", singleBookRes.statusCode === 200);
    assert("Returns correct book with id 1", singleBookRes.body.data && singleBookRes.body.data.id === 1);

    // 9. GET /books/:bookId - Non-existent ID
    const notFoundRes = await makeRequest("GET", "/books/99999");
    assert("GET /books/99999 returns 404 Not Found", notFoundRes.statusCode === 404);
    assert("Returns message: 'Book not found'", notFoundRes.body.message === "Book not found");

    // 10. GET /books/:bookId - Invalid non-numeric ID
    const badIdRes = await makeRequest("GET", "/books/abc");
    assert("GET /books/abc returns 400 Bad Request", badIdRes.statusCode === 400);

    // 11. POST /books - Valid body
    console.log("\n[Test Suite 4: POST /books (Create & Validation)]");
    const validPost = {
      title: "Database Fundamentals",
      author: "John Smith",
      price: 400,
      pages: 300
    };
    const postRes = await makeRequest("POST", "/books", validPost);
    assert("POST /books returns 201 Created", postRes.statusCode === 201);
    assert("Returns success message and created book", postRes.body.data && postRes.body.data.title === "Database Fundamentals");
    const createdId = postRes.body.data ? postRes.body.data.id : null;

    // 12. POST /books - Missing title
    const missingTitleRes = await makeRequest("POST", "/books", { author: "Anonymous", price: 10, pages: 100 });
    assert("POST /books missing title returns 400 Bad Request", missingTitleRes.statusCode === 400);

    // 13. POST /books - Missing author
    const missingAuthorRes = await makeRequest("POST", "/books", { title: "Untitled", price: 10, pages: 100 });
    assert("POST /books missing author returns 400 Bad Request", missingAuthorRes.statusCode === 400);

    // 14. POST /books - Non-numeric price
    const nonNumericPriceRes = await makeRequest("POST", "/books", { title: "Test", author: "Tester", price: "free", pages: 100 });
    assert("POST /books non-numeric price returns 400 Bad Request", nonNumericPriceRes.statusCode === 400);

    // 15. PUT /books/:bookId - Valid update
    console.log("\n[Test Suite 5: PUT /books/:bookId (Update)]");
    const updatePayload = {
      title: "The Alchemist - Updated",
      author: "Paulo Coelho",
      price: 350,
      pages: 220
    };
    const putRes = await makeRequest("PUT", `/books/1`, updatePayload);
    assert("PUT /books/1 returns 200 OK after update", putRes.statusCode === 200);
    assert("Updated book reflects new title and price", putRes.body.data && putRes.body.data.price === 350);

    // 16. PUT /books/:bookId - Non-existent ID
    const putNotFoundRes = await makeRequest("PUT", "/books/99999", updatePayload);
    assert("PUT /books/99999 returns 404 Not Found", putNotFoundRes.statusCode === 404);

    // 17. DELETE /books/:bookId - Valid delete
    console.log("\n[Test Suite 6: DELETE /books/:bookId (Delete)]");
    const delRes = await makeRequest("DELETE", `/books/${createdId}`);
    assert("DELETE /books/:id returns 200 OK after delete", delRes.statusCode === 200);
    assert("Returns confirmation message", delRes.body.message === "Book deleted successfully");

    // 18. DELETE /books/:bookId - Deleting already deleted ID returns 404
    const delAgainRes = await makeRequest("DELETE", `/books/${createdId}`);
    assert("DELETE /books/:id on non-existent id returns 404 Not Found", delAgainRes.statusCode === 404);

    console.log("\n==================================================");
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log("==================================================");
  } finally {
    server.close();
  }
}

runTests().then(() => {
  if (failed > 0) process.exit(1);
}).catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
