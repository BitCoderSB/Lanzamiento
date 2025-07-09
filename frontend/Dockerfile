# frontend/Dockerfile

# Etapa 1: Construir la aplicación React
FROM node:18-alpine AS build

WORKDIR /app

# --- CAMBIOS DE DEPURACIÓN Y COPIA ---

# AÑADE ESTA LÍNEA DE DEPURACIÓN CRÍTICA (forzada a no usar caché)
# Esto nos mostrará el contenido REAL del directorio /app en el momento de la construcción.
RUN ls -la /app && echo "Depuración de caché en $(date +%s)"
# Asegúrate de que package.json y package-lock.json aparecen en la salida de este comando.

# Copia los archivos de configuración de dependencias
COPY package.json ./
# Copiamos package-lock.json con una ruta más explícita (desde la raíz del contexto de construcción)
# Esto a veces ayuda a BuildKit a encontrar el archivo si hay ambigüedad.
COPY package-lock.json ./ 


# --- FIN CAMBIOS ---

# Instala las dependencias
RUN npm install

# Copia el código fuente del frontend
COPY . .

# Construye la aplicación React para producción
RUN npm run build


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