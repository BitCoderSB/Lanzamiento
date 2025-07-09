# backend/Dockerfile
# ...
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copia package*.json
COPY backend/package*.json ./backend/

# Moverse al directorio del backend
WORKDIR /app/backend

# Instala dependencias
RUN npm install --production

# --- AÑADE ESTAS LÍNEAS DE DEPURACIÓN CRÍTICAS ---
# Verifica si la carpeta 'jsonwebtoken' existe después de la instalación
RUN ls -la node_modules/jsonwebtoken/ || echo "ERROR: node_modules/jsonwebtoken/ NO encontrado."
# Muestra el contenido de node_modules (las primeras líneas)
RUN ls -la node_modules/ | head -n 20 || echo "ERROR: No se pudo listar node_modules."
# --- FIN LÍNEAS DE DEPURACIÓN ---

# Copia el resto del código de la aplicación
COPY backend/. . 

# Expone el puerto
EXPOSE 10000

# Comando por defecto
CMD ["npm", "start"]