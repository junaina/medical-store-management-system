import { useEffect, useState } from "react";
import api from "../lib/api";

export default function ReportsPage() {
  const [tab, setTab] = useState("stock");
  const [stock, setStock] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [message, setMessage] = useState("");

  const today = new Date();
  const [dailyDate, setDailyDate] = useState(today.toISOString().slice(0, 10));
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));

  useEffect(() => {
    loadBaseReports();
  }, []);

  async function loadBaseReports() {
    try {
      const [stockRes, expiryRes, lowStockRes, nearExpiryRes] =
        await Promise.all([
          api.get("/reports/stock"),
          api.get("/reports/expiry"),
          api.get("/reports/low-stock"),
          api.get("/reports/near-expiry"),
        ]);

      setStock(stockRes.data);
      setExpiry(expiryRes.data);
      setLowStock(lowStockRes.data);
      setNearExpiry(nearExpiryRes.data);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to load reports.");
    }
  }

  async function loadDailyReport() {
    try {
      const res = await api.get("/reports/daily-sales", {
        params: { report_date: dailyDate },
      });
      setDailyReport(res.data);
      setTab("daily");
    } catch (err) {
      setMessage(
        err?.response?.data?.detail || "Failed to load daily sales report.",
      );
    }
  }

  async function loadMonthlyReport() {
    try {
      const res = await api.get("/reports/monthly-sales", {
        params: {
          year: Number(year),
          month: Number(month),
        },
      });
      setMonthlyReport(res.data);
      setTab("monthly");
    } catch (err) {
      setMessage(
        err?.response?.data?.detail || "Failed to load monthly sales report.",
      );
    }
  }

  function renderMedicineTable(items) {
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="7">No records found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.batch_number}</td>
                  <td>{String(item.expiry_date).slice(0, 10)}</td>
                  <td>{item.price}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports</h1>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="card">
        <div className="tab-row">
          <button className="secondary-btn" onClick={() => setTab("stock")}>
            Stock
          </button>
          <button className="secondary-btn" onClick={() => setTab("expiry")}>
            Expiry
          </button>
          <button className="secondary-btn" onClick={() => setTab("low-stock")}>
            Low Stock
          </button>
          <button
            className="secondary-btn"
            onClick={() => setTab("near-expiry")}
          >
            Near Expiry
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Daily Sales Report</h3>
        <div className="inline-form">
          <input
            type="date"
            value={dailyDate}
            onChange={(e) => setDailyDate(e.target.value)}
          />
          <button className="primary-btn" onClick={loadDailyReport}>
            Load Daily Report
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Monthly Sales Report</h3>
        <div className="inline-form">
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <button className="primary-btn" onClick={loadMonthlyReport}>
            Load Monthly Report
          </button>
        </div>
      </div>

      {tab === "stock" && (
        <div className="card">{renderMedicineTable(stock)}</div>
      )}
      {tab === "expiry" && (
        <div className="card">{renderMedicineTable(expiry)}</div>
      )}
      {tab === "low-stock" && (
        <div className="card">{renderMedicineTable(lowStock)}</div>
      )}
      {tab === "near-expiry" && (
        <div className="card">{renderMedicineTable(nearExpiry)}</div>
      )}

      {tab === "daily" && dailyReport && (
        <div className="card">
          <h3>Daily Sales Report - {dailyReport.report_date}</h3>
          <p>Total Sales: {dailyReport.summary.total_sales}</p>
          <p>Total Quantity Sold: {dailyReport.summary.total_quantity_sold}</p>
          <p>Total Revenue: {dailyReport.summary.total_revenue}</p>
        </div>
      )}

      {tab === "monthly" && monthlyReport && (
        <div className="card">
          <h3>
            Monthly Sales Report - {monthlyReport.month}/{monthlyReport.year}
          </h3>
          <p>Total Sales: {monthlyReport.summary.total_sales}</p>
          <p>
            Total Quantity Sold: {monthlyReport.summary.total_quantity_sold}
          </p>
          <p>Total Revenue: {monthlyReport.summary.total_revenue}</p>
        </div>
      )}
    </div>
  );
}
