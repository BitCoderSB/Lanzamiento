# backend/Dockerfile - Versión Final para Producción
# Ubicación: ./backend/Dockerfile

FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package*.json desde la carpeta 'backend' en el contexto
COPY backend/package*.json ./backend/

# Moverse al directorio de trabajo específico del backend dentro del contenedor
WORKDIR /app/backend

# Instala dependencias (instalación completa para asegurar todas las dependencias)
RUN npm install

# Copia el resto del código de la aplicación
COPY backend/. . 

# Expone el puerto que usa tu backend
EXPOSE 10000

# Comando por defecto al arrancar el contenedor
CMD ["npm", "start"]
