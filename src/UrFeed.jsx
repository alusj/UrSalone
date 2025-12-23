import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export default function UrFeed() {
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setPosts(data);
    }
  };

  return (
    <main className="px-4 pb-24">
      <h1 className="text-2xl font-bold mt-4">Your Feed</h1>

      {/* MAP POSTS HERE */}
      {posts.map((post) => (
        <div key={post.id} className="p-3 border rounded-lg my-3 bg-white">
          <p>{post.content}</p>
        </div>
      ))}

      {/* FLOATING BUTTONS */}
      <div className="fixed bottom-24 right-4 flex flex-col gap-4 z-50">
        <button
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
          onClick={() => setShowPostModal(true)}
        >
          ✏️
        </button>

        <button
          className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
          onClick={() => setShowConnectionsModal(true)}
        >
          👥
        </button>
      </div>
    </main>
  );
}
