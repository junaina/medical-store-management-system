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

  function renderMedicineTable(items, title, subtitle) {
    return (
      <div className="report-panel">
        <div className="report-panel-header">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="report-empty-state">
            <div className="report-empty-icon">✓</div>
            <div>
              <h4>No records found</h4>
              <p>There is no data available for this report right now.</p>
            </div>
          </div>
        ) : (
          <div className="report-table-wrap">
            <table className="report-table">
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
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.batch_number}</td>
                    <td>{String(item.expiry_date).slice(0, 10)}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function renderSalesSummaryCard(title, subtitle, report) {
    return (
      <div className="report-panel">
        <div className="report-panel-header">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>

        <div className="reports-summary-grid">
          <div className="reports-summary-card">
            <span className="reports-summary-label">Total Sales</span>
            <strong className="reports-summary-value">
              {report.summary.total_sales}
            </strong>
          </div>

          <div className="reports-summary-card">
            <span className="reports-summary-label">Quantity Sold</span>
            <strong className="reports-summary-value">
              {report.summary.total_quantity_sold}
            </strong>
          </div>

          <div className="reports-summary-card">
            <span className="reports-summary-label">Revenue</span>
            <strong className="reports-summary-value">
              {report.summary.total_revenue}
            </strong>
          </div>
        </div>

        {report.sales?.length > 0 ? (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Medicine ID</th>
                  <th>Customer ID</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Tax</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {report.sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>#{sale.id}</td>
                    <td>{sale.medicine_id}</td>
                    <td>{sale.customer_id ?? "Walk-in"}</td>
                    <td>{sale.quantity}</td>
                    <td>{sale.unit_price}</td>
                    <td>{sale.tax}</td>
                    <td>{sale.discount}</td>
                    <td>{sale.total_amount}</td>
                    <td>{String(sale.sale_date).slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="report-empty-state">
            <div className="report-empty-icon">○</div>
            <div>
              <h4>No sales found</h4>
              <p>No sales were recorded for the selected period.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page reports-page">
      <div className="reports-hero">
        <div>
          <p className="reports-eyebrow">Analytics & Insights</p>
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">
            Review stock, expiry, alerts, and sales performance from one place.
          </p>
        </div>

        <div className="reports-hero-chip">Live Reporting</div>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="report-controls-grid">
        <div className="report-filter-card">
          <div className="report-filter-head">
            <h3>Browse Inventory Reports</h3>
            <p>Switch between stock, expiry, and alert views.</p>
          </div>

          <div className="report-tabs">
            <button
              className={tab === "stock" ? "report-tab active" : "report-tab"}
              onClick={() => setTab("stock")}
            >
              Stock
            </button>
            <button
              className={tab === "expiry" ? "report-tab active" : "report-tab"}
              onClick={() => setTab("expiry")}
            >
              Expiry
            </button>
            <button
              className={
                tab === "low-stock" ? "report-tab active" : "report-tab"
              }
              onClick={() => setTab("low-stock")}
            >
              Low Stock
            </button>
            <button
              className={
                tab === "near-expiry" ? "report-tab active" : "report-tab"
              }
              onClick={() => setTab("near-expiry")}
            >
              Near Expiry
            </button>
          </div>
        </div>

        <div className="report-filter-card">
          <div className="report-filter-head">
            <h3>Daily Sales Report</h3>
            <p>Select a date to load one-day sales performance.</p>
          </div>

          <div className="report-filter-form single-column">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
              />
            </label>
            <button
              className="primary-btn report-action-btn"
              onClick={loadDailyReport}
            >
              Load Daily Report
            </button>
          </div>
        </div>

        <div className="report-filter-card">
          <div className="report-filter-head">
            <h3>Monthly Sales Report</h3>
            <p>Select a month and year for aggregated sales insights.</p>
          </div>

          <div className="report-filter-form two-columns">
            <label>
              <span>Month</span>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </label>

            <label>
              <span>Year</span>
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </label>

            <button
              className="primary-btn report-action-btn full-width"
              onClick={loadMonthlyReport}
            >
              Load Monthly Report
            </button>
          </div>
        </div>
      </div>

      {tab === "stock" &&
        renderMedicineTable(
          stock,
          "Stock Report",
          "Complete inventory listing with pricing and quantities.",
        )}

      {tab === "expiry" &&
        renderMedicineTable(
          expiry,
          "Expiry Report",
          "Inventory ordered around medicine expiry visibility.",
        )}

      {tab === "low-stock" &&
        renderMedicineTable(
          lowStock,
          "Low Stock Report",
          "Items that may require replenishment soon.",
        )}

      {tab === "near-expiry" &&
        renderMedicineTable(
          nearExpiry,
          "Near Expiry Report",
          "Items that are approaching their expiry date.",
        )}

      {tab === "daily" &&
        dailyReport &&
        renderSalesSummaryCard(
          `Daily Sales Report - ${dailyReport.report_date}`,
          "Performance summary and line-level sales for the selected date.",
          dailyReport,
        )}

      {tab === "monthly" &&
        monthlyReport &&
        renderSalesSummaryCard(
          `Monthly Sales Report - ${monthlyReport.month}/${monthlyReport.year}`,
          "Performance summary and line-level sales for the selected month.",
          monthlyReport,
        )}
    </div>
  );
}
