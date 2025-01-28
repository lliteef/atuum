import { useEffect } from "react";

export default function Workstation() {
  useEffect(() => {
    document.title = "Workstation | IMG";
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Workstation</h1>
    </div>
  );
}