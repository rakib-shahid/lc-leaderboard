const express = require('express');
const router = express.Router();

module.exports = (pool, cache) => {
  router.get('/leetcode-stats', async (req, res) => {
    const discordUsername = req.headers["discord-username"]; // Get Discord username from request header

  if (!discordUsername) {
    return res.status(400).json({ message: "Discord username is required" });
  }

  try {
    // Query the database to get the corresponding LeetCode username
    const result = await pool.query(
      "SELECT leetcode_username FROM account_owner WHERE discord_username = $1",
      [discordUsername]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "LeetCode username not found" });
    }

    const leetcodeUsername = result.rows[0].leetcode_username;

    // Check cache for data
    const cachedData = cache.get(leetcodeUsername);
    if (cachedData) {
      return res.json(cachedData); // Return cached data
    }

    // Fetch data from external LeetCode API
    const response = await fetch(
      `http://localhost:3001/${leetcodeUsername}`
    );
    const data = await response.json();

    // Cache the response
    cache.set(leetcodeUsername, data);

    res.json(data);
  } catch (error) {
    console.error("Error fetching LeetCode stats:", error);
    res.status(500).json({ message: "Error fetching LeetCode stats" });
  }
  });

  router.get('/discord_lookup', async (req, res) => {
    const discordUsername = req.headers["discord-username"];

  if (!discordUsername) {
    return res
      .status(400)
      .json({ message: "Discord username header is required" });
  }

  try {
    // Query the database to find the LeetCode username for the given Discord username (case-insensitive)
    const result = await pool.query(
      "SELECT leetcode_username FROM account_owner WHERE LOWER(discord_username) = LOWER($1)",
      [discordUsername]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "LeetCode username not found for the provided Discord username",
      });
    }

    const leetcodeUsername = result.rows[0].leetcode_username;

    // Check cache for data
    const cachedData = cache.get(leetcodeUsername);
    if (cachedData) {
        if (!cachedData["message"]){
            cachedData.cache = "true";
            return res.json(cachedData); // Return cached data
        }
    }

    // Fetch LeetCode stats from external API
    const response = await fetch(
      `http://localhost:3001/${leetcodeUsername}`
    );
    const data = await response.json();
    let localrank = -1;
    // Calculate the local ranking of the user in the points table
    const ranking_result = await pool.query(
      `SELECT ranking FROM (SELECT user_id, points, RANK() OVER (ORDER BY points DESC) AS ranking FROM points) ranked_points JOIN users ON ranked_points.user_id = users.id WHERE LOWER(users.username) = LOWER($1);`,
      [leetcodeUsername]
    );
    if (ranking_result.rows.length != 0) {
      localrank = ranking_result.rows[0].ranking;
    }

    const wins = await pool.query(
        `SELECT wins FROM points WHERE user_id = (SELECT id FROM users WHERE LOWER(username) = LOWER($1));`,
          [leetcodeUsername]
      );
      let winCount = 0;
      if (wins.rows.length != 0) {
        if (wins.rows[0].wins != null){
        winCount = wins.rows[0].wins;

        }
      }
  
      // Send the LeetCode stats
      const result_json = {
        discord_username: discordUsername,
        leetcode_username: data.username,
        ranking: data.ranking,
        local_ranking: localrank,
          wins: winCount,
        avatar: data.avatar,
      };
    cache.set(discordUsername, result_json);
    res.json(result_json);
  } catch (error) {
    console.log("Error fetching LeetCode stats:", error);
    res.status(500).json({ message: "Error fetching LeetCode stats" });
  }
  });

  router.get('/leetcode_lookup', async (req, res) => {
    const leetcodeUsername = req.headers["leetcode-username"];

  if (!leetcodeUsername) {
    return res
      .status(400)
      .json({ message: "LeetCode username header is required" });
  }

  try {
    // Check cache for data
    const cachedData = cache.get(leetcodeUsername);
    if (cachedData) {
        if (!cachedData["message"]){
            cachedData.cache = "true";
            return res.json(cachedData); // Return cached data
        }
    }

    // Query to find Discord username (case-insensitive)
    const result = await pool.query(
      "SELECT discord_username FROM account_owner WHERE LOWER(leetcode_username) = LOWER($1)",
      [leetcodeUsername]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "LeetCode username not found for the provided Discord username",
      });
    }

    const discordUsername = result.rows[0].discord_username;

    // Fetch LeetCode stats from external API
    const response = await fetch(
      `http://localhost:3001/${leetcodeUsername}`
    );
    const data = await response.json();

    let localrank = -1;
    // Calculate the local ranking of the user in the points table (case-insensitive)
    const ranking_result = await pool.query(
      `SELECT ranking FROM (SELECT user_id, points, RANK() OVER (ORDER BY points DESC) AS ranking FROM points) ranked_points JOIN users ON ranked_points.user_id = users.id WHERE LOWER(users.username) = LOWER($1);`,
      [leetcodeUsername]
    );
    if (ranking_result.rows.length != 0) {
      localrank = ranking_result.rows[0].ranking;
    }

    const wins = await pool.query(
      `SELECT wins FROM points WHERE user_id = (SELECT id FROM users WHERE LOWER(username) = LOWER($1));`,
        [leetcodeUsername]
    );
    let winCount = 0;
    if (wins.rows.length != 0) {
        if (wins.rows[0].wins != null){
        winCount = wins.rows[0].wins;

        }
      }

    // Send the LeetCode stats
    const result_json = {
      discord_username: discordUsername,
      leetcode_username: data.username,
      ranking: data.ranking,
      local_ranking: localrank,
        wins: winCount,
      avatar: data.avatar,
    };
    cache.set(leetcodeUsername, result_json);
    res.json(result_json);
  } catch (error) {
    console.log("Error fetching LeetCode stats:", error);
    res.status(500).json({ message: "Error fetching LeetCode stats" });
  }
  });

  router.get('/leetcode_ac', async (req, res) => {
    const leetcodeUsername = req.headers["leetcode-username"];

  if (!leetcodeUsername) {
    return res
      .status(400)
      .json({ message: "LeetCode username header is required" });
  }

  try {
    // Check cache for data
    const cachedData = cache.get(`${leetcodeUsername}_ac`);
    if (cachedData) {
      return res.json(cachedData); // Return cached data
    }

    // Fetch LeetCode stats from external API
    const response = await fetch(
      `http://localhost:3001/${leetcodeUsername}/acSubmission`
    );
    const data = await response.json();

    // Cache the response
    cache.set(`${leetcodeUsername}_ac`, data);

    // Send the data response
    res.json(data);
  } catch (error) {
    console.error("Error fetching LeetCode stats:", error);
    res.status(500).json({ message: "Error fetching LeetCode stats" });
  }
  });

  return router;
};
