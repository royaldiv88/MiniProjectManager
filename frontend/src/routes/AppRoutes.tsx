import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import Scheduler from "../pages/Scheduler";
import { JSX } from "react";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><Projects/></PrivateRoute>} />
      <Route path="/projects/:id" element={<PrivateRoute><ProjectDetails/></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/scheduler" element={<Scheduler />} />
    </Routes>
  );
}
