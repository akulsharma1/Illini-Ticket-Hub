import React from "react";
import { Link } from "react-router-dom";
import "./eventsView.css";

interface Event {
  event_id: number;
  event_type: string;
  event_start: Date;
  away_team: string;
  stadium_location: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formattedDate = event.event_start
    ? new Date(event.event_start).toLocaleDateString()
    : "";

  const handleClick = () => {
    localStorage.setItem('currEvent', JSON.stringify(event));
  };

  return (
    <div className="events-container">
      <div key={event.event_id} className="event-card">
        <div className="event-details">
          <h3>{event.event_type}</h3>
          <p>Illinois VS {event.away_team}</p>
          <p>Stadium: {event.stadium_location}</p>
          <p className="event-date">Date: {formattedDate}</p>
        </div>
        <div className="event-actions">
          <Link to="/buy">
            <button className="buy-button-event" onClick={handleClick}>
              Buy
            </button>
          </Link>
          <Link to="/sell">
            <button className="sell-button-event" onClick={handleClick}>
              Sell
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
