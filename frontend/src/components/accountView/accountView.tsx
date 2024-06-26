import React, { useState, useEffect } from "react";
import "./accountView.css";
import { Link } from "react-router-dom";
import Plot from 'react-plotly.js';

interface Account {
  account_id: string;
  email_address: string;
  name: string;
  // Add more fields as needed in future
}

interface Transaction {
  id: number;
  created: Date;
  price: number;
}

const AccountDetails: React.FC<{ account: Account | null }> = ({ account }) => {
  const [numBids, setNumBids] = useState<number>(0);
  const [numAsks, setNumAsks] = useState<number>(0);
  // console.log(account);

  useEffect(() => {
    const fetchData = async () => {
      if (account) {
        try {
          const bidsResponse = await fetch(
            "http://localhost:5555/account/bids?id=" + account.account_id
          );
          if (bidsResponse.ok) {
            const bidsData = await bidsResponse.json();
            setNumBids(bidsData.count);
          } else {
            throw new Error("Failed to fetch bid data");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [account]);

  useEffect(() => {
    const fetchData = async () => {
      if (account) {
        try {
          const asksResponse = await fetch(
            "http://localhost:5555/account/asks?id=" + account.account_id
          );
          if (asksResponse.ok) {
            const asksData = await asksResponse.json();
            setNumAsks(asksData.count);
          } else {
            throw new Error("Failed to fetch ask data");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [account]);

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
        <strong>Number of Active Bids:</strong> {numBids}
      </p>
      <p>
        <strong>Number of Active Asks:</strong> {numAsks}
      </p>
      <p>
        {/* <strong>Account Creation Date:</strong> 3/24/22 */}
      </p>
    </div>
  );
};

const TransactionGraphs: React.FC<{ account: Account | null }> = ({ account }) => {
  const [sellTransactions, setSellTransactions] = useState<Transaction[]>([]);
  const [buyTransactions, setBuyTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (account) {
        try {
          const transactionResponse = await fetch(
            "http://localhost:5555/account/transactions?id=" + account.account_id
          );
          if (transactionResponse.ok) {
            const transactionData = await transactionResponse.json();
            const sellTransactions: Transaction[] = transactionData.selling_transactions.map((transactionData: any) => ({
              id: transactionData.seller_id,
              created: transactionData.created_at,
              price: transactionData.price,
            }));
            const buyTransactions: Transaction[] = transactionData.buying_transactions.map((transactionData: any) => ({
              id: transactionData.buyer_id,
              created: transactionData.created_at,
              price: transactionData.price,
            }));
            setSellTransactions(sellTransactions);
            setBuyTransactions(buyTransactions);
          } else {
            throw new Error("Failed to fetch bid data");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [account]);

  if (!account) {
    return <p></p>;
  }

  return (
     <div>
      <Plot
      data={[
        {
          x: sellTransactions.map(transaction => transaction.created),
          y: sellTransactions.map(transaction => transaction.price),
          mode: "markers",
          type: "scatter",
          marker: {
            size: 12,
          }
        },
      ]}
      layout={{
        title: "Sell Transactions",
        xaxis: {
          title: "Time",
        },
        yaxis: {
          title: "Price",
        },
      }}
    />
    <Plot
      data={[
        {
          x: buyTransactions.map(transaction => transaction.created),
          y: buyTransactions.map(transaction => transaction.price),
          mode: "markers",
          type: "scatter",
          marker: {
            size: 12,
          }
        },
      ]}
      layout={{
        title: "Buy Transactions",
        xaxis: {
          title: "Time",
        },
        yaxis: {
          title: "Price",
        },
      }}
    />
  </div>
  
  )


}


const AccountView: React.FC = () => {
  const [account, setAccount] = useState<Account | null>(null);
  let profile: Account;
  const st = localStorage.getItem("userProfile");
  // console.log("st: ", st);

  if (!st) {
    throw new Error("feafaeio");
  } else {
    profile = JSON.parse(st) as Account;
  }
  console.log("json_profile", profile);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5555/account/profile?id=" + profile.account_id,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        // console.log(data);
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

  const renderTransactionGraphs = () => (
    <div className="transaction-card">
       <div className="transaction-graphs">
          <TransactionGraphs account={account} />
       </div>

    </div>
  )

  return <>{renderAccountDetails()} {renderTransactionGraphs()}</>;
};

export default AccountView;
