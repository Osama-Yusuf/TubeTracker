FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies required for yt-dlp and zip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    ffmpeg \
    zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy project files
COPY . .

# Create temp and bin directories
RUN mkdir -p temp bin

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
