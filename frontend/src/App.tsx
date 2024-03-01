import React, { useState } from "react";
import Sidebar from "./components/sidebar/sidebar";
import AccountButton from "./components/accountButton/accountButton";
import DashboardTickets from "./components/dashboardTickets/dashboardTickets";
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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};
export default App;
