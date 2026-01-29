FROM oven/bun:1.3-alpine

WORKDIR /app

COPY . .

RUN bun install --production

EXPOSE 3000

RUN chmod +x ./scripts/run.sh

CMD ["./scripts/run.sh"]