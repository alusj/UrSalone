import { useState } from "react";

const TABS = [
  { id: "request", label: "Request", emoji: "📲" },
  { id: "drivers", label: "Drivers", emoji: "🚘" },
  { id: "okada",   label: "Okada",   emoji: "🏍️" },
  { id: "keke",    label: "Keke",    emoji: "🛺" },
  { id: "trips",   label: "Trips",   emoji: "🧾" },
];

export default function Transportation() {
  const [tab, setTab] = useState("request");

  const Pill = ({ id, label, emoji }) => {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm
          ${active ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-700 hover:bg-slate-50 border-slate-300"}`}
      >
        <span className="text-base">{emoji}</span>
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="sticky top:[56px] top-[56px] z-10 bg-slate-100/80 backdrop-blur supports-[backdrop-filter]:bg-slate-100/60">
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {TABS.map(t => <Pill key={t.id} {...t} />)}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-4">
        {tab === "request" && <Card title="Request a Ride" subtitle="Pickup/dropoff, fare estimate, live status." />}
        {tab === "drivers" && <Card title="Driver Onboarding" subtitle="Register, upload docs, approval status." />}
        {tab === "okada"   && <Card title="Motorbikes (Okada)" subtitle="Fast short trips; helmet & safety notes." />}
        {tab === "keke"    && <Card title="Keke (Tricycles)" subtitle="Affordable city rides; seat capacity." />}
        {tab === "trips"   && <Card title="Trip History" subtitle="Receipts, ratings, and support." />}
      </div>
    </div>
  );
}

function Card({ title, subtitle }) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
}
