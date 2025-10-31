import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login(){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setErr("");
    try{
      const res = await api.post("/api/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    }catch(err:any){
      setErr(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y:0 }} transition={{duration:0.3}}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              className="w-full mt-1 p-2 border rounded" placeholder="Enter username" />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)}
              type="password" className="w-full mt-1 p-2 border rounded" placeholder="Password" />
          </div>
          {err && <div className="text-red-500 text-sm">{err}</div>}
          <button type="submit" className="w-full bg-primary text-white p-2 rounded mt-2">Sign in</button>
        </form>
        <p className="mt-3 text-sm">Don't have an account? <Link to="/register" className="text-accent">Register</Link></p>
      </motion.div>
    </div>
  );
}
