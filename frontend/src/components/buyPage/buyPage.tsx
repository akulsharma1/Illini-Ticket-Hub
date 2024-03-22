import React, { useState } from "react";
import "./buyPage.css";

interface Event {
  id: number;
  name: string;
  lowestAsk: number;
  highestBid: number;
}

const BuyPage: React.FC = () => {
  const [event, setEvent] = useState<Event>({
    id: 1,
    name: "Buy Illinois vs Purdue Tickets",
    lowestAsk: 50,
    highestBid: 100,
  });

  const handleBuyNow = () => {
    console.log("Buying now at lowest ask:", event.lowestAsk);
  };

  const handlePlaceBid = () => {
    console.log("Placing new bid");
  };

  return (
    <div className="buy-page">
      <div className="event-card-buy">
        <div className="card-header">
          <h1 className="card-title">{event.name}</h1>
        </div>
        <div className="card-content">
          <div className="button-container">
            <button className="buy-button" onClick={handleBuyNow}>
              Buy Now at Lowest Ask: ${event.lowestAsk}
            </button>
            <button className="sell-button" onClick={handlePlaceBid}>
              Place New Bid (Current Highest Bid: ${event.highestBid})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;