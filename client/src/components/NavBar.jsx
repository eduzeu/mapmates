import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="navBarContainer">
      <button className="menuButton" onClick={toggleMenu}>
        ☰
      </button>
      
      {isOpen && (
        <nav className="dropdownMenu">
          <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
          <NavLink to="/maps" onClick={toggleMenu}>Maps</NavLink>
          <NavLink to="/feed" onClick={toggleMenu}>Feed</NavLink>
          <NavLink to="/signout" onClick={toggleMenu}>Signout</NavLink>
        </nav>
      )}
    </div>
  );
};

export default NavBar;