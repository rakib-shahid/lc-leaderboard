const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
          SELECT ao.leetcode_username username, p.points, ao.discord_username
          FROM points p
          JOIN users u ON p.user_id = u.id
          JOIN account_owner ao ON LOWER(ao.leetcode_username) = LOWER(u.username)
          ORDER BY p.points DESC
          LIMIT 15;
        `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });
  router.get('/leaderboard_history', async (req, res) => {
    try {
      const result = await pool.query(`
          SELECT ao.discord_username,
                 ao.leetcode_username,
                 p.total_points,
                 p.wins AS total_wins
          FROM points p
          JOIN users u ON p.user_id = u.id
          JOIN account_owner ao ON LOWER(ao.leetcode_username) = LOWER(u.username)
          ORDER BY p.wins DESC, p.total_points DESC;
      `);
  
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching historical leaderboard:", error);
      res.status(500).json({ message: "Error fetching historical leaderboard" });
    }
  });
  return router;
};
