FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia sólo los ficheros de dependencia primero para aprovechar el cache de Docker
COPY package*.json ./

# Instala dependencias
RUN npm install --production # Instala solo dependencias de producción para reducir tamaño

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que usa tu backend
# Render mapeará su tráfico externo a este puerto interno
EXPOSE 3000

# Comando por defecto al arrancar el contenedor
# Usa 'npm start' para producción (asumiendo que tu package.json lo tiene configurado para 'node src/app.js')
CMD ["npm", "start"]