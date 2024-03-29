import { Link } from "react-router-dom";
import "./signOutButton.css";

const SignOutButton: React.FC = () => (
    <Link to="/login">
      <div className="sign-out-button">Sign Out</div>
    </Link>
);

export default SignOutButton;