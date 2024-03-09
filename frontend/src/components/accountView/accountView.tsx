import React, { useState, useEffect } from "react";
import "./accountView.css";
import { Link } from "react-router-dom";

interface Account {
  account_id: string;
  email_address: string;
  name: string;
  // Add more fields as needed in future
}

const AccountDetails: React.FC<{ account: Account | null }> = ({ account }) => {
  if (!account) {
    return <p>Loading account data...</p>;
  }

  return (
    <div className="account-details">
      {/* get the account name and email which was pulled from the backend database*/}
      <p>
        <strong>Email:</strong> {account.email_address}
      </p>
      <p>
        <strong>Name:</strong> {account.name}
      </p>
      {/*replace this dummy data when we these fields it to the backend routing in the future*/}
      <p>
        <strong>Number of Active Bids:</strong> 5
      </p>
      <p>
        <strong>Number of Active Asks:</strong> 3
      </p>
      <p>
        <strong>Account Creation Date:</strong> 3/24/22
      </p>
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
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5555/account/profile", {
          // fetch email and name from backend database
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log(data);
        const profileData: Account = data.profile;
        setAccount(profileData); // store the pulled data
      } catch (error) {
        console.error("Error fetching data:", error);
        // handle any errors that might arise
      }
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
