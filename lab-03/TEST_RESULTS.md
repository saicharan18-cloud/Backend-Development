# Lab 3 REST API - Test Execution Report

**Execution Date:** 2026-11-07T05:48:13.004Z
**Base URL:** `http://localhost:3031`

| # | Test Case Name | Method | Endpoint | Expected | Received | Result |
|---|---|---|---|---|---|---|
| 1 | GET /books (Default Params) | `GET` | `/books` | `200` | `200` | **PASSED** |
| 2 | GET /books?search_q=Clean (Search Filter) | `GET` | `/books?search_q=Clean` | `200` | `200` | **PASSED** |
| 3 | GET /books?order_by=price&order=DESC (Sorting) | `GET` | `/books?order_by=price&order=DESC` | `200` | `200` | **PASSED** |
| 4 | GET /books?limit=3&offset=2 (Pagination) | `GET` | `/books?limit=3&offset=2` | `200` | `200` | **PASSED** |
| 5 | GET /books?min_price=20&max_price=35 (Price Range Filter) | `GET` | `/books?min_price=20&max_price=35` | `200` | `200` | **PASSED** |
| 6 | GET /books?min_price=invalid (Invalid Filter Rejection) | `GET` | `/books?min_price=invalid` | `400` | `400` | **PASSED** |
| 7 | GET /books/1 (Retrieve Book by ID) | `GET` | `/books/1` | `200` | `200` | **PASSED** |
| 8 | GET /books/99999 (Non-existent ID) | `GET` | `/books/99999` | `404` | `404` | **PASSED** |
| 9 | GET /books/invalid_id (Invalid ID Type) | `GET` | `/books/invalid_id` | `400` | `400` | **PASSED** |
| 10 | POST /books (Valid Creation) | `POST` | `/books` | `201` | `201` | **PASSED** |
| 11 | POST /books (Missing Title Validation) | `POST` | `/books` | `400` | `400` | **PASSED** |
| 12 | POST /books (Missing Author Validation) | `POST` | `/books` | `400` | `400` | **PASSED** |
| 13 | POST /books (Non-numeric Price Validation) | `POST` | `/books` | `400` | `400` | **PASSED** |
| 14 | PUT /books/1 (Valid Update) | `PUT` | `/books/1` | `200` | `200` | **PASSED** |
| 15 | PUT /books/99999 (Update Non-existent ID) | `PUT` | `/books/99999` | `404` | `404` | **PASSED** |
| 16 | DELETE /books/1 (Delete Book by ID) | `DELETE` | `/books/1` | `200` | `200` | **PASSED** |
| 17 | DELETE /books/99999 (Delete Non-existent ID) | `DELETE` | `/books/99999` | `404` | `404` | **PASSED** |

---

## Detailed Request & Response Payloads

### Test 1: GET /books (Default Params)
- **Request:** `GET /books`

- **Status Code:** `200` (Expected: `200`)
- **Response Body:**
```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 29.99
  },
  {
    "id": 2,
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt",
    "price": 34.5
  },
  {
    "id": 3,
    "title": "Design Patterns",
    "author": "Erich Gamma",
    "price": 42
  },
  {
    "id": 4,
    "title": "You Don't Know JS",
    "author": "Kyle Simpson",
    "price": 19.95
  },
  {
    "id": 5,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 38
  },
  {
    "id": 6,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "price": 65
  },
  {
    "id": 7,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 15.5
  },
  {
    "id": 8,
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "price": 22
  }
]
```


### Test 2: GET /books?search_q=Clean (Search Filter)
- **Request:** `GET /books?search_q=Clean`

- **Status Code:** `200` (Expected: `200`)
- **Response Body:**
```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 29.99
  }
]
```


### Test 3: GET /books?order_by=price&order=DESC (Sorting)
- **Request:** `GET /books?order_by=price&order=DESC`

- **Status Code:** `200` (Expected: `200`)
- **Response Body:**
```json
[
  {
    "id": 6,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "price": 65
  },
  {
    "id": 3,
    "title": "Design Patterns",
    "author": "Erich Gamma",
    "price": 42
  },
  {
    "id": 5,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 38
  },
  {
    "id": 2,
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt",
    "price": 34.5
  },
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 29.99
  },
  {
    "id": 8,
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "price": 22
  },
  {
    "id": 4,
    "title": "You Don't Know JS",
    "author": "Kyle Simpson",
    "price": 19.95
  },
  {
    "id": 7,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 15.5
  }
]
```


### Test 4: GET /books?limit=3&offset=2 (Pagination)
- **Request:** `GET /books?limit=3&offset=2`

