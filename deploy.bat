@echo off
echo 🚀 Deploying Neon Portfolio...

if not exist "package.json" (
  echo ❌ Error: package.json not found. Run this from the project root.
  exit /b 1
)

echo 📦 Installing frontend dependencies...
call npm install

echo 🔨 Building frontend...
call npm run build

if not exist "php\vendor" (
  echo 📦 Installing PHP dependencies...
  cd php
  call composer install --no-dev --optimize-autoloader
  cd ..
)

if not exist ".env" (
  echo ⚠️  Warning: .env file not found. Copy .env.example to .env and configure your SMTP credentials.
)

echo ✅ Build complete! Upload the 'dist\' folder contents to your PHP hosting server.
echo 📁 Ensure these directories are writable:
echo    - php\vendor\
echo    - php\messages\
echo    - php\uploads\

pause
