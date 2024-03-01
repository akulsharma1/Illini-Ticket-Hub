import React, { useState, useEffect } from "react";

interface Ticket {
  owner_id: number;
  event_id: number;
  used: boolean;
  listed: boolean;
  created_at: string;
}

const dashboardTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/account/tickets/test?id=1"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setTickets(data.tickets);
        setLoading(false);
      } catch (error) {
        setError(error as string);
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
    <div className="ticket-list">
      <div className="ticket-heading">Your Tickets</div>
      <ul className="ticket-tabs">
        {tickets.map((ticket, index) => (
          <li key={index}>
            <strong className="event">Event ID:</strong> {ticket.event_id},{" "}
            <strong className={ticket.used ? "used" : "unused"}>
              {ticket.used ? "used" : "unused"}
            </strong>{" "}
            <strong className={ticket.listed ? "listed" : "unlisted"}>
              {ticket.listed ? "listed" : "unlisted"}
            </strong>{" "}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default dashboardTickets;
