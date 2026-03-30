import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

function buildInitialForm(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});
}

function normalizeForForm(item, fields) {
  const next = {};

  for (const field of fields) {
    const rawValue = item[field.name];

    if (field.type === "date" && rawValue) {
      next[field.name] = String(rawValue).slice(0, 10);
    } else if (rawValue === null || rawValue === undefined) {
      next[field.name] = "";
    } else {
      next[field.name] = String(rawValue);
    }
  }

  return next;
}

function buildPayload(form, fields) {
  const payload = {};

  for (const field of fields) {
    let value = form[field.name];

    if (field.type === "number") {
      value = value === "" ? 0 : Number(value);
    }

    payload[field.name] = value;
  }

  return payload;
}

export default function CrudPage({ title, endpoint, fields }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(buildInitialForm(fields));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const formTitle = useMemo(
    () =>
      editingId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`,
    [editingId, title],
  );

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get(`${endpoint}/`);
      setItems(res.data);
    } catch (error) {
      setMessage(error?.response?.data?.detail || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(buildInitialForm(fields));
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const payload = buildPayload(form, fields);

      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, payload);
        setMessage(`${title.slice(0, -1)} updated successfully.`);
      } else {
        await api.post(`${endpoint}/`, payload);
        setMessage(`${title.slice(0, -1)} created successfully.`);
      }

      resetForm();
      fetchItems();
    } catch (error) {
      setMessage(error?.response?.data?.detail || "Action failed.");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm(normalizeForForm(item, fields));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const ok = window.confirm("Are you sure you want to delete this record?");
    if (!ok) return;

    try {
      await api.delete(`${endpoint}/${id}`);
      setMessage("Deleted successfully.");
      fetchItems();
    } catch (error) {
      setMessage(error?.response?.data?.detail || "Delete failed.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{title}</h1>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="card">
        <h3>{formTitle}</h3>

        <form className="grid-form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.name}>
              <span>{field.label}</span>
              <input
                type={field.type || "text"}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required={field.required !== false}
                step={field.type === "number" ? "any" : undefined}
              />
            </label>
          ))}

          <div className="actions-row">
            <button className="primary-btn" type="submit">
              {editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button
                className="secondary-btn"
                type="button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>All {title}</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  {fields.map((field) => (
                    <th key={field.name}>{field.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={fields.length + 2}>No data found.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      {fields.map((field) => (
                        <td key={field.name}>
                          {String(item[field.name] ?? "")}
                        </td>
                      ))}
                      <td className="table-actions">
                        <button
                          className="secondary-btn"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
