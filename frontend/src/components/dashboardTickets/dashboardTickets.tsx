import React, { useState, useEffect } from "react";
import "./dashboardTickets.css";

interface Account {
  account_id: string;
  email_address: string;
  name: string;
}

// Ticket has values, owner_id, event_id, used, listed, and created_at
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

// Ticket card
const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [askPrice, setAskPrice] = useState<number>(-1); // Initialize with a default value (-1 or any appropriate default value)

  console.log("In Ticket Card");

  useEffect(() => {
    const fetchEventAndAskPrice = async () => {
      try {
        // Fetch event details, lowest ask, and highest bid
        const eventResponse = await fetch(
          `http://localhost:5555/events/prices/${ticket.event_id}`
        );
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
        setAskPrice(askData.CurrentAsk); // Assuming `CurrentBid` is the key for ask price in the response
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
  // States for tickets, error, and loading
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  let profile: Account;
  const st = localStorage.getItem("userProfile");

  if (!st) {
    throw new Error("User profile not found in local storage");
  } else {
    profile = JSON.parse(st) as Account;
  }

  // Retrieves tickets from backend and stores them in tickets, handling errors and loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5555/account/tickets?id=" + profile.account_id
        );
        if (!response.ok) {
          console.log("error fetching data");
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const tickets: Ticket[] = data.tickets.map((ticketData: any) => ({
          owner_id: ticketData.owner_id,
          event_id: ticketData.event_id,
          used: ticketData.used,
          listed: ticketData.listed,
          created_at: ticketData.created_at,
        }));
        setTickets(tickets);
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
    // return <div>Loading...</div>;
  }

  // handle error
  if (error) {
    console.error("error found: ", error);
    // return <div>Error: {error}</div>;
  }

  console.log(tickets);
  if (tickets.length === 0) {
    return (
      <div className="ticket-list">
        <div className="ticket-heading"> No Tickets</div>
      </div>
    );
  }

  // Render ticket list
  return (
    <div className="ticket-list">
      <div className="ticket-heading">Your Tickets</div>
      <div className="ticket-cards">
        {tickets.map((ticket) => (
          <TicketCard ticket={ticket} />
        ))}
      </div>
    </div>
  );
};

export default DashboardTickets;
