# ---------- 1) deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
# тулчейн для возможных нативных модулей (argon2 и пр.)
RUN apk add --no-cache python3 make g++ libc6-compat

# корень монорепы + package.json нужных пакетов
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/auth-customer/package.json ./services/auth-customer/package.json
# если пакета нет — просто удалите эту строку
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# ставим зависимости по lockfile (для всего воркспейса)
RUN pnpm install --frozen-lockfile


# ---------- 2) build ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# переносим всё из deps (node_modules, lockfile и т.д.)
COPY --from=deps /app /app
# копируем исходники
COPY . .

# работаем внутри сервиса
WORKDIR /app/services/auth-customer
# 1) генерируем Prisma Client
RUN pnpm prisma generate
# 2) собираем NestJS
RUN pnpm build


# ---------- 3) runner ----------
FROM node:20-alpine AS runner
WORKDIR /app/services/auth-customer
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
ENV NODE_ENV=production

# рабочие файлы
COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml      /app/pnpm-lock.yaml
COPY --from=build /app/services/auth-customer/package.json ./package.json

# ВАЖНО: копируем и корневые node_modules, и node_modules конкретного пакета
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/services/auth-customer/node_modules ./node_modules

# артефакты
COPY --from=build /app/services/auth-customer/dist   ./dist
COPY --from=build /app/services/auth-customer/prisma ./prisma

EXPOSE 4001
# Вызываем локальный бинарь без pnpm, чтобы не зависеть от скриптов
CMD ["sh", "-lc", "pnpm exec prisma generate && pnpm exec prisma migrate deploy && node dist/main.js"]
