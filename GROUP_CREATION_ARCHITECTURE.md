# Group Creation Flow - Visual Architecture

## π Complete Request/Response Flow

```
MOBILE APP - create.tsx (User Interface)
    |
    | User fills form:
    | - Type: trip
    | - Name: "Bali Trip"
    | - Emoji: "✈️"
    | - Dates, Budget, etc.
    |
    β"˜β"€β"€ Validates all required fields
         βŒ If validation fails → Show alert
         βœ… If valid → Send to API
                |
                v
    
API SERVICE - services/api.ts (HTTP Client)
    |
    | Creates POST request
    | URL: /api/groups
    | Headers: Authorization Bearer {token}
    | Body: JSON with group data
    |
    β"˜β"€β"€ Sends to backend
                |
                v

BACKEND SERVER - server.ts (Express)
    |
    | Route: POST /api/groups
    | Passes through auth middleware
    |
    β"˜β"€β"€ Routes to group.routes.ts
                |
                v

AUTH MIDDLEWARE - auth.middleware.ts
    |
    | Checks Authorization header
    | Verifies JWT token
    | βœ… Sets req.userId = decoded.userId ← KEY FIX!
    |
    β"˜β"€β"€ Passes to controller
                |
                v

GROUP CONTROLLER - group.controller.ts
    |
    | createGroup(req, res)
    | ├─ β"˜β"€β"€ Extract userId = req.userId βœ…
    | ├─ Validate user exists in database
    | ├─ Validate input fields
    | ├─ Create Group document:
    | │  ├─ name, type, emoji
    | │  ├─ createdBy = userId
    | │  ├─ members = [creator]
    | │  ├─ Trip fields (if type === 'trip')
    | │  └─ Initialize counters
    | ├─ Save to database
    | ├─ Populate references βœ…
    | └─ Return 201 with full group object
    |
    β"˜β"€β"€ Sends response
                |
                v

MOBILE APP - create.tsx (Response Handler)
    |
    | Receives: { success: true, data: { id, name, ... } }
    | βœ… Status 201 → Group created!
    | β"˜β"€β"€β"€β"€ Show success alert
            βœ… Error caught → Show error message
    |
    | onPress OK:
    | Navigate to: /group/{response.data.id}
    |
    β"˜β"€β"€ User sees new group details
```

---

## π Data Structures

### Request Body
```json
{
  "type": "trip",
  "name": "Bali Trip 2025",
  "emoji": "✈️",
  "description": "Beach vacation with friends",
  "tripStartDate": "2025-01-15T00:00:00Z",
  "tripEndDate": "2025-01-18T00:00:00Z",
  "tripDestination": "Bali, Indonesia",
  "tripBudget": 30000,
  "trackBudget": true
}
```

### Response Body (201)
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Bali Trip 2025",
    "type": "trip",
    "emoji": "✈️",
    "description": "Beach vacation with friends",
    "createdBy": {
      "_id": "507f191e810c19729de860ea",
      "name": "User Name",
      "email": "user@example.com"
    },
    "members": [
      {
        "userId": {
          "_id": "507f191e810c19729de860ea",
          "name": "User Name",
          "email": "user@example.com"
        },
        "userName": "User Name",
        "email": "user@example.com",
        "role": "creator"
      }
    ],
    "expenses": [],
    "totalSpent": 0,
    "netBalance": 0,
    "isActive": true,
    "tripStartDate": "2025-01-15T00:00:00Z",
    "tripEndDate": "2025-01-18T00:00:00Z",
    "tripDestination": "Bali, Indonesia",
    "tripBudget": 30000,
    "trackBudget": true,
    "createdAt": "2025-02-24T10:30:00Z",
    "updatedAt": "2025-02-24T10:30:00Z"
  }
}
```

### Error Response (400/401/500)
```json
{
  "success": false,
  "error": "Name, type, and emoji are required"
}
```

---

## π Architecture Layers

```
PRESENTATION LAYER (Mobile App)
    β—†β"€β"€ Mobile-App/app/group/create.tsx
    β"‚   - Multi-step form
    β"‚   - Input validation
    β"‚   - Error display
    β"‚
    β–‡β"€β"€ Mobile-App/src/services/api.ts
    β"‚   - API calls
    β"‚   - Request configuration
    β"‚   - Response parsing
    β"‚
    β–‡β"€β"€ Mobile-App/src/types/group.types.ts
        - Type definitions
        - Enums
        - Interfaces

    
HTTP TRANSPORT LAYER (Network)
    |
    β"˜β"€β"€ Axios with Bearer token in headers
    
    
API LAYER (Express Backend)
    β—†β"€β"€ Backend/src/server.ts
    β"‚   - Route registration
    β"‚   - Middleware setup
    β"‚
    β–‡β"€β"€ Backend/src/routes/group.routes.ts
    β"‚   - Endpoint definitions
    β"‚   - Method mapping
    β"‚
    β–‡β"€β"€ Backend/src/middleware/auth.middleware.ts
    β"‚   - JWT verification
    β"‚   - User extraction βœ…
    β"‚
    β–‡β"€β"€ Backend/src/controllers/group.controller.ts
        - Business logic
        - Validation
        - Database operations

    
DATA LAYER (MongoDB)
    β—†β"€β"€ Backend/src/models/Group.model.ts
    β"‚   - Schema definition
    β"‚   - Indexes
    β"‚   - Type checking
    β"‚
    β–‡ Database
        - Stores groups
        - Stores expenses
        - Stores user references
```

---

## πŸ" Key Validations

```
USER INPUT VALIDATION (Frontend)
  βœ" Name not empty
  βœ" Type selected
  βœ" Emoji selected
  βš� Trip dates required (if type === 'trip')
  βš� End date > Start date (if trip)

BACKEND VALIDATION
  βœ… User authenticated (token valid)
  βœ… User exists in database
  βœ… Name, type, emoji provided
  βœ… Trip dates valid (if trip group)
  βœ… Start date < End date (if trip)
```

---

## π§ Debugging Points

If group creation fails:

1. **Check Frontend Logs**
   - Browser console for API errors
   - Alert messages show error details

2. **Check Backend Logs**
   - Terminal where `npm start` is running
   - Look for error stack traces

3. **Verify Auth**
   - Token stored in AsyncStorage
   - Token not expired
   - Authorization header sent

4. **Verify Network**
   - Backend running on correct port
   - Correct API base URL in frontend
   - Network not blocked

5. **Check Database**
   - MongoDB connection working
   - User record exists
   - Database has write permissions

---

## π Performance Optimization

- Populates references before returning (eager loading)
- Uses indexes on frequently queried fields (createdBy, members.userId)
- Lean queries where mutations not needed
- Proper error codes for client handling

---

## π" Status Codes Used

```
200 OK - Request successful
201 CREATED - Resource created successfully
400 BAD REQUEST - Validation failed
401 UNAUTHORIZED - Authentication failed
403 FORBIDDEN - Permission denied
404 NOT FOUND - Resource not found
500 INTERNAL SERVER ERROR - Server error
```

---

## π Implemented Features

βœ… Create group with any type
βœ… Support trip-specific fields
βœ… Validate all required fields
βœ… Create as group creator automatically
βœ… Initialize expense tracking
βœ… Proper error messages
βœ… Populate references for rich response
βœ… User authentication & validation

---

## π future Enhancements

- [ ] Invite members during creation
- [ ] Add profile images
- [ ] Support group descriptions
- [ ] Custom colors per group
- [ ] Template for common group types
- [ ] Duplicate group functionality
- [ ] Group settings/preferences
