const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "books.db");

let dbInstance = null;

/**
 * Initializes the SQLite database connection, creates the books table if not exists,
 * and seeds initial books data if empty.
 */
async function initializeDB() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys and WAL mode for better concurrency
  await dbInstance.exec(`PRAGMA foreign_keys = ON;`);

  // Create books table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);

  // Seed sample data if table is empty
  const countRow = await dbInstance.get(`SELECT COUNT(*) AS count FROM books;`);
  if (countRow.count === 0) {
    const seedBooks = [
      { title: "Clean Code", author: "Robert C. Martin", price: 29.99 },
      { title: "The Pragmatic Programmer", author: "Andrew Hunt", price: 34.50 },
      { title: "Design Patterns", author: "Erich Gamma", price: 42.00 },
      { title: "You Don't Know JS", author: "Kyle Simpson", price: 19.95 },
      { title: "Refactoring", author: "Martin Fowler", price: 38.00 },
      { title: "Introduction to Algorithms", author: "Thomas H. Cormen", price: 65.00 },
      { title: "JavaScript: The Good Parts", author: "Douglas Crockford", price: 15.50 },
      { title: "Eloquent JavaScript", author: "Marijn Haverbeke", price: 22.00 }
    ];

    for (const book of seedBooks) {
      await dbInstance.run(
        `INSERT INTO books (title, author, price) VALUES (?, ?, ?);`,
        [book.title, book.author, book.price]
      );
    }
    console.log("Database initialized and seeded with 8 sample books.");
  }

  return dbInstance;
}

/**
 * Helper to get the active db instance.
 */
function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initializeDB() first.");
  }
  return dbInstance;
}

module.exports = {
  initializeDB,
  getDB
};

