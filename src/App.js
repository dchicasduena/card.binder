import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search function that calls the Netlify function
  const searchCards = async () => {
    setLoading(true);
    setError(null);

    // Call the Netlify function with the search term
    const url = `/.netlify/functions/pokemon-api?name=${encodeURIComponent(searchTerm)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Check for errors in the response
      if (data.error) {
        setError(data.error);
        setCards([]);
      } else {
        // Set the state with the fetched cards
        setCards(data);
      }
    } catch (error) {
      setError("Failed to load cards.");
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Pokemon TCG Card Binder Viewer</h1>

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
              <h3>{card.name}</h3>
              <img src={card.images.large} alt={card.name} />
            </div>
          ))
        ) : (
          <p>No cards found</p>
        )}
      </div>
    </div>
  );
};

export default App;
