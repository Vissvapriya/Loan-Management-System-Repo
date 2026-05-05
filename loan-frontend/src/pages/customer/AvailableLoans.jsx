import { useState, useEffect } from "react";
import "./availableLoans.css";
import { useNavigate } from "react-router-dom";

function AvailableLoans() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/schemes");
        const data = await res.json();
        if (res.ok) setSchemes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  return (
    <div className="loan-page">
      <h2>Available Loan Products</h2>

      {loading ? (
        <p>Loading schemes...</p>
      ) : (
        <div className="loan-grid">
          {schemes.map((scheme) => (
            <div className="loan-card" key={scheme.id}>
              <h3>{scheme.name}</h3>
              <p><strong>Interest:</strong> {scheme.interest_rate}%</p>
              <p><strong>Max Amount:</strong> ₹{parseFloat(scheme.max_amount).toLocaleString()}</p>
              <p><strong>Duration:</strong> {scheme.duration}</p>
              {scheme.description && <p className="scheme-desc">{scheme.description}</p>}

              <button
                className="apply-btn"
                onClick={() => navigate(`/customer/apply-loan?scheme=${scheme.id}&purpose=${encodeURIComponent(scheme.name)}`)}
              >
                Apply for Loan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AvailableLoans;
