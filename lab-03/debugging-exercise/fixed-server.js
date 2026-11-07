/**
 * FIXED SERVER (Debugging Exercise Resolution)
 * 
 * Solutions to the 4 bugs:
 * 1. Port Conflict: Use process.env.PORT || 3000, and handle fallback or free port.
 * 2. Wrong Import Path: Corrected relative path to '../database.js'.
 * 3. Table-Name Typo: Corrected table name from 'book' to 'books'.
 * 4. Missing await: Added 'await' before async db.all(query).
 */

const express = require("express");

// FIX 2: Correct import path pointing to database.js
const { initializeDB, getDB } = require("../database");

const app = express();
app.use(express.json());

// FIX 1: Dynamic port selection to prevent EADDRINUSE conflict
const PORT = process.env.PORT || 3001;

app.get("/books", async (req, res) => {
  try {
    const db = getDB();

    // FIX 3: Correct table name 'books' (plural) matching SQLite schema
    const query = "SELECT * FROM books;";

    // FIX 4: Added 'await' to resolve the database Promise before sending response
    const books = await db.all(query);

    // Now correctly sends the array of books
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

initializeDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Fixed server running successfully on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is busy (EADDRINUSE). Retrying on port ${PORT + 1}...`);
      server.listen(PORT + 1);
    } else {
      console.error("Server error:", err);
    }
  });
});

