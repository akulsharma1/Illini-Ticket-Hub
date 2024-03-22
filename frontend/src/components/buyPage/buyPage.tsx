import React, { useState } from "react";
import "./buyPage.css";

interface Event {
  id: number;
  name: string;
  lowestAsk: number;
  highestBid: number; // Adding highestBid property
}

const BuyPage: React.FC = () => {
  const [event, setEvent] = useState<Event>({
    id: 1,
    name: "Concert Ticket",
    lowestAsk: 50,
    highestBid: 100, // Hardcoded example value
  });

  const handleBuyNow = () => {
    // Handle Buy Now functionality
    console.log("Buying now at lowest ask:", event.lowestAsk);
  };

  const handlePlaceBid = () => {
    // Handle Place Bid functionality
    console.log("Placing new bid");
  };

  return (
    <div className="buy-page">
      <div className="event-card">
        <div className="card-header">
          <h1 className="card-title">{event.name}</h1>
        </div>
        <div className="card-content">
          <div className="button-container">
            <button onClick={handleBuyNow}>
              Buy Now at Lowest Ask: ${event.lowestAsk}
            </button>
            <button onClick={handlePlaceBid}>
              Place New Bid (Current Highest Bid: ${event.highestBid})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
