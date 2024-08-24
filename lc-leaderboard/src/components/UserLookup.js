import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useUser } from "../UserContext"; // import useUser hook

const UserLookup = () => {
  const { user } = useUser();
  const [username, setUsername] = useState(user.username || ""); // Default to logged-in user's Discord username
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null); // State to hold LeetCode stats

  // Fetch LeetCode stats based on Discord username
  const fetchDiscordStats = async (discordUsername) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/discord_lookup",
        {
          headers: {
            "discord-username": discordUsername, // Send Discord username in the header
          },
        }
      );
      setStats(response.data);
      //   console.log(response.data);
      //   console.log("LeetCode stats from Discord lookup:", response.data);
    } catch (error) {
      //   console.error(
      //     "Error fetching LeetCode stats from Discord lookup:",
      //     error
      //   );
      // Clear stats if Discord lookup fails
      //   setStats(null);
      //   return -1;
      fetchLeetCodeStats(discordUsername);
      //   setMessage("Failed to fetch LeetCode stats from Discord lookup");
    }
  };

  // Fetch LeetCode stats based on LeetCode username
  const fetchLeetCodeStats = async (leetCodeUsername) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/leetcode_lookup",
        {
          headers: {
            "leetcode-username": leetCodeUsername,
          },
        }
      );
      //   check if response is an empty json
      if (Object.keys(response.data).length === 0) {
        setMessage("No LeetCode stats available for user: " + leetCodeUsername);
        return;
      }
      setStats(response.data);
      console.log("LeetCode stats from LeetCode lookup:", response.data);
    } catch (error) {
      console.error(
        "Error fetching LeetCode stats from LeetCode lookup:",
        error
      );
      setMessage("Error fetching LeetCode stats");
    }
  };

  useEffect(() => {
    // Fetch stats for the logged-in user when the component mounts
    fetchDiscordStats(user.username);
  }, [user.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setStats(null); // Clear current stats

    // Try Discord lookup first
    try {
      fetchDiscordStats(username);
    } catch {
      // If Discord lookup fails, try LeetCode lookup
      fetchLeetCodeStats(username);
    }
  };

  return (
    <div className="container">
      <h1 className="text-center my-4">User Lookup</h1>
      <Form
        onSubmit={handleSubmit}
        className="text-center"
        style={{ width: "50%", margin: "0 auto", paddingBottom: "20px" }}
      >
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Enter LeetCode/Discord Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" style={{ marginTop: "10px" }}>
          Lookup
        </Button>
        {message && (
          <Alert variant="info" className="mt-3">
            {message}
          </Alert>
        )}
      </Form>
      {/* Display LeetCode stats */}
      {stats ? (
        <div className="text-center mt-4">
          <Card style={{ width: "18rem", margin: "0 auto" }}>
            <Card.Img variant="top" src={stats.avatar} />
            <Card.Body>
              <Card.Title>{stats.leetcode_username}</Card.Title>
              <Card.Text>
                <strong>Ranking:</strong> {stats.ranking}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      ) : (
        <div className="text-center mt-4">
          <p>No LeetCode stats available.</p>
        </div>
      )}
    </div>
  );
};

export default UserLookup;
