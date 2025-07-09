# frontend/Dockerfile

# Etapa 1: Construir la aplicación React
FROM node:18-alpine AS build

# Directorio de trabajo
WORKDIR /app

# --- AÑADE ESTAS LÍNEAS DE DEPURACIÓN ---
# Ejecutará un comando 'ls -la' para listar los archivos en el directorio actual (/app)
# Esto nos dirá si BuildKit "ve" package.json y package-lock.json aquí.
RUN ls -la # Este debería mostrar los contenidos de /app después del WORKDIR
# --- FIN LÍNEAS DE DEPURACIÓN ---


# Copia los archivos de configuración de dependencias
COPY package.json ./
COPY package-lock.json ./

# Instala las dependencias
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