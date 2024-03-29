import React, { useState } from "react";
import Sidebar from "./components/sidebar/sidebar";
import AccountButton from "./components/accountButton/accountButton";
import DashboardTickets from "./components/dashboardTickets/dashboardTickets";
import AccountView from "./components/accountView/accountView";
import LoginPage from "./components/loginPage/LoginPage";
import CreateAccount from "./components/createAccount/CreateAccount";
import BuyPage from "./components/buyPage/buyPage";
import SellPage from "./components/sellPage/sellPage";
import EventsView from "./components/eventsView/eventsView";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleAccountButtonClick = () => {};

  return (
    <div className="main-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AccountButton onClick={handleAccountButtonClick} />
      <DashboardTickets />
    </div>
  );
};

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("");
  return (
    <div className="main-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AccountView />
    </div>
  );
};

const BuyTicketsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Buy");

  return (
    <div className="main-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <BuyPage />
    </div>
  );
};

const SellTicketsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Sell");

  return (
    <div className="main-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <SellPage />
    </div>
  );
};

const EventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Events");
  const handleAccountButtonClick = () => {};

  return (
    <div className="main-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AccountButton onClick={handleAccountButtonClick} />
      <EventsView />
    </div>
  );
};

// All of our routes and routing is setup here:
// buyPage and sellPage have dynamic routing based on the eventID
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/buy/:eventID" element={<BuyTicketsPage />} />
        <Route path="/sell" element={<SellTicketsPage />} />
        <Route path="/events" element={<EventsPage />} />
      </Routes>
    </Router>
  );
};
export default App;
