import React from "react";
import "./accountButton.css";
import { Link } from "react-router-dom";

interface accountButtonProps {
  onClick: () => void;
}

const accountButton: React.FC<accountButtonProps> = ({ onClick }) => {
  return (
    <Link to="/account">
      <button className="account-button" onClick={onClick}>
        Account
      </button>
    </Link>
  );
};

export default accountButton;
