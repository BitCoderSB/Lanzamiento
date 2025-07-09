# frontend/Dockerfile
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copia las definiciones de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia todo el código de la app
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Arrancar el dev server de Vite
CMD ["npm", "run", "dev"]
