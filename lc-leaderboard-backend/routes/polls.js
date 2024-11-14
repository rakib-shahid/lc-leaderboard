const express = require('express');
const fs = require('fs');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = fs.readFileSync("data.json", "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading data.json:", error);
    res.status(500).json({ message: "Error reading data.json" });
  }
});

module.exports = router;
