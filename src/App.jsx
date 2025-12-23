// src/App.jsx
import { useEffect, useState } from "react";
import supabase from "./supabaseClient";

// Screens
import BottomTabs from "./components/BottomTabs.jsx";
import Login from "./Login.jsx";
import Explore from "./Explore.jsx";
import Marketplace from "./Marketplace.jsx";
import Navigation from "./Navigation.jsx";
import Transportation from "./Transportation.jsx";
import UrBank from "./UrBank.jsx";

export default function App() {
  // -------- Auth state --------
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Which page is visible
  const [page, setPage] = useState("explore");

  // -------- Load auth session --------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // UI Guard
  if (!authReady) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        Loading…
      </div>
    );
  }

  // Not logged in → Login screen
  if (!session) {
    return <Login />;
  }

  // ---------- MAIN UI ----------
  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* --- Top Header --- */}
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

      {/* --- Page Content --- */}
      <main className="p-4">
        {page === "explore" && <Explore />}
        {page === "marketplace" && <Marketplace />}
        {page === "urbank" && <UrBank />}
        {page === "navigation" && <Navigation />}
        {page === "transportation" && <Transportation />}
      </main>

      {/* --- Bottom Navigation Tabs --- */}
      <BottomTabs page={page} setPage={setPage} />
    </div>
  );
}
