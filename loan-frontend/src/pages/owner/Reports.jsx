import { useState, useEffect } from "react";
import "./ownerDashboard.css";
import { apiFetch } from "../../api";

function Reports() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await apiFetch("/api/loans");
        const data = await res.json();
        if(res.ok) setLoanData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

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

  const filteredData = loanData
    .filter((loan) =>
      filterStatus === "All" ? true : loan.status === dbStatus(filterStatus)
    )
    .filter((loan) =>
      (loan.applicant_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalLoans = loanData.length;
  const totalSanctioned = loanData.filter(
    (loan) => loan.status === "approved"
  ).length;
  const totalCancelled = loanData.filter(
    (loan) => loan.status === "rejected"
  ).length;
  const totalVerification = loanData.filter(
    (loan) => loan.status === "pending"
  ).length;
  const totalApprovedAmount = loanData
    .filter((loan) => loan.status === "approved")
    .reduce((acc, loan) => acc + parseFloat(loan.amount), 0);

  return (
    <div className="reports-wrapper">
      <div className="reports-header">
        <h2>Loan Reports</h2>
        <p>Track loan performance and application status</p>
      </div>

      {/* Summary Cards */}
      <div className="reports-stats">
        <div className="stat-card">
          <h4>Total Loans</h4>
          <p>{totalLoans}</p>
        </div>
        <div className="stat-card">
          <h4>Sanctioned</h4>
          <p>{totalSanctioned}</p>
        </div>
        <div className="stat-card">
          <h4>Cancelled</h4>
          <p>{totalCancelled}</p>
        </div>
        <div className="stat-card">
          <h4>Under Verification</h4>
          <p>{totalVerification}</p>
        </div>
        <div className="stat-card">
          <h4>Total Approved Amount</h4>
          <p>₹{totalApprovedAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="reports-controls">
        <input
          type="text"
          placeholder="Search customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Sanctioned">Sanctioned</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Under Verification">Under Verification</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
           <p>Loading reports...</p>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Amount</th>
              <th>Interest</th>
              <th>Duration</th>
              <th>EMI</th>
              <th>CIBIL</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.applicant_name}</td>
                <td>{loan.purpose}</td>
                <td>₹{parseFloat(loan.amount).toLocaleString()}</td>
                <td>{loan.interest ? loan.interest + '%' : 'TBD'}</td>
                <td>{loan.duration || 'TBD'}</td>
                <td>{loan.emi ? '₹' + parseFloat(loan.emi).toLocaleString() : 'TBD'}</td>
                <td>{loan.cibil || 'N/A'}</td>
                <td>
                  <span
                    className={`status-badge ${
                      loan.status === "approved"
                        ? "approved"
                        : loan.status === "rejected"
                        ? "cancelled"
                        : "verification"
                    }`}
                  >
                    {displayStatus(loan.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export default Reports;