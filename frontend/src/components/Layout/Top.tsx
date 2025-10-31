import { ReactNode } from "react";

export default function Topbar({ children }: { children?: ReactNode }) {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="bg-white flex justify-between items-center p-4 shadow-sm sticky top-0 z-20">
      <div>{children}</div>
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 shadow-sm"
      >
        Logout
      </button>
    </div>
  );
}
