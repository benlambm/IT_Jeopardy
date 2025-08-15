#!/bin/bash
# Universal VPS Deployment Setup Script
# Deploy any GitHub repo to a subdomain.benlamb.net
# Run this on your VPS as root

set -e  # Exit on error

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Universal VPS Deployment Setup Script ===${NC}"
echo "Deploy any GitHub repository to your VPS with nginx and SSL"
echo ""

# Get subdomain from user
echo -e "${YELLOW}Enter the subdomain (without .benlamb.net):${NC}"
echo "Example: For 'jeopardy.benlamb.net', enter 'jeopardy'"
read -p "Subdomain: " SUBDOMAIN

if [ -z "$SUBDOMAIN" ]; then
    echo -e "${RED}Error: Subdomain cannot be empty${NC}"
    exit 1
fi

# Configuration
DOMAIN="${SUBDOMAIN}.benlamb.net"
WEB_ROOT="/var/www/${DOMAIN}"
EMAIL="benjaminmlamb@icloud.com"  # For SSL certificate notifications

# Get GitHub repository URL
echo ""
echo -e "${YELLOW}Enter the GitHub repository URL:${NC}"
echo "Example: https://github.com/benlambm/IT_Jeopardy.git"
read -p "GitHub repo URL: " GITHUB_REPO

if [ -z "$GITHUB_REPO" ]; then
    echo -e "${RED}Error: GitHub repository URL cannot be empty${NC}"
    exit 1
fi

# Extract repo name for display
REPO_NAME=$(basename "$GITHUB_REPO" .git)

# Get the default file to serve (optional)
echo ""
echo -e "${YELLOW}Enter the default index file (press Enter for 'index.html'):${NC}"
read -p "Index file [index.html]: " INDEX_FILE
INDEX_FILE=${INDEX_FILE:-index.html}

# Confirm settings
echo ""
echo -e "${GREEN}=== Configuration Summary ===${NC}"
echo "Domain: ${DOMAIN}"
echo "Web Root: ${WEB_ROOT}"
echo "Repository: ${GITHUB_REPO}"
echo "Index File: ${INDEX_FILE}"
echo "SSL Email: ${EMAIL}"
echo ""
read -p "Proceed with setup? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo -e "${GREEN}Starting deployment setup...${NC}"
echo ""

# 1. Add the deployment SSH key to authorized_keys
echo -e "${YELLOW}Step 1: SSH Key Setup for GitHub Actions${NC}"
echo "Do you want to add a GitHub Actions deployment key? (y/n)"
read -p "Add SSH key? " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    echo ""
    echo "Please paste the PUBLIC KEY from your local machine:"
    echo "(This is the content of ~/.ssh/github_actions_deploy.pub)"
    echo "Press Enter twice when done:"
    echo ""
    
    # Read multiline input until empty line
    PUBLIC_KEY=""
    while IFS= read -r line; do
        [ -z "$line" ] && break
        PUBLIC_KEY="$line"
    done
    
    if [ -n "$PUBLIC_KEY" ]; then
        # Check if key already exists
        if ! grep -q "$PUBLIC_KEY" ~/.ssh/authorized_keys 2>/dev/null; then
            echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys
            chmod 600 ~/.ssh/authorized_keys
            echo -e "${GREEN}✓ SSH key added successfully${NC}"
        else
            echo -e "${YELLOW}✓ SSH key already exists${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ No SSH key provided, skipping...${NC}"
    fi
else
    echo -e "${YELLOW}Skipping SSH key setup${NC}"
fi

# 2. Create web directory
echo ""
echo "Step 2: Creating web directory..."
mkdir -p "${WEB_ROOT}"
cd "${WEB_ROOT}"

# 3. Clone the repository
echo ""
echo -e "${YELLOW}Step 3: Cloning repository...${NC}"
if [ ! -d ".git" ]; then
    git clone "$GITHUB_REPO" .
    echo -e "${GREEN}✓ Repository cloned successfully${NC}"
else
    echo "Repository already exists, pulling latest..."
    git pull origin main || git pull origin master
    echo -e "${GREEN}✓ Repository updated${NC}"
fi

