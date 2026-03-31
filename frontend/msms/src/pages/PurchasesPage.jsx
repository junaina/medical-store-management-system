import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    medicine_id: "",
    supplier_id: "",
    quantity: "",
    unit_cost: "",
    total_cost: "",
    purchase_date: new Date().toISOString().slice(0, 10),
  });

  const medicineMap = useMemo(
    () => Object.fromEntries(medicines.map((m) => [m.id, m.name])),
    [medicines],
  );

  const supplierMap = useMemo(
    () => Object.fromEntries(suppliers.map((s) => [s.id, s.name])),
    [suppliers],
  );

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const quantity = Number(form.quantity || 0);
    const unitCost = Number(form.unit_cost || 0);
    const total = quantity * unitCost;

    setForm((prev) => ({
      ...prev,
      total_cost: total ? String(total) : "",
    }));
  }, [form.quantity, form.unit_cost]);

  async function loadAll() {
    try {
      const [purchasesRes, medicinesRes, suppliersRes] = await Promise.all([
        api.get("/purchases/"),
        api.get("/medicines/"),
        api.get("/suppliers/"),
      ]);

      setPurchases(purchasesRes.data);
      setMedicines(medicinesRes.data);
      setSuppliers(suppliersRes.data);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to load purchases.");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        medicine_id: Number(form.medicine_id),
        supplier_id: Number(form.supplier_id),
        quantity: Number(form.quantity),
        unit_cost: Number(form.unit_cost),
        total_cost: Number(form.total_cost),
        purchase_date: form.purchase_date,
      };

      await api.post("/purchases/", payload);

      setMessage("Purchase recorded successfully.");
      setForm({
        medicine_id: "",
        supplier_id: "",
        quantity: "",
        unit_cost: "",
        total_cost: "",
        purchase_date: new Date().toISOString().slice(0, 10),
      });

      loadAll();
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to create purchase.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Purchases</h1>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="card">
        <h3>Record Purchase</h3>

        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            <span>Medicine</span>
            <select
              name="medicine_id"
              value={form.medicine_id}
              onChange={handleChange}
              required
            >
              <option value="">Select medicine</option>
              {medicines.map((medicine) => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Supplier</span>
            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
              required
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Quantity</span>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Unit Cost</span>
            <input
              type="number"
              step="any"
              name="unit_cost"
              value={form.unit_cost}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Total Cost</span>
            <input
              type="number"
              step="any"
              name="total_cost"
              value={form.total_cost}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Purchase Date</span>
            <input
              type="date"
              name="purchase_date"
              value={form.purchase_date}
              onChange={handleChange}
              required
            />
          </label>

          <button className="primary-btn" type="submit">
            Save Purchase
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Purchase History</h3>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Medicine</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="7">No purchases found.</td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{purchase.id}</td>
                    <td>
                      {medicineMap[purchase.medicine_id] ||
                        purchase.medicine_id}
                    </td>
                    <td>
                      {supplierMap[purchase.supplier_id] ||
                        purchase.supplier_id}
                    </td>
                    <td>{purchase.quantity}</td>
                    <td>{purchase.unit_cost}</td>
                    <td>{purchase.total_cost}</td>
                    <td>{String(purchase.purchase_date).slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
