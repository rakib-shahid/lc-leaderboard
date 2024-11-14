const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { Pool } = require("pg");
const fs = require("fs");
const https = require("https");
const NodeCache = require("node-cache");
const validator = require('validator');

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

const cache = new NodeCache({ stdTTL: 600 });

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

// Routes
app.use('/leaderboard', require('./routes/leaderboard')(pool, cache));
app.use('/api', require('./routes/leetcode')(pool, cache));
app.use('/polls', require('./routes/polls'));
app.use('/news', require('./routes/news'));
app.use('/api/subscribe', require('./routes/subscribe')(pool));

const privateKey = fs.readFileSync("privkey.pem");
const certificate = fs.readFileSync("fullchain.pem");

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

const PORT = process.env.PORT || 443;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
