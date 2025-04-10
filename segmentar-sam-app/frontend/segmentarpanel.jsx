// frontend-app (Diseño moderno basado en segmentar IA)
// Componente React principal para visualizar + subir + editar segmentaciones

import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, Download, FileEdit } from "lucide-react";
import { motion } from "framer-motion";

export default function SegmentarPanel() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState([]);
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

  return (
    <div className="p-6 max-w-5xl mx-auto grid gap-6">
      <h1 className="text-2xl font-bold">Diseño IA: Segmentación de Productos</h1>

      <Card className="border-dashed border-2">
        <CardContent className="p-4 grid gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleSelect}
            ref={fileRef}
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              className="rounded-xl max-h-72 object-contain border"
            />
          )}
          <Button onClick={handleUpload} disabled={loading} className="w-fit">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />}
            Subir y Segmentar
          </Button>
        </CardContent>
      </Card>

      {segments.length > 0 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Segmentos Detectados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((seg, i) => (
              <Card key={i} className="p-4">
                <CardContent>
                  <p className="text-sm mb-2">Segmento #{seg.id}</p>
                  <p className="text-xs">Área: {seg.area} píxeles</p>
                  <Button variant="outline" className="mt-2 text-sm">
                    <FileEdit className="mr-2 w-4 h-4" /> Editar Máscara
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
