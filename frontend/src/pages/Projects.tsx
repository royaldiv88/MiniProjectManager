import { useEffect, useState } from "react";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Top";
import api from "../api/api";
import type { Project} from "../types/types";
import { Link } from "react-router-dom";

export default function Projects(){
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const load = async()=> {
    const res = await api.get("/api/projects");
    setProjects(res.data);
  };

  useEffect(()=>{ load(); }, []);

  const create = async () => {
    await api.post("/api/projects", { title, description: desc });
    setTitle(""); setDesc("");
    load();
  };

  const remove = async (id:number) => {
    if(!confirm("Delete project?")) return;
    await api.delete(`/api/projects/${id}`);
    load();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Topbar>
  <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
    <span className="text-indigo-600">Create Projects</span>
  </h1>
</Topbar>
        <div className="mt-6">
           
          <div className="mt-4 grid grid-cols-3 gap-6">
            <div className="col-span-3 bg-white p-4 rounded-xl shadow">
              <div className="flex gap-2">
                <input className="flex-1 p-2 border rounded" placeholder="Project title" value={title} onChange={e=>setTitle(e.target.value)} />
                <input className="flex-1 p-2 border rounded" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
                <button className="bg-primary text-white px-4 rounded" onClick={create}>Create</button>
              </div>
            </div>
            {projects.map(p=>(
              <div key={p.id} className="bg-white p-4 rounded-xl shadow">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-slate-500 mt-2">{p.description}</p>
                <div className="mt-3 flex gap-2">
                  <Link to={`/projects/${p.id}`} className="text-blue-600">Open</Link>
                  <button className="text-red-500" onClick={()=>remove(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
