#!/bin/bash
# ============================================================
# Deploy script for Legal Register Management System
# Run this every time you want to update the app on VPS:
#   bash deploy.sh
# NOTE: Run setup.sh first before using this script.
# ============================================================

set -e  # Stop on any error

APP_DIR="/var/www/legal-register"
FRONTEND_DIR="$APP_DIR/legal-register-frontend"
BACKEND_DIR="$APP_DIR/legal-register-backend"

GREEN='\033[0;32m'
NC='\033[0m'
print_done() { echo -e "${GREEN}[DONE]${NC} $1"; }

echo "========================================"
echo " Legal Register — Deploying Update..."
echo "========================================"

# 1. Pull latest code
echo "[1/5] Pulling latest code..."
cd "$APP_DIR"
git pull origin main
print_done "Code updated."

# 2. Install backend dependencies
echo "[2/5] Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install --omit=dev
print_done "Backend dependencies installed."

# 3. Install frontend dependencies and build
echo "[3/5] Building frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build
print_done "Frontend built."

# 4. Ensure logs directory exists
echo "[4/5] Ensuring logs directory..."
mkdir -p "$BACKEND_DIR/logs"
print_done "Logs directory ready."

# 5. Restart backend with PM2
echo "[5/5] Restarting backend..."
cd "$BACKEND_DIR"
pm2 describe legal-register-backend > /dev/null 2>&1 \
  && pm2 reload ecosystem.config.cjs --env production \
  || pm2 start ecosystem.config.cjs --env production
pm2 save
print_done "Backend restarted."

echo "========================================"
echo " Deploy complete!"
echo " Backend : running on port 5000 (PM2)"
echo " Frontend: served from $FRONTEND_DIR/dist"
echo "========================================"
