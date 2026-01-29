#!/bin/sh

bunx prisma migrate deploy

bun run build

bun run start