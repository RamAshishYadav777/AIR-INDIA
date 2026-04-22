# Build Stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port (Internal)
EXPOSE 5000

# Start command
CMD ["npm", "run", "dev"]
