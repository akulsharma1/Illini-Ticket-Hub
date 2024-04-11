import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./createTicketButton.css";

interface Account {
  account_id: string;
  email_address: string;
  name: string;
}

interface Event {
  event_id: number;
  event_type: string;
  event_start: Date;
  away_team: string;
  stadium_location: string;
}

const createTicket = async (eventId: number) => {
  let profile: Account;
  const st = localStorage.getItem("userProfile");

  if (!st) {
    throw new Error("feafaeio");
  } else {
    profile = JSON.parse(st) as Account;
  }

  try {
    const response = await fetch(
      "http://localhost:5555/account/create-ticket",
      {
        // fetch email and password data from backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_id: profile.account_id,
          event_id: eventId,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Bad ticket make");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
};

const CreateTicketButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = (eventId: number) => {
    createTicket(eventId);
    handleCloseModal();
  };

  return (
    <>
      <button className="create-ticket-button" onClick={handleOpenModal}>
        +
      </button>
      <TicketModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidValue: number) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState(-1);
  const [events, setEvents] = useState<Event[]>([]);

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit(selectedOption);
      setSelectedOption(-1);
    }
  };

  const handleClose = () => {
    setSelectedOption(-1);
    onClose();
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(Number(e.target.value));
  };

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
      } catch (error) {
        throw new Error("Somethings wrong");
      }
    };

    fetchData();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="ticket-modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>
          &times;
        </span>
        <h2>Select an Option</h2>
        <select
          value={selectedOption}
          onChange={handleOptionChange}
          className="dropdown"
        >
          <option value="">Select an option...</option>
          {events.map((event, index) => (
            <option key={index} value={event.event_id}>
              {event.event_type} vs {event.away_team}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default CreateTicketButton;
