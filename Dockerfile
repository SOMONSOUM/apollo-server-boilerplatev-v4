# Specify the base image
FROM node:16-alpine

# Arguments
ARG PORT

# Set environment variables
ENV PORT=${PORT}

# Create a working directory
WORKDIR /usr/src/app

# Copy package and lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN yarn build

# Expose the port
EXPOSE ${PORT}

# Start the server
CMD ["yarn", "start"]