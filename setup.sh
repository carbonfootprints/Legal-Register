#!/bin/bash
# ============================================================
# First-time Server Setup for Legal Register Management System
# Run this ONCE on a fresh Ubuntu 22.04 VPS:  bash setup.sh
# ============================================================

set -e  # Stop on any error

APP_DIR="/var/www/legal-register"
FRONTEND_DIR="$APP_DIR/legal-register-frontend"
BACKEND_DIR="$APP_DIR/legal-register-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() { echo -e "\n${GREEN}[STEP $1]${NC} $2"; }
print_warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_done() { echo -e "${GREEN}[DONE]${NC} $1"; }

echo "========================================================"
echo "  Legal Register — First Time Server Setup"
echo "========================================================"
echo ""

# ---- Collect user input upfront ----
read -p "Enter your server IP address (e.g. 192.168.1.100): " SERVER_IP
read -p "Enter your Git repository URL: " GIT_REPO_URL
read -p "Enter MongoDB password (choose a strong one): " MONGO_PASSWORD
read -p "Enter your Gmail address (for email notifications): " EMAIL_USER
read -p "Enter your Gmail App Password: " EMAIL_PASS

# Auto-generate secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || openssl rand -hex 64)
CRON_SECRET=$(openssl rand -hex 32)

echo ""
echo "--------------------------------------------------------"
echo "  Configuration Summary"
echo "  Server IP  : $SERVER_IP"
echo "  Git Repo   : $GIT_REPO_URL"
echo "  Email      : $EMAIL_USER"
echo "--------------------------------------------------------"
read -p "Looks good? Press Enter to continue or Ctrl+C to cancel..."

# ============================================================
# STEP 1 — System update
# ============================================================
print_step "1/10" "Updating system packages..."
apt update && apt upgrade -y
apt install -y curl git ufw
print_done "System updated."

# ============================================================
# STEP 2 — Install Node.js 20
# ============================================================
print_step "2/10" "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
print_done "Node.js $(node -v) installed."

# ============================================================
# STEP 3 — Install PM2
# ============================================================
print_step "3/10" "Installing PM2..."
npm install -g pm2
print_done "PM2 installed."

# ============================================================
# STEP 4 — Install Nginx
# ============================================================
print_step "4/10" "Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
print_done "Nginx installed and started."

# ============================================================
# STEP 5 — Install MongoDB 7
# ============================================================
print_step "5/10" "Installing MongoDB 7..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  tee /etc/apt/sources.list.d/mongodb-org-7.0.list

apt update
apt install -y mongodb-org
systemctl enable mongod
systemctl start mongod
sleep 3  # Wait for MongoDB to start
print_done "MongoDB 7 installed and started."

# ============================================================
# STEP 6 — Secure MongoDB with authentication
# ============================================================
print_step "6/10" "Securing MongoDB..."

# Create MongoDB user
mongosh --quiet --eval "
use admin;
db.createUser({
  user: 'legaladmin',
  pwd: '$MONGO_PASSWORD',
  roles: [{ role: 'readWrite', db: 'legal-register' }]
});
print('MongoDB user created successfully.');
"

# Enable authentication in MongoDB config
if ! grep -q "authorization: enabled" /etc/mongod.conf; then
  echo -e "\nsecurity:\n  authorization: enabled" >> /etc/mongod.conf
fi

systemctl restart mongod
sleep 3
print_done "MongoDB secured with authentication."

# ============================================================
# STEP 7 — Clone project and create .env files
# ============================================================
print_step "7/10" "Setting up project files..."

mkdir -p "$APP_DIR"
cd "$APP_DIR"
git clone "$GIT_REPO_URL" .

# Create backend .env
cat > "$BACKEND_DIR/.env" <<EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://legaladmin:${MONGO_PASSWORD}@localhost:27017/legal-register?authSource=admin
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
CORS_ORIGIN=http://${SERVER_IP}
CRON_SECRET=${CRON_SECRET}
FRONTEND_URL=http://${SERVER_IP}
EOF

# Create frontend .env
cat > "$FRONTEND_DIR/.env" <<EOF
VITE_API_URL=http://${SERVER_IP}/api
EOF

print_done "Environment files created."

# ============================================================
# STEP 8 — Install dependencies and build
# ============================================================
print_step "8/10" "Installing dependencies and building..."

cd "$BACKEND_DIR"
npm install --omit=dev

cd "$FRONTEND_DIR"
npm install
npm run build

mkdir -p "$BACKEND_DIR/logs"
print_done "Build complete."

# ============================================================
# STEP 9 — Configure Nginx
# ============================================================
print_step "9/10" "Configuring Nginx..."

# Copy nginx config
cp "$APP_DIR/nginx.conf" /etc/nginx/sites-available/legal-register

# Remove default Nginx site and enable ours
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/legal-register /etc/nginx/sites-enabled/legal-register

nginx -t && systemctl reload nginx
print_done "Nginx configured."

# ============================================================
# STEP 10 — Start backend with PM2 + setup firewall
# ============================================================
print_step "10/10" "Starting backend and configuring firewall..."

cd "$BACKEND_DIR"
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | tail -1 | bash  # Auto-run PM2 on server reboot

# Firewall: allow SSH and HTTP only
ufw allow OpenSSH
ufw allow 'Nginx HTTP'
ufw --force enable

print_done "Backend started. Firewall configured."

# ============================================================
# FINAL
# ============================================================
echo ""
echo "========================================================"
echo -e "${GREEN}  Setup complete!${NC}"
echo ""
echo "  Your app is live at: http://${SERVER_IP}"
echo ""
echo "  Useful commands:"
echo -e "  ${YELLOW}pm2 logs legal-register-backend${NC}   — view backend logs"
echo -e "  ${YELLOW}pm2 status${NC}                         — check process status"
echo -e "  ${YELLOW}bash /var/www/legal-register/deploy.sh${NC} — deploy updates"
echo "========================================================"
