import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const TODOS_URL = `${API_URL}/api/todos`;

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(async (url, options = {}) => {
    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers
        }
      });
    } catch {
      throw new Error("Cannot connect to the API. Check that the backend is running and VITE_API_URL is correct.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
    return data;
  }, []);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request(TODOS_URL);
      setTodos(data.todos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const counts = useMemo(() => ({
    all: todos.length,
    active: todos.filter((todo) => !todo.completed).length,
    completed: todos.filter((todo) => todo.completed).length
  }), [todos]);

  const visibleTodos = useMemo(() => todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  }), [todos, filter]);

  async function addTodo(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const data = await request(TODOS_URL, {
        method: "POST",
        body: JSON.stringify({ title: cleanTitle })
      });
      setTodos((current) => [data.todo, ...current]);
      setTitle("");
      setNotice("Task added successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo) {
    setError("");
    try {
      const data = await request(`${TODOS_URL}/${todo._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !todo.completed })
      });
      setTodos((current) => current.map((item) => item._id === todo._id ? data.todo : item));
    } catch (err) {
      setError(err.message);
    }
  }

  function beginEdit(todo) {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setError("");
    setNotice("");
  }

  async function saveEdit(event) {
    event.preventDefault();
    const cleanTitle = editTitle.trim();
    if (!cleanTitle) {
      setError("Task title cannot be empty.");
      return;
    }
    try {
      const data = await request(`${TODOS_URL}/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: cleanTitle })
      });
      setTodos((current) => current.map((item) => item._id === editingId ? data.todo : item));
      setEditingId(null);
      setEditTitle("");
      setNotice("Task updated.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTodo(id) {
    if (!window.confirm("Delete this task?")) return;
    setError("");
    try {
      await request(`${TODOS_URL}/${id}`, { method: "DELETE" });
      setTodos((current) => current.filter((todo) => todo._id !== id));
      setNotice("Task deleted.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearCompleted() {
    const completed = todos.filter((todo) => todo.completed);
    if (!completed.length) return;
    if (!window.confirm(`Delete ${completed.length} completed task(s)?`)) return;
    setError("");
    try {
      await Promise.all(completed.map((todo) =>
        request(`${TODOS_URL}/${todo._id}`, { method: "DELETE" })
      ));
      setTodos((current) => current.filter((todo) => !todo.completed));
      setNotice("Completed tasks cleared.");
    } catch (err) {
      setError(err.message);
      await loadTodos();
    }
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="app-card">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">✓</div>
            <span>TaskFlow</span>
          </div>
          <span className="sync-label"><span className="sync-dot" /> MongoDB synced via API</span>
        </header>

        <section className="hero">
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>Make room for<br /><span>what matters.</span></h1>
          <p className="hero-copy">Small steps every day add up to big things.</p>
        </section>

        <form className="add-form" onSubmit={addTodo}>
          <span className="plus-icon" aria-hidden="true">＋</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What do you need to get done?"
            aria-label="New task title"
            maxLength={200}
          />
          <button type="submit" disabled={saving || !title.trim()}>{saving ? "Adding…" : "Add task"}</button>
        </form>

        {error && <div className="message error-message" role="alert">{error}</div>}
        {notice && !error && <div className="message success-message" role="status">{notice}</div>}

        <section className="task-section">
          <div className="list-heading">
            <div>
              <h2>Your tasks <span className="total-badge">{counts.all}</span></h2>
              <p>A little progress is still progress.</p>
            </div>
            <button className="text-button" onClick={clearCompleted} disabled={!counts.completed}>
              Clear completed
            </button>
          </div>

          <div className="filters" role="group" aria-label="Filter tasks">
            {[
              ["all", `All tasks ${counts.all}`],
              ["active", `To do ${counts.active}`],
              ["completed", `Completed ${counts.completed}`]
            ].map(([value, label]) => (
              <button key={value} className={`filter-button ${filter === value ? "selected" : ""}`}
                onClick={() => setFilter(value)} type="button">{label}</button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state"><div className="loader" /><p>Loading your tasks…</p></div>
          ) : visibleTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{filter === "completed" ? "✦" : "☀"}</div>
              <h3>{filter === "completed" ? "Nothing completed yet" : filter === "active" ? "You're all caught up!" : "A fresh start."}</h3>
              <p>{filter === "completed" ? "Completed tasks will appear here." : filter === "active" ? "Enjoy the breathing room, or add another task." : "Add a task above and make today count."}</p>
            </div>
          ) : (
            <ul className="todo-list">
              {visibleTodos.map((todo) => (
                <li key={todo._id} className={`todo-item ${todo.completed ? "is-complete" : ""}`}>
                  <button className={`check-button ${todo.completed ? "checked" : ""}`}
                    onClick={() => toggleTodo(todo)} aria-label={todo.completed ? "Mark task incomplete" : "Mark task complete"}>
                    {todo.completed ? "✓" : ""}
                  </button>
                  {editingId === todo._id ? (
                    <form className="edit-form" onSubmit={saveEdit}>
                      <input autoFocus value={editTitle} onChange={(event) => setEditTitle(event.target.value)}
                        maxLength={200} aria-label="Edit task title" />
                      <button type="submit" className="icon-button save-button" aria-label="Save task">✓</button>
                      <button type="button" className="icon-button" onClick={() => setEditingId(null)} aria-label="Cancel edit">×</button>
                    </form>
                  ) : (
                    <>
                      <div className="todo-content">
                        <span className="todo-title">{todo.title}</span>
                        <span className="todo-date">{new Date(todo.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </div>
                      <div className="todo-actions">
                        <button className="icon-button" onClick={() => beginEdit(todo)} aria-label={`Edit ${todo.title}`}>✎</button>
                        <button className="icon-button delete-button" onClick={() => deleteTodo(todo._id)} aria-label={`Delete ${todo.title}`}>×</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="app-footer">
          <span>Built with <strong>React</strong>, <strong>Express</strong> &amp; <strong>MongoDB</strong></span>
          <span>{counts.completed} of {counts.all} complete</span>
        </footer>
      </section>
      <p className="page-caption">A calmer way to get things done.</p>
    </main>
  );
}
