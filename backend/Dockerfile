# 1. Chọn Node LTS
FROM node:18

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy package.json và package-lock.json
COPY package*.json ./

# 4. Cài thư viện (production)
RUN npm install --production

# 5. Copy toàn bộ source code vào container
COPY . .

# 6. Copy .env nếu bạn muốn (tuỳ cách)
COPY .env .env

# 7. Expose port API (thay theo server.js của bạn)
EXPOSE 3000

# 8. Lệnh chạy app
CMD ["npm", "start"]

