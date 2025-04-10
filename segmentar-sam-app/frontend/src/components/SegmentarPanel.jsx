// frontend/src/components/SegmentarPanel.jsx
// Estructura: frontend/src/components/
// Última edición: 2025-04-09 23:59 UTC
// Editado por: Code Copilot (GPT)
// Cambio: Remoción de dependencias rotas a shadcn/ui; reemplazo por clases Tailwind nativas

import React, { useState, useRef } from "react";
import { Loader2, UploadCloud, Eye } from "lucide-react";
import { motion } from "framer-motion";
import SVGMaskEditor from "./SVGMaskEditor.jsx";

export default function SegmentarPanel() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState([]);
  const [activeSegment, setActiveSegment] = useState(null);
  const [exportedJson, setExportedJson] = useState(null);
  const fileRef = useRef();

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("http://localhost:8000/segmentar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setSegments(data.segments);
      setActiveSegment(null);
      setExportedJson(null);
    } catch (err) {
      console.error("Error al segmentar:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleExportPaths = (paths) => {
    const json = JSON.stringify(paths, null, 2);
    setExportedJson(json);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto grid gap-6">
      <h1 className="text-2xl font-bold">Diseño IA: Segmentación de Productos</h1>

      <div className="border-2 border-dashed rounded-xl p-4 space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleSelect}
          ref={fileRef}
          className="w-full border px-3 py-2 rounded-md text-sm"
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            className="rounded-xl max-h-72 object-contain border"
          />
        )}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
          Subir y Segmentar
        </button>
      </div>

      {segments.length > 0 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Segmentos Detectados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((seg, i) => (
              <div key={i} className="p-4 rounded-xl border shadow-sm space-y-2">
                <p className="text-sm">Segmento #{seg.id}</p>
                <p className="text-xs text-gray-600">Área: {seg.area} píxeles</p>
                <button
                  className="inline-flex items-center gap-1 text-sm px-3 py-1 border rounded hover:bg-gray-100"
                  onClick={() => setActiveSegment(seg)}
                >
                  <Eye className="w-4 h-4" /> Ver Segmento
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSegment && (
        <div className="grid gap-4 mt-8">
          <h2 className="text-xl font-bold">Editor de Segmento #{activeSegment.id}</h2>
          <SVGMaskEditor
            paths={activeSegment.svg_paths}
            width={512}
            height={512}
            onExport={handleExportPaths}
          />
          <button
            onClick={() => setActiveSegment(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            Ocultar Vista
          </button>
        </div>
      )}

      {exportedJson && (
        <div className="bg-gray-100 p-4 rounded-xl">
          <h3 className="font-semibold mb-2">Máscara exportada como JSON:</h3>
          <pre className="text-xs whitespace-pre-wrap break-all">{exportedJson}</pre>
        </div>
      )}
    </div>
  );
}
