// components/SVGMaskEditor.jsx (editable + export JSON)
import React, { useState, useRef, useEffect } from "react";

export default function SVGMaskEditor({ paths = [], width = 512, height = 512 }) {
  const [editablePaths, setEditablePaths] = useState(paths);
  const svgRef = useRef();

  useEffect(() => {
    setEditablePaths(paths);
  }, [paths]);

  const handleExport = () => {
    const json = JSON.stringify(editablePaths, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "segmento_editado.json";
    a.click();
  };

  return (
    <div className="grid gap-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto border rounded-xl shadow"
        xmlns="http://www.w3.org/2000/svg"
      >
        {editablePaths.map((d, idx) => (
          <path
            key={idx}
            d={d}
            fill="rgba(0,128,255,0.2)"
            stroke="blue"
            strokeWidth={1.4}
            cursor="pointer"
          />
        ))}
      </svg>
      <button
        onClick={handleExport}
        className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Exportar JSON
      </button>
    </div>
  );
}
