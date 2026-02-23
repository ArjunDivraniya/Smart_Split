# Trip Splitter Backend

A Node.js/Express REST API backend for Trip Splitter - a comprehensive trip expense management application for both web and mobile platforms.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Trip Management**: Create, manage, and track trips with multiple members
- **Expense Tracking**: Add and manage expenses with flexible split options (equally, unequally, percentage, shares)
- **Settlement Calculations**: Advanced debt settlement algorithm using direct debt netting
- **Trip Features**:
  - Itinerary & Activity Planning
  - Packing List Management
  - Trip Chat & Messaging
  - Analytics & Spending Breakdown
  - Member Invitations & Status Management
- **Notifications**: Real-time notification system for trip events
- **File Uploads**: Profile images and QR codes via Cloudinary
- **Security**: CORS, Helmet, input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Additional**: Multer (file uploads), Bcrypt (password hashing)

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # MongoDB connection
│   ├── cloudinary.ts # Cloudinary setup
├── controllers/     # Business logic
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── trip.controller.ts
│   ├── expense.controller.ts
│   ├── itinerary.controller.ts
│   ├── packing.controller.ts
│   ├── chat.controller.ts
│   ├── analytics.controller.ts
│   ├── settlement.controller.ts
│   └── notification.controller.ts
├── models/          # MongoDB schemas
│   ├── User.model.ts
│   ├── Trip.model.ts
│   ├── Expense.model.ts
│   ├── Notification.model.ts
│   ├── Activity.model.ts
│   ├── PackingItem.model.ts
│   └── Message.model.ts
├── routes/          # API routes
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── trip.routes.ts
│   ├── expense.routes.ts
│   └── notification.routes.ts
├── middleware/      # Custom middleware
│   ├── auth.middleware.ts
│   ├── errorHandler.ts
│   └── upload.middleware.ts
├── utils/           # Utility functions
│   └── notification.ts
└── server.ts        # Express application entry point
```

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Fill in your `.env` file with:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trip-splitter
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

## Development

**Start development server with hot reload:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/update` - Update user profile
- `GET /api/user/search?query=` - Search users
- `POST /api/user/upload-profile` - Upload profile image
- `POST /api/user/upload-qr` - Upload QR code
- `DELETE /api/user/delete-account` - Delete account

### Trips
- `POST /api/trips/create` - Create a new trip
- `GET /api/trips/user` - Get user's trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips/:id/add-member` - Add member to trip
- `POST /api/trips/:id/respond` - Accept/reject invitation
- `POST /api/trips/:id/end` - End a trip

### Trip Features
- `GET /api/trips/:id/settlements` - Get settlement payments
- `GET /api/trips/:id/analytics` - Get spending analytics
- `GET /api/trips/:id/itinerary` - Get activities
- `POST /api/trips/:id/itinerary` - Add activity
- `GET /api/trips/:id/packing` - Get packing list
- `POST /api/trips/:id/packing` - Add packing item
- `PUT /api/trips/:id/packing` - Toggle packing item
- `DELETE /api/trips/:id/packing` - Delete packing item
- `GET /api/trips/:id/chat` - Get chat messages
- `POST /api/trips/:id/chat` - Send message

### Expenses
- `POST /api/expenses/add` - Add expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications` - Mark all as read

## Key Features

### Settlement Algorithm
The backend implements a direct debt calculation algorithm that:
1. Processes all expenses for a trip
2. Calculates who owes whom
3. Nets debts to minimize transactions
4. Returns simplified settlement instructions

### Flexible Expense Splitting
- **Equally**: Split expense equally among members
- **Unequally**: Custom amount for each member
- **Percentage**: Split by percentage
- **Shares**: Split by number of shares

### Security Features
- Password hashing with bcryptjs
- JWT token-based authentication
- Cookie-based token storage (httpOnly)
- CORS configuration for web & mobile
- Input validation with express-validator
- Helmet for HTTP security headers

## Authentication

All protected endpoints require:
1. **Authorization Header**: `Authorization: Bearer <token>`
2. **Or Cookie**: `token=<jwt-token>`

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Database Models

### User
- Basic profile information
- Authentication details
- Cloudinary references for images

### Trip
- Trip details (name, destination, dates)
- Member list with status (invited/joined/rejected)
- References to expenses

### Expense
- Title, amount, category
- Payer and split information
- Flexible split amounts/percentages/shares

### Notification
- User notifications
- Trip-related events
- Status tracking (read/unread)

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
