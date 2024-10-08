import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Container } from "react-bootstrap";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get("http://localhost:5000/leaderboard");
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <Container>
      <h1 className="text-center my-4">Leaderboard</h1>
      <Table striped bordered hover>
        <thead style={{ color: "var(--text-color)" }}>
          <tr>
            <th>Rank</th>
            <th>Leetcode Username</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody style={{ color: "var(--text-color)" }}>
          {leaderboard.map((user, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.points}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Leaderboard;
