import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./buyPage.css";

interface Event {
  event_id: number;
  event_type: string;
  event_start: Date;
  away_team: string;
  stadium_location: string;
}

interface TopPrices {
  top_5_lowest_asks: number[];
  top_5_highest_bids: number[];
}

const BuyPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [lowestAsk, setLowestAsk] = useState<number>(-1);
  const [highestBid, setHighestBid] = useState<number>(-1);
  const [topPrices, setTopPrices] = useState<TopPrices | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    const fetchData = async (eventId: number) => {
      try {
        const eventResponse = await fetch(
          `http://localhost:5555/events/prices/${eventId}`
        );
        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event data");
        }
        const eventData = await eventResponse.json();
        setEvent(eventData.event);
        setLowestAsk(eventData.lowest_ask);
        setHighestBid(eventData.highest_bid);

        const topPricesResponse = await fetch(`http://localhost:5555/events/prices/top/${eventId}`);
        if (!topPricesResponse.ok) {
          throw new Error("Failed to fetch top prices");
        }
        const topPricesData = await topPricesResponse.json();
        setTopPrices({
          top_5_lowest_asks: topPricesData.top_5_lowest_asks,
          top_5_highest_bids: topPricesData.top_5_highest_bids,
        });


      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const storedEvent = localStorage.getItem("currEvent");
    if (storedEvent) {
      const storedEventData = JSON.parse(storedEvent);
      setEvent(storedEventData);
      fetchData(storedEventData.event_id);
    } else {
      console.error("Event not found in local storage");
    }
  }, []);

  // Function to handle "Buy Now Lowest Ask"
  const handleBuyLowest = async () => {
    try {
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        console.error("User profile not found in local storage");
        return;
      }
      const ownerId = JSON.parse(userProfile).account_id;

      const response = await fetch("http://localhost:5555/bids/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: lowestAsk,
          event_id: event!.event_id,
          owner_id: ownerId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create bid");
      }
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error creating bid:", error);
    }
  };

  const handlePlaceNewBid = async (bidValue: number) => {
    setIsBidModalOpen(false);
    try {
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        console.error("User profile not found in local storage");
        return;
      }
      const ownerId = JSON.parse(userProfile).account_id;

      const response = await fetch("http://localhost:5555/bids/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: bidValue,
          event_id: event?.event_id,
          owner_id: ownerId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create bid");
      }
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error creating bid:", error);
    }
  };

  if (!event) {
    return <div>Event not found</div>;
  }

  const formattedDate = event.event_start
    ? new Date(event.event_start).toLocaleDateString()
    : "";

  return (
    <div className="buy-page">
      <div className="container">
        <div className="event-card-buy">
          <div className="card-header">
            <h1 className="card-title">{`${event.event_type} - Buy`}</h1>
          </div>
          <div className="card-content">
            <p>Away Team: {event.away_team}</p>
            <p>Stadium: {event.stadium_location}</p>
            <p>Event Start: {formattedDate}</p>
          </div>
        </div>

        {topPrices && (
          <div className="topasksandbids-card">
            <div className="card-header">
              <h2 className="card-title">Top 5 Highest Bids and Lowest Asks</h2>
            </div>
            <div className="card-content">
              <p>Top 5 Lowest Asks: {topPrices.top_5_lowest_asks.join(", ")}</p>
              <p>Top 5 Highest Bids: {topPrices.top_5_highest_bids.join(", ")}</p>
            </div>
          </div>
        )}

        <div className="action-card">
          <div className="card-header">
            <h2 className="card-title">Buy</h2>
          </div>
          <div className="button-container">
            <button className="buy-button" onClick={handleBuyLowest}>
              Buy Now
              <br />
              Lowest Ask: {lowestAsk}
            </button>
            <button
              className="bid-button"
              onClick={() => setIsBidModalOpen(true)}
            >
              Place New Bid
              <br />
              Highest Bid: {highestBid}
            </button>
          </div>
        </div>
      </div>
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onSubmit={handlePlaceNewBid}
      />
    </div>
  );
};

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidValue: number) => void;
}

const BidModal: React.FC<BidModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [bidValue, setBidValue] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const value = parseFloat(bidValue);
    if (!isNaN(value) && value > 0) {
      onSubmit(value);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Place Your Bid</h2>
        <input
          type="number"
          value={bidValue}
          onChange={(e) => setBidValue(e.target.value)}
          placeholder="Enter bid amount"
        />
        <button onClick={handleSubmit}>Submit Bid</button>
      </div>
    </div>
  );
};

export default BuyPage;
