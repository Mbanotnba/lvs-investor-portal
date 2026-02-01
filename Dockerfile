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

# Custom nginx config for SPA with security headers
RUN echo 'server { \
    listen 8080; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Security headers \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-Frame-Options "DENY" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always; \
    \
    # HTML files - no cache to ensure fresh content \
    location ~* \.html$ { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
    } \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css)$ { \
        expires 1h; \
        add_header Cache-Control "public, max-age=3600"; \
        add_header X-Content-Type-Options "nosniff" always; \
    } \
    location ~* \.(png|jpg|jpeg|gif|ico|svg|webp|mp4|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header X-Content-Type-Options "nosniff" always; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
