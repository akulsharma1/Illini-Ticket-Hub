import React, { useState } from "react";
import "./sellPage.css";

interface Event {
  id: number;
  name: string;
  lowestAsk: number;
  highestBid: number;
}

const SellPage: React.FC = () => {
  const [event, setEvent] = useState<Event>({
    id: 1,
    name: "Sell Illinois vs Maryland tickets",
    lowestAsk: 50,
    highestBid: 100,
  });

  const handleSellNow = () => {
    console.log("Buying now at lowest ask:", event.lowestAsk);
  };

  const handlePlaceAsk = () => {
    console.log("Placing new ask");
  };

  return (
    <div className="sell-page">
      <div className="event-card-sell">
        <div className="card-header">
          <h1 className="card-title">{event.name}</h1>
        </div>
        <div className="card-content">
          <div className="button-container">
            <button className="sell-button" onClick={handleSellNow}>
              Sell Now at Highest Bid: ${event.highestBid}
            </button>
            <button className="buy-button" onClick={handlePlaceAsk}>
              Place New Ask (Current Lowest Ask: ${event.lowestAsk})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;
