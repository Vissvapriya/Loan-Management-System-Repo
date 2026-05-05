import { useState, useEffect } from "react";
import "./ownerDashboard.css";
import { apiFetch } from "../../api";

function Users() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFetch("/api/users");
        const data = await res.json();
        if(res.ok) setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    // Note: To persist this to DB you would need another API endpoint.
    // For now we just mock the UI toggle.
    setCustomers(
      customers.map((cust) =>
        cust.id === id
          ? {
              ...cust,
              isBlocked: !cust.isBlocked,
            }
          : cust
      )
    );
  };

  return (
    <div className="customers-wrapper">
      <h2>Customer Management</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search customer..."
        className="customer-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Customer Table */}
      <div className="customer-table">
        {loading ? (
          <p>Loading customers...</p>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.role.toUpperCase()}</td>
                <td>
                  <span
                    className={
                      !customer.isBlocked
                        ? "status-active"
                        : "status-blocked"
                    }
                  >
                    {!customer.isBlocked ? "Active" : "Blocked"}
                  </span>
                </td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    View
                  </button>
                  <button
                    className="block-btn"
                    onClick={() => toggleStatus(customer.id)}
                  >
                    {!customer.isBlocked
                      ? "Block"
                      : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Profile Modal */}
      {selectedCustomer && (
        <div className="customer-modal">
          <div className="modal-content">
            <h3>{selectedCustomer.name} - Profile</h3>
            <p><strong>Email:</strong> {selectedCustomer.email}</p>
            <p><strong>Role:</strong> {selectedCustomer.role}</p>
            <p><strong>Registered On:</strong> {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>

            <button onClick={() => setSelectedCustomer(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;