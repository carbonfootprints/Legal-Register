#!/bin/bash
# ============================================================
# Domain + SSL Setup for Legal Register Management System
# Domain: alertio.cloud
# Run on VPS:  bash domain-setup.sh
# ============================================================

set -e

DOMAIN="alertio.cloud"
APP_DIR="/var/www/legal-register"
FRONTEND_DIR="$APP_DIR/legal-register-frontend"
BACKEND_DIR="$APP_DIR/legal-register-backend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() { echo -e "\n${GREEN}[STEP $1]${NC} $2"; }
print_done()  { echo -e "${GREEN}[DONE]${NC} $1"; }
print_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo "========================================================"
echo "  Legal Register — Domain + SSL Setup"
echo "  Domain: $DOMAIN"
echo "========================================================"

read -p "Enter your email address (for SSL certificate alerts): " SSL_EMAIL

# ============================================================
# STEP 1 — Install Certbot
# ============================================================
print_step "1/5" "Installing Certbot..."
apt install -y certbot python3-certbot-nginx
print_done "Certbot installed."

# ============================================================
# STEP 2 — Update Nginx config to use domain
# ============================================================
print_step "2/5" "Updating Nginx config for domain..."
cp "$APP_DIR/nginx-ssl.conf" /etc/nginx/sites-available/legal-register
nginx -t && systemctl reload nginx
print_done "Nginx updated for $DOMAIN."

# ============================================================
# STEP 3 — Obtain SSL certificate
# ============================================================
print_step "3/5" "Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "$SSL_EMAIL" \
  --redirect
print_done "SSL certificate installed."

# ============================================================
# STEP 4 — Update .env files to use HTTPS domain
# ============================================================
print_step "4/5" "Updating environment variables to use HTTPS..."

# Update backend .env
sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://$DOMAIN|" "$BACKEND_DIR/.env"
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" "$BACKEND_DIR/.env"

# Update frontend .env and rebuild
echo "VITE_API_URL=https://$DOMAIN/api" > "$FRONTEND_DIR/.env"

cd "$FRONTEND_DIR"
npm install
npm run build
print_done "Environment updated and frontend rebuilt."

# ============================================================
# STEP 5 — Restart backend + allow HTTPS in firewall
# ============================================================
print_step "5/5" "Restarting backend and updating firewall..."

cd "$BACKEND_DIR"
pm2 reload ecosystem.config.cjs --env production
pm2 save

ufw allow 'Nginx HTTPS'
ufw reload

nginx -t && systemctl reload nginx
print_done "Backend restarted. Firewall updated."

# ============================================================
# FINAL
# ============================================================
echo ""
echo "========================================================"
echo -e "${GREEN}  SSL Setup Complete!${NC}"
echo ""
echo "  Your app is now live at:"
echo -e "  ${YELLOW}https://$DOMAIN${NC}"
echo ""
echo "  SSL auto-renewal is handled by Certbot."
echo "  Test renewal: certbot renew --dry-run"
echo "========================================================"
