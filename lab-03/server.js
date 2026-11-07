const express = require("express");
const { initializeDB } = require("./database");
const booksRouter = require("./routes/books");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Lab 3 Books REST API",
    endpoints: {
      getAllBooks: "GET /books",
      searchAndFilter: "GET /books?search_q=&order_by=&order=&limit=&offset=&min_price=&max_price=",
      getBookById: "GET /books/:id",
      createBook: "POST /books",
      updateBook: "PUT /books/:id",
      deleteBook: "DELETE /books/:id"
    }
  });
});

// About route (Lab 1 compatibility)
app.get("/about", (req, res) => {
  res.json({
    name: "Sai Charan",
    section: "CSE QE (2A)",
    registrationNumber: "252U1R8002",
    course: "Backend Development Fundamentals - Lab 3"
  });
});

// Time route (Lab 1 compatibility)
app.get("/time", (req, res) => {
  res.json({
    currentTime: new Date()
  });
});

// Mount the Books REST API routes on /books noun
app.use("/books", booksRouter);

// 404 Error Handler - consistent JSON response format
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// Global Central Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

// Start database and server
let serverInstance = null;

async function startServer(port = PORT) {
  try {
    await initializeDB();
    return new Promise((resolve) => {
      serverInstance = app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        resolve(serverInstance);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Automatically start server when executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
