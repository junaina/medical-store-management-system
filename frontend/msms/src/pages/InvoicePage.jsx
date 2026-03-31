import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function InvoicePage() {
  const { saleId } = useParams();

  const [sale, setSale] = useState(null);
  const [medicine, setMedicine] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      try {
        const saleRes = await api.get(`/sales/${saleId}`);
        const saleData = saleRes.data;
        setSale(saleData);

        const requests = [api.get(`/medicines/${saleData.medicine_id}`)];
        if (saleData.customer_id) {
          requests.push(api.get(`/customers/${saleData.customer_id}`));
        }

        const [medicineRes, customerRes] = await Promise.all(requests);
        setMedicine(medicineRes.data);
        setCustomer(customerRes?.data || null);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load invoice.");
      }
    }

    loadInvoice();
  }, [saleId]);

  if (error) return <div className="alert">{error}</div>;
  if (!sale || !medicine) return <div className="page">Loading invoice...</div>;

  return (
    <div className="page">
      <div className="invoice-card">
        <div className="invoice-header">
          <div>
            <h1>Medical Store Invoice</h1>
            <p>Invoice #: {sale.id}</p>
            <p>Date: {String(sale.sale_date).slice(0, 10)}</p>
          </div>

          <button className="primary-btn" onClick={() => window.print()}>
            Print Invoice
          </button>
        </div>

        <div className="two-col">
          <div className="card">
            <h3>Customer</h3>
            {customer ? (
              <>
                <p>
                  <strong>Name:</strong> {customer.name}
                </p>
                <p>
                  <strong>Contact:</strong> {customer.contact}
                </p>
                <p>
                  <strong>Address:</strong> {customer.address}
                </p>
              </>
            ) : (
              <p>Walk-in customer</p>
            )}
          </div>

          <div className="card">
            <h3>Medicine</h3>
            <p>
              <strong>Name:</strong> {medicine.name}
            </p>
            <p>
              <strong>Category:</strong> {medicine.category}
            </p>
            <p>
              <strong>Batch:</strong> {medicine.batch_number}
            </p>
          </div>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{medicine.name}</td>
                <td>{sale.quantity}</td>
                <td>{sale.unit_price}</td>
                <td>{sale.tax}</td>
                <td>{sale.discount}</td>
                <td>{sale.total_amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
