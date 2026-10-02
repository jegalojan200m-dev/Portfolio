#!/bin/bash
set -e

echo "🚀 Deploying Neon Portfolio..."

if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run this from the project root."
  exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🔨 Building frontend..."
npm run build

if [ ! -d "php/vendor" ]; then
  echo "📦 Installing PHP dependencies..."
  cd php
  composer install --no-dev --optimize-autoloader
  cd ..
fi

if [ ! -f ".env" ]; then
  echo "⚠️  Warning: .env file not found. Copy .env.example to .env and configure your SMTP credentials."
fi

echo "✅ Build complete! Upload the 'dist/' folder contents to your PHP hosting server."
echo "📁 Ensure these directories are writable:"
echo "   - php/vendor/"
echo "   - php/messages/"
echo "   - php/uploads/"
