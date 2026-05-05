import { useState, useEffect } from "react";
import "./Loans.css";
import { apiFetch } from "../../api";

function LoanRequests() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("amount");
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewDocs, setViewDocs] = useState(null);

  useEffect(() => { fetchLoans(); }, []);

  const fetchLoans = async () => {
    try {
      const res = await apiFetch("/api/loans");
      const data = await res.json();
      if(res.ok) setLoanRequests(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = filterStatus === "All" ? loanRequests : loanRequests.filter((loan) => loan.status === filterStatus);
  const sortedLoans = [...filteredLoans].sort((a, b) => sortBy === "amount" ? b.amount - a.amount : new Date(b.created_at) - new Date(a.created_at));

  const updateStatus = async (id, newStatus, reason = "") => {
    if(newStatus === "Under Verification") newStatus = "pending";
    if(newStatus === "Sanctioned") newStatus = "approved";
    if(newStatus === "Cancelled") newStatus = "rejected";

    let payload = { status: newStatus };

    if (newStatus === "approved") {
      payload = { ...payload, bank: "SBI Bank", account: "XXXX9921", interest: 9.5, duration: "5 Years", emi: 4200 };
    }

    if (newStatus === "rejected" && reason) {
      payload.rejection_reason = reason;
    }

    try {
      const res = await apiFetch(`/api/loans/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        fetchLoans();
        setRejectModal(null);
        setRejectionReason("");
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleReject = (loan) => {
    setRejectModal(loan);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    updateStatus(rejectModal.id, "rejected", rejectionReason);
  };

  const displayStatus = (status) => {
    if(status === 'approved') return 'Sanctioned';
    if(status === 'rejected') return 'Cancelled';
    return 'Under Verification';
  };

  const dbStatus = (display) => {
    if(display === 'Sanctioned') return 'approved';
    if(display === 'Cancelled') return 'rejected';
    return 'pending';
  };

  const totalLoans = loanRequests.length;
  const sanctioned = loanRequests.filter(l => l.status === "approved").length;
  const cancelled = loanRequests.filter(l => l.status === "rejected").length;
  const verification = loanRequests.filter(l => l.status === "pending").length;
  const totalApprovedAmount = loanRequests.filter(l => l.status === "approved").reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div className="loan-requests-wrapper">
      <h2>Loan Request Management</h2>

      <div className="stats-container">
        <div className="stat-card">Total: {totalLoans}</div>
        <div className="stat-card green">Sanctioned: {sanctioned}</div>
        <div className="stat-card red">Cancelled: {cancelled}</div>
        <div className="stat-card orange">Under Verification: {verification}</div>
        <div className="stat-card blue">Approved Amount: ₹{totalApprovedAmount}</div>
      </div>

      <div className="controls">
        <select onChange={(e) => setFilterStatus(dbStatus(e.target.value))}>
          <option value="All">All</option>
          <option value="Sanctioned">Sanctioned</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Under Verification">Under Verification</option>
        </select>

        <select onChange={(e) => setSortBy(e.target.value)}>
          <option value="amount">Sort by Amount</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
           <p>Loading requests...</p>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Loan Details</th>
              <th>CIBIL</th>
              <th>Documents</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLoans.map((loan) => (
              <tr key={loan.id}>
                <td>
                  <strong>{loan.applicant_name}</strong><br />
                  {loan.applicant_email}<br />
                  {loan.phone || 'N/A'}
                </td>
                <td>
                  ₹{parseFloat(loan.amount).toLocaleString()}<br />
                  {loan.purpose}
                </td>
                <td>{loan.cibil || 'N/A'}</td>
                <td>
                  {(loan.id_proof || loan.income_proof || loan.address_proof) ? (
                    <button className="doc-btn" onClick={() => setViewDocs(loan)}>View Docs</button>
                  ) : (
                    <span style={{color: '#999'}}>No docs</span>
                  )}
                </td>
                <td>{new Date(loan.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${displayStatus(loan.status).replace(" ", "")}`}>
                    {displayStatus(loan.status)}
                  </span>
                </td>
                <td>
                  {loan.status === 'pending' && (
                    <div style={{display: 'flex', gap: '5px'}}>
                      <button className="approve-btn" onClick={() => updateStatus(loan.id, "approved")}>Approve</button>
                      <button className="reject-btn" onClick={() => handleReject(loan)}>Reject</button>
                    </div>
                  )}
                  {loan.status !== 'pending' && <span>-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Reject Loan Application</h3>
            <p>Applicant: <strong>{rejectModal.applicant_name}</strong></p>
            <p>Amount: <strong>₹{parseFloat(rejectModal.amount).toLocaleString()}</strong></p>
            
            <label>Rejection Reason:</label>
            <select value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}>
              <option value="">Select reason</option>
              <option value="Low CIBIL Score">Low CIBIL Score</option>
              <option value="Insufficient Income">Insufficient Income</option>
              <option value="Incomplete Documents">Incomplete Documents</option>
              <option value="High Debt-to-Income Ratio">High Debt-to-Income Ratio</option>
              <option value="Other">Other</option>
            </select>

            {rejectionReason === "Other" && (
              <textarea 
                placeholder="Enter custom reason..." 
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{marginTop: '10px', width: '100%', padding: '10px', minHeight: '80px'}}
              />
            )}

            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
              <button onClick={confirmReject} style={{flex: 1, padding: '10px', background: '#d93025', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
                Confirm Rejection
              </button>
              <button onClick={() => {setRejectModal(null); setRejectionReason("");}} style={{flex: 1, padding: '10px', background: '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {viewDocs && (
        <div className="modal">
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <h3>Documents - {viewDocs.applicant_name}</h3>
            
            <div style={{marginTop: '20px'}}>
              {viewDocs.id_proof && (
                <div style={{marginBottom: '15px'}}>
                  <strong>ID Proof:</strong><br />
                  <a href={`http://localhost:5000/${viewDocs.id_proof}`} target="_blank" rel="noopener noreferrer" style={{color: '#2c7be5'}}>
                    View Document →
                  </a>
                </div>
              )}
              {viewDocs.income_proof && (
                <div style={{marginBottom: '15px'}}>
                  <strong>Income Proof:</strong><br />
                  <a href={`http://localhost:5000/${viewDocs.income_proof}`} target="_blank" rel="noopener noreferrer" style={{color: '#2c7be5'}}>
                    View Document →
                  </a>
                </div>
              )}
              {viewDocs.address_proof && (
                <div style={{marginBottom: '15px'}}>
                  <strong>Address Proof:</strong><br />
                  <a href={`http://localhost:5000/${viewDocs.address_proof}`} target="_blank" rel="noopener noreferrer" style={{color: '#2c7be5'}}>
                    View Document →
                  </a>
                </div>
              )}
            </div>

            <button onClick={() => setViewDocs(null)} style={{marginTop: '20px', padding: '10px 20px', background: '#2c7be5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanRequests;
