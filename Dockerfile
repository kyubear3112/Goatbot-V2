FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    DEBIAN_FRONTEND=noninteractive \
    PORT=3001

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    libuuid1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --include=optional --no-audit --no-fund \
    && npm cache clean --force

COPY . .

ENV PORT=3001
EXPOSE 3001

CMD ["sh", "-c", "if [ -n \"$FB_APPSTATE\" ]; then printf '%s' \"$FB_APPSTATE\" > account.txt; fi; exec node index.js"]
