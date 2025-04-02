import React from "react";
import { Link } from "react-router-dom"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faBookOpen  } from "@fortawesome/free-solid-svg-icons"; // Use a valid icon
import '../styles/Header.css';

const Header = ({ toggleDarkMode, darkMode }) => {
    return (
      <header className="header">
        <Link to="/" className="logo">
          <FontAwesomeIcon icon={faBookOpen } /> Card Binder
        </Link>
        <nav>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li>
              <button className="theme-toggle" onClick={toggleDarkMode}>
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              </button>
            </li>
          </ul>
        </nav>
      </header>
    );
};

export default Header;
