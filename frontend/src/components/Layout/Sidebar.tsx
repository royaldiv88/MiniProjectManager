import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function Sidebar(){
  return (
    <motion.aside
      initial={{ width: 200 }}
      animate={{ width: 200 }}
      className="h-screen bg-white shadow p-4"
      aria-label="Main navigation"
    >
      <div className="text-xl font-bold mb-6">TaskMe</div>
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "block px-3 py-2 rounded bg-accent text-white"
              : "block px-3 py-2 rounded hover:bg-gray-100"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive
              ? "block px-3 py-2 rounded bg-accent text-white"
              : "block px-3 py-2 rounded hover:bg-gray-100"
          }
        >
          Projects
        </NavLink>

        {/* Smart Scheduler link */}
        <NavLink
          to="/scheduler"
          className={({ isActive }) =>
            isActive
              ? "block px-3 py-2 rounded bg-accent text-white"
              : "block px-3 py-2 rounded hover:bg-gray-100"
          }
        >
          Smart Scheduler
        </NavLink>
      </nav>
    </motion.aside>
  );
}
