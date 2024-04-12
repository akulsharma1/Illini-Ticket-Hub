import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./sellPage.css";

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

const SellPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [lowestAsk, setLowestAsk] = useState<number>(-1);
  const [highestBid, setHighestBid] = useState<number>(-1);
  const [topPrices, setTopPrices] = useState<TopPrices | null>(null);
  const [askPrice, setAskPrice] = useState<number>(-1); // Initialize with a default value (-1 or any appropriate default value)
  const [isAskModalOpen, setIsAskModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    const fetchData = async (eventId: number) => {
      try {

        const response = await fetch(
          `http://localhost:5555/events/prices/${eventId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }
        const eventData = await response.json();

        setEvent(eventData.event);
        setLowestAsk(eventData.lowest_ask);
        setHighestBid(eventData.highest_bid);
        const topPricesResponse = await fetch(
          `http://localhost:5555/events/prices/top/${eventId}`
        );
        if (!topPricesResponse.ok) {
          throw new Error("Failed to fetch top prices");
        }
        const topPricesData = await topPricesResponse.json();
        setTopPrices({
          top_5_lowest_asks: topPricesData.top_5_lowest_asks,
          top_5_highest_bids: topPricesData.top_5_highest_bids,
        });
        
        

        const userProfile = localStorage.getItem("userProfile");
        if (!userProfile) {
          console.error("User profile not found in local storage");
          return;
        }
        const ownerId = JSON.parse(userProfile).account_id;

        const askResponse = await fetch(`http://localhost:5555/account/userask/${eventId}/${ownerId}`);
        if (!askResponse.ok) {
          throw new Error("Failed to fetch ask price"); 
        }
        const askData = await askResponse.json();
        console.log(askData);
        setAskPrice(askData.CurrentAsk);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

    };

    const storedEvent = localStorage.getItem("currEvent");
    if (storedEvent) {
      const storedEventData = JSON.parse(storedEvent);
      setEvent(storedEventData);
      const eventId = storedEventData.event_id;
      fetchData(eventId);
    } else {
      console.error("Event not found in local storage");
    }

    
  }, []);

  // Function to handle "Buy Now Lowest Ask"
  const handleAskHighest = async () => {
    try {
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        console.error("User profile not found in local storage");
        return;
      }
      const ownerId = JSON.parse(userProfile).account_id;

      const response = await fetch("http://localhost:5555/asks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: highestBid,
          event_id: event!.event_id,
          owner_id: ownerId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create ask");
      }
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error creating ask:", error);
    }
  };

  const formatPrices = (prices: number[] | null | undefined): string => {
    if (!prices || prices.length === 0) {
      return "N/A";
    }
    
    const formattedPrices = prices.map(price => `$${price.toFixed(2)}`);
    return formattedPrices.join(", ");
  };
  

  const handlePlaceNewAsk = async (askValue: number) => {
    setIsAskModalOpen(false);
    try {
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        console.error("User profile not found in local storage");
        return;
      }
      const ownerId = JSON.parse(userProfile).account_id;

      const response = await fetch("http://localhost:5555/asks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: askValue,
          event_id: event?.event_id,
          owner_id: ownerId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create ask");
      }
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error creating ask:", error);
    }
  };

  if (!event) {
    return <div>Event not found</div>;
  }

  const formattedDate = event.event_start
    ? new Date(event.event_start).toLocaleDateString()
    : "";

  return (
    <div className="sell-page">
      <div className="container">
        <div className="event-card-sell">
          <div className="card-header">
            <h1 className="card-title">{`${event.event_type} - Sell`}</h1>
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
            <p>Top 5 Lowest Asks: {formatPrices(topPrices.top_5_lowest_asks)}</p>
            <p>Top 5 Highest Bids: {formatPrices(topPrices.top_5_highest_bids)}</p>
            <p>Your Current Ask: {askPrice !== -1 ? `$${askPrice.toFixed(2)}` : "N/A"}</p>
            </div>
          </div>
        )}

        <div className="action-card">
          <div className="card-header">
            <h2 className="card-title">Sell</h2>
          </div>
          <div className="button-container">
            <button className="sell-button" onClick={handleAskHighest}>
              Sell Now
              <br />
              Highest Bid:{" "}
                {highestBid !== -1 ? `$${highestBid.toFixed(2)}` : "N/A"}
            </button>
            <button
              className="ask-button"
              onClick={() => setIsAskModalOpen(true)}
            >
              Place New Ask
              <br />
              Lowest Ask:{" "}
              {lowestAsk !== -1 ? `$${lowestAsk.toFixed(2)}` : "N/A"}
            </button>
          </div>
        </div>
      </div>
      <AskModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onSubmit={handlePlaceNewAsk}
      />
    </div>
  );
};

interface AskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (askValue: number) => void;
}

const AskModal: React.FC<AskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [askValue, setAskValue] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const value = parseFloat(askValue);
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
        <h2>Place Your Ask</h2>
        <input
          type="number"
          value={askValue}
          onChange={(e) => setAskValue(e.target.value)}
          placeholder="Enter ask amount"
        />
        <button onClick={handleSubmit}>Submit Ask</button>
      </div>
    </div>
  );
};

export default SellPage;