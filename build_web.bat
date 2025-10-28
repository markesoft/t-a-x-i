@echo off
set NODE_ENV=production

:: Optimize Node.js memory settings
set NODE_OPTIONS=--max-old-space-size=4096  --max-semi-space-size=256

:: Clean up before build
rm -rf .output dist ./prisma/generated
:: npm cache verify

:: Copy environment file
copy .env.web .env

:: Update build date
node scripts/update-build-date.cjs
::node scripts\replace.js

:: Run optimized build
npm run build:optimized