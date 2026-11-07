const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Welcome route
app.get("/", (req, res) => {
    res.send("Welcome to my Node.js and Express server!");
});
// About route
app.get("/about", (req, res) => {
    res.json({
        name: "Sai Charan",
        section: "CSE QE (2A)",
        registrationNumber: "252U1R8002"
    });
});
// Time route
app.get("/time", (req, res) => {
    res.json({
        currentTime: new Date()
    });
});
// 404 Error Handler
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});