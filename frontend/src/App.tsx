import React, { useState } from "react";
import Sidebar from "./components/sidebar/sidebar";
import AccountButton from "./components/accountButton/accountButton";
import DashboardTickets from "./components/dashboardTickets/dashboardTickets";
import AccountView from "./components/accountView/accountView";
import LoginPage from "./components/loginPage/LoginPage";
import CreateAccount from "./components/createAccount/CreateAccount";
import BuyPage from "./components/buyPage/buyPage";
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

  //const handleAccountButtonClick = () => {};

  return (
    <div className="main-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AccountView />
    </div>
  );
};

const BuyTicketsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("");

  return (
    <div className="main-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <BuyPage />
    </div>
  );
};

// All of our routes and routing is setup here:
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/buy" element={<BuyTicketsPage />} />
      </Routes>
    </Router>
  );
};
export default App;
