import { useEffect } from "react";

export default function Workstation() {
  useEffect(() => {
    document.title = "Workstation | IMG";
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to your Workstation</h1>
      <p className="text-gray-600">Here you can manage your tasks and projects efficiently.</p>
      <div className="mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">New Task</button>
      </div>
    </div>
  );
}
