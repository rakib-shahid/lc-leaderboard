// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CustomNavbar from "./components/Navbar";
import Leaderboard from "./components/Leaderboard";
import UserLookup from "./components/UserLookup";
import Callback from "./components/Callback";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <CustomNavbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Leaderboard />} />{" "}
          <Route
            path="/userlookup"
            element={<ProtectedRoute component={UserLookup} />}
          />
          <Route path="/callback" element={<Callback />} />{" "}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
