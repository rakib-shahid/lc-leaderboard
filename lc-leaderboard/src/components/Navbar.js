import React, { useState, useEffect } from "react";
import { Navbar, Nav, Button, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useUser } from "../UserContext"; // import useUser hook
import "./Navbar.css";

const CustomNavbar = () => {
  const { user } = useUser(); // get user from context
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Effect to update the profile picture when the user changes
  useEffect(() => {
    if (user && user.profilePicture) {
      setProfilePicture(user.profilePicture);
    }
  }, [user]); // Depend on the `user` object

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.reload();
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/" className="brand-padding">
        <b>LC Leaderboard</b>
      </Navbar.Brand>
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
                  src={profilePicture}
                  roundedCircle
                  style={{ width: "30px", height: "30px", marginRight: "10px" }}
                />
                <b>{user.global_name}</b>
              </Navbar.Text>
              <Button
                variant="outline-danger"
                onClick={handleLogout}
                style={{ marginRight: "10px", marginLeft: "10px" }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              href="http://localhost:5000/login"
              style={{
                marginRight: "10px",
                marginLeft: "10px",
                backgroundColor: "#7289DA",
                borderColor: "#7289DA",
                onMouseOver: {
                  backgroundColor: "#677bc4",
                  borderColor: "#677bc4",
                },
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#4f5f98";
                e.target.style.borderColor = "#4f5f98";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#7289DA";
                e.target.style.borderColor = "#7289DA";
              }}
            >
              Login with Discord
            </Button>
          )}
          {/* Add Dark Mode Toggle Button */}
          <Button
            variant="outline-light"
            onClick={toggleDarkMode}
            style={{ marginRight: "10px" }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
