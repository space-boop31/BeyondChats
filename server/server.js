const express = require("express");
const cors = require("cors");

require("dotenv").config();

// Initialize SQLite database
const db = require("./database");
console.log("SQLite database connected");

const articleRoutes = require("./routes/articles");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/articles", articleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
