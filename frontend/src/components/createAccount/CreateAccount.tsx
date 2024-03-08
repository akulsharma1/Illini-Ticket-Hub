import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link component for routing
import './CreateAccount.css'; // Import CSS file for styling

const CreateAccount: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const createAccount = () => {
    // TODO - one of us will add the backend logic for creating an account later
    // Will need to make an entry into database
    const userData = { email };
    navigate("/dashboard", {state: { userData } }); // after creating an account, forward to database
  };

  return (
    <div className="create-container">
      <header className="top-header">
        <h1>Illini Ticket Hub</h1>
      </header>
      <div className="create-card">
        <div className="card-header">
          <h2>Create Account</h2>
        </div>
        <div className="card-body">
          <form>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <button type="button" className="create-button" onClick={createAccount}>Create Account</button>
            <div className="create-account">
              <p>Already have an account? <Link to="/login">Sign in!</Link></p> 
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
