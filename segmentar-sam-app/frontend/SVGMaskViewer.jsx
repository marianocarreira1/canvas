// components/SVGMaskViewer.jsx
import React from "react";

export default function SVGMaskViewer({ paths = [], width = 512, height = 512 }) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto border rounded-2xl shadow-md"
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths.map((d, idx) => (
        <path
          key={idx}
          d={d}
          fill="rgba(255,0,0,0.2)"
          stroke="red"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}
