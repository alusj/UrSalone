// src/Login.jsx
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import supabase from "./supabaseClient";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Login to UrSalone
        </h2>
        <Auth 
          supabaseClient={supabase} 
          appearance={{ theme: ThemeSupa }}
          providers={["google", "github"]} // optional: add social logins
        />
      </div>
    </div>
  );
}
