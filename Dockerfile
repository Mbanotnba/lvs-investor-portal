FROM nginx:alpine

# Copy frontend files
COPY . /usr/share/nginx/html

# Remove backend and node_modules from frontend image
RUN rm -rf /usr/share/nginx/html/backend \
    /usr/share/nginx/html/node_modules \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/package*.json \
    /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.gitignore

# Custom nginx config for SPA
RUN echo 'server { \
    listen 8080; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|mp4|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
