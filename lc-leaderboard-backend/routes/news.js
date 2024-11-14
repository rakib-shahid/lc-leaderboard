const express = require('express');
const fs = require('fs');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = fs.readFileSync("news.json", "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading news.json:", error);
    res.status(500).json({ message: "Error reading news.json" });
  }
});

module.exports = router;
