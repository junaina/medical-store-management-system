import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: [],
    nearExpiry: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [medicinesRes, lowStockRes, nearExpiryRes] = await Promise.all([
          api.get("/medicines/"),
          api.get("/reports/low-stock"),
          api.get("/reports/near-expiry"),
        ]);

        setStats({
          totalMedicines: medicinesRes.data.length,
          lowStock: lowStockRes.data,
          nearExpiry: nearExpiryRes.data,
        });
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load dashboard.");
      }
    }

    loadDashboard();
  }, []);

  const summaryText = useMemo(() => {
    if (stats.totalMedicines === 0) {
      return "No medicines have been added yet.";
    }

    if (stats.lowStock.length === 0 && stats.nearExpiry.length === 0) {
      return "Inventory looks healthy right now.";
    }

    return `${stats.lowStock.length} low-stock item(s) and ${stats.nearExpiry.length} near-expiry item(s) need attention.`;
  }, [stats]);

  return (
    <div className="page dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Overview</p>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">{summaryText}</p>
        </div>

        <div className="dashboard-hero-badge">
          <span className="dashboard-badge-dot"></span>
          System Active
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="dashboard-stats-grid">
        <div className="metric-card metric-card-primary">
          <div className="metric-card-top">
            <span className="metric-label">Total Medicines</span>
            <span className="metric-icon">💊</span>
          </div>
          <h2 className="metric-value">{stats.totalMedicines}</h2>
          <p className="metric-meta">
            Total medicine records currently in inventory
          </p>
        </div>

        <div className="metric-card metric-card-warning">
          <div className="metric-card-top">
            <span className="metric-label">Low Stock Items</span>
            <span className="metric-icon">⚠️</span>
          </div>
          <h2 className="metric-value">{stats.lowStock.length}</h2>
          <p className="metric-meta">Items that may need replenishment soon</p>
        </div>

        <div className="metric-card metric-card-danger">
          <div className="metric-card-top">
            <span className="metric-label">Near Expiry Items</span>
            <span className="metric-icon">🗓️</span>
          </div>
          <h2 className="metric-value">{stats.nearExpiry.length}</h2>
          <p className="metric-meta">Items approaching their expiry date</p>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Low Stock</h3>
              <p>Medicines with quantity below your alert threshold</p>
            </div>
          </div>

          {stats.lowStock.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✓</div>
              <div>
                <h4>No low stock items</h4>
                <p>Everything looks sufficiently stocked right now.</p>
              </div>
            </div>
          ) : (
            <div className="dashboard-list">
              {stats.lowStock.map((item) => (
                <div className="dashboard-list-item" key={item.id}>
                  <div>
                    <p className="list-item-title">{item.name}</p>
                    <p className="list-item-subtitle">{item.category}</p>
                  </div>

                  <div className="list-item-pill list-item-pill-warning">
                    Qty: {item.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Near Expiry</h3>
              <p>Medicines that require expiry attention soon</p>
            </div>
          </div>

          {stats.nearExpiry.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✓</div>
              <div>
                <h4>No near expiry items</h4>
                <p>No medicines are currently close to expiry.</p>
              </div>
            </div>
          ) : (
            <div className="dashboard-list">
              {stats.nearExpiry.map((item) => (
                <div className="dashboard-list-item" key={item.id}>
                  <div>
                    <p className="list-item-title">{item.name}</p>
                    <p className="list-item-subtitle">
                      Batch: {item.batch_number}
                    </p>
                  </div>

                  <div className="list-item-pill list-item-pill-danger">
                    Exp: {String(item.expiry_date).slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
