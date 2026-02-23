# Trip Splitter Backend - Documentation Index

## Quick Start

👋 **New to this backend?** Start here:

1. **Installation**: [SETUP.md](./SETUP.md) - 5 minutes
2. **What is this?**: [README.md](./README.md) - 10 minutes
3. **Using the API**: [API_ROUTES.md](./API_ROUTES.md) - Reference

---

## Documentation Guide

### 📋 Overview Documents

| Document | Purpose | Time |
|----------|---------|------|
| [README.md](./README.md) | Project overview, features, tech stack | 10 min |
| [SETUP.md](./SETUP.md) | Installation and configuration | 5 min |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Code organization and architecture | 15 min |
| [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) | Migration from Next.js backend | 10 min |

### 🛠️ Technical References

| Document | Purpose | Use When |
|----------|---------|----------|
| [API_ROUTES.md](./API_ROUTES.md) | Complete API endpoint documentation | Integrating frontend |
| `package.json` | Dependencies and scripts | Setting up environment |
| `tsconfig.json` | TypeScript configuration | Customizing build |
| `.env.example` | Environment variables template | Configuring system |

---

## Common Tasks

### 🎯 I want to...

**...get started quickly**
```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary credentials

# 3. Run
npm run dev
# Server starts on http://localhost:5000
```

**...understand the architecture**
→ Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) (15 min)

**...integrate with my frontend**
→ Read [API_ROUTES.md](./API_ROUTES.md)
→ Look for your endpoint in the reference

**...add a new feature**
1. Create controller: `src/controllers/feature.controller.ts`
2. Create routes: `src/routes/feature.routes.ts`
3. Add to server.ts: `app.use('/api/feature', featureRoutes);`
4. Add documentation to API_ROUTES.md

**...deploy to production**
→ Read [SETUP.md](./SETUP.md) → Deployment section

**...understand how the app was migrated**
→ Read [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)

---

## API Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <jwt-token>
```

### Main Endpoint Groups

| Group | Purpose | Total Endpoints |
|-------|---------|-----------------|
| `/auth` | Register, login, logout | 3 |
| `/user` | Profile, search, uploads | 6 |
| `/trips` | Trip management + features | 18 |
| `/expenses` | Expense management | 3 |
| `/notifications` | Notifications | 2 |

**Total**: 32 endpoints

### Example Requests

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get current user
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer <your-token>"

# Create trip
curl -X POST http://localhost:5000/api/trips/create \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Paris Trip",
    "destination":"Paris, France",
    "startDate":"2024-06-01",
    "endDate":"2024-06-10",
    "members":[{"email":"friend@example.com"}]
  }'
```

See [API_ROUTES.md](./API_ROUTES.md) for complete endpoint documentation.

---

## Project Structure at a Glance

```
backend/
├── src/
│   ├── config/          MongoDB & file upload config
│   ├── controllers/     Business logic (10 controllers)
│   ├── models/          Database schemas (7 models)
│   ├── routes/          API routes (5 route files)
│   ├── middleware/      Auth, errors, uploads
│   ├── utils/          Helper functions
│   └── server.ts       Express app setup
├── package.json        Dependencies
├── tsconfig.json       TypeScript config
└── docs/
    ├── README.md
    ├── SETUP.md
    ├── API_ROUTES.md
    ├── PROJECT_STRUCTURE.md
    ├── MIGRATION_SUMMARY.md
    └── INDEX.md (this file)
```

## File Organization

### Models (Database)
- **User.model.ts** - User profiles
- **Trip.model.ts** - Trips with members
- **Expense.model.ts** - Expenses
- **Notification.model.ts** - Notifications
- **Activity.model.ts** - Activities/Itinerary
- **PackingItem.model.ts** - Packing list
- **Message.model.ts** - Chat messages

### Controllers (Logic)
- **auth.controller.ts** - 3 functions
- **user.controller.ts** - 6 functions
- **trip.controller.ts** - 6 functions
- **expense.controller.ts** - 3 functions
- **settlement.controller.ts** - 1 complex function
- **itinerary.controller.ts** - 2 functions
- **packing.controller.ts** - 4 functions
- **chat.controller.ts** - 2 functions
- **analytics.controller.ts** - 1 function
- **notification.controller.ts** - 2 functions

### Routes (API)
- **auth.routes.ts** - `/api/auth/*`
- **user.routes.ts** - `/api/user/*`
- **trip.routes.ts** - `/api/trips/*`
- **expense.routes.ts** - `/api/expenses/*`
- **notification.routes.ts** - `/api/notifications`

---

## Key Features

✅ **User Authentication**
- Register, login with JWT
- Password hashing with bcryptjs

✅ **Trip Management**
- Create trips with members
- Member invitations (accepted/rejected)
- End trips

✅ **Expense Tracking**
- Add/edit/delete expenses
- Flexible split options (equal, unequal, percentage, shares)
- Automatic notifications

✅ **Settlement Calculator**
- Direct debt algorithm
- Debt netting optimization
- Minimal transaction settlements

✅ **Trip Features**
- Activities/Itinerary planner
- Packing lists with checkboxes
- Group chat/messages
- Spending analytics with charts

✅ **File Management**
- Profile image uploads (Cloudinary)
- QR code uploads
- Secure file handling

✅ **Notifications**
- Trip invites
- Expense updates
- Activity announcements
- System notifications

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + Bcryptjs |
| File Storage | Cloudinary |
| File Upload | Multer |

---

## Environment Variables

Create `.env` file in root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/trip-splitter

# Authentication
JWT_SECRET=your-super-secret-key-here

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

See [SETUP.md](./SETUP.md) for detailed configuration.

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm run lint
```

---

## Deployment

### Quick Deployment on Railway.app
```bash
# 1. Push to GitHub
# 2. Connect GitHub repo to Railway
# 3. Set environment variables
# 4. Deploy!
```

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

See [SETUP.md](./SETUP.md) for more deployment options.

---

## Troubleshooting

### Port Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Failed
- Check `MONGODB_URI` is correct
- Ensure MongoDB is running
- For Atlas: Check IP whitelist

### Cloudinary Errors
- Verify credentials in `.env`
- Check folder permissions

### JWT Errors
- Token expired? Log in again
- Invalid token? Check secret key matches

---

## Support & Resources

### Included Documentation
- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Installation guide
- [API_ROUTES.md](./API_ROUTES.md) - API reference
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Migration details

### External Resources
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Guide](https://jwt.io/)

### Getting Help
1. Check documentation files above
2. Check `.env.example` for configuration
3. Review API_ROUTES.md for endpoint usage
4. Check server logs: `npm run dev`

---

## Next Steps

1. **Setup**: Follow [SETUP.md](./SETUP.md) (5 min)
2. **Explore**: Test endpoints with [API_ROUTES.md](./API_ROUTES.md)
3. **Integrate**: Connect your frontend apps
4. **Customize**: Add your own features
5. **Deploy**: Use guides in [SETUP.md](./SETUP.md)

---

## Summary

| Aspect | Details |
|--------|---------|
| **Created** | Full Node.js/Express backend |
| **Endpoints** | 32 API routes |
| **Models** | 7 MongoDB schemas |
| **Features** | Complete trip expense management |
| **Status** | ✅ Production-ready |
| **Documentation** | 📚 Complete |
| **Setup Time** | ⏱️ 5 minutes |

---

**Happy Coding!** 🚀

For detailed information about any topic, click the links above or refer to individual documentation files.
