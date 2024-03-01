import React, { useState, useEffect } from "react";
import "./dashboardTickets.css";

interface Ticket {
  owner_id: number;
  event_id: number;
  used: boolean;
  listed: boolean;
  created_at: string;
}

const DashboardTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5555/account/tickets/test?id=1"
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
            created_at: ticketData.created_at
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

  if (loading) {
    console.log("loading");
    return <div>Loading...</div>;
  }

  if (error) {
    console.error("error found: ", error);
    return <div>Error: {error}</div>;
  }

  return (
    <div className="ticket-list">
      <div className="ticket-heading">Your Tickets</div>
      {<ul className="ticket-tabs">
        {tickets.map((ticket, index) => (
          <li key={index}>
            <strong className="event">Event ID: {ticket.event_id}</strong>,{" "}
            <strong className={ticket.used ? "used" : "unused"}>
              {ticket.used ? "used" : "unused"}
            </strong>{" "}
            <strong className={ticket.listed ? "listed" : "unlisted"}>
              {ticket.listed ? "listed" : "unlisted"}
            </strong>{" "}
          </li>
        ))}
      </ul>}
    </div>
  );
};

export default DashboardTickets;
