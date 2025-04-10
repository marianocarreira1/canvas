# CHANGELOG

> Estructura: raíz del proyecto
> Última edición: 2025-04-09 23:59 UTC
> Editado por: Code Copilot (GPT)

## [0.1.0] - 2025-04-09
### Agregado
- Endpoint `/segmentar` en FastAPI para procesar imágenes y retornar máscaras.
- Modelo `sam_vit_h_4b8939.pth` referenciado desde el backend.
- Frontend en React con Tailwind para subir imagen y ver segmentos.
- Viewer interactivo SVG con exportación a JSON.
- Dockerfile y docker-compose para orquestar backend.
- Script `/guardar_svg` para persistir edición de máscaras.

### Cambios
- Modularización de componentes: `SegmentarPanel.jsx`, `SVGMaskEditor.jsx`

### Pendientes
- Editor visual editable (mover puntos SVG)
- Autenticación por usuario
- Guardado histórico por sesión
