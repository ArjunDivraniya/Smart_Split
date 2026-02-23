# Backend Setup Guide

## Prerequisites

- Node.js v16 or higher
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)
- npm or yarn package manager

## Step-by-Step Setup

### 1. Create `.env` File

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trip-splitter

# JWT
JWT_SECRET=generate-a-strong-random-string-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_api_secret

# CORS (for frontend origins)
CORS_ORIGINS=http://localhost:3000,http://localhost:8081,exp://localhost:8081
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 4. Test Endpoints

Health check:
```bash
curl http://localhost:5000/health
```

### MongoDB Setup

#### Local Development (Optional)
```bash
# If using local MongoDB
mongod
```

#### Using MongoDB Atlas (Recommended)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Set `MONGODB_URI` in `.env`

### Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Get your:
   - Cloud Name
   - API Key
   - API Secret
3. Set in `.env`

## Building & Deployment

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
npm start
```

### Using PM2 for Production (Optional)
```bash
npm install -g pm2
pm2 start dist/server.js --name "trip-splitter-backend"
```

## Database Initialization

The backend automatically initializes MongoDB collections on first run. No manual setup needed!

## Common Issues

### Port Already in Use
```bash
# Change PORT in .env or kill process
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Failed
- Check `MONGODB_URI` in `.env`
- Ensure MongoDB is running
- For Atlas, check IP whitelist

### Cloudinary Upload Fails
- Verify credentials in `.env`
- Check folder permissions in Cloudinary dashboard

## Testing API

### Using Postman
1. Import the API collection
2. Set environment variables for token
3. Test endpoints

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | Database URL | `mongodb://localhost:27017/trip-splitter` |
| `JWT_SECRET` | JWT signing key | `super-secret-key` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret123` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:3000` |

## Next Steps

1. Connect frontend to this backend
2. Update `CORS_ORIGINS` with frontend URLs
3. Configure authentication flow
4. Test complete user journey
5. Deploy to production

## Support

For detailed API documentation, see [API Routes](./API_ROUTES.md)

For issues, check server logs or create an issue in the repository.
