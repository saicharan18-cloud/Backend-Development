/**
 * BROKEN SERVER (Debugging Exercise)
 * 
 * This file contains 4 classic bugs intentionally introduced for the Lab 3 debugging exercise:
 * 1. Port Conflict (EADDRINUSE)
 * 2. Wrong Import Path (Cannot find module)
 * 3. Table-Name Typo (SQLITE_ERROR: no such table)
 * 4. Missing await on async database call (Promise returned instead of data)
 */

const express = require("express");

// BUG 2: WRONG IMPORT PATH
// The file is named '../database.js', but this tries to import from a non-existent './db/connection'
const { initializeDB, getDB } = require("./db/connection"); 

const app = express();
app.use(express.json());

// BUG 1: HARDCODED PORT & PORT CONFLICT (EADDRINUSE)
// Hardcoding a busy port like 3000 without process.env.PORT fallback or conflict handling
const PORT = 3000;

app.get("/books", async (req, res) => {
  try {
    const db = getDB();

    // BUG 3: TABLE-NAME TYPO
    // The table is named 'books', but query uses 'book' -> SQLITE_ERROR: no such table: book
    const query = "SELECT * FROM book;"; 

    // BUG 4: MISSING AWAIT
    // Missing 'await' before db.all(query). Returns Promise { <pending> } instead of book array!
    const books = db.all(query); 

    // Sending a raw Promise to client results in empty object {}
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Broken server listening on port ${PORT}`);
  });
});

