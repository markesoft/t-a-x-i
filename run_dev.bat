@echo off
set NODE_ENV=development
copy .env.dev .env
rm -rf .output .nuxt dist
npm run dev