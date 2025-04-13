# Deployment Guide

## Table of Contents
- [Vercel Deployment](#vercel-deployment)
- [Ubuntu/Linux Deployment](#ubuntulinux-deployment)

## Vercel Deployment

Vercel is the recommended platform for deploying this application due to its seamless integration with React applications and zero-configuration deployments.

### Prerequisites
1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) (optional for local testing)

### Steps

1. **Prepare Your Application**
   - Ensure all environment variables are properly configured in your `.env` file
   - Update the build scripts in `package.json` if necessary
   - Test the build locally: `npm run build`

2. **Deploy to Vercel**
   - Option 1: GitHub Integration (Recommended)
     1. Push your code to GitHub
     2. Import your repository in Vercel dashboard
     3. Configure environment variables in Vercel dashboard
     4. Deploy

   - Option 2: Vercel CLI
     ```bash
     # Install Vercel CLI
     npm i -g vercel

     # Login to Vercel
     vercel login

     # Deploy
     vercel
     ```

3. **Configure Environment Variables**
   - Go to your project settings in Vercel dashboard
   - Add all required environment variables
   - Redeploy if necessary

## Ubuntu/Linux Deployment

### Prerequisites
1. Ubuntu 20.04 LTS or later
2. Node.js 16.x or later
3. PM2 (Process Manager)
4. Nginx
5. SSL certificate (Let's Encrypt recommended)

### Installation Steps

1. **Update System & Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone and Setup Application**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd <your-repo-directory>

   # Install dependencies
   npm install

   # Build the application
   npm run build
   ```

3. **Configure PM2**
   Create a PM2 ecosystem file (ecosystem.config.js):
   ```javascript
   module.exports = {
     apps: [{
       name: 'toxicguard',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production'
       }
     }]
   }
   ```

4. **Configure Nginx**
   Create nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL Configuration (Let's Encrypt)**
   ```bash
   # Install Certbot
   sudo apt install -y certbot python3-certbot-nginx

   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

6. **Start Application**
   ```bash
   # Start with PM2
   pm2 start ecosystem.config.js

   # Save PM2 configuration
   pm2 save

   # Setup PM2 startup script
   pm2 startup
   ```

### Maintenance

- **Logs**: View logs with `pm2 logs`
- **Updates**: 
  ```bash
  git pull
  npm install
  npm run build
  pm2 restart all
  ```
- **Monitoring**: Use `pm2 monit` for real-time monitoring

### Security Considerations

1. **Firewall Configuration**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Secure Nginx Configuration**
   - Enable HTTPS only
   - Configure security headers
   - Enable rate limiting

### Troubleshooting

1. **Application Issues**
   - Check PM2 logs: `pm2 logs`
   - Check application status: `pm2 status`

2. **Nginx Issues**
   - Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
   - Test nginx configuration: `sudo nginx -t`

3. **SSL Issues**
   - Check SSL configuration: `sudo certbot certificates`
   - Renew certificates: `sudo certbot renew --dry-run`