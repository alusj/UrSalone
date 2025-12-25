import { useEffect, useMemo, useRef, useState } from "react";
import supabase from "./supabaseClient";

/* =========================
   Top tabs (same visual style you like)
   ========================= */
const TABS = [
  { id: "feed",        label: "UrFeed",          emoji: "🏠" },
  { id: "discover",    label: "Discover",        emoji: "🔎" },
  { id: "connections", label: "UrConnections",   emoji: "👥" },
  { id: "notifs",      label: "UrNotifications", emoji: "🔔", badge: 3 }, // demo badge
  { id: "messages",    label: "UrMessages",      emoji: "💬", badge: 1 }, // demo badge
];


export default function Explore() {
 const [tab, setTab] = useState("feed");
 const [feedTab, setFeedTab] = useState("feed");

 
  // demo badge counts; replace with real counts later
  const badgeCounts = useMemo(() => ({ notifs: 3, messages: 1 }), []);
  const [hideTopTabs, setHideTopTabs] = useState(false);
const lastScrollY = useRef(0);

useEffect(() => {
  const onScroll = () => {
    const y = window.scrollY || 0;

    if (y > lastScrollY.current + 8) {
      setHideTopTabs(true);   // scrolling down
    } else if (y < lastScrollY.current - 8) {
      setHideTopTabs(false);  // scrolling up
    }

    lastScrollY.current = y;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);


  const Pill = ({ id, label, emoji }) => {
    const active = tab === id;
    const showBadge =
      (id === "notifs" && badgeCounts.notifs) ||
      (id === "messages" && badgeCounts.messages);
    const count =
      id === "notifs"
        ? badgeCounts.notifs
        : id === "messages"
        ? badgeCounts.messages
        : 0;

    return (
      <button
        onClick={() => setTab(id)}
        className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm
          ${
            active
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 hover:bg-slate-50 border-slate-300"
          }`}
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
            {TABS.map((t) => (
              <Pill key={t.id} id={t.id} label={t.label} emoji={t.emoji} />
            ))}
          </div>
        </div>
      </div>

        
       {/* UrFeed sub-tabs (TikTok style) */}
 <div
 className={`sticky top-[56px] z-20 bg-slate-100/80 backdrop-blur
              transition-transform duration-300
              ${hideTopTabs ? "-translate-y-full" : "translate-y-0"}`}
>
  </div>
  {tab === "feed" && (
  <div className="px-4 pt-2">
    <div className="flex gap-6 text-sm font-medium text-gray-500">
      
      <button
        onClick={() => setFeedTab("feed")}
        className={`pb-2 transition
          ${
            feedTab === "feed"
              ? "text-black border-b-2 border-black"
              : "hover:text-gray-700"
          }`}
      >
        Feed
      </button>

      <button
        onClick={() => setFeedTab("friends")}
        className={`pb-2 transition
          ${
            feedTab === "friends"
              ? "text-black border-b-2 border-black"
              : "hover:text-gray-700"
          }`}
      >
        Connections
      </button>

    </div>
  </div>
)}





      {/* Content area; extra bottom padding so it sits above the bottom taskbar */}
           <div className="px-4 pt-4 pb-28">
        {tab === "feed" && feedTab === "feed" && <FeedSection />}
        {tab === "feed" && feedTab === "connections" && <ConnectionsSection />}
        {tab === "discover" && <DiscoverSection />}
        {tab === "notifs" && <NotificationsSection />}
        {tab === "messages" && <MessagesSection />}
      </div>
    </div>
  );
}

/* =========================
   UrFeed — Supabase wired
   - create post
   - load feed (RPC with fallback)
   - like/unlike (RPC with fallback)
   - add comment (simple)
   ========================= */

function FeedSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  // compose state
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("public"); // 'public' | 'followers' | 'private'

  // cursor for keyset pagination
  const lastCreatedAt = useRef(null);
  const lastId = useRef(null);

  useEffect(() => {
    fetchFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchFirstPage() {
    setError("");
    setLoading(true);
    try {
      const res = await getFeedPage({ limit: 12 });
      setPosts(res);
      setHasMore(res.length >= 12);
      if (res.length) {
        lastCreatedAt.current = res[res.length - 1].created_at;
        lastId.current = res[res.length - 1].id;
      } else {
        lastCreatedAt.current = null;
        lastId.current = null;
      }
    } catch (e) {
      setError(e.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMore() {
    if (!hasMore || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await getFeedPage({
        limit: 12,
        beforeCreatedAt: lastCreatedAt.current,
        beforeId: lastId.current,
      });
      setPosts((p) => [...p, ...res]);
      setHasMore(res.length >= 12);
      if (res.length) {
        lastCreatedAt.current = res[res.length - 1].created_at;
        lastId.current = res[res.length - 1].id;
      }
    } catch (e) {
      setError(e.message || "Failed to load more");
    } finally {
      setLoading(false);
    }
  }

  // --- RPC (preferred) with safe fallback ---
  async function getFeedPage({ limit, beforeCreatedAt = null, beforeId = null }) {
    // Try RPC feed_for_user (from the SQL I gave you)
    const { data, error } = await supabase.rpc("feed_for_user", {
      p_limit: limit,
      p_before_created_at: beforeCreatedAt,
      p_before_id: beforeId,
    });
    if (!error && Array.isArray(data)) return data;

    // Fallback: basic public feed (you still get your posts + public)
    const q = supabase
      .from("posts")
      .select("*")
      .eq("is_deleted", false)
      .in("visibility", ["public", "followers", "private"]) // RLS will filter
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit);

    if (beforeCreatedAt && beforeId) {
      // emulate keyset with lt filter if you added a composite index
      q.lt("created_at", beforeCreatedAt);
    }

    const { data: fb, error: fbErr } = await q;
    if (fbErr) throw fbErr;
    return fb || [];
  }

  // --- Create post ---
  async function handleCreatePost(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setCreating(true);
    setError("");
    try {
      // Preferred: RPC create_post
      const { data, error } = await supabase.rpc("create_post", {
        p_text: text.trim(),
        p_visibility: visibility,
      });

      if (error) {
        // Fallback: direct insert (will respect RLS)
        const { data: d2, error: e2 } = await supabase
          .from("posts")
          .insert([{ text: text.trim(), visibility }])
          .select()
          .single();
        if (e2) throw e2;
        // Prepend
        setPosts((p) => [d2, ...p]);
      } else if (data) {
        setPosts((p) => [data, ...p]);
      }

      setText("");
      setVisibility("public");
    } catch (e3) {
      setError(e3.message || "Failed to post");
    } finally {
      setCreating(false);
    }
  }

  // --- Like / Unlike ---
  async function toggleLike(postId) {
    try {
      const { data, error } = await supabase.rpc("toggle_like", {
        p_post_id: postId,
      });
      if (error) {
        // Fallback: manual toggle
        const { data: me } = await supabase.auth.getUser();
        const uid = me?.data?.user?.id;
        if (!uid) return;

        // check if reaction exists
        const { data: has, error: hasErr } = await supabase
          .from("post_reactions")
          .select("post_id")
          .eq("post_id", postId)
          .eq("user_id", uid)
          .maybeSingle();

        if (hasErr) throw hasErr;

        if (has) {
          await supabase
            .from("post_reactions")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", uid);
        } else {
          await supabase
            .from("post_reactions")
            .insert([{ post_id: postId, user_id: uid }]);
        }
      }
      // simple refresh of the first page (keeps it reliable)
      fetchFirstPage();
    } catch (e) {
      console.error(e);
      setError("Failed to toggle like");
    }
  }

  // --- Add simple comment (1 level) ---
  async function addComment(postId, value) {
    const text = value.trim();
    if (!text) return;
    try {
      const { error } = await supabase.rpc("add_comment", {
        p_post_id: postId,
        p_text: text,
      });
      if (error) {
        // fallback insert
        await supabase.from("comments").insert([{ post_id: postId, text }]);
      }
      fetchFirstPage();
    } catch (e) {
      console.error(e);
      setError("Failed to comment");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-700">Your Feed</h2>

      {/* Composer */}
      <form onSubmit={handleCreatePost} className="bg-white border rounded-lg p-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share something with UrSalone…"
          className="w-full border rounded-md p-3 outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="border rounded-md px-2 py-1"
          >
            <option value="public">Public</option>
            <option value="followers">Followers only</option>
            <option value="private">Private (only me)</option>
          </select>

          <button
            type="submit"
            disabled={creating || !text.trim()}
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-60"
          >
            {creating ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      {/* Errors */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            onLike={() => toggleLike(p.id)}
            onComment={(t) => addComment(p.id, t)}
          />
        ))}
        {posts.length === 0 && !loading && (
          <div className="bg-white border rounded-lg p-4 text-gray-600">
            No posts yet. Be the first to share!
          </div>
        )}
      </div>

      {/* Load more */}
      <div className="pt-2">
        {hasMore && (
          <button
            onClick={fetchMore}
            disabled={loading}
            className="px-4 py-2 rounded-md border bg-white hover:bg-slate-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}

/* --- Post UI helper --- */

function PostCard({ post, onLike, onComment }) {
  const [commentText, setCommentText] = useState("");

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-800">
            {/* You can join with profiles later */}
            @{(post.author_id || "").slice(0, 8)}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
        <VisibilityBadge v={post.visibility} />
      </div>

      {post.text && <p className="mt-3 whitespace-pre-wrap">{post.text}</p>}

      {/* (Optional) link preview fields if present */}
      {post.link_url && (
        <a
          href={post.link_url}
          target="_blank"
          rel="noreferrer"
          className="block mt-3 border rounded-md p-3 hover:bg-slate-50"
        >
          <div className="text-sm font-medium">{post.link_title || post.link_url}</div>
          {post.link_image && (
            <img src={post.link_image} alt="" className="mt-2 rounded-md" />
          )}
        </a>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onLike}
          className="px-3 py-1 rounded-md border bg-white hover:bg-slate-50"
        >
          ❤️ Like
        </button>
        <button className="px-3 py-1 rounded-md border bg-white hover:bg-slate-50">
          💾 Save
        </button>
        <button className="px-3 py-1 rounded-md border bg-white hover:bg-slate-50">
          🔁 Repost
        </button>
      </div>

      {/* Add comment */}
      <div className="mt-3 flex gap-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment…"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          onClick={() => {
            if (!commentText.trim()) return;
            onComment(commentText);
            setCommentText("");
          }}
          className="px-3 py-2 rounded-md bg-slate-900 text-white"
        >
          Comment
        </button>
      </div>
    </div>
  );
}

function VisibilityBadge({ v }) {
  const map = {
    public: { label: "Public", cls: "bg-green-100 text-green-700" },
    followers: { label: "Followers", cls: "bg-amber-100 text-amber-700" },
    private: { label: "Private", cls: "bg-gray-100 text-gray-700" },
  };
  const item = map[v] || map.public;
  return (
    <span className={`text-xs px-2 py-1 rounded ${item.cls}`}>{item.label}</span>
  );
}

/* ---------- Other top tabs (placeholders) ---------- */

function Card({ title, subtitle }) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
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
