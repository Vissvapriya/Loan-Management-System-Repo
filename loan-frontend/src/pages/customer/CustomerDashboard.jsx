import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import "./customerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await apiFetch("/api/loans/my");
        const data = await res.json();
        if(res.ok) {
          setApplications(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  return (
    <div className="customer-wrapper">

      {/* HERO SECTION */}
      <section className="customer-hero">
        <div className="customer-hero-content">
          <h1>Welcome, {user.name}!</h1>
          <p>
            Manage your loan applications, check balances,
            track EMI payments and stay updated with due dates.
          </p>

          <button
            className="apply-btn"
            onClick={() => navigate("/customer/apply-loan")}
          >
            Apply for Loan
          </button>
        </div>
      </section>

      {/* DASHBOARD STATS */}
      <section className="customer-stats">
        <div className="customer-card">
          <h4>Total Loans Applied</h4>
          <p>{applications.length}</p>
        </div>
        <div className="customer-card">
          <h4>Active Loans</h4>
          <p>{applications.filter(a => a.status === 'approved').length}</p>
        </div>
        <div className="customer-card">
          <h4>Interest Rate</h4>
          <p>9%</p>
        </div>
        <div className="customer-card">
          <h4>Pending Applications</h4>
          <p className="status">{applications.filter(a => a.status === 'pending').length}</p>
        </div>
      </section>

      {/* LOAN APPLICATIONS */}
      <section className="customer-applications">
        <h2>Your Loan Applications</h2>

        {loading ? (
          <p>Loading your loans...</p>
        ) : applications.length === 0 ? (
          <p>No loan applications submitted yet.</p>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="application-card">
              <p><strong>Loan Amount:</strong> ₹{app.amount}</p>
              <p><strong>Purpose:</strong> {app.purpose}</p>
              <p><strong>Applied On:</strong> {new Date(app.created_at).toLocaleDateString()}</p>
              <p className="status">Status: {app.status}</p>
            </div>
          ))
        )}
      </section>

    </div>
  );
}

export default CustomerDashboard;