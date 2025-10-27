# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Install fontconfig and other font libraries required by Sharp/SVG
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    fontconfig \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of the application's source code
COPY . .

# Make your port available to the world outside this container
EXPOSE 8080

# Define the command to run your app
CMD ["node", "index.js"]