# Lab 3 Debugging Exercise Guide

This guide documents the root cause analysis, error symptoms, and resolutions for the 4 classic backend errors encountered in Lab 3.

---

## 1. Port Conflict (`EADDRINUSE`)

### Symptom
When starting the server, the process crashes immediately with:
```text
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1898:16)
    at listenInCluster (node:net:1946:12)
    at Server.listen (node:net:2044:7)
```

### Root Cause
Another process (or an older instance of the Node server that was not properly stopped) is already listening on port `3000`. Operating systems do not permit two processes to bind to the same IP/port combination simultaneously.

### Solution
1. **Find and kill the blocking process:**
   - On Windows (PowerShell/CMD):
     ```powershell
     netstat -ano | findstr :3000
     taskkill /PID <PID_NUMBER> /F
     ```
   - On Linux/macOS:
     ```bash
     lsof -i :3000
     kill -9 <PID>
     ```
2. **Make the port configurable in code:**
   ```javascript
   // Use environment variable with fallback, or handle EADDRINUSE dynamically
   const PORT = process.env.PORT || 3001;
   ```

---

## 2. Wrong Import Path (`MODULE_NOT_FOUND`)

### Symptom
When executing the file, Node crashes before running:
```text
Error: Cannot find module './db/connection'
Require stack:
 - C:\Users\...\debugging-exercise\broken-server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1225:15)
    at Module._load (node:internal/modules/cjs/loader:1051:27)
```

### Root Cause
The `require()` statement points to a non-existent directory or misnamed file path (`./db/connection` instead of `../database.js`).

### Solution
Verify the directory structure and use the correct relative path:
```javascript
// Broken:
const { initializeDB, getDB } = require("./db/connection");

// Fixed:
const { initializeDB, getDB } = require("../database");
```

---

## 3. Table-Name Typo (`no such table`)

### Symptom
When making a request to `GET /books`, the server throws:
```text
SQLITE_ERROR: no such table: book
```
Or the client receives a 500 status code with `{ "message": "SQLITE_ERROR: no such table: book" }`.

### Root Cause
In SQLite, table names must match the schema defined in `CREATE TABLE`. In our schema, the table is named `books` (plural noun), but the query requested `SELECT * FROM book` (singular).

### Solution
Correct the SQL query to target the exact table name:
```javascript
// Broken:
const query = "SELECT * FROM book;";

// Fixed:
const query = "SELECT * FROM books;";
```

---

## 4. Missing `await` in Async Database Query

### Symptom
The route returns an empty JSON object `{}` instead of the book array, or causes unexpected promise rejection / data truncation:
```json
{}
```

### Root Cause
Database driver operations using `sqlite` / promises (e.g. `db.all()`, `db.get()`, `db.run()`) are asynchronous and return a `Promise`. Without the `await` keyword, JavaScript continues execution synchronously. Express serializes the unsettled `Promise` instance into an empty JSON object `{}` instead of waiting for the resolved data array.

### Solution
Add the `await` keyword before `db.all()` inside the `async` handler:
```javascript
// Broken:
const books = db.all(query); // returns Promise { <pending> }

// Fixed:
const books = await db.all(query); // awaits resolution and returns Array of books
```

