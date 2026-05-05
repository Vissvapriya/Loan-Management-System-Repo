import { Outlet, useNavigate } from "react-router-dom";
import "../pages/owner/ownerDashboard.css";

function OwnerLayout() {
  const navigate = useNavigate();

  return (
    <div className="owner-wrapper">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">LoanSys</div>

        <nav className="nav-links">
          <a onClick={() => navigate("/owner/dashboard")}>Dashboard</a>
          <a onClick={() => navigate("/owner/users")}>Users</a>
          <a onClick={() => navigate("/owner/loans")}>Loans</a>
          <a onClick={() => navigate("/owner/reports")}>Reports</a>
        </nav>

        <button className="contact-btn" onClick={() => navigate("/")}>
          Logout
        </button>
      </header>
      

      {/* Page Content will load here */}
      <div style={{ padding: "80px" }}>
        <Outlet />
      </div>

    </div>
  );
}

export default OwnerLayout;