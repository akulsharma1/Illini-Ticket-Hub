// eventsView.tsx
import React, {useState, useEffect} from 'react';
import './eventsView.css';

// Event has id, type, start, opponent, and location
interface Event {
    event_id: number;
    event_type: string;
    event_start: Date;
    away_team: string;
    stadium_location: string;
  }
  
  // Card for displaying events
  const EventCard: React.FC<Event> = ({ event_id, event_type, event_start, away_team, stadium_location }) => {
    // Format date for displaying
    const formattedDate = event_start ? new Date(event_start).toLocaleDateString() : '';
  
    return (
      <div className="events-container">
        <div key={event_id} className="event-card">
          <div className="event-details">
            <h3>{event_type}</h3>
            <p>Illinois VS  {away_team}</p>
            <p>Stadium: {stadium_location}</p>
            <p className="event-date">Date: {formattedDate}</p>
          </div>
          <div className="event-actions">
            <button className="buy-button">Buy</button>
            <button className="sell-button">Sell</button>
          </div>
        </div>
      </div>
    );
  };

const EventsView: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
  
    // Retrieves events from backend and stores them in events, handling errors and loading
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(
            "http://localhost:5555/events/"
          );
          if (!response.ok) {
            console.log("error fetching data");
            throw new Error("Failed to fetch data");
          }
          console.log("successfuly got data");
          const data = await response.json();
          console.log(data);
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
  
    // handle loading
    if (loading) {
      console.log("loading");
      return <div>Loading...</div>;
    }
  
    // handle error
    if (error) {
      console.error("error found: ", error);
      return <div>Error: {error}</div>;
    }
  
    // Render event list
    return (
      <div className="event-container">
        <div className="event-heading">Events</div>
        <div className="event-cards">
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
      </div>
    );

};

export default EventsView;
