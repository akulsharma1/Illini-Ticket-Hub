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
  const [event, setEvent] = useState<Event | null>(null);
  const [lowestAsk, setLowestAsk] = useState<number>(-1);
  const [highestBid, setHighestBid] = useState<number>(-1);
  const [topPrices, setTopPrices] = useState<TopPrices | null>(null);
  const [bidPrice, setBidPrice] = useState<number>(-1); // Initialize with a default value (-1 or any appropriate default value)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false); // State to control modal visibility
  const [isEditBidModalOpen, setIsEditBidModalOpen] = useState(false);

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

      const bidResponse = await fetch(
        `http://localhost:5555/account/userbid/${eventId}/${ownerId}`
      );
      if (!bidResponse.ok) {
        throw new Error("Failed to fetch bid price");
      }
      const bidData = await bidResponse.json();
      console.log(bidData);
      setBidPrice(bidData.CurrentBid);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
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
        const errorData = await response.json(); // Assuming server responds with JSON on error
        console.error("Failed to create bid", errorData);

        // Check if the specific error about owning a ticket is returned
        if (
          response.status === 400 &&
          errorData.error &&
          errorData.error.includes(
            "cannot place bid for ticket when one is already owned"
          )
        ) {
          alert("You cannot buy a ticket, you already own a ticket.");
        } else {
          // Generic error message for other issues
          alert("Failed to buy now: " + (errorData.message || "Unknown error"));
        }

        return;
      }
      const responseData = await response.json();
      fetchData(event!.event_id);
      console.log(responseData);
    } catch (error) {
      console.error("Error creating bid:", error);
      alert("An error occurred while trying to buy the ticket.");
    }
  };

  const formatPrices = (prices: number[] | null | undefined): string => {
    if (!prices || prices.length === 0) {
      return "N/A";
    }

    const formattedPrices = prices.map((price) => `$${price.toFixed(2)}`);
    return formattedPrices.join(", ");
  };

  const handlePlaceNewBid = async (bidValue: number) => {
    setIsBidModalOpen(false);
    try {
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        console.error("User profile not found in local storage");
        alert("You must be logged in to place a bid.");
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
        const errorData = await response.json(); // Assuming server responds with JSON on error
        console.error("Failed to create bid", errorData);

        // Check if the specific error about owning a ticket is returned
        if (
          response.status === 400 &&
          errorData.error &&
          errorData.error.includes(
            "cannot place bid for ticket when one is already owned"
          )
        ) {
          alert("You cannot place a bid, you already own a ticket.");
        } else {
          // Generic error message for other issues
          alert(
            "Failed to place bid: " + (errorData.message || "Unknown error")
          );
        }

        return;
      }

      const responseData = await response.json();
      fetchData(event!.event_id); // triggers re-render
    } catch (error) {
      console.error("Error creating bid:", error);
      alert("An error occurred while trying to place the bid.");
    }
  };

  const handleEditBid = async (newBidValue: number) => {
    try {
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        console.error("User profile not found in local storage");
        return;
      }
      const ownerId = JSON.parse(userProfile).account_id;

      const response = await fetch("http://localhost:5555/bids/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: newBidValue,
          event_id: event?.event_id,
          owner_id: ownerId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create bid");
      }
      const responseData = await response.json();
      console.log(responseData);

      fetchData(event!.event_id); // triggers re-render
      setIsEditBidModalOpen(false); // Close modal on success
    } catch (error) {
      console.error("Error updating bid:", error);
    }
  };

  const handleRemoveBid = async () => {
    if (bidPrice === -1) {
      console.error("No bid to remove");
      return; // Early exit if no bid is present
    }

    const userProfile = localStorage.getItem("userProfile");
    if (!userProfile) {
      console.error("User profile not found in local storage");
      return;
    }
    const ownerId = JSON.parse(userProfile).account_id;

    try {
      const response = await fetch(`http://localhost:5555/bids/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: bidPrice,
          event_id: event?.event_id,
          owner_id: ownerId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete bid");
      }

      const responseData = await response.json();
      console.log("Bid removed:", responseData);
      setBidPrice(-1); // Reset bid price indicating no current bid
      fetchData(event!.event_id); // triggers re-render
    } catch (error) {
      console.error("Error removing bid:", error);
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
              <p>
                Top 5 Lowest Asks: {formatPrices(topPrices.top_5_lowest_asks)}
              </p>
              <p>
                Top 5 Highest Bids: {formatPrices(topPrices.top_5_highest_bids)}
              </p>
              <p>
                Your Current Bid:{" "}
                {bidPrice !== -1 ? `$${bidPrice.toFixed(2)}` : "N/A"}
              </p>
            </div>
          </div>
        )}

        <div className="action-card">
          <div className="card-header">
            <h2 className="card-title">Buy</h2>
          </div>
          <div className="button-container">
            <button
              className={`buy-button ${
                bidPrice != -1 || lowestAsk == -1 ? "disabled" : ""
              }`}
              onClick={handleBuyLowest}
              disabled={bidPrice !== -1 || lowestAsk === -1} // This actually disables the button
            >
              Buy Now
              <br />
              Lowest Ask:{" "}
              {lowestAsk !== -1 ? `$${lowestAsk.toFixed(2)}` : "N/A"}
            </button>

            {bidPrice === -1 ? (
              <button
                className="bid-button"
                onClick={() => setIsBidModalOpen(true)}
              >
                Place New Bid
                <br />
                Lowest Ask:{" "}
                {lowestAsk !== -1 ? `$${lowestAsk.toFixed(2)}` : "N/A"}
              </button>
            ) : (
              <button
                className="bid-button"
                onClick={() => setIsEditBidModalOpen(true)}
              >
                Edit Bid
                <br />
                Current Bid: {`$${bidPrice.toFixed(2)}`}
              </button>
            )}
            <button
              className={`remove-bid-button ${
                bidPrice === -1 ? "disabled" : ""
              }`}
              onClick={handleRemoveBid}
              disabled={bidPrice === -1}
            >
              Remove Bid
            </button>
          </div>
        </div>
      </div>
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onSubmit={handlePlaceNewBid}
        bidPrice={0}
      />
      <EditBidModal
        isOpen={isEditBidModalOpen}
        onClose={() => setIsEditBidModalOpen(false)}
        onSubmit={handleEditBid}
        bidPrice={bidPrice} // Pass bidPrice as a prop
      />
    </div>
  );
};

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidValue: number) => void;
  bidPrice: number; // Add bidPrice here
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

const EditBidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bidPrice,
}) => {
  const [editBidValue, setEditBidValue] = useState("");

  useEffect(() => {
    // Set initial value to current bid when modal opens
    if (isOpen && bidPrice !== -1) {
      setEditBidValue(bidPrice.toString());
    }
  }, [isOpen, bidPrice]);

  const handleSubmit = () => {
    const value = parseFloat(editBidValue);
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
        <h2>Edit Your Bid</h2>
        <input
          type="number"
          value={editBidValue}
          onChange={(e) => setEditBidValue(e.target.value)}
          placeholder="Enter new bid amount"
        />
        <button onClick={handleSubmit}>Update Bid</button>
      </div>
    </div>
  ) : null;
};

export default BuyPage;
