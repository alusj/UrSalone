// web/src/components/BottomTabs.jsx  (or web/src/BottomTabs.jsx if you prefer)
import { useEffect, useRef, useState } from "react";

export default function BottomTabs({ page, setPage }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y > lastY.current + 8) setHidden(true);
      else if (y < lastY.current - 8) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const Btn = ({ id, label, emoji }) => (
    <button
      onClick={() => setPage(id)}
      className={`flex flex-col items-center justify-center py-2 text-sm select-none
        ${page === id ? "text-blue-600 font-semibold" : "text-gray-600"}`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="leading-tight">{label}</span>
    </button>
  );

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm
                  transition-transform duration-300
                  ${hidden ? "translate-y-full" : "translate-y-0"}`}
      style={{ zIndex: 50 }}
      aria-label="Bottom navigation"
    >
      <div className="mx-auto max-w-5xl grid grid-cols-5">
        <Btn id="explore"        label="Explore"        emoji="🧭" />
        <Btn id="marketplace"    label="Marketplace"    emoji="🛒" />
        <Btn id="urbank"         label="UrBank"         emoji="🏦" />
        <Btn id="navigation"     label="Navigation"     emoji="🗺️" />
        <Btn id="transportation" label="Transport"      emoji="🚖" />
      </div>
    </nav>
  );
}
