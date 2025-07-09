# frontend/Dockerfile

# Etapa 1: Construir la aplicación React
FROM node:18-alpine AS build

WORKDIR /app

# Copia solo package.json
COPY package.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente del frontend (esto incluye index.html)
COPY . .

# --- AÑADE ESTA LÍNEA DE DEPURACIÓN CRÍTICA ---
# Después de copiar todo, lista el contenido de /app para ver si index.html está ahí.
# Esto nos dirá si el archivo llegó correctamente al contenedor.
RUN ls -la /app && echo "Contenido de /app antes del build en $(date +%s)"
# --- FIN LÍNEAS DE DEPURACIÓN ---

# Ejecutar 'vite build' directamente usando npx
RUN npx vite build

# ... (Resto del Dockerfile, Etapa 2) ...