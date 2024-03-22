// eventsView.tsx
import React from 'react';
import './eventsView.css';

const EventsView: React.FC = () => {
    // Dummy data for events
    const events = [
        { id: 1, name: 'Event 1', opponent: 'Opponent 1', date: '2024-04-01' },
        { id: 2, name: 'Event 2', opponent: 'Opponent 2', date: '2024-04-15' },
        // Add more events as needed
    ];

    return (
        <div className="events-container">
            {events.map(event => (
                <div key={event.id} className="event-card">
                    <div className="event-details">
                        <h3>{event.name}</h3>
                        <p>Opponent: {event.opponent}</p>
                        <p className="event-date">Date: {event.date}</p>
                    </div>
                    <div className="event-actions">
                        <button className="buy-button">Buy</button>
                        <button className="sell-button">Sell</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventsView;