# 4. Set proper permissions
echo ""
echo "Step 4: Setting file permissions..."
find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" \) -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chown -R www-data:www-data "${WEB_ROOT}"

# 5. Create nginx configuration (HTTP only for now, SSL will be added by certbot)
echo ""
echo -e "${YELLOW}Step 5: Creating nginx configuration...${NC}"

# Determine index files based on what exists or user preference
if [ -f "${WEB_ROOT}/new.html" ] && [ "$INDEX_FILE" = "index.html" ]; then
    INDEX_DIRECTIVE="index new.html index.html;"
else
    INDEX_DIRECTIVE="index ${INDEX_FILE};"
fi

cat > "/etc/nginx/sites-available/${DOMAIN}" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    root ${WEB_ROOT};
    ${INDEX_DIRECTIVE}

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

echo -e "${GREEN}✓ Nginx configuration created${NC}"

# 6. Enable the site
echo ""
echo "Step 6: Enabling nginx site..."
ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/"
nginx -t && systemctl reload nginx

# 7. Install and configure SSL with Certbot
echo ""
echo -e "${YELLOW}Step 7: SSL Certificate Setup${NC}"
echo "Do you want to set up SSL/HTTPS with Let's Encrypt? (y/n)"
read -p "Setup SSL? " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if certbot is installed, if not install it
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    else
        echo -e "${GREEN}✓ Certbot is already installed${NC}"
    fi
    
    # 8. Obtain SSL certificate
    echo ""
    echo -e "${YELLOW}Step 8: Obtaining SSL certificate for ${DOMAIN}...${NC}"
    echo -e "${RED}Note: This requires that ${DOMAIN} already points to this server's IP address${NC}"
    echo ""
    
    # Run certbot
    certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --email "${EMAIL}" --redirect
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ SSL certificate obtained and configured successfully${NC}"
        
        # Test renewal only for this specific certificate
        echo ""
        echo -e "${YELLOW}Testing SSL renewal for ${DOMAIN}...${NC}"
        certbot renew --cert-name "${DOMAIN}" --dry-run
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Automatic SSL renewal is configured for ${DOMAIN}${NC}"
        else
            echo -e "${YELLOW}⚠ Automatic renewal test failed, but certificate is installed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ SSL certificate setup failed. You can try manually later with:${NC}"
        echo "  certbot --nginx -d ${DOMAIN}"
    fi
else
    echo -e "${YELLOW}Skipping SSL setup. Site will be HTTP only.${NC}"
    echo "To add SSL later, run: certbot --nginx -d ${DOMAIN}"
fi

# Final summary
echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo -e "${GREEN}✓${NC} Repository deployed to ${WEB_ROOT}"
echo -e "${GREEN}✓${NC} File permissions set"
echo -e "${GREEN}✓${NC} Nginx configured for ${DOMAIN}"

if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
    echo -e "${GREEN}✓${NC} SSL certificate installed (HTTPS enabled)"
    echo -e "${GREEN}✓${NC} Automatic SSL renewal configured"
fi

echo ""
echo -e "${GREEN}=== Access Your Site ===${NC}"

if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
    echo "Your site is available at:"
    echo -e "  ${GREEN}https://${DOMAIN}/${NC} (secure)"
    echo "  http://${DOMAIN}/ (redirects to HTTPS)"
else
    echo "Your site is available at:"
    echo -e "  ${YELLOW}http://${DOMAIN}/${NC}"
fi

echo ""
echo -e "${YELLOW}=== GitHub Actions Deployment ===${NC}"
echo "To enable automatic deployment on push:"
echo ""
echo "1. Add these GitHub Secrets to your repository:"
echo "   - VPS_HOST: $(hostname -I | awk '{print $1}')"
echo "   - VPS_USER: root"
echo "   - VPS_PORT: 22"
echo "   - VPS_SSH_KEY: (your deployment private key)"
echo ""
echo "2. Create .github/workflows/deploy-to-vps.yml with:"
echo "   - Deploy path: ${WEB_ROOT}"
echo "   - Domain: ${DOMAIN}"
echo ""
echo -e "${GREEN}Deployment setup complete for ${REPO_NAME}!${NC}"
