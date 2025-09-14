import { useEffect, useState } from "react";
import supabase from "./supabaseClient";

export default function Hotels() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("id, name, city, address, star_rating, price_per_night, amenities, image_url")
        .order("star_rating", { ascending: false });
      if (!error) setRows(data || []);
    })();
  }, []);

  const filtered = rows.filter(h =>
    (city === "All" || h.city.toLowerCase() === city.toLowerCase()) &&
    (h.name.toLowerCase().includes(q.toLowerCase()) || h.address?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h2 className="text-2xl font-bold mb-4">Hotels</h2>
      <div className="flex gap-3 mb-6">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Search hotels"
               value={q} onChange={e => setQ(e.target.value)} />
        <select className="border rounded px-3 py-2"
                value={city} onChange={e => setCity(e.target.value)}>
          <option>All</option>
          {/* quick city list derived from data */}
          {[...new Set(rows.map(r => r.city))].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map(h => (
          <li key={h.id} className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="text-lg font-semibold">{h.name}</div>
            <div className="text-sm text-gray-600">{h.address} — {h.city}</div>
            <div className="mt-2">⭐ {h.star_rating} · Le {h.price_per_night?.toLocaleString()}/night</div>
            <div className="text-sm text-gray-500 mt-1">
              Amenities: {h.amenities?.join(", ")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
