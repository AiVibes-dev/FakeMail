FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose Expo and web ports
EXPOSE 19000 19002 3000

# Start the application in docker mode
CMD ["npm", "run", "docker"]