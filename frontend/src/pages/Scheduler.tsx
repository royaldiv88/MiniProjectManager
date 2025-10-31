import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api/api";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Top"; // make sure this matches your filename

type LocalTask = {
  id: number;
  title: string;
  dueDate: string | null;
  estimatedHours: number;
  dependencies: string[]; // list of titles
};

interface ScheduleResponse {
  recommendedOrder: string[];
  totalEstimatedHours?: number;
}

interface ProjectSummary {
  id: number;
  title: string;
}

interface ProjectDetails {
  id: number;
  title: string;
  description?: string;
  tasks: {
    id: number;
    title: string;
    dueDate?: string | null;
    isCompleted: boolean;
    estimatedHours?: number | null; // in case backend later exposes it
    dependencies?: string[] | null;  // optional if backend exposes saved deps
  }[];
}

export default function Scheduler() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);
  const [localTasks, setLocalTasks] = useState<LocalTask[]>([]);
  const [result, setResult] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Load project list on mount
  useEffect(() => {
    api
      .get("/api/projects")
      .then((res) => {
        // Projects endpoint returns minimal project DTOs; adapt if shape differs
        setProjects(res.data);
      })
      .catch(() => {
        // ignore for now
      });
  }, []);

  // When a project is selected, fetch details and build editable localTasks
  const fetchProjectDetails = async (id: number) => {
    setLoading(true);
    setErr("");
    setResult(null);
    setLocalTasks([]);
    try {
      const res = await api.get<ProjectDetails>(`/api/projects/${id}`);
      const project = res.data;
      setSelectedProject(project);

      // Build editable local tasks from project tasks
      const mapped: LocalTask[] = (project.tasks || []).map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate ?? null,
        estimatedHours: t.estimatedHours ?? 8, // default to 8 if backend doesn't provide
        dependencies: t.dependencies ?? [], // if backend has saved dependencies, use them
      }));
      setLocalTasks(mapped);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to fetch project tasks");
      setSelectedProject(null);
    } finally {
      setLoading(false);
    }
  };

  // Helpers to edit local tasks
  const updateTaskField = (index: number, patch: Partial<LocalTask>) => {
    setLocalTasks((prev) => {
      const c = [...prev];
      c[index] = { ...c[index], ...patch };
      return c;
    });
  };

  const removeLocalTask = (index: number) => {
    setLocalTasks((prev) => {
      const c = [...prev];
      c.splice(index, 1);
      return c;
    });
  };

  const addCustomTask = () => {
    const nextId = localTasks.length ? Math.max(...localTasks.map(t => t.id)) + 1 : 1000;
    setLocalTasks(prev => [
      ...prev,
      { id: nextId, title: "New Task", dueDate: null, estimatedHours: 8, dependencies: [] }
    ]);
  };

  // Generate schedule using current localTasks
  const generateSchedule = async () => {
    if (!selectedProject) {
      setErr("Please select a project first.");
      return;
    }
    if (!localTasks.length) {
      setErr("No tasks to schedule.");
      return;
    }

    // Validate: task titles must be unique & non-empty
    const titles = localTasks.map(t => t.title?.trim());
    if (titles.some(t => !t)) {
      setErr("All tasks must have a title.");
      return;
    }
    const dup = titles.find((t, i) => titles.indexOf(t) !== i);
    if (dup) {
      setErr(`Duplicate task title: "${dup}". Titles must be unique.`);
      return;
    }

    setLoading(true);
    setErr("");
    setResult(null);

    // Build payload expected by backend
    const payload = {
      tasks: localTasks.map(t => ({
        title: t.title,
        estimatedHours: t.estimatedHours,
        dueDate: t.dueDate || null,
        dependencies: t.dependencies || []
      }))
    };

    try {
      const res = await api.post<ScheduleResponse>(`/api/v1/projects/${selectedProject.id}/schedule`, payload);
      setResult(res.data);
    } catch (e: any) {
      // display server message if present
      setErr(e?.response?.data?.message || e?.message || "Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  // UI Helpers: set dependency list for a task
  const toggleDependency = (taskIndex: number, dependencyTitle: string) => {
    setLocalTasks(prev => {
      const copy = [...prev];
      const deps = new Set(copy[taskIndex].dependencies || []);
      if (deps.has(dependencyTitle)) deps.delete(dependencyTitle);
      else deps.add(dependencyTitle);
      copy[taskIndex] = { ...copy[taskIndex], dependencies: Array.from(deps) };
      return copy;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <Topbar />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-white p-6 rounded-2xl shadow-md mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">🧠 Smart Scheduler</h1>
            <div>
              <button
                onClick={() => document.location.reload()}
                className="text-sm text-slate-500 hover:underline"
                title="Reload page"
              >
                Reload
              </button>
            </div>
          </div>

          {/* Project selector */}
          <div className="flex items-center gap-3 mb-6">
            <label className="font-medium">Select Project:</label>
            <select
              onChange={(e) => {
                const id = parseInt(e.target.value);
                if (!isNaN(id)) fetchProjectDetails(id);
              }}
              className="border p-2 rounded"
              defaultValue=""
            >
              <option value="" disabled>-- Choose a project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            {selectedProject && (
              <div className="ml-4 text-sm text-slate-600">Loaded: <strong>{selectedProject.title}</strong></div>
            )}
          </div>

          {/* Editable task table */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Tasks ({localTasks.length})</h2>
              <div className="flex gap-2">
                <button onClick={addCustomTask} className="bg-blue-600 text-white px-3 py-1 rounded">+ Add Task</button>
                <button
                  onClick={() => { setLocalTasks([]); setResult(null); }}
                  className="bg-red-50 text-red-600 px-3 py-1 rounded border"
                >
                  Clear
                </button>
              </div>
            </div>

            {localTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No tasks loaded. Select a project to import its tasks, or add tasks manually.</p>
            ) : (
              <div className="space-y-3">
                {localTasks.map((t, idx) => (
                  <div key={t.id} className="border rounded p-3 bg-white flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="flex-1">
                      <input
                        value={t.title}
                        onChange={(e) => updateTaskField(idx, { title: e.target.value })}
                        className="w-full p-2 border rounded mb-2"
                        placeholder="Task title"
                      />
                      <div className="text-sm text-slate-500 mb-1">Due: {t.dueDate ?? "N/A"}</div>
                      <div className="text-sm text-slate-500">Dependencies (select below)</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Estimated hours</label>
                        <input
                          type="number"
                          value={t.estimatedHours}
                          min={0}
                          onChange={(e) => updateTaskField(idx, { estimatedHours: Number(e.target.value) || 0 })}
                          className="w-24 p-2 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Dependencies</label>
                        <div className="max-h-28 overflow-auto border rounded p-2 bg-slate-50 w-56">
                          {localTasks
                            .filter(x => x.title !== t.title)
                            .map(x => {
                              const checked = t.dependencies.includes(x.title);
                              return (
                                <label key={x.title} className="flex items-center gap-2 text-sm mb-1">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleDependency(idx, x.title)}
                                  />
                                  <span>{x.title}</span>
                                </label>
                              );
                            })}
                          {localTasks.filter(x => x.title !== t.title).length === 0 && (
                            <div className="text-xs text-slate-400">No other tasks to depend on.</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button onClick={() => removeLocalTask(idx)} className="text-sm text-red-600">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate */}
          <div className="mt-4">
            <button
              onClick={generateSchedule}
              disabled={loading || localTasks.length === 0}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Generating..." : "⚙️ Generate Smart Schedule"}
            </button>
          </div>

          {err && <div className="text-red-600 mt-3">{err}</div>}

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-6 border-t pt-4">
              <h2 className="text-xl font-semibold mb-3">✅ Recommended Order</h2>
              <ol className="list-decimal ml-5 space-y-1">
                {result.recommendedOrder.map((r, i) => <li key={i}>{r}</li>)}
              </ol>

              {result.totalEstimatedHours != null && (
                <p className="mt-3 text-slate-600">⏱ Total Estimated Hours: <strong>{result.totalEstimatedHours}</strong></p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
