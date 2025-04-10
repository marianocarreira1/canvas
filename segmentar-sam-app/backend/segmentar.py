# backend/segmentar.py
# Última edición: 2025-04-09 23:59 UTC
# Editado por: Code Copilot (GPT)
# Cambio: Estandarización de metadatos y manejo explícito de dependencias críticas

import os
import sys
import io
import time
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
import base64
import json
import cv2
import uvicorn

try:
    import ssl
except ImportError:
    raise RuntimeError(
        "El entorno no tiene soporte para SSL. Asegúrate de usar una versión de Python compilada con OpenSSL."
    )

try:
    import multipart
except ImportError:
    raise RuntimeError(
        "python-multipart es requerido para subir archivos. Instálalo con: pip install python-multipart"
    )

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAVE_PATH = "segmentaciones_guardadas"
os.makedirs(SAVE_PATH, exist_ok=True)

app.mount("/archivos", StaticFiles(directory=SAVE_PATH), name="archivos")

CHANGELOG_PATH = "CHANGELOG.md"

predictor = None
checkpoint_path = "sam_vit_h_4b8939.pth"

@app.on_event("startup")
def load_model():
    global predictor
    try:
        import torch
        from segment_anything import sam_model_registry, SamPredictor
        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(f"No se encontró el checkpoint del modelo en: {checkpoint_path}")
        sam = sam_model_registry["vit_h"](checkpoint=checkpoint_path)
        sam.to(device="cuda" if torch.cuda.is_available() else "cpu")
        predictor = SamPredictor(sam)
    except Exception as e:
        predictor = None
        print("[ERROR] Fallo al cargar modelo SAM:", e)

@app.get("/status")
def status():
    try:
        import torch
        return {
            "torch": torch.__version__,
            "cuda_available": torch.cuda.is_available(),
            "model_loaded": predictor is not None,
            "checkpoint_path": checkpoint_path,
        }
    except:
        return {
            "torch": False,
            "cuda_available": False,
            "model_loaded": False,
            "checkpoint_path": checkpoint_path,
        }

@app.get("/changelog")
def get_changelog():
    if not os.path.exists(CHANGELOG_PATH):
        return JSONResponse(status_code=404, content={"error": "CHANGELOG.md no encontrado"})
    with open(CHANGELOG_PATH, "r", encoding="utf-8") as f:
        return PlainTextResponse(content=f.read(), media_type="text/plain")

def mask_to_svg_path(mask):
    contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    paths = []
    for cnt in contours:
        cnt = cnt.squeeze()
        if len(cnt.shape) != 2: continue
        d = f"M {cnt[0][0]},{cnt[0][1]} " + " ".join([f"L {x},{y}" for x, y in cnt[1:]]) + " Z"
        paths.append(d)
    return paths

@app.post("/segmentar")
async def segmentar(file: UploadFile = File(...)):
    if predictor is None:
        return JSONResponse(status_code=503, content={"error": "Modelo SAM no disponible"})

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    predictor.set_image(image_np)
    height, width = image_np.shape[:2]
    points = [[width // 2, height // 2]]
    labels = [1]

    masks, scores, logits = predictor.predict(
        point_coords=np.array(points),
        point_labels=np.array(labels),
        multimask_output=True,
    )

    segments = []
    for i, mask in enumerate(masks):
        ys, xs = np.where(mask)
        coords = list(zip(xs.tolist(), ys.tolist()))
        svg_paths = mask_to_svg_path(mask)
        segments.append({
            "id": i,
            "area": int(mask.sum()),
            "mask": coords,
            "svg_paths": svg_paths
        })

    base_filename = file.filename.rsplit(".", 1)[0]
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    json_filename = f"{base_filename}_segmentos_{timestamp}.json"
    out_path = os.path.join(SAVE_PATH, json_filename)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(segments, f, indent=2)

    return JSONResponse(content={"status": "ok", "file": json_filename, "segments": segments})

@app.post("/guardar_svg")
async def guardar_svg(request: Request):
    data = await request.json()
    nombre = request.headers.get("x-filename", "segmento_manual")
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"{nombre}_editado_{timestamp}.json"
    out_path = os.path.join(SAVE_PATH, filename)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return {"status": "guardado", "archivo": filename}

@app.get("/descargar_segmentos/{filename}")
def descargar_segmentos(filename: str):
    filepath = os.path.join(SAVE_PATH, filename)
    if not os.path.isfile(filepath):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})
    return FileResponse(filepath, media_type="application/json", filename=filename)

@app.get("/listar_segmentaciones")
def listar_segmentaciones():
    archivos = [f for f in os.listdir(SAVE_PATH) if f.endswith(".json")]
    return {"archivos": archivos}

@app.delete("/eliminar_segmento/{filename}")
def eliminar_segmento(filename: str):
    filepath = os.path.join(SAVE_PATH, filename)
    if not os.path.isfile(filepath):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})
    os.remove(filepath)
    return {"status": "eliminado", "archivo": filename}

if __name__ == "__main__":
    uvicorn.run("segmentar:app", host="0.0.0.0", port=8000, reload=True)
