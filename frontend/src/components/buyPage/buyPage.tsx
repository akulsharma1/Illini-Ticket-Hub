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

const BuyPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [lowestAsk, setLowestAsk] = useState<number>(-1);
  const [highestBid, setHighestBid] = useState<number>(-1);

  useEffect(() => {
    const fetchData = async (eventId: number) => {
      try {
        // Fetch event details, lowest ask, and highest bid
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const storedEvent = localStorage.getItem("currEvent");
    if (storedEvent) {
      const storedEventData = JSON.parse(storedEvent);
      setEvent(storedEventData);
      // Retrieve event ID from stored event data
      const eventId = storedEventData.event_id;
      fetchData(eventId);
    } else {
      console.error("Event not found in local storage");
    }
  }, []);

  if (!event) {
    return <div>Event not found</div>;
  }

  const formattedDate = event.event_start
    ? new Date(event.event_start).toLocaleDateString()
    : "";

  const handleBuyLowest = async () => {
    try {
      // Retrieve user ID from local storage
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        console.error("User profile not found in local storage");
        return;
      }
      const ownerId = JSON.parse(userProfile).account_id;

      // Send bid creation request with owner ID
      const response = await fetch("http://localhost:5555/bids/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: lowestAsk,
          event_id: event.event_id,
          owner_id: ownerId, // Use retrieved owner ID
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create bid");
      }
      const responseData = await response.json();
      console.log(responseData); // Log response from backend
    } catch (error) {
      console.error("Error creating bid:", error);
    }
  };

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
            <button className="bid-button">
              Place New Bid
              <br />
              Highest Bid: {highestBid}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
