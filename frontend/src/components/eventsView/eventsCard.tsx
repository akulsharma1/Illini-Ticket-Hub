import React from "react";
import { Link } from "react-router-dom";
import "./eventsView.css";
import eventImage from "./images/StateFarmCenter.png";

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
    localStorage.setItem("currEvent", JSON.stringify(event));
  };

  return (
    <div className="event-card">
      <div className="event-details">
        <h3>{event.event_type}</h3>
        <p>Illinois VS {event.away_team}</p>
        <p>Stadium: {event.stadium_location}</p>
        <p className="event-date">Date: {formattedDate}</p>
      </div>
      <div className="event-image-container">
        <img src={eventImage} alt="Event Image" className="event-image"/>
      </div>
      <div className="event-actions">
        <Link to={`/buy/${event.event_id}`}>
          <button className="buy-button-event" onClick={handleClick}>
            Buy
          </button>
        </Link>
        <Link to={`/sell/${event.event_id}`}>
          <button className="sell-button-event" onClick={handleClick}>
            Sell
          </button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
