
// ==================================================
// Step 3: Plain HTTP Server using built-in http module
// (No Express - just Node.js core)
// ==================================================

const http = require("http");

// http.createServer takes a callback with (request, response)
// request -> contains info about the incoming HTTP request
// response -> used to send data back to the client

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Set status code 200 (OK) and Content-Type header
    res.writeHead(200, { "Content-Type": "text/plain" });

    // Send response body and close the connection
    res.end("Hello from the plain Node.js http module!\n");
});

const PORT = 3001;

server.listen(PORT, () => {
    console.log(`Plain HTTP server listening at http://localhost:${PORT}`);
});
