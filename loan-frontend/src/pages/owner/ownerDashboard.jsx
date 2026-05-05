import { useState, useEffect } from "react";
import "./ownerDashboard.css";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await apiFetch("/api/loans");
        const data = await res.json();
        if(res.ok) setLoans(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLoans();
  }, []);

  const totalApplications = loans.length;
  const sanctionedCount = loans.filter(l => l.status === "approved").length;
  const totalApprovedAmount = loans.filter(l => l.status === "approved").reduce((a, b) => a + parseFloat(b.amount), 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="logout-container" style={{ position: "absolute", top: 10, right: 10 }}>
          <button style={{ padding: "8px 16px", borderRadius: "5px", background: "none", color: "white", border: "1px solid white", cursor: "pointer" }} onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="hero-content">
          <h1>Loan Management System</h1>
          <p>
            Maximizing Customer Experience and Simplifying
            Loan Lifecycle in Retail, Corporate and Automotive Lending.
          </p>

          <button
            className="hero-btn"
            onClick={() => navigate("/owner/loans")}
          >
            Review Loans
          </button>
        </div>
      </section>

      {/* DASHBOARD STATS */}
      <section className="stats-section">
        <div className="stat-card">
          <h4>Total Applications</h4>
          <p>{totalApplications}</p>
        </div>

        <div className="stat-card">
          <h4>Loans Sanctioned</h4>
          <p>{sanctionedCount}</p>
        </div>

        <div className="stat-card">
          <h4>Total Approved Amount</h4>
          <p>₹{totalApprovedAmount}</p>
        </div>

        <div className="stat-card">
          <h4>Pending Applications</h4>
          <p>{loans.filter(l => l.status === "pending").length}</p>
        </div>
      </section>

    </div>
  );
}

export default OwnerDashboard;