import { useEffect, useMemo, useState } from "react";

const TABS = [
  { id: "feed",        label: "UrFeed",         emoji: "🏠" },
  { id: "connections", label: "UrConnections",  emoji: "👥" },
  { id: "discover",    label: "Discover",       emoji: "🔎" },
  { id: "notifs",      label: "UrNotifications",emoji: "🔔", badge: 3 }, // demo badge
  { id: "messages",    label: "UrMessages",     emoji: "💬", badge: 1 }, // demo badge
];

export default function Explore() {
  const [tab, setTab] = useState("feed");

  // (Optional) fake counts for badges; replace later with Supabase data
  const badgeCounts = useMemo(() => ({ notifs: 3, messages: 1 }), []);

  const Pill = ({ id, label, emoji }) => {
    const active = tab === id;
    const showBadge = (id === "notifs" && badgeCounts.notifs) || (id === "messages" && badgeCounts.messages);
    const count = id === "notifs" ? badgeCounts.notifs : id === "messages" ? badgeCounts.messages : 0;

    return (
      <button
        onClick={() => setTab(id)}
        className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm
          ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-slate-50 border-slate-300"}`}
      >
        <span className="text-base">{emoji}</span>
        <span className="font-medium">{label}</span>
        {showBadge ? (
          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full text-xs bg-red-500 text-white grid place-items-center">
            {count}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Sticky sub-nav (under your header) */}
      <div className="sticky top-[56px] z-10 bg-slate-100/80 backdrop-blur supports-[backdrop-filter]:bg-slate-100/60">
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {TABS.map(t => (
              <Pill key={t.id} id={t.id} label={t.label} emoji={t.emoji} />
            ))}
          </div>
        </div>
      </div>

      {/* Content area; extra bottom padding so it sits above the bottom taskbar */}
      <div className="px-4 pt-4 pb-28">
        {tab === "feed" && <FeedSection />}
        {tab === "connections" && <ConnectionsSection />}
        {tab === "discover" && <DiscoverSection />}
        {tab === "notifs" && <NotificationsSection />}
        {tab === "messages" && <MessagesSection />}
      </div>
    </div>
  );
}

/* ---------- Placeholders (wire to Supabase later) ---------- */

function Card({ title, subtitle }) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
}

function FeedSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-700">Your Feed</h2>
      <Card title="Create Post" subtitle="Share text, photo, or video with your followers." />
      <Card title="Welcome to UrFeed" subtitle="This is where posts from people & businesses appear." />
      <Card title="Tip" subtitle="We’ll add composer + infinite scroll next." />
    </div>
  );
}

function ConnectionsSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-700">Your Connections</h2>
      <Card title="Friends / Following" subtitle="See and manage your connections." />
      <Card title="Requests" subtitle="Incoming / outgoing connection requests." />
    </div>
  );
}

function DiscoverSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-700">Discover</h2>
      <Card title="People & Businesses" subtitle="Find accounts near you or trending in Sierra Leone." />
      <Card title="Categories" subtitle="Tourism, Hotels, Food, Services, Entertainment…" />
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-700">Notifications</h2>
      <Card title="Mentions, likes, follows" subtitle="Your recent activity will show up here." />
    </div>
  );
}

function MessagesSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-700">Messages</h2>
      <Card title="Inbox" subtitle="1:1 chats (group chats later)." />
      <Card title="Tip" subtitle="We’ll wire realtime messaging with Supabase channels." />
    </div>
  );
}
