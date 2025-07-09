# frontend/Dockerfile - Versión Final Correcta
# Ubicación: ./frontend/Dockerfile

# Etapa 1: Construir la aplicación React
FROM node:18-alpine AS build

# El WORKDIR inicial ahora es la raíz del contenedor (/app)
# y se corresponde con la raíz del repositorio (PizarraDigital/)
WORKDIR /app

# Copia solo package.json desde la carpeta 'frontend' en el contexto
COPY frontend/package.json ./frontend/ 
# Moverse al directorio de trabajo específico del frontend dentro del contenedor
# Aquí es donde se ejecutarán 'npm install' y 'npx vite build'.
WORKDIR /app/frontend

# Instala las dependencias
RUN npm install

# Copia el resto del código del frontend (src, public, etc.)
# Desde la carpeta 'frontend' del contexto (raíz del repo) al WORKDIR actual (/app/frontend)
COPY frontend/. . 

# Ejecutar 'vite build' directamente usando npx
RUN npx vite build


# Etapa 2: Servir la aplicación construida
FROM node:18-alpine

# El WORKDIR aquí es la raíz del contenedor.
WORKDIR /app

# Instala 'serve' globalmente
RUN npm install -g serve

# Copia los archivos construidos de la etapa 'build'
# La etapa 'build' dejó los archivos construidos en /app/frontend/dist
COPY --from=build /app/frontend/dist ./dist 
# Expone el puerto donde 'serve' escuchará
EXPOSE 3000

# Comando para iniciar el servidor 'serve'
CMD ["serve", "-s", "dist", "-l", "3000"]