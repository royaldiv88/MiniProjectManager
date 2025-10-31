
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Top";
import api from "../api/api";
import type { Project } from "../types/types";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// (Same imports as above)
export default function Dashboard(){
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const r = await api.get("/api/projects");
      setProjects(r.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(()=> { load(); }, []);

  const create = async () => {
    if (!title.trim()) { alert("Please enter a title"); return; }
    try {
      await api.post("/api/projects", { title, description: desc });
      setTitle(""); setDesc("");
      await load();
    } catch (e:any) {
      console.error("Create failed", e);
      alert(e?.response?.data?.message ?? "Create failed");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Topbar>
  <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
    Your <span className="text-indigo-600">Project Collection</span>
  </h1>
</Topbar>
        <div className="mt-6">
          

          <div className="mt-2 p-2">
            <div className="flex gap-2">
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {loading ? <div>Loading...</div> : projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="bg-white p-4 rounded-xl shadow hover:shadow-md">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-slate-500 mt-2">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

