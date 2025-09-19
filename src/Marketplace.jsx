import { useMemo, useState } from "react";

const TABS = [
  { id: "browse",   label: "Browse",   emoji: "🛍️" },
  { id: "business", label: "My Biz",   emoji: "🏪" },
  { id: "products", label: "Products", emoji: "📦" },
  { id: "orders",   label: "Orders",   emoji: "🧾", badge: 2 }, // demo badge
  { id: "reviews",  label: "Reviews",  emoji: "⭐" },
];

export default function Marketplace() {
  const [tab, setTab] = useState("browse");
  const badgeCounts = useMemo(() => ({ orders: 2 }), []);

  const Pill = ({ id, label, emoji }) => {
    const active = tab === id;
    const showBadge = id === "orders" && badgeCounts.orders;
    const count = showBadge ? badgeCounts.orders : 0;

    return (
      <button
        onClick={() => setTab(id)}
        className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm
          ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 hover:bg-slate-50 border-slate-300"}`}
      >
        <span className="text-base">{emoji}</span>
        <span className="font-medium">{label}</span>
        {showBadge && (
          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full text-xs bg-red-500 text-white grid place-items-center">
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Sticky sub-nav (under your header) */}
      <div className="sticky top-[56px] z-10 bg-slate-100/80 backdrop-blur supports-[backdrop-filter]:bg-slate-100/60">
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {TABS.map(t => <Pill key={t.id} {...t} />)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-28 space-y-4">
        {tab === "browse"   && <Card title="Browse"   subtitle="Search & filter marketplace items by category, price, and distance." />}
        {tab === "business" && <Card title="My Business" subtitle="Set up or edit your business profile and verification." />}
        {tab === "products" && <Card title="Products" subtitle="Manage catalog, stock, photos, and pricing." />}
        {tab === "orders"   && <Card title="Orders"   subtitle="See new orders, update statuses, and print receipts." />}
        {tab === "reviews"  && <Card title="Reviews"  subtitle="See ratings & reply to customer feedback." />}
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
