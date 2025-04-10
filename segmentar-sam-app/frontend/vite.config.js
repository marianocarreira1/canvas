// vite.config.js
// Estructura: frontend/
// Última edición: 2025-04-09 23:59 UTC
// Editado por: Code Copilot (GPT)
// Cambio: Configuración base de Vite con alias de rutas y React

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
