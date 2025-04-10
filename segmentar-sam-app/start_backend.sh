#!/bin/bash

# Script para iniciar la API de segmentación SAM
# Requiere tener el entorno virtual activado o dependencias instaladas

echo "🚀 Iniciando backend en http://localhost:8000 ..."
uvicorn backend.segmentar:app --reload --host 0.0.0.0 --port 8000
