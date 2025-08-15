#!/bin/bash
# VPS Setup Script for IT Jeopardy Deployment
# Run this on your VPS as root
# Domain: jeopardy.benlamb.net

set -e  # Exit on error

# Configuration
DOMAIN="jeopardy.benlamb.net"
WEB_ROOT="/var/www/${DOMAIN}"
EMAIL="benjaminmlamb@icloud.com"  # For SSL certificate notifications

echo "=== IT Jeopardy VPS Setup Script ==="
echo "Setting up deployment for: ${DOMAIN}"
echo "Web root: ${WEB_ROOT}"
echo ""

# 1. Add the deployment SSH key to authorized_keys
echo "Step 1: Adding GitHub Actions deployment key..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key (you'll need to paste this when prompted)
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
    echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "✓ SSH key added successfully"
else
    echo "⚠ No SSH key provided, skipping..."
fi

# 2. Create web directory
echo ""
echo "Step 2: Creating web directory..."
mkdir -p "${WEB_ROOT}"
cd "${WEB_ROOT}"

# 3. Clone the repository
echo ""
echo "Step 3: Cloning IT_Jeopardy repository..."
if [ ! -d ".git" ]; then
    git clone https://github.com/benlambm/IT_Jeopardy.git .
    echo "✓ Repository cloned successfully"
else
    echo "Repository already exists, pulling latest..."
    git pull origin main
fi

# 4. Set proper permissions
echo ""
echo "Step 4: Setting file permissions..."
find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" \) -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chown -R www-data:www-data "${WEB_ROOT}"

# 5. Create nginx configuration (HTTP only for now, SSL will be added by certbot)
echo ""
echo "Step 5: Creating nginx configuration..."
cat > "/etc/nginx/sites-available/${DOMAIN}" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    root ${WEB_ROOT};
    index new.html index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
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

# 6. Enable the site
echo ""
echo "Step 6: Enabling nginx site..."
ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/"
nginx -t && systemctl reload nginx

# 7. Install and configure SSL with Certbot
echo ""
echo "Step 7: Installing Certbot for SSL..."

# Check if certbot is installed, if not install it
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
else
    echo "Certbot is already installed"
fi

# 8. Obtain SSL certificate
echo ""
echo "Step 8: Obtaining SSL certificate for ${DOMAIN}..."
echo "Note: This requires that ${DOMAIN} already points to this server's IP address"
echo ""

# Run certbot
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --email "${EMAIL}" --redirect

if [ $? -eq 0 ]; then
    echo "✓ SSL certificate obtained and configured successfully"
else
    echo "⚠ SSL certificate setup failed. You can try manually later with:"
    echo "  certbot --nginx -d ${DOMAIN}"
fi

# 9. Set up automatic SSL renewal
echo ""
echo "Step 9: Setting up automatic SSL renewal..."
# Test renewal
certbot renew --dry-run
if [ $? -eq 0 ]; then
    echo "✓ Automatic SSL renewal is configured"
else
    echo "⚠ Automatic renewal test failed, please check certbot configuration"
fi

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "✓ SSH key configured for GitHub Actions"
echo "✓ Repository cloned to ${WEB_ROOT}"
echo "✓ File permissions set"
echo "✓ Nginx configured for ${DOMAIN}"
echo "✓ SSL certificate installed (HTTPS enabled)"
echo "✓ Automatic SSL renewal configured"
echo ""
echo "Next steps:"
echo "1. Add GitHub Secrets to your repository (see DEPLOYMENT.md)"
echo "2. Push a commit to test the deployment"
echo ""
echo "Your game is now available at:"
echo "  HTTP:  http://${DOMAIN}/new.html"
echo "  HTTPS: https://${DOMAIN}/new.html (recommended)"
echo ""
echo "Note: The site will automatically redirect HTTP to HTTPS"
