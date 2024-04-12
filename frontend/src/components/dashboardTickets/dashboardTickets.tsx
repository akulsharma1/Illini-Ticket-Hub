// dashboardTickets.tsx

import React, { useState, useEffect } from "react";
import "./dashboardTickets.css";

interface Account {
  account_id: string;
  email_address: string;
  name: string;
}

interface Ticket {
  owner_id: number;
  event_id: number;
  used: boolean;
  listed: boolean;
  created_at: string;
}

interface TicketCardProps {
  ticket: Ticket;
}

interface Event {
  event_id: number;
  event_type: string;
  event_start: Date;
  away_team: string;
  stadium_location: string;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [askPrice, setAskPrice] = useState<number>(-1);

  useEffect(() => {
    const fetchEventAndAskPrice = async () => {
      try {
        const eventResponse = await fetch(`http://localhost:5555/events/prices/${ticket.event_id}`);
        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event data");
        }
        const eventData = await eventResponse.json();
        setEvent(eventData.event);

        const askResponse = await fetch(`http://localhost:5555/account/userask/${ticket.event_id}/${ticket.owner_id}`);
        if (!askResponse.ok) {
          throw new Error("Failed to fetch ask price");
        }
        const askData = await askResponse.json();
        setAskPrice(askData.CurrentAsk);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchEventAndAskPrice();
  }, [ticket.event_id, ticket.owner_id]);

  if (!event) {
    return <div></div>;
  }

  const formattedDate = event.event_start
    ? new Date(event.event_start).toLocaleDateString()
    : "";

  return (
    <div className="ticket-card">
      <div className="ticket-event-details">
        <h3>{event.event_type}</h3>
        <p>Illinois VS {event.away_team}</p>
        <p>Stadium: {event.stadium_location}</p>
        <p className="event-date">Date: {formattedDate}</p>
      </div>
      <span className={ticket.listed ? "listed" : "unlisted"}>
        {ticket.listed ? `Listed at $${askPrice.toFixed(2)}` : "Unlisted"}
      </span>
    </div>
  );
};

const DashboardTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const profile: Account = JSON.parse(localStorage.getItem("userProfile") || "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5555/account/tickets?id=${profile.account_id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const fetchedTickets: Ticket[] = data.tickets.map((ticketData: any) => ({
          owner_id: ticketData.owner_id,
          event_id: ticketData.event_id,
          used: ticketData.used,
          listed: ticketData.listed,
          created_at: ticketData.created_at,
        }));

        const listedTickets = fetchedTickets.filter(ticket => ticket.listed);
        const unlistedTickets = fetchedTickets.filter(ticket => !ticket.listed);

        const sortedTickets = [...listedTickets, ...unlistedTickets];

        setTickets(sortedTickets);
        setLoading(false);
      } catch (error) {
        setError((error as Error).toString());
        setLoading(false);
      }
    };

    fetchData();
  }, [profile.account_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="ticket-list">
        <div className="ticket-heading"> No Tickets</div>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      <div className="ticket-heading">Your Tickets</div>
      <div className="ticket-cards">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.event_id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
};

export default DashboardTickets;
