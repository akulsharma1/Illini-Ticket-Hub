import React, { useState, useEffect } from "react";
import "./dashboardTickets.css";

// Ticket has values, owner_id, event_id, used, listed, and created_at
interface Ticket {
  owner_id: number;
  event_id: number;
  used: boolean;
  listed: boolean;
  created_at: string;
}

// Ticket card
const TicketCard: React.FC<Ticket> = ({ event_id, listed }) => {
  return (
    <div className="ticket-card">
      <strong className="event">Event ID: {event_id}</strong>
      <span className={listed ? "listed" : "unlisted"}>
        {listed ? "Listed" : "Unlisted"}
      </span>
    </div>
  );
};

const DashboardTickets: React.FC = () => {
  // States for tickets, error, and loading
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Retrieves tickets from backend and stores them in tickets, handling errors and loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5555/account/tickets?id=1"
        );
        if (!response.ok) {
          console.log("error fetching data");
          throw new Error("Failed to fetch data");
        }
        console.log("successfuly got data");
        const data = await response.json();
        console.log(data);
        const tickets: Ticket[] = data.tickets.map((ticketData: any) => ({
          owner_id: ticketData.owner_id,
          event_id: ticketData.event_id,
          used: ticketData.used,
          listed: ticketData.listed,
          created_at: ticketData.created_at,
        }));
        setTickets(tickets);
        console.log(tickets);
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

  // Render ticket list
  return (
    <div className="ticket-list">
      <div className="ticket-heading">Your Tickets</div>
      <div className="ticket-cards">
        {tickets.map((ticket, index) => (
          <TicketCard key={index} {...ticket} />
        ))}
      </div>
    </div>
  );
};

export default DashboardTickets;
