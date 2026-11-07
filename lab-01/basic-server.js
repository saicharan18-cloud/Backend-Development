const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from basic server!\n");
});

const PORT = 3001;

server.listen(PORT, () => {
    console.log(`Basic server running at http://localhost:${PORT}`);
});