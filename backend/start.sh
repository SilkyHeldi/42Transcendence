#!/usr/bin/env sh

# if node_modules not exist then install it
if [ ! -d "node_modules" ]; then
     bun install
fi
bun install
# if no prisma client then generate it
bun x prisma db push
#if [ ! -d "node_modules/.prisma/client" ]; then
#    npx prisma db seed
#fi

# if first params is "dev" then run dev server else run prod server
if [ "$1" = "dev" ]; then
    bun run start:dev
else
    #npm run build
    bun run start:prod
fi
