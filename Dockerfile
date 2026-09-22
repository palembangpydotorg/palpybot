FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m botuser
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN chown -R botuser:botuser /app
USER botuser

CMD ["node", "main.js"]
