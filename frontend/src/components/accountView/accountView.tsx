import React, { useState, useEffect } from "react";
import "./accountView.css";
import { Link } from "react-router-dom";

interface Account {
  username: string;
  email: string;
  // Add more fields as needed in future
}

const AccountDetails: React.FC<{ account: Account | null }> = ({ account }) => {
  if (!account) {
    return <p>Loading account data...</p>;
  }

  return (
    <div className="account-details">
      <p>
        <strong>Username:</strong> {account.username}
      </p>
      <p>
        <strong>Email:</strong> {account.email}
      </p>
      {/* Add more fields here as needed in future*/}
    </div>
  );
};

const SignOutButton: React.FC = () => (
  // route to the login page after signing out
  <Link to="/login">
    <div className="sign-out-button">Sign Out</div>
  </Link>
);

const AccountView: React.FC = () => {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    // Simulate fetching data with a delay
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: replace this dummy data with actual data from backend database in future
      const dummyAccount: Account = {
        username: "john_doe",
        email: "john.doe@example.com",
        // Add more dummy data as needed
      };

      setAccount(dummyAccount);
    };

    fetchData();
  }, []);

  const renderAccountDetails = () => (
    <div className="card">
      <div className="account-view">
        <h1>Account Information</h1>
        <AccountDetails account={account} />
      </div>
    </div>
    // account-view is not a defined css element in App.css so react will auto generate it at runtime
    // (we have account-view inside a card, so its styling is irrelevant)
  );

  return (
    <>
      <SignOutButton />
      {renderAccountDetails()}
    </>
  );
};

export default AccountView;
