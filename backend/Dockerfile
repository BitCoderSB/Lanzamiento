# backend/Dockerfile
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia sólo los ficheros de dependencia primero para aprovechar el cache
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto que usa tu backend
EXPOSE 3000

# Comando por defecto al arrancar el contenedor
CMD ["npm", "run", "dev"]
