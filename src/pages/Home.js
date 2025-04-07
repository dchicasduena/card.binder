import React, { useState, useRef } from "react";
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faCircleNotch, faCirclePlus, faCircleMinus, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { toPng } from "html-to-image";

const Home = ({darkMode}) => {
  const [cards, setCards] = useState([]);
  const [binderCards, setBinderCards] = useState(Array(9).fill(null)); // Default 3x3 layout
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("binder");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [binderLayout, setBinderLayout] = useState("3x3");
  const binderRef = useRef(null);
  

  const searchCards = async () => {
    setLoading(true);
    setError(null);
    const url = `/.netlify/functions/pokemon-api?name=${encodeURIComponent(searchTerm)}`;
    setCards([]);

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.noResults) {
        setError("No cards found.");
        return;
      }

      const cardsWithImages = data.filter((card) => card.images && card.images.large);
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

  const downloadImage = async () => {
    if (!binderRef.current) return;
  
    const node = binderRef.current;
    const originalStyle = node.style.justifyContent;
    node.style.justifyContent = "center";
  
    const actualWidth = node.offsetWidth;
    const actualHeight = node.offsetHeight;
  
    // watermark element
    const watermark = document.createElement("div");
    watermark.innerHTML = `Made using <strong>Card Binder</strong><br/>card-binder.netlify.app`;
    watermark.style.position = "absolute";
    watermark.style.bottom = "10px";
    watermark.style.right = "10px";
    watermark.style.fontSize = "28px";
    watermark.style.fontWeight = "normal"; 
    watermark.style.color = darkMode ? "#ffffff" : "#000000";
    watermark.style.backgroundColor = darkMode ? "#252525" : "#ffffff";
    watermark.style.borderRadius = "10px";
    watermark.style.padding = "8px 12px";
    watermark.style.pointerEvents = "none";
    watermark.style.lineHeight = "1.4";
    watermark.style.textAlign = "right";

    node.style.position = "relative";
    node.appendChild(watermark);
  
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        useCORS: true,
        width: actualWidth,
        height: actualHeight,
        style: {
          width: `${actualWidth}px`,
          height: `${actualHeight}px`,
          backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
        },
      });
  
      const link = document.createElement("a");
      link.download = "binder-layout.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Could not generate image:", error);
    } finally {
      node.removeChild(watermark);
      node.style.justifyContent = originalStyle;
    }
  };  

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  // Updated layout preserves existing cards
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
    setBinderCards(binderCards.slice(0, newBinderCards.length).concat(newBinderCards.slice(binderCards.length)));
    togglePopup();
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  
    const dragImage = document.createElement("img");
    dragImage.src = binderCards[index]?.images.large;
    
    dragImage.style.borderRadius = "14px";
    // max size of the image wile dragging
    dragImage.width = 200; 
    dragImage.height = 280; 
  
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
  
    e.dataTransfer.setDragImage(dragImage, dragImage.width / 2, dragImage.height / 2);
  
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };  

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = e.dataTransfer.getData("text/plain");
    if (sourceIndex === "") return;

    setBinderCards((prevCards) => {
      const newCards = [...prevCards];
      const draggedCard = newCards[sourceIndex];
      newCards[sourceIndex] = newCards[targetIndex];
      newCards[targetIndex] = draggedCard;
      return newCards;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="main-content">
      <Helmet>
        <title>Card Binder - Pokémon TCG Binder Visualizer</title>
        <meta name="description" content="Visualize and arrange your Pokémon TCG cards and binder layout with this tool." />
        <meta name="keywords" content="Pokémon TCG, binder tool, collection organizer, about Pokémon TCG tool" />
      </Helmet>
      <h1 className="title">Visualize your PTCG Binder</h1>
      <p className="info">
        Plan your Pokémon TCG binder layout. <br />
        Drag and arrange them here before placing your cards in your binder.
      </p>

      <div className="mobile-warning">
        <br />
        <FontAwesomeIcon icon={faTriangleExclamation} className="warning-icon" />
        <h2 className="title">Mobile Warning!</h2>
        <p className="info">
          This site is not optimized for mobile devices. <br />
          For the best experience, please use a desktop browser or a device with a larger screen. <br />
          You can try rotating your device to check if it works
        </p>
      </div>

      <div className="main-container">
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
        <button className="button" onClick={downloadImage}>
          <i className="fa-solid fa-download"></i>
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
        <div ref={binderRef} className="binder-image-container">
          <div
            className="binder-container"
            style={{
              gridTemplateColumns:
                binderLayout === "3x4" ? "repeat(4, 1fr)" : `repeat(${binderLayout.split("x")[0]}, 1fr)`,
              gridTemplateRows:
                binderLayout === "3x4" ? "repeat(3, 1fr)" : `repeat(${binderLayout.split("x")[1]}, 1fr)`,
              gridAutoRows: binderLayout === "2x2" ? "1fr" : "auto",
              gap: "10px",
              justifyContent: binderLayout === "2x2" ? "1fr" : "auto",
            }}
          >
            {binderCards.map((card, index) => (
              <div
                key={index}
                className={card ? "card" : "binder-slot"}
                draggable={card ? true : false}
                onDragStart={(e) => card && handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => {
                  if (card) removeFromBinder(index);
                }}
              >
                {card ? (
                  <div className="card-image-wrapper">
                    <img src={card.images.large} alt={card.name} />
                    <div className="card-overlay">
                      <FontAwesomeIcon icon={faCircleMinus} className="remove-icon" />
                    </div>
                  </div>
                ) : (
                  <div className="empty-slot">+</div>
                )}
              </div>
            ))}
          </div>
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
              <div key={index} className="card" onClick={() => addToBinder(card)}>
                <div className="card-image-wrapper">
                  <img src={card.images.large} alt={card.name} />
                  <div className="card-overlay">
                    <FontAwesomeIcon icon={faCirclePlus} />
                  </div>
                </div>
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
            </div>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="back-to-top">
        <FontAwesomeIcon icon={faChevronUp} />
      </button>
      </div>
    
    </div>
  );
};

export default Home;
