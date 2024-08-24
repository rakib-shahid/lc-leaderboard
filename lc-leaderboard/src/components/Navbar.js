import React from "react";
import { Navbar, Nav, Button, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useUser } from "../UserContext"; // import useUser hook
import "./Navbar.css";

// src/components/Navbar.js

const CustomNavbar = () => {
  const { user } = useUser(); // get user from context

  const handleLogout = () => {
    // Clear token and user data on logout
    localStorage.removeItem("access_token");
    window.location.reload(); // Reload page to reflect changes
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/" className="brand-padding">
        <b>LC Leaderboard</b>
      </Navbar.Brand>{" "}
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <LinkContainer to="/">
            <Nav.Link>Leaderboard</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/userlookup">
            <Nav.Link>User Lookup</Nav.Link>
          </LinkContainer>
        </Nav>
        <Nav className="ms-auto">
          {user ? (
            <>
              <Navbar.Text className="d-flex align-items-center">
                <Image
                  src={user.profilePicture}
                  roundedCircle
                  style={{ width: "30px", height: "30px", marginRight: "10px" }}
                />
                <b>{user.username}</b>
              </Navbar.Text>
              <div style={{ marginRight: "10px" }}></div> {/* Add padding */}
              <Button variant="outline-danger" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="outline-primary"
              href="http://localhost:5000/login"
            >
              Login with Discord
            </Button>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
