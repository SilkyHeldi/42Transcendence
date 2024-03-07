#!/usr/bin/env sh

# if node_modules not exist then install it
if [ ! -d "node_modules" ]; then
bun install
fi
bun install

# if first params is "dev" then run dev server else run prod server
if [ "$1" = "dev" ]; then
    bun run dev
else
    #npm run build
    bun run start
fi
