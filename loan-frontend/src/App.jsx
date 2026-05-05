import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import OwnerLayout from "./layout/OwnerLayout";
import CustomerLayout from "./layout/CustomerLayout";
import Login from "./pages/login";

import OwnerDashboard from "./pages/owner/ownerDashboard";
import Users from "./pages/owner/Users";
import Loans from "./pages/owner/Loans";
import Reports from "./pages/owner/Reports";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AvailableLoans from "./pages/customer/AvailableLoans"; 
import LoanApplication from "./pages/customer/LoanApplicationForm";
import LoanHistory from "./pages/customer/LoanHistory";

function App() {
  return (
    <Router>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="apply-loan" element={<LoanApplication />} />
          <Route path="available-loans" element={<AvailableLoans />} />
          <Route path="history" element={<LoanHistory />} />
        </Route>

        {/* Owner Routes */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="loans" element={<Loans />} />
          <Route path="reports" element={<Reports />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;