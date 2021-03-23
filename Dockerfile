
#### Base Image with only nodejs and packages necessary for deployment ####
FROM alpine:latest as base

# Install package dependencies
RUN apk add --update --no-cache nodejs npm

# Set a working directory
WORKDIR /code

##### Image used for development purposes only ####
FROM base AS builder
RUN apk add --no-cache \
    curl \
    bash 



# Copy and install all node dependencies
COPY package*.json ./

RUN npm install

COPY . .

# ENV NODE_ENV production
RUN npm run build

ENTRYPOINT ["node", "./"]
