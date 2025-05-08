import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  
  const toggleMenu = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/loggedIn', {
        method: 'GET',
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      if(data.loggedIn){
        setLoggedIn(true);
      }
      else{
        setLoggedIn(false);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="navBarContainer">
      <button className="menuButton" onClick={toggleMenu}>
        ☰
      </button>
      
      {(isOpen && loggedIn) && (
        <nav className="dropdownMenu">
          <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
          <NavLink to="/maps" onClick={toggleMenu}>Maps</NavLink>
          <NavLink to="/feed" onClick={toggleMenu}>Feed</NavLink>
          <NavLink to="/signout" onClick={toggleMenu}>Signout</NavLink>

        </nav>
      )}
      {(isOpen && !loggedIn) && (
        <nav className="dropdownMenu">
          <NavLink to="/signin" onClick={toggleMenu}>Login</NavLink>
          <NavLink to="/signup" onClick={toggleMenu}>Create Account</NavLink>

        </nav>
      )}
    </div>
  );
};

export default NavBar;