- **Status Code:** `200` (Expected: `200`)
- **Response Body:**
```json
[
  {
    "id": 3,
    "title": "Design Patterns",
    "author": "Erich Gamma",
    "price": 42
  },
  {
    "id": 4,
    "title": "You Don't Know JS",
    "author": "Kyle Simpson",
    "price": 19.95
  },
  {
    "id": 5,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 38
  }
]
```


### Test 5: GET /books?min_price=20&max_price=35 (Price Range Filter)
- **Request:** `GET /books?min_price=20&max_price=35`

- **Status Code:** `200` (Expected: `200`)
- **Response Body:**
```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 29.99
  },
  {
    "id": 2,
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt",
    "price": 34.5
  },
  {
    "id": 8,
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "price": 22
  }
]
```


### Test 6: GET /books?min_price=invalid (Invalid Filter Rejection)
- **Request:** `GET /books?min_price=invalid`

- **Status Code:** `400` (Expected: `400`)
- **Response Body:**
```json
{
  "message": "min_price must be numeric"
}
```


### Test 7: GET /books/1 (Retrieve Book by ID)
- **Request:** `GET /books/1`

- **Status Code:** `200` (Expected: `200`)
- **Response Body:**
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "price": 29.99
}
```


### Test 8: GET /books/99999 (Non-existent ID)
- **Request:** `GET /books/99999`

- **Status Code:** `404` (Expected: `404`)
- **Response Body:**
```json
{
  "message": "Book not found"
}
```


### Test 9: GET /books/invalid_id (Invalid ID Type)
- **Request:** `GET /books/invalid_id`

- **Status Code:** `400` (Expected: `400`)
- **Response Body:**
```json
{
  "message": "Invalid book ID"
}
```


### Test 10: POST /books (Valid Creation)
- **Request:** `POST /books`
- **Payload:** ```json
{
  "title": "Site Reliability Engineering",
  "author": "Betsy Beyer",
  "price": 44.99
}
```
- **Status Code:** `201` (Expected: `201`)
- **Response Body:**
```json
{
  "message": "Book created successfully",
  "book": {
    "id": 10,
    "title": "Site Reliability Engineering",
    "author": "Betsy Beyer",
    "price": 44.99
  }
}
```


### Test 11: POST /books (Missing Title Validation)
- **Request:** `POST /books`
- **Payload:** ```json
{
  "author": "Betsy Beyer",
  "price": 44.99
}
```
- **Status Code:** `400` (Expected: `400`)
- **Response Body:**
```json
{
  "message": "Title is required and must be a non-empty string"
}
```


### Test 12: POST /books (Missing Author Validation)
- **Request:** `POST /books`
- **Payload:** ```json
{
  "title": "No Author Book",
  "price": 29.99
}
```
- **Status Code:** `400` (Expected: `400`)
- **Response Body:**
```json
{
  "message": "Author is required and must be a non-empty string"
}
```


### Test 13: POST /books (Non-numeric Price Validation)
- **Request:** `POST /books`
- **Payload:** ```json
{
  "title": "Free Book",
  "author": "Author",
  "price": "Free"
}
```
- **Status Code:** `400` (Expected: `400`)
- **Response Body:**
```json
{
  "message": "Price is required and must be a non-negative number"
}
```


### Test 14: PUT /books/1 (Valid Update)
- **Request:** `PUT /books/1`
- **Payload:** ```json
{
  "title": "Clean Code (Updated Edition)",
  "author": "Robert C. Martin",
  "price": 34.99
}
```
- **Status Code:** `200` (Expected: `200`)
- **Response Body:**
```json
{
  "message": "Book updated successfully",
  "book": {
    "id": 1,
    "title": "Clean Code (Updated Edition)",
    "author": "Robert C. Martin",
    "price": 34.99
  }
}
```


### Test 15: PUT /books/99999 (Update Non-existent ID)
- **Request:** `PUT /books/99999`
- **Payload:** ```json
{
  "title": "Ghost Book",
  "author": "Ghost Writer",
  "price": 20
}
```
- **Status Code:** `404` (Expected: `404`)
- **Response Body:**
```json
{
  "message": "Book not found"
}
```


### Test 16: DELETE /books/1 (Delete Book by ID)
- **Request:** `DELETE /books/1`

- **Status Code:** `200` (Expected: `200`)
- **Response Body:**
```json
{
  "message": "Book deleted successfully"
}
```


### Test 17: DELETE /books/99999 (Delete Non-existent ID)
- **Request:** `DELETE /books/99999`

- **Status Code:** `404` (Expected: `404`)
- **Response Body:**
```json
{
  "message": "Book not found"
}
```
