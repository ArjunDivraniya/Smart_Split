# Deploy Trip Splitter Backend to Render

## Prerequisites
1. GitHub account with your code pushed
2. Render account (sign up at https://render.com)
3. MongoDB Atlas account (unless you already have a database)
4. Cloudinary account for image uploads

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Make sure your package.json has build & start scripts
✅ Already configured in your package.json:
```json
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js",
  "dev": "nodemon src/server.ts"
}
```

### 1.2 Push your code to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial commit - Trip Splitter backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trip-splitter-backend.git
git push -u origin main
```

---

## Step 2: Create a Render Service

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Search for your repository name and connect it
5. Fill in the details:

### Service Details
- **Name**: `trip-splitter-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users (e.g., Singapore, US East)
- **Branch**: `main`
- **Root Directory**: `backend` (since your backend is in a subdirectory)

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Environment Variables
Click **"Advanced"** and add the following variables:
```
MONGODB_URI = your-mongodb-atlas-connection-string
JWT_SECRET = your-super-secret-key
CLOUDINARY_CLOUD_NAME = your-cloudinary-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret
CORS_ORIGINS = http://localhost:3000,https://your-frontend-url.onrender.com
NODE_ENV = production
PORT = 5000
```

### Plan Selection
- Select **"Free"** (with limitations) or **"Starter"** for production

---

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Run the build command
   - Deploy your service

3. Wait for deployment (2-5 minutes)
4. Once live, you'll see your service URL like:
   ```
   https://smart-split-oomn.onrender.com
   ```

---

## Step 4: Update Your Frontend CORS

Update your frontend `.env` file to use the Render backend URL:
```
REACT_APP_API_URL=https://smart-split-oomn.onrender.com
VITE_API_URL=https://smart-split-oomn.onrender.com
```

---

## Step 5: Verify Deployment

Test your backend endpoints:

```bash
# Health check
curl https://smart-split-oomn.onrender.com/health

# Test registration
curl -X POST https://smart-split-oomn.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

---

## Important Notes

⚠️ **Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- First request will be slow (cold start)
- Limited to 750 hours/month

✅ **Recommendations for Production:**
- Upgrade to Starter plan ($7/month) for always-on service
- Enable auto-deploys from GitHub
- Set up Render logs monitoring

---

## Troubleshooting

### Build Fails
- Check if `tsconfig.json` is in backend folder
- Ensure all dependencies in package.json are correct
- View Render build logs for details

### Service Crashes
- Check Render logs for error messages
- Verify all environment variables are set correctly
- Test locally with: `npm run build && npm start`

### Database Connection Issues
- Ensure MongoDB Atlas allows Render's IP (Allow all IPs: 0.0.0.0/0)
- Verify `MONGODB_URI` format is correct

### CORS Errors
- Add your frontend URL to `CORS_ORIGINS` environment variable

---

## Redeploy Process

To redeploy after making changes:
```bash
git add .
git commit -m "Update: your changes"
git push origin main
```
Render will automatically detect changes and redeploy!

---

## Monitoring & Logs

On Render Dashboard:
1. Click on your service
2. View **"Logs"** in real-time
3. Check **"Metrics"** for CPU, Memory, Network usage
