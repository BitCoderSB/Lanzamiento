# frontend/Dockerfile - Versión Final para Producción (Solución de package-lock.json)
# Ubicación: ./frontend/Dockerfile

# Etapa 1: Construir la aplicación React
FROM node:18-alpine AS build

WORKDIR /app

# Copia SOLO package.json. package-lock.json no se copia explícitamente aquí.
COPY package.json ./

# Instala las dependencias. npm las resolverá basándose en package.json.
RUN npm install

# Copia el código fuente del frontend
COPY . .

# Construye la aplicación React para producción
RUN npm run build # Esto genera los archivos estáticos en la carpeta 'dist'


# Etapa 2: Servir la aplicación construida con un servidor web ligero ('serve')
FROM node:18-alpine

WORKDIR /app

# Instala 'serve' globalmente para servir los archivos estáticos
RUN npm install -g serve

# Copia los archivos construidos de la etapa 'build' al directorio de trabajo final
COPY --from=build /app/dist ./dist

# Expone el puerto donde 'serve' escuchará
EXPOSE 3000

# Comando para iniciar el servidor 'serve'
CMD ["serve", "-s", "dist", "-l", "3000"]