# frontend/Dockerfile

# Etapa 1: Construir la aplicación React
FROM node:18-alpine AS build

WORKDIR /app

# Copia solo package.json
COPY package.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente del frontend
COPY . .

# --- CAMBIO CRÍTICO AQUÍ ---
# Antes: RUN npm run build # Esto genera los archivos estáticos en la carpeta 'dist'
# Ahora: Ejecutar 'vite build' directamente usando npx para evitar el "Missing script"
RUN npx vite build # <--- ¡CAMBIO!
# --- FIN CAMBIO ---


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