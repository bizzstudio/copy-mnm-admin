# ============================================================================
#  mnm-admin — React 19 + Vite SPA → nginx
#  משתני VITE_* נצרבים בזמן ה-build (build args).
# ============================================================================

# ---------- שלב build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# build args → env בזמן build (Vite צורב VITE_* לתוך ה-bundle)
ARG VITE_APP_STORE_DOMAIN
ARG VITE_APP_API_BASE_URL
ARG VITE_APP_API_SOCKET_URL
ARG VITE_APP_CLOUD_NAME
ARG VITE_APP_CLOUDINARY_API_KEY
ARG VITE_APP_CLOUDINARY_API_SECRET
ARG VITE_APP_CLOUDINARY_UPLOAD_PRESET
ARG VITE_APP_CLOUDINARY_URL
ARG VITE_APP_LIKUTAPP_DOMAIN
ENV VITE_APP_STORE_DOMAIN=$VITE_APP_STORE_DOMAIN \
    VITE_APP_API_BASE_URL=$VITE_APP_API_BASE_URL \
    VITE_APP_API_SOCKET_URL=$VITE_APP_API_SOCKET_URL \
    VITE_APP_CLOUD_NAME=$VITE_APP_CLOUD_NAME \
    VITE_APP_CLOUDINARY_API_KEY=$VITE_APP_CLOUDINARY_API_KEY \
    VITE_APP_CLOUDINARY_API_SECRET=$VITE_APP_CLOUDINARY_API_SECRET \
    VITE_APP_CLOUDINARY_UPLOAD_PRESET=$VITE_APP_CLOUDINARY_UPLOAD_PRESET \
    VITE_APP_CLOUDINARY_URL=$VITE_APP_CLOUDINARY_URL \
    VITE_APP_LIKUTAPP_DOMAIN=$VITE_APP_LIKUTAPP_DOMAIN

RUN npm run build

# ---------- שלב serve ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
