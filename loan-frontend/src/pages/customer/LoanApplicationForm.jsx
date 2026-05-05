import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./loanApplication.css";

function LoanApplication() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    age: "", phone: "", income: "", cibil: "",
    loanAmount: "", purpose: "", collateral: "", employment: "", scheme_id: ""
  });
  const [files, setFiles] = useState({
    id_proof: null,
    income_proof: null,
    address_proof: null
  });
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/schemes");
        const data = await res.json();
        if (res.ok) setSchemes(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchemes();

    const params = new URLSearchParams(location.search);
    const purpose = params.get("purpose");
    const scheme = params.get("scheme");
    if (purpose) setForm(prev => ({ ...prev, purpose }));
    if (scheme) setForm(prev => ({ ...prev, scheme_id: scheme }));
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("amount", parseFloat(form.loanAmount));
      formData.append("purpose", form.purpose);
      if (form.age) formData.append("age", parseInt(form.age));
      if (form.phone) formData.append("phone", form.phone);
      if (form.income) formData.append("income", parseFloat(form.income));
      if (form.cibil) formData.append("cibil", parseInt(form.cibil));
      if (form.collateral) formData.append("collateral", form.collateral);
      if (form.employment) formData.append("employment", form.employment);
      if (form.scheme_id) formData.append("scheme_id", form.scheme_id);

      if (files.id_proof) formData.append("id_proof", files.id_proof);
      if (files.income_proof) formData.append("income_proof", files.income_proof);
      if (files.address_proof) formData.append("address_proof", files.address_proof);

      const res = await fetch("http://localhost:5000/api/loans", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      navigate("/customer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setFile = (field) => (e) => setFiles({ ...files, [field]: e.target.files[0] });

  return (
    <div className="loan-form-page">
      <h2>Loan Application Form</h2>
      <form className="loan-form" onSubmit={handleSubmit}>
        {error && <div style={{ color: "red", marginBottom: "10px", gridColumn: "span 2" }}>{error}</div>}

        <select onChange={set("scheme_id")} value={form.scheme_id} required>
          <option value="">Select Loan Scheme</option>
          {schemes.map(s => (
            <option key={s.id} value={s.id}>{s.name} - {s.interest_rate}%</option>
          ))}
        </select>

        <input placeholder="Loan Amount Required (₹)" type="number" required onChange={set("loanAmount")} value={form.loanAmount} />
        <input placeholder="Purpose of Loan" required value={form.purpose} onChange={set("purpose")} />
        <input type="number" placeholder="Age" onChange={set("age")} value={form.age} />
        <input placeholder="Phone Number" onChange={set("phone")} value={form.phone} />
        <input placeholder="Monthly Income (₹)" onChange={set("income")} value={form.income} />
        <input placeholder="CIBIL Score" onChange={set("cibil")} value={form.cibil} />
        <input placeholder="Collateral (Property / Gold / None)" onChange={set("collateral")} value={form.collateral} />
        
        <select onChange={set("employment")} value={form.employment}>
          <option value="">Employment Type</option>
          <option value="Salaried">Salaried</option>
          <option value="Self Employed">Self Employed</option>
          <option value="Business">Business</option>
        </select>

        <div className="file-upload-section">
          <label>
            <span>ID Proof (Aadhaar/PAN)</span>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile("id_proof")} />
            {files.id_proof && <small>✓ {files.id_proof.name}</small>}
          </label>
        </div>

        <div className="file-upload-section">
          <label>
            <span>Income Proof (Salary Slip)</span>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile("income_proof")} />
            {files.income_proof && <small>✓ {files.income_proof.name}</small>}
          </label>
        </div>

        <div className="file-upload-section">
          <label>
            <span>Address Proof</span>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile("address_proof")} />
            {files.address_proof && <small>✓ {files.address_proof.name}</small>}
          </label>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default LoanApplication;
