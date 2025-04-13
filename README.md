# ToxiGuard - AI-Powered Social Media Comment Moderation Platform

## Overview
ToxiGuard is an AI-powered web application designed to help users manage and moderate comments on their social media posts using the Groq API with a Llama 3.3 model. The platform provides real-time toxicity analysis, user management, and comprehensive moderation tools.

## Features
- **AI-Powered Comment Analysis**
  - Real-time toxicity detection
  - Sentiment analysis
  - Content categorization
  - Automated moderation suggestions

- **User Management**
  - Secure authentication system
  - Role-based access control (Admin, Moderator, User)
  - User profile management
  - Password reset functionality

- **Comment Management**
  - Real-time comment monitoring
  - Bulk moderation actions
  - Comment filtering and search
  - Custom moderation rules

- **Admin Dashboard**
  - System health monitoring
  - User management
  - API key management
  - MongoDB connection management
  - Activity logs and audit trails
  - Performance metrics

- **Security Features**
  - JWT-based authentication
  - API key encryption
  - Rate limiting
  - Input validation
  - Error handling

## System Architecture

### Frontend
- React.js with TypeScript
- Material-UI for components
- Redux for state management
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT for authentication
- Groq API integration
- Winston for logging

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Groq API key
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/oyash01/ToxicAvenger.git
cd ToxicAvenger
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
Create `.env` files in both frontend and backend directories:

Backend (.env):
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm start
```

## Usage

1. **User Registration**
   - Navigate to the registration page
   - Fill in your details
   - Verify your email

2. **Comment Moderation**
   - Access the dashboard
   - Connect your social media accounts
   - Set up moderation rules
   - Monitor and moderate comments

3. **Admin Features**
   - Access the admin dashboard
   - Manage users and permissions
   - Monitor system health
   - Configure API settings

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/forgot-password` - Password reset request
- POST `/api/auth/reset-password` - Password reset

### Comment Endpoints
- GET `/api/comments` - Get all comments
- POST `/api/comments/analyze` - Analyze comment toxicity
- PUT `/api/comments/:id` - Update comment status
- DELETE `/api/comments/:id` - Delete comment

### Admin Endpoints
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id` - Update user role
- GET `/api/admin/system-health` - Get system health metrics
- POST `/api/admin/api-keys` - Manage API keys

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
For support, email support@toxiguard.com or create an issue in the GitHub repository.

## Acknowledgments
- Groq API for AI capabilities
- MongoDB for database support
- React and Node.js communities

## Complete Vercel Deployment Guide for Beginners

### Step 1: Create a Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" in the top right corner
3. You can sign up using:
   - GitHub (recommended)
   - GitLab
   - Bitbucket
   - Email

### Step 2: Prepare Your Project
1. Make sure your project is pushed to GitHub
2. Ensure all dependencies are listed in `package.json`
3. Verify your `vercel.json` configuration file exists

### Step 3: Create a New Project in Vercel
1. Log in to your Vercel dashboard
2. Click "Add New..." and select "Project"
3. Import your GitHub repository:
   - Search for "ToxicAvenger"
   - Click "Import"

### Step 4: Configure Project Settings
1. In the project configuration screen:
   - Framework Preset: Select "Vite"
   - Root Directory: Leave as default
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. Set up Environment Variables:
   - Click "Environment Variables"
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     GROQ_API_KEY=your_groq_api_key
     NODE_ENV=production
     ```
   - Click "Add" for each variable

### Step 5: Deploy Your Project
1. Click "Deploy"
2. Wait for the deployment to complete (usually 1-2 minutes)
3. Vercel will provide you with a deployment URL (e.g., `https://toxicavenger.vercel.app`)

### Step 6: Verify Your Deployment
1. Visit the provided URL
2. Test the following:
   - Homepage loads correctly
   - User registration works
   - Login functionality
   - API endpoints are accessible

### Step 7: Set Up a Custom Domain (Optional)
1. In your Vercel dashboard, go to "Settings" > "Domains"
2. Click "Add Domain"
3. Enter your domain name (e.g., `toxiguard.com`)
4. Follow the DNS configuration instructions:
   - Add the provided DNS records to your domain registrar
   - Wait for DNS propagation (can take up to 24 hours)

### Step 8: Monitor Your Application
1. Check the "Deployments" tab for:
   - Build logs
   - Deployment status
   - Error messages

2. Use the "Analytics" tab to monitor:
   - Page views
   - Performance metrics
   - Error rates

### Step 9: Update Your Application
1. Make changes to your code
2. Push changes to GitHub
3. Vercel will automatically:
   - Detect the changes
   - Build the new version
   - Deploy the updates

### Vercel Deployment Troubleshooting

#### Common Build Issues and Solutions

1. **Missing Dependencies Error**
   ```bash
   sh: line 1: react-scripts: command not found
   ```
   Solution:
   - Make sure all dependencies are listed in `package.json`
   - Run `npm install` in both root and frontend directories
   - Check if `react-scripts` is listed in `frontend/package.json`

2. **Build Command Fails**
   Solution:
   - Verify the build command in `vercel.json`
   - Ensure the correct output directory is specified
   - Check if all required environment variables are set

3. **API Routes Not Working**
   Solution:
   - Verify the API routes in `vercel.json`
   - Check if the backend server is properly configured
   - Ensure all API endpoints are properly exported

4. **Environment Variables Issues**
   Solution:
   - Double-check all environment variables in Vercel dashboard
   - Ensure variables are properly formatted
   - Verify MongoDB connection string

#### Step-by-Step Deployment Fix

1. **Clean Installation**
   ```bash
   # Remove node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   rm -rf frontend/node_modules frontend/package-lock.json

   # Install dependencies
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Verify Build Locally**
   ```bash
   # Test the build command locally
   cd frontend
   npm run build
   ```

3. **Update Vercel Configuration**
   - Go to Vercel dashboard
   - Navigate to project settings
   - Update build settings:
     ```
     Build Command: cd frontend && npm install && npm run build
     Output Directory: frontend/dist
     ```

4. **Redeploy**
   - Push changes to GitHub
   - Trigger a new deployment in Vercel
   - Monitor the build logs

### Additional Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Guide](https://vercel.com/docs/cli)
- [Vercel Support](https://vercel.com/support)