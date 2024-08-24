const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { Pool } = require("pg");
const querystring = require("querystring");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";
const SCOPE = "identify";

// Discord login route
app.get("/login", (req, res) => {
  const authURL = `https://discord.com/oauth2/authorize?client_id=1276713610126561392&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=identify`;
  res.redirect(authURL);
});

// Discord callback route
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Missing authorization code" });
  }

  try {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: querystring.stringify({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        scope: SCOPE,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Response Body:", errorText);
      return res.status(response.status).json({ message: errorText });
    }

    const data = await response.json();
    const { access_token } = data;
    console.log("Access Token:", access_token);

    // Fetch user details from Discord API
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const userError = await userResponse.json();
      return res
        .status(userResponse.status)
        .json({ message: userError.message });
    }

    const user = await userResponse.json();
    res.json({ access_token, user });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Error during authentication" });
  }
});
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login");
};

app.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: "Invalid token" });
    }

    const user = await response.json();
    console.log("User:", user);
    console.log("User ID:", user.id);
    console.log("User avatar:", user.avatar);
    const profilePictureUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

    res.json({
      ...user,
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// check if username is in registered table
const checkIfRegistered = async (username) => {
  const result = await pool.query(
    "SELECT * FROM registered WHERE username = $1",
    [username]
  );
  return result.rows.length > 0;
};

// check if username is in users table
const checkIfUserExists = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows.length > 0;
};

// register new user
app.post("/register", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const isRegistered = await checkIfRegistered(username);
  if (isRegistered) {
    const isUser = await checkIfUserExists(username);
    if (isUser) {
      return res.json({ message: "Already registered" });
    } else {
      return res.json({ message: "Invalid name" });
    }
  }

  //   // add username to registered table
  //   await pool.query("INSERT INTO registered (username) VALUES ($1)", [username]);

  //   try {
  //     // check if username is valid
  //     // thanks alfa-leetcode-api
  //     const response = await fetch(
  //       `https://alfa-leetcode-api.onrender.com/${username}`
  //     );
  //     const data = await response.json();

  //     if (data.errors) {
  //       return res.json({ message: "Invalid name" });
  //     }

  //     if (data.username) {
  //       // add to users table if valid
  //       await pool.query("INSERT INTO users (username) VALUES ($1)", [username]);
  //       return res.json({ message: `${data.username} has been registered` });
  //     }
  //   } catch (error) {
  //     return res.status(500).json({ message: "Error checking username" });
  //   }

  return res.status(500).json({ message: "Unknown error" });
});

app.get("/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT u.username, p.points
        FROM points p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.points DESC
        LIMIT 50;
      `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

app.get("/api/leetcode-stats", async (req, res) => {
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

    // Fetch data from external LeetCode API
    const response = await fetch(
      `https://alfa-leetcode-api.onrender.com/${leetcodeUsername}`
    );
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Error fetching LeetCode stats:", error);
    res.status(500).json({ message: "Error fetching LeetCode stats" });
  }
});

app.get("/api/discord_lookup", async (req, res) => {
  const discordUsername = req.headers["discord-username"];

  if (!discordUsername) {
    return res
      .status(400)
      .json({ message: "Discord username header is required" });
  }

  try {
    // Query the database to find the LeetCode username for the given Discord username
    const result = await pool.query(
      "SELECT leetcode_username FROM account_owner WHERE discord_username = $1",
      [discordUsername]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "LeetCode username not found for the provided Discord username",
      });
    }

    const leetcodeUsername = result.rows[0].leetcode_username;

    // Fetch LeetCode stats from external API
    const response = await fetch(
      `https://alfa-leetcode-api.onrender.com/${leetcodeUsername}`
    );
    const data = await response.json();

    // Send the LeetCode stats
    res.json({
      leetcode_username: data.username,
      ranking: data.ranking,
      avatar: data.avatar,
    });
  } catch (error) {
    console.error("Error fetching LeetCode stats:", error);
    res.status(500).json({ message: "Error fetching LeetCode stats" });
  }
});

app.get("/api/leetcode_lookup", async (req, res) => {
  const leetcodeUsername = req.headers["leetcode-username"];

  if (!leetcodeUsername) {
    return res
      .status(400)
      .json({ message: "LeetCode username header is required" });
  }

  try {
    // Fetch LeetCode stats from external API
    const response = await fetch(
      `https://alfa-leetcode-api.onrender.com/${leetcodeUsername}`
    );
    const data = await response.json();

    // Send the LeetCode stats
    res.json({
      leetcode_username: data.username,
      ranking: data.ranking,
      avatar: data.avatar,
    });
  } catch (error) {
    console.error("Error fetching LeetCode stats:", error);
    res.status(500).json({ message: "Error fetching LeetCode stats" });
  }
});

app.get("/api/leetcode_ac", async (req, res) => {
  const leetcodeUsername = req.headers["leetcode-username"];

  if (!leetcodeUsername) {
    return res
      .status(400)
      .json({ message: "LeetCode username header is required" });
  }

  try {
    // Fetch LeetCode stats from external API
    const response = await fetch(
      `https://alfa-leetcode-api.onrender.com/${leetcodeUsername}/acSubmission`
    );
    const data = await response.json();

    //   send the data response
    res.json(data);
  } catch (error) {
    console.error("Error fetching LeetCode stats:", error);
    res.status(500).json({ message: "Error fetching LeetCode stats" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
