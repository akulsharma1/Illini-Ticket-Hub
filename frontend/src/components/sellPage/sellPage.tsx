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

  useEffect(() => {
    const fetchData = async (eventId: number) => {
      try {
        const response = await fetch(`http://localhost:5555/events/prices/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }
        const eventData = await response.json();

        setEvent(eventData.event);
        setLowestAsk(eventData.lowest_ask);
        setHighestBid(eventData.highest_bid);

        const topPricesResponse = await fetch(`http://localhost:5555/events/prices/top/${eventId}`);
        if (!topPricesResponse.ok) {
          throw new Error("Failed to fetch top prices");
        }
        const topPricesData = await topPricesResponse.json();
        setTopPrices({
          top_5_lowest_asks: topPricesData.top_5_lowest_asks,
          top_5_highest_bids: topPricesData.top_5_highest_bids,
        });
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

  if (!event) {
    return <div>Event not found</div>;
  }

  const formattedDate = event.event_start ? new Date(event.event_start).toLocaleDateString() : "";

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
              <p>Top 5 Lowest Asks: {topPrices.top_5_lowest_asks.join(", ")}</p>
              <p>Top 5 Highest Bids: {topPrices.top_5_highest_bids.join(", ")}</p>
            </div>
          </div>
        )}

        <div className="action-card">
          <div className="card-header">
            <h2 className="card-title">Sell</h2>
          </div>
          <div className="button-container">
            <button className="buy-button">
              Place New Ask
              <br />
              Lowest Ask: {lowestAsk}
            </button>
            <button className="sell-button">
              Sell Now
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
