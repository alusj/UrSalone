// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import supabase from "./supabaseClient";

// Your other pages
import BottomTabs from "./components/BottomTabs.jsx";
import Hotels from "./Hotels.jsx";
import Essentials from "./Essentials.jsx";
import Login from "./Login.jsx";
import Explore from "./Explore.jsx";
import Marketplace from "./Marketplace.jsx";
import Navigation from "./Navigation.jsx";
import Transportation from "./Transportation.jsx";
import UrBank from "./UrBank.jsx";


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
    // inside App(), before the return (...)
const signOut = async () => {
  try {
    await supabase.auth.signOut();   // sign out with Supabase
    setPage("explore");              // optional: go back to Explore
    setSession(null);                // clear session state
  } catch (e) {
    console.error("Logout failed:", e.message);
  }
};
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
        return (
  <div className="min-h-screen bg-slate-100 pb-20">
    {/* --- Optional Header (branding + logout) --- */}
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">UrSalone</h1>
     <button
  onClick={async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPage("explore");
  }}
  className="px-3 py-1 bg-red-500 text-white rounded"
>
  Logout
</button>

    </header>

    {/* --- Page content --- */}
    <main className="p-4">
      {page === "explore" && <Explore />}
      {page === "marketplace" && <Marketplace />}
      {page === "urbank" && <UrBank />}
      {page === "navigation" && <Navigation />}
      {page === "transportation" && <Transportation />}
    </main>

    {/* --- Bottom Taskbar --- */}
    <BottomTabs page={page} setPage={setPage} />
  </div>
);
// <-- after this, there should be NOTHING except the closing brace of the function:
}  // end of export default function App()
