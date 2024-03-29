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

  useEffect(() => {
    const storedEvent = localStorage.getItem("currEvent");
    if (storedEvent) {
      setEvent(JSON.parse(storedEvent));
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
    <div className="buy-page">
      <div className="container">
        <div className="event-card-buy">
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
            <button className="buy-button">Buy Now</button>
            <button className="sell-button">Place New Bid</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
