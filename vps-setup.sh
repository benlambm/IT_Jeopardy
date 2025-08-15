#!/bin/bash
# VPS Setup Script for IT Jeopardy Deployment
# Run this on your VPS as root

set -e  # Exit on error

echo "=== IT Jeopardy VPS Setup Script ==="
echo "This script will set up your VPS for automatic GitHub deployments"
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
mkdir -p /var/www/jeopardy
cd /var/www/jeopardy

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
chown -R www-data:www-data /var/www/jeopardy

# 5. Create nginx configuration
echo ""
echo "Step 5: Creating nginx configuration..."
cat > /etc/nginx/sites-available/jeopardy << 'EOF'
server {
    listen 80;
    server_name jeopardy.yourdomain.com;  # Change this to your domain or IP
    root /var/www/jeopardy;
    index new.html index.html;

    location / {
        try_files $uri $uri/ =404;
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
}
EOF

# 6. Enable the site
echo ""
echo "Step 6: Enabling nginx site..."
ln -sf /etc/nginx/sites-available/jeopardy /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "✓ SSH key configured for GitHub Actions"
echo "✓ Repository cloned to /var/www/jeopardy"
echo "✓ File permissions set"
echo "✓ Nginx configured"
echo ""
echo "Next steps:"
echo "1. Update the nginx server_name in /etc/nginx/sites-available/jeopardy"
echo "2. Add GitHub Secrets to your repository (see instructions)"
echo "3. Push a commit to test the deployment"
echo ""
echo "The game will be available at: http://your-vps-ip/new.html"
