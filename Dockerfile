# ---- Stage 1: Build ----
    FROM node:22-alpine AS builder

    # Establece el directorio de trabajo
    WORKDIR /app
    
    # Copia los archivos necesarios para instalar dependencias
    COPY package.json package-lock.json* ./
    # Si usas Yarn, copia yarn.lock en lugar de package-lock.json:
    # COPY package.json yarn.lock ./
    
    # Instala las dependencias
    RUN npm install
    # Si usas Yarn:
    # RUN yarn install
    
    # Copia el resto del código fuente
    COPY . .
    
    # Construye la aplicación para producción
    RUN npm run build
    # Si usas Yarn:
    # RUN yarn build
    
    # ---- Stage 2: Serve ----
    FROM nginx:stable-alpine
    
    # Copia los archivos estáticos generados en la etapa de construcción
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # (Opcional) Copia un archivo de configuración personalizado para Nginx
    # Si necesitas manejar rutas en una SPA, descomenta la línea siguiente y crea nginx.conf
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expone el puerto 80 para Nginx
    EXPOSE 80
    
    # Comando para iniciar Nginx
    CMD ["nginx", "-g", "daemon off;"]