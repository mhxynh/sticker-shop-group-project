FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy application code
COPY ./src ./src

# Install dependencies
RUN npm install

# Switch to a non-root user
USER node

# Expose application port
EXPOSE 3000

# Default command
CMD ["npm", "start"]
