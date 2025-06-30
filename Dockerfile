# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (development and production)
RUN npm install

# Copy all code
COPY . .

# Compile TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Just copy package.json and package-lock.json to install production dependencies
COPY package*.json ./

RUN npm install --only=production

# Copy the transpiled code
COPY --from=build /app/dist ./

EXPOSE 3000

CMD ["node", "app.js"]