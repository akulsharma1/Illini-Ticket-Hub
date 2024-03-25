import React, { useState, useEffect } from "react";
import EventCard from "./eventsCard";
import "./eventsView.css";

interface Event {
  event_id: number;
  event_type: string;
  event_start: Date;
  away_team: string;
  stadium_location: string;
}

const EventsView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5555/events/");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const events: Event[] = data.events.map((eventData: any) => ({
          event_id: eventData.event_id,
          event_type: eventData.event_type,
          event_start: eventData.event_start,
          away_team: eventData.away_team,
          stadium_location: eventData.stadium_location,
        }));
        setEvents(events);
        setLoading(false);
      } catch (error) {
        setError((error as Error).toString());
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="event-container">
      <div className="event-heading">Events</div>
      <div className="event-cards">
        {events.map((event) => (
          <EventCard key={event.event_id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventsView;
