import React, { useState, useEffect  } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const [cards, setCards] = useState([]);
  const [binderCards, setBinderCards] = useState(Array(9).fill(null)); // Default 3x3 layout
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("binder");
  const [isPopupOpen, setIsPopupOpen] = useState(false); 
  const [binderLayout, setBinderLayout] = useState("3x3"); 

  const searchCards = async () => {
    setLoading(true);
    setError(null);
    const url = `/.netlify/functions/pokemon-api?name=${encodeURIComponent(searchTerm)}`;
    setCards([]); // Clear previous cards

    try {
      const response = await fetch(url);
      const data = await response.json();

      const cardsWithImages = data.filter(
        (card) => card.images && card.images.large
      );
      setCards(cardsWithImages);

      setViewMode("cards");
    } catch (error) {
      setError("Failed to load cards.");
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToBinder = (card) => {
    setBinderCards((prevBinder) => {
      const newBinder = [...prevBinder];
      const emptyIndex = newBinder.findIndex((slot) => slot === null);
      if (emptyIndex !== -1) {
        newBinder[emptyIndex] = card;
      }
      return newBinder;
    });
  };

  const removeFromBinder = (index) => {
    setBinderCards((prevBinder) => {
      const newBinder = [...prevBinder];
      newBinder[index] = null;
      return newBinder;
    });
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const changeLayout = (layout) => {
    let newBinderCards = [];
    switch (layout) {
      case "2x2":
        newBinderCards = Array(4).fill(null); 
        break;
      case "3x3":
        newBinderCards = Array(9).fill(null); 
        break;
      case "3x4":
        newBinderCards = Array(12).fill(null); 
        break;
      case "4x4":
        newBinderCards = Array(16).fill(null); 
        break;
      default:
        newBinderCards = Array(9).fill(null); 
    }
    setBinderLayout(layout);
    setBinderCards(newBinderCards); 
    togglePopup();
  };

  return (
    <div className="main-content">
      <h1 className="title">Visualize your PTCG Binder</h1>
      <p className="info">
        Plan your Pokémon TCG binder layout. <br />
        Drag and arrange them here before placing your cards in your binder.
      </p>

      {/* Search Bar */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchCards()}
        />
        <button className="button" onClick={searchCards}>
          <i className="fa-solid fa-search"></i> Filter
        </button>
        <button className="button" onClick={togglePopup}>
          <i className="fa-solid fa-cog"></i>
        </button>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <span
          onClick={() => setViewMode("binder")}
          style={{
            cursor: "pointer",
            marginRight: "8px",
            fontWeight: "bold",
            color: viewMode === "binder" ? "#E42535" : "",
            fontSize: "18px",
          }}
        >
          Binder View
        </span>
        <span className="separator">|</span>
        <span
          onClick={() => setViewMode("cards")}
          style={{
            cursor: "pointer",
            marginLeft: "8px",
            fontWeight: "bold",
            color: viewMode === "cards" ? "#E42535" : "",
            fontSize: "18px",
          }}
        >
          Card View
        </span>
      </div>
      
      {/* Show Binder View */}
      {viewMode === "binder" && (
        <div
          className="binder-container"
          style={{
            gridTemplateColumns:
              binderLayout === "3x4" ? "repeat(4, 1fr)" : `repeat(${binderLayout.split("x")[0]}, 1fr)`, 
            gridTemplateRows:
              binderLayout === "3x4" ? "repeat(3, 1fr)" : `repeat(${binderLayout.split("x")[1]}, 1fr)`, 
            gridAutoRows: binderLayout === "2x2" ? "1fr" : "auto", 
            gap: "10px", 
            justifyContent: binderLayout === "2x2" ? "1fr" : "auto", /* Adjust for 2x2 */
          }}
        >
          {binderCards.map((card, index) => (
            <div key={index} className={card ? "card" : "binder-slot"}>
              {card ? (
                <img
                  src={card.images.large}
                  alt={card.name}
                  onClick={() => removeFromBinder(index)}
                />
              ) : (
                <div className="empty-slot">+</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show Card View */}
      {viewMode === "cards" && (
        <div className="card-container">
          {loading && (
            <div className="loading-container">
              <FontAwesomeIcon icon={faCircleNotch} spin className="loading-spinner" />
            </div>
          )}
          {error && (
            <div className="loading-container">
              <p>{error}</p>
            </div>
          )}
          {cards.length > 0 &&
            cards.map((card, index) => (
              <div
                key={index}
                className="card"
                onClick={() => addToBinder(card)}
              >
                <img src={card.images.large} alt={card.name} />
              </div>
            ))}
        </div>
      )}

      {/* Popup for Binder Options */}
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Binder Options</h3>
            <ul>
              <li onClick={() => changeLayout("2x2")}>2x2</li>
              <li onClick={() => changeLayout("3x3")}>3x3</li>
              <li onClick={() => changeLayout("3x4")}>3x4</li>
              <li onClick={() => changeLayout("4x4")}>4x4</li>
            </ul>
            <div className="popup-buttons">
              <button onClick={togglePopup} className="close-btn">
                Close
              </button>
              <button onClick={togglePopup} className="confirm-btn">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="back-to-top"
      >
          <FontAwesomeIcon icon={faChevronUp} />
      </button>

    </div>
  );
};

export default Home;
