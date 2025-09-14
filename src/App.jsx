// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import supabase from "./supabaseClient";

// Your other pages
import Hotels from "./Hotels.jsx";
import Essentials from "./Essentials.jsx";
import Login from "./Login.jsx";

/** Simple placeholder for Orders page (you can replace later) */
function Orders() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <p className="text-gray-600">
        Orders UI coming soon. (Table is ready; we’ll hook the cart & checkout
        next.)
      </p>
    </div>
  );
}

export default function App() {
  // -------- auth state --------
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // which page is shown
  const [page, setPage] = useState("districts"); // "districts" | "hotels" | "essentials" | "orders"

  // -------- districts data state --------
  const [status, setStatus] = useState("Connecting to Supabase...");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // optional UI state for districts
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc"); // "name-asc" | "name-desc" | "pop-asc" | "pop-desc"

  // --- Auth bootstrap & listener ---
  useEffect(() => {
    // 1) get current session once
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      setAuthReady(true);
    });

    // 2) subscribe to future changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    // cleanup subscription
    return () => sub.subscription.unsubscribe();
  }, []);

  // --- Fetch districts (public.districts) ---
  useEffect(() => {
    (async () => {
      try {
        setStatus("Loading districts...");
        const { data, error } = await supabase
          .from("districts")
          .select("id, name, capital, province, population")
          .order("name", { ascending: true });

        if (error) throw error;

        setRows(data ?? []);
        setStatus("Loaded!");
      } catch (err) {
        console.error("Supabase error:", err);
        setError(err.message);
        setStatus("Failed to load.");
      }
    })();
  }, []);

  // --- Filter/sort for districts ---
  const filtered = useMemo(() => {
    let out = rows;

    if (province !== "All") {
      out = out.filter(
        (r) => r.province?.toLowerCase() === province.toLowerCase()
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.capital?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "name-desc":
        out = [...out].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "pop-asc":
        out = [...out].sort(
          (a, b) => (a.population || 0) - (b.population || 0)
        );
        break;
      case "pop-desc":
        out = [...out].sort(
          (a, b) => (b.population || 0) - (a.population || 0)
        );
        break;
      default:
        // name-asc
        out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    }

    return out;
  }, [rows, query, province, sortBy]);

  // --- Render guards ---
  if (!authReady) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-blue-700">
            UrSalone{" "}
            <span role="img" aria-label="globe">
              🌍
            </span>{" "}
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </h1>

          <div className="flex gap-2">
            {/* Page nav */}
            <nav className="hidden sm:flex gap-2">
              <button
                onClick={() => setPage("districts")}
                className={`px-3 py-1 rounded border ${
                  page === "districts"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                Districts
              </button>
              <button
                onClick={() => setPage("hotels")}
                className={`px-3 py-1 rounded border ${
                  page === "hotels"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                Hotels
              </button>
              <button
                onClick={() => setPage("essentials")}
                className={`px-3 py-1 rounded border ${
                  page === "essentials"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                Essentials
              </button>
              <button
                onClick={() => setPage("orders")}
                className={`px-3 py-1 rounded border ${
                  page === "orders"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                Orders
              </button>
            </nav>

            {/* Logout */}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setPage("districts");
              }}
              className="px-3 py-1 rounded border bg-white hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* PAGE: Districts */}
      {page === "districts" && (
        <main className="mx-auto max-w-5xl px-6 py-6">
          <p className="text-sm text-gray-500 mb-4">{status}</p>

          {/* Toolbar */}
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {/* Search */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search district or capital…"
              className="w-full rounded-md border px-3 py-2"
            />

            {/* Province */}
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option>All</option>
              <option>Eastern</option>
              <option>Northern</option>
              <option>North West</option>
              <option>Southern</option>
              <option>Western Area</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="name-asc">Sort: Name (A–Z)</option>
              <option value="name-desc">Sort: Name (Z–A)</option>
              <option value="pop-asc">Sort: Population (low→high)</option>
              <option value="pop-desc">Sort: Population (high→low)</option>
            </select>
          </div>

          {error && <p className="text-red-600 mb-4">Error: {error}</p>}
          {!error && filtered.length === 0 && (
            <p className="text-gray-500">No districts found.</p>
          )}

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <li
                key={r.id}
                className="bg-white shadow-md rounded-lg p-6 border hover:shadow-xl transition"
              >
                <strong className="text-lg text-gray-800">{r.name}</strong>
                <br />
                Capital: <span className="font-medium">{r.capital}</span>
                <br />
                Province: {r.province}
                <br />
                Population: {r.population?.toLocaleString()}
              </li>
            ))}
          </ul>
        </main>
      )}

      {/* PAGE: Hotels */}
      {page === "hotels" && <Hotels />}

      {/* PAGE: Essentials */}
      {page === "essentials" && <Essentials />}

      {/* PAGE: Orders */}
      {page === "orders" && <Orders />}
    </div>
  );
}
