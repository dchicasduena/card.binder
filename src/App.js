import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const searchCards = async () => {
    setLoading(true);
    setError(null);
    const url = `/.netlify/functions/pokemon-api?name=${encodeURIComponent(searchTerm)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Filter out cards that do not have images
      const cardsWithImages = data.filter((card) => card.images && card.images.large);
      setCards(cardsWithImages);
    } catch (error) {
      setError("Failed to load cards.");
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router> {/* Using Router to enable routing in the app */}
      <div className={`App ${darkMode ? "dark-mode" : ""}`}>
        <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        <div className="main-content">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={searchCards}>
              <i className="fa-solid fa-search"></i> Search
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}

          <div className="card-container">
            {cards.length > 0 ? (
              cards.map((card, index) => (
                <div key={index} className="card">
                  <img src={card.images.large} alt={card.name} />
                </div>
              ))
            ) : (
              <p>No cards found</p>
            )}
          </div>
        </div>  
        <Footer /> 
      </div>
    </Router>
  );
};

export default App;