const express = require("express");
const router = express.Router();
const { getDB } = require("../database");

// Whitelisted columns for ORDER BY to prevent SQL injection
const ALLOWED_ORDER_BY = ["id", "title", "author", "price"];

/**
 * Task 1 & 2 & 3:
 * GET /books
 * Supports query parameters:
 *  - search_q: partial title match using LIKE
 *  - order_by: column name (default 'id')
 *  - order: sort direction 'ASC' or 'DESC' (default 'ASC')
 *  - limit: number of records (default 10)
 *  - offset: pagination offset (default 0)
 *  - min_price & max_price: price range filter using BETWEEN / comparison
 */
router.get("/", async (req, res, next) => {
  try {
    const db = getDB();

    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price
    } = req.query;

    const conditions = [];
    const params = [];

    // 1. Partial title match with LIKE
    if (search_q.trim() !== "") {
      conditions.push("title LIKE ?");
      params.push(`%${search_q.trim()}%`);
    }

    // 2. Price-range filter using min_price and max_price
    if (min_price !== undefined && max_price !== undefined) {
      const min = parseFloat(min_price);
      const max = parseFloat(max_price);
      if (isNaN(min) || isNaN(max)) {
        return res.status(400).json({ message: "min_price and max_price must be numeric" });
      }
      conditions.push("price BETWEEN ? AND ?");
      params.push(min, max);
    } else if (min_price !== undefined) {
      const min = parseFloat(min_price);
      if (isNaN(min)) {
        return res.status(400).json({ message: "min_price must be numeric" });
      }
      conditions.push("price >= ?");
      params.push(min);
    } else if (max_price !== undefined) {
      const max = parseFloat(max_price);
      if (isNaN(max)) {
        return res.status(400).json({ message: "max_price must be numeric" });
      }
      conditions.push("price <= ?");
      params.push(max);
    }

    // 3. Safe sorting validation (order_by & order)
    const safeOrderBy = ALLOWED_ORDER_BY.includes(order_by.toLowerCase())
      ? order_by.toLowerCase()
      : "id";
    const safeOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // 4. Safe pagination validation (limit & offset)
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
    const safeOffset = !isNaN(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    // 5. Construct parameterized query
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM books ${whereClause} ORDER BY ${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?;`;

    params.push(safeLimit, safeOffset);

    // Execute parameterized query
    const books = await db.all(sql, params);

    return res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /books/:id
 * Retrieve a single book by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const db = getDB();
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await db.get("SELECT * FROM books WHERE id = ?;", [bookId]);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

/**
 * Task 4 & 5:
 * POST /books
 * Create a new book.
 * Validates body: reject missing title, author, or non-numeric price with 400.
 * Returns 201 Created on success.
 */
router.post("/", async (req, res, next) => {
  try {
    const db = getDB();
    const { title, author, price } = req.body;

    // Validation
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Title is required and must be a non-empty string" });
    }

    if (!author || typeof author !== "string" || author.trim() === "") {
      return res.status(400).json({ message: "Author is required and must be a non-empty string" });
    }

    if (price === undefined || price === null || typeof price !== "number" || isNaN(price) || price < 0) {
      return res.status(400).json({ message: "Price is required and must be a non-negative number" });
    }

    // Parameterized INSERT query
    const insertResult = await db.run(
      "INSERT INTO books (title, author, price) VALUES (?, ?, ?);",
      [title.trim(), author.trim(), Number(price)]
    );

    const createdBook = await db.get("SELECT * FROM books WHERE id = ?;", [insertResult.lastID]);

    return res.status(201).json({
      message: "Book created successfully",
      book: createdBook
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Task 5:
 * PUT /books/:id
 * Update an existing book.
 * Returns 404 if ID does not exist.
 * Returns 200 on successful update.
 */
router.put("/:id", async (req, res, next) => {
  try {
    const db = getDB();
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    // Verify existing book
    const existingBook = await db.get("SELECT * FROM books WHERE id = ?;", [bookId]);
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    const { title, author, price } = req.body;

    // Validation
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Title is required and must be a non-empty string" });
    }

    if (!author || typeof author !== "string" || author.trim() === "") {
      return res.status(400).json({ message: "Author is required and must be a non-empty string" });
    }

    if (price === undefined || price === null || typeof price !== "number" || isNaN(price) || price < 0) {
      return res.status(400).json({ message: "Price is required and must be a non-negative number" });
    }

    // Parameterized UPDATE query
    await db.run(
      "UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?;",
      [title.trim(), author.trim(), Number(price), bookId]
    );

    const updatedBook = await db.get("SELECT * FROM books WHERE id = ?;", [bookId]);

    return res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Task 5:
 * DELETE /books/:id
 * Delete a book by ID.
 * Returns 404 if ID does not exist.
 * Returns 200 on successful deletion.
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const db = getDB();
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    // Check if book exists
    const existingBook = await db.get("SELECT * FROM books WHERE id = ?;", [bookId]);
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Parameterized DELETE query
    await db.run("DELETE FROM books WHERE id = ?;", [bookId]);

    return res.status(200).json({
      message: "Book deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

