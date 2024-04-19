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
  const [isEditAskModalOpen, setIsEditAskModalOpen] = useState(false);

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

        const askResponse = await fetch(
          `http://localhost:5555/account/userask/${eventId}/${ownerId}`
        );
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

  // Function to handle "Sell Now Highest Ask"
  const handleSellHighest = async () => {
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
        const errorData = await response.json(); // Assuming server responds with JSON on error
        console.error("Failed to sell now", errorData);

        // Check if the specific error about owning a ticket is returned
        if (
          response.status === 400 &&
          errorData.error &&
          errorData.error.includes("must own ticket to place ask")
        ) {
          alert(
            "Failed to sell ticket: You don't own a ticket for this event."
          );
        } else {
          // Generic error message for other issues
          alert(
            "Failed to sell now: " + (errorData.message || "Unknown error")
          );
        }

        return;
      }
      const responseData = await response.json();
      console.log(responseData);
      alert("The ticket was successfully sold!");
    } catch (error) {
      console.error("Error creating ask:", error);
      alert("An error occurred while trying to sell the ticket.");
    }
  };

  const formatPrices = (prices: number[] | null | undefined): string => {
    if (!prices || prices.length === 0) {
      return "N/A";
    }

    const formattedPrices = prices.map((price) => `$${price.toFixed(2)}`);
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
        const errorData = await response.json(); // Assuming server responds with JSON on error
        console.error("Failed to create ask", errorData);

        // Check if the specific error about owning a ticket is returned
        if (
          response.status === 400 &&
          errorData.error &&
          errorData.error.includes("must own ticket to place ask")
        ) {
          alert("Failed to place ask: You don't own a ticket for this event.");
        } else {
          // Generic error message for other issues
          alert(
            "Failed to place ask: " + (errorData.message || "Unknown error")
          );
        }

        return;
      }
      const responseData = await response.json();
      console.log(responseData);
      alert("Your ask was successfully placed!");
    } catch (error) {
      console.error("Error creating ask:", error);
      alert("An error occurred while trying to place the ask.");
    }
  };

  const handleEditAsk = async (newAskValue: number) => {
    try {
      // fetch user info from local store
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        console.error("User profile not found in local storage");
        return;
      }
      const ownerId = JSON.parse(userProfile).account_id;

      const response = await fetch("http://localhost:5555/asks/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: newAskValue,
          event_id: event?.event_id,
          owner_id: ownerId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to edit ask");
      }
      const responseData = await response.json();
      console.log(responseData);

      setIsEditAskModalOpen(false); // Close modal on success
    } catch (error) {
      console.error("Error updating ask:", error);
    }
  };

  const handleRemoveAsk = async () => {
    if (askPrice === -1) {
      console.error("No ask to remove");
      return; // Early exit if no ask is present
    }

    const userProfile = localStorage.getItem("userProfile");
    if (!userProfile) {
      console.error("User profile not found in local storage");
      return;
    }
    const ownerId = JSON.parse(userProfile).account_id;

    try {
      const response = await fetch(`http://localhost:5555/asks/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: askPrice,
          event_id: event?.event_id,
          owner_id: ownerId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete ask");
      }

      const responseData = await response.json();
      console.log("Ask removed:", responseData);
      setAskPrice(-1); // Reset ask price indicating no current ask
    } catch (error) {
      console.error("Error removing ask:", error);
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
              <p>
                Top 5 Lowest Asks: {formatPrices(topPrices.top_5_lowest_asks)}
              </p>
              <p>
                Top 5 Highest Bids: {formatPrices(topPrices.top_5_highest_bids)}
              </p>
              <p>
                Your Current Ask:{" "}
                {askPrice !== -1 ? `$${askPrice.toFixed(2)}` : "N/A"}
              </p>
            </div>
          </div>
        )}

        <div className="action-card">
          <div className="card-header">
            <h2 className="card-title">Sell</h2>
          </div>
          <div className="button-container">
            <button
              className={`sell-button ${askPrice != -1 ? "disabled" : ""}`} // @TODO: add another check here for if the user owns ticket
              onClick={handleSellHighest}
            >
              Sell Now
              <br />
              Highest Bid:{" "}
              {highestBid !== -1 ? `$${highestBid.toFixed(2)}` : "N/A"}
            </button>
            {askPrice === -1 ? (
              <button
                className="ask-button"
                onClick={() => setIsAskModalOpen(true)}
              >
                Place New Ask
                <br />
                Lowest Ask:{" "}
                {lowestAsk !== -1 ? `$${lowestAsk.toFixed(2)}` : "N/A"}
              </button>
            ) : (
              <button
                className="ask-button"
                onClick={() => setIsEditAskModalOpen(true)}
              >
                Edit Ask
                <br />
                Current Ask: {`$${askPrice.toFixed(2)}`}
              </button>
            )}
            <button
              className={`remove-ask-button ${
                askPrice === -1 ? "disabled" : ""
              }`}
              onClick={handleRemoveAsk}
              disabled={askPrice === -1}
            >
              Remove Ask
            </button>
          </div>
        </div>
      </div>
      <AskModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onSubmit={handlePlaceNewAsk}
        askPrice={0}
      />
      <EditAskModal
        isOpen={isEditAskModalOpen}
        onClose={() => setIsEditAskModalOpen(false)}
        onSubmit={handleEditAsk}
        askPrice={askPrice} // Pass askPrice as a prop
      />
    </div>
  );
};

interface AskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (askValue: number) => void;
  askPrice: number;
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

const EditAskModal: React.FC<AskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  askPrice,
}) => {
  const [editAskValue, setEditAskValue] = useState("");

  useEffect(() => {
    // Set initial value to current ask when modal opens
    if (isOpen && askPrice !== -1) {
      setEditAskValue(askPrice.toString());
    }
  }, [isOpen, askPrice]);

  const handleSubmit = () => {
    const value = parseFloat(editAskValue);
    if (!isNaN(value) && value > 0) {
      onSubmit(value);
      onClose(); // Close modal after submitting
    }
  };

  return isOpen ? (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Edit Your Ask</h2>
        <input
          type="number"
          value={editAskValue}
          onChange={(e) => setEditAskValue(e.target.value)}
          placeholder="Enter new ask amount"
        />
        <button onClick={handleSubmit}>Update Ask</button>
      </div>
    </div>
  ) : null;
};

export default SellPage;
