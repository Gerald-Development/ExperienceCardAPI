FROM node:22-bullseye

RUN apt update -y && apt upgrade -y && apt install -y python3.9 build-essential g++ libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev ffmpeg

WORKDIR /app
COPY index.js config.json package.json ./
RUN npm install

CMD ["node", "index.js"]