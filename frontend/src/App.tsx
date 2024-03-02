import React, { useState } from "react";
import Sidebar from "./components/sidebar/sidebar";
import AccountButton from "./components/accountButton/accountButton";
import DashboardTickets from "./components/dashboardTickets/dashboardTickets";
import AccountView from "./components/accountView/accountView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
};
export default App;
