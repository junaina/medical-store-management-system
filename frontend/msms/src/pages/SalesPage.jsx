import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function SalesPage() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    medicine_id: "",
    customer_id: "",
    quantity: "",
    unit_price: "",
    tax: "0",
    discount: "0",
    total_amount: "",
    sale_date: new Date().toISOString().slice(0, 10),
  });

  const medicineMap = useMemo(
    () => Object.fromEntries(medicines.map((m) => [m.id, m.name])),
    [medicines],
  );

  const customerMap = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c.name])),
    [customers],
  );

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const quantity = Number(form.quantity || 0);
    const unitPrice = Number(form.unit_price || 0);
    const tax = Number(form.tax || 0);
    const discount = Number(form.discount || 0);
    const subtotal = quantity * unitPrice;
    const total = subtotal + tax - discount;

    setForm((prev) => ({
      ...prev,
      total_amount: total || total === 0 ? String(total) : "",
    }));
  }, [form.quantity, form.unit_price, form.tax, form.discount]);

  async function loadAll() {
    try {
      const [salesRes, medicinesRes, customersRes] = await Promise.all([
        api.get("/sales/"),
        api.get("/medicines/"),
        api.get("/customers/"),
      ]);

      setSales(salesRes.data);
      setMedicines(medicinesRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to load sales.");
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
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        tax: Number(form.tax),
        discount: Number(form.discount),
        total_amount: Number(form.total_amount),
        sale_date: form.sale_date,
      };

      const res = await api.post("/sales/", payload);

      setMessage("Sale recorded successfully.");

      setForm({
        medicine_id: "",
        customer_id: "",
        quantity: "",
        unit_price: "",
        tax: "0",
        discount: "0",
        total_amount: "",
        sale_date: new Date().toISOString().slice(0, 10),
      });

      loadAll();

      navigate(`/sales/${res.data.id}/invoice`);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to create sale.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sales</h1>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="card">
        <h3>Create Sale</h3>

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
            <span>Customer (Optional)</span>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
            >
              <option value="">Walk-in customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
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
            <span>Unit Price</span>
            <input
              type="number"
              step="any"
              name="unit_price"
              value={form.unit_price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Tax</span>
            <input
              type="number"
              step="any"
              name="tax"
              value={form.tax}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Discount</span>
            <input
              type="number"
              step="any"
              name="discount"
              value={form.discount}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Total Amount</span>
            <input
              type="number"
              step="any"
              name="total_amount"
              value={form.total_amount}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Sale Date</span>
            <input
              type="date"
              name="sale_date"
              value={form.sale_date}
              onChange={handleChange}
              required
            />
          </label>

          <button className="primary-btn" type="submit">
            Save Sale
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Sales History</h3>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Medicine</th>
                <th>Customer</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Date</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="10">No sales found.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td>{medicineMap[sale.medicine_id] || sale.medicine_id}</td>
                    <td>
                      {sale.customer_id
                        ? customerMap[sale.customer_id] || sale.customer_id
                        : "Walk-in"}
                    </td>
                    <td>{sale.quantity}</td>
                    <td>{sale.unit_price}</td>
                    <td>{sale.tax}</td>
                    <td>{sale.discount}</td>
                    <td>{sale.total_amount}</td>
                    <td>{String(sale.sale_date).slice(0, 10)}</td>
                    <td>
                      <button
                        className="secondary-btn"
                        onClick={() => navigate(`/sales/${sale.id}/invoice`)}
                      >
                        View
                      </button>
                    </td>
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
