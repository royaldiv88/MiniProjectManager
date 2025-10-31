import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Top";
import api from "../api/api";
import type { Project } from "../types/types";

export default function ProjectDetails(){
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  const load = async() => {
    const res = await api.get(`/api/projects/${id}`);
    setProject(res.data);
  };

  useEffect(()=>{ load(); }, [id]);

  const addTask = async () => {
    await api.post(`/api/projects/${id}/tasks`, { title, dueDate: due || null });
    setTitle(""); setDue("");
    load();
  };

  const toggleComplete = async (taskId:number, current:boolean) => {
    // use PUT to update isCompleted
    await api.put(`/api/tasks/${taskId}`, { title: "temp", dueDate: null, isCompleted: !current })
      .catch(()=>{}); // we'll reload after
    load();
  };

  const remove = async (taskId:number) => {
    if(!confirm("Delete task?")) return;
    await api.delete(`/api/tasks/${taskId}`);
    load();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Topbar />
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{project?.title ?? "Project"}</h1>
          <p className="text-sm text-slate-500">{project?.description}</p>

          <div className="mt-6 bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold">Tasks</h3>

            <div className="mt-3 flex gap-2">
              <input className="flex-1 p-2 border rounded" placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} />
              <input type="date" className="p-2 border rounded" value={due} onChange={e=>setDue(e.target.value)} />
              <button className="bg-primary text-white px-4 rounded" onClick={addTask}>Add</button>
            </div>

            <div className="mt-4 grid gap-3">
              {project?.tasks?.map(t=>(
                <div key={t.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-sm text-slate-500">{t.dueDate ? new Date(t.dueDate).toLocaleString() : "No due date"}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={()=>toggleComplete(t.id, t.isCompleted)} className={`px-3 py-1 rounded ${t.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                      {t.isCompleted ? "Completed" : "Mark done"}
                    </button>
                    <button onClick={()=>remove(t.id)} className="text-red-500">Delete</button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
