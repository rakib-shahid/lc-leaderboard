const express = require('express');
const validator = require('validator');
const router = express.Router();

module.exports = (pool) => {
  router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    try {
      const result = await pool.query(
        "INSERT INTO mailing_list (email) VALUES ($1) RETURNING *",
        [email]
      );
      res.status(201).json({ message: "Successfully subscribed", data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error: error.message });
      console.error(error);
    }
  });

  return router;
};
