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

const SellPage: React.FC = () => {
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

  return (
    <div className="sell-page">
      <div className="container">
        <div className="event-card-sell">
          <div className="card-header">
            <h1 className="card-title">{event.event_type}</h1>
          </div>
          <div className="card-content">
            <p>Away Team: {event.away_team}</p>
            <p>Stadium: {event.stadium_location}</p>
            <p>Event Start: {formattedDate}</p>
          </div>
        </div>
        <div className="action-card">
          <div className="card-header">
            <h2 className="card-title">Actions</h2>
          </div>
          <div className="button-container">
            <button className="buy-button">
              Buy Now
              <br />
              Lowest Ask: {lowestAsk}
            </button>
            <button className="sell-button">
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

export default SellPage;
