import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import "./loanHistory.css";

function LoanHistory() {
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await apiFetch("/api/loans/my");
        const data = await res.json();
        if (res.ok) setLoans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const filteredLoans = filter === "All" 
    ? loans 
    : loans.filter(l => l.status === filter.toLowerCase());

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pending", class: "badge-pending" },
      approved: { label: "Approved", class: "badge-approved" },
      rejected: { label: "Rejected", class: "badge-rejected" }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="loan-history-wrapper">
      <div className="history-header">
        <h2>My Loan History</h2>
        <div className="filter-buttons">
          {["All", "Pending", "Approved", "Rejected"].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading your loan history...</p>
      ) : filteredLoans.length === 0 ? (
        <p className="no-loans">No loans found for this filter.</p>
      ) : (
        <div className="history-grid">
          {filteredLoans.map((loan) => {
            const badge = getStatusBadge(loan.status);
            return (
              <div key={loan.id} className="history-card">
                <div className="card-header">
                  <h3>₹{parseFloat(loan.amount).toLocaleString()}</h3>
                  <span className={`status-badge ${badge.class}`}>{badge.label}</span>
                </div>

                <div className="card-body">
                  <p><strong>Purpose:</strong> {loan.purpose}</p>
                  <p><strong>Applied On:</strong> {new Date(loan.created_at).toLocaleDateString()}</p>
                  
                  {loan.status === "approved" && (
                    <>
                      <p><strong>Approved On:</strong> {loan.approved_date ? new Date(loan.approved_date).toLocaleDateString() : "N/A"}</p>
                      <p><strong>Bank:</strong> {loan.bank || "N/A"}</p>
                      <p><strong>Interest Rate:</strong> {loan.interest}%</p>
                      <p><strong>Duration:</strong> {loan.duration}</p>
                      <p><strong>EMI:</strong> ₹{loan.emi ? parseFloat(loan.emi).toLocaleString() : "N/A"}</p>
                    </>
                  )}

                  {loan.status === "rejected" && loan.rejection_reason && (
                    <div className="rejection-box">
                      <strong>Rejection Reason:</strong>
                      <p>{loan.rejection_reason}</p>
                    </div>
                  )}

                  {loan.status === "pending" && (
                    <p className="pending-note">Your application is under review</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LoanHistory;
