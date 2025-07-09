# backend/Dockerfile - Versión Final Correcta
# Ubicación: ./backend/Dockerfile

FROM node:18-alpine

# El WORKDIR inicial ahora es la raíz del contenedor (/app)
# y se corresponde con la raíz del repositorio (PizarraDigital/)
WORKDIR /app

# Copia package.json y package-lock.json desde la carpeta 'backend' en el contexto
# (que es la raíz del repo) a una ubicación temporal en /app/backend.
# Esto asegura que npm install tenga los archivos correctos.
COPY backend/package*.json ./backend/

# Moverse al directorio de trabajo específico del backend dentro del contenedor
# Aquí es donde se ejecutarán 'npm install' y se copiará el resto del código.
WORKDIR /app/backend 
# Instala dependencias
RUN npm install --production 
# Copia el resto del código de la aplicación (src, config, etc.)
# Desde la carpeta 'backend' del contexto (raíz del repo) al WORKDIR actual (/app/backend)
COPY backend/. . 

# Expone el puerto que usa tu backend
EXPOSE 10000

# Comando por defecto al arrancar el contenedor
CMD ["npm", "start"]