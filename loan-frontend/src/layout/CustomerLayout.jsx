import { Outlet, useNavigate } from "react-router-dom";

function CustomerLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <header style={{
        height: "65px",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontWeight: "bold", fontSize: "20px", color: "#0a3d62", cursor: "pointer" }}
          onClick={() => navigate("/customer")}>
          LoanSys
        </div>

        <nav style={{ display: "flex", gap: "30px" }}>
          {[
            { label: "Dashboard", path: "/customer" },
            { label: "Available Loans", path: "/customer/available-loans" },
            { label: "Apply Loan", path: "/customer/apply-loan" },
            { label: "Loan History", path: "/customer/history" },
          ].map(({ label, path }) => (
            <span
              key={path}
              onClick={() => navigate(path)}
              style={{ cursor: "pointer", color: "#475569", fontWeight: 500, fontSize: "15px" }}
            >
              {label}
            </span>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ color: "#64748b", fontSize: "14px" }}>Hi, {user.name}</span>
          <button onClick={handleLogout} style={{
            background: "#ef4444", color: "white", border: "none",
            padding: "8px 16px", borderRadius: "20px", cursor: "pointer", fontWeight: 500
          }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ padding: "30px 40px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default CustomerLayout;
