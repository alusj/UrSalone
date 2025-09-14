import { useEffect, useState } from "react";
import supabase from "./supabaseClient";

export default function Essentials() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("essentials")
        .select("id, name, category, unit, price, image_url")
        .order("name");
      setItems(data || []);
    })();
  }, []);

  const filtered = items.filter(i => cat === "All" || i.category === cat);
  const add = (it) => {
    setCart(prev => {
      const ex = prev.find(p => p.id === it.id);
      return ex
        ? prev.map(p => p.id === it.id ? { ...p, qty: p.qty + 1 } : p)
        : [...prev, { ...it, qty: 1 }];
    });
  };
  const total = cart.reduce((s, c) => s + c.qty * Number(c.price ?? 0), 0);

  const placeOrder = async () => {
    const payload = cart.map(c => ({ item_id: c.id, qty: c.qty, price: c.price }));
    const { error } = await supabase.from("orders").insert({
      customer_name: "Guest",              // later: pull from user profile
      phone: "000-000-000",
      address: "TBD",
      items: payload,
      total
    });
    if (!error) {
      alert("Order placed!");
      setCart([]);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h2 className="text-2xl font-bold mb-4">Order Essentials</h2>

      <div className="flex gap-3 mb-6">
        <select className="border rounded px-3 py-2"
                value={cat} onChange={e => setCat(e.target.value)}>
          <option>All</option>
          {[...new Set(items.map(i => i.category))].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map(it => (
          <div key={it.id} className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="text-lg font-semibold">{it.name}</div>
            <div className="text-sm text-gray-500">{it.category} · {it.unit}</div>
            <div className="mt-2 font-medium">Le {Number(it.price).toLocaleString()}</div>
            <button className="mt-3 px-3 py-2 rounded bg-blue-600 text-white"
                    onClick={() => add(it)}>
              Add to cart
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border rounded-lg p-4">
        <div className="text-lg font-semibold mb-2">Cart</div>
        {cart.length === 0 ? <p className="text-gray-500">Cart empty.</p> : (
          <>
            <ul className="space-y-2">
              {cart.map(c => (
                <li key={c.id} className="flex justify-between">
                  <span>{c.name} × {c.qty}</span>
                  <span>Le {(c.qty * c.price).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-3 font-semibold">
              <span>Total</span><span>Le {total.toLocaleString()}</span>
            </div>
            <button className="mt-4 px-4 py-2 rounded bg-green-600 text-white"
                    onClick={placeOrder}>
              Place order
            </button>
          </>
        )}
      </div>
    </div>
  );
}
