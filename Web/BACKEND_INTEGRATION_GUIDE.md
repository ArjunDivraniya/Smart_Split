# SmartSplit Web - Backend Integration Guide

## Current Status
- ✅ QRCode import fixed
- ✅ Dashboard page updated to fetch `/analytics/dashboard`
- ✅ Register page updated to call backend `/auth/register`
- ✅ Backend running on `http://localhost:5000`
- ✅ Web app running on `http://localhost:3001`
- ✅ NextAuth configured to use backend APIs

## Running the Application

### Terminal 1: Backend
```bash
cd Backend
npm run dev
# Backend runs on http://localhost:5000
```

### Terminal 2: Web App  
```bash
cd Web
npm run dev
# Web app runs on http://localhost:3001
```

## API Usage Pattern

All pages use the `apiCall` function from `src/lib/api-client.ts`:

```typescript
import { apiCall } from '@/lib/api-client';

// Get data
const response = await apiCall('/groups');
if (response.success) {
  const data = response.data;
}

// Post data
const response = await apiCall('/groups', {
  method: 'POST',
  body: { name: 'Trip Name', members: [...] },
});

// Update data
const response = await apiCall(`/groups/${id}`, {
  method: 'PUT',
  body: { name: 'New Name' },
});

// Delete data
const response = await apiCall(`/groups/${id}`, {
  method: 'DELETE',
});
```

## Pages Requiring Integration

### 1. **Groups Listing** - `(dashboard)/groups/page.tsx`
**API Endpoint**: `GET /api/groups`
**Response Structure**:
```typescript
{
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: Array<{ userId: string; name: string; }>;
  totalBalance?: number;
  createdAt: string;
}[]
```

**Implementation**:
```typescript
useEffect(() => {
  const fetchGroups = async () => {
    const res = await apiCall('/groups');
    if (res.success) {
      setGroups(res.data);
    }
  };
  fetchGroups();
}, []);
```

---

### 2. **Create Group** - `(dashboard)/groups/create/page.tsx`
**API Endpoint**: `POST /api/groups`
**Request Body**:
```typescript
{
  name: string;
  description?: string;
  members: string[]; // User IDs
}
```

**Implementation**:
```typescript
const handleCreate = async (formData) => {
  const res = await apiCall('/groups', {
    method: 'POST',
    body: formData,
  });
  if (res.success) {
    router.push(`/groups/${res.data._id}`);
  }
};
```

---

### 3. **Group Details** - `(dashboard)/groups/[id]/page.tsx`
**API Endpoints**:
- `GET /api/groups/:id` - Group details
- `GET /api/expenses/group/:id` - Group expenses  
- `GET /api/expenses/group/:id/balances` - Who owes whom

**Key Fields**:
- Group data, members list, total expenses, balance sheet

---

### 4. **Personal Expenses** - `(dashboard)/personal/page.tsx`
**API Endpoint**: `GET /api/personal-expenses`
**Response Structure**:
```typescript
{
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  user: string;
}[]
```

---

### 5. **Add Personal Expense** - `(dashboard)/personal/add/page.tsx`
**API Endpoint**: `POST /api/personal-expenses`
**Request Body**:
```typescript
{
  description: string;
  amount: number;
  category: string; // food, transport, etc.
  date: string;
}
```

---

### 6. **Friends** - `(dashboard)/friends/page.tsx`
**API Endpoint**: `GET /api/friends`
**Features**:
- Show list of friends
- Display balance/debt with each friend
- Add friend button → `POST /api/friends/add { friendId }`
- Remove friend → `DELETE /api/friends/:id`

---

### 7. **Settlements** - `(dashboard)/settlements/page.tsx`
**API Endpoints**:
- `GET /api/settlements/user` - All user settlements
- `POST /api/settlements/record` - Record a settlement

**Settlement Flow**:
1. User records payment
2. Sends to backend
3. Updates balances
4. Creates notification for receiver

---

### 8. **Analytics** - `(dashboard)/analytics/page.tsx`
**API Endpoints**:
- `GET /api/analytics/monthly` - Last 6 months data
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/insights` - Top category

**Display**: 
- Line chart (Recharts) for monthly trends
- Pie chart for category distribution
- Top insights card

---

### 9. **Profile** - `(dashboard)/profile/page.tsx`
**API Endpoints**:
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password
- `POST /api/profile/picture` - Upload avatar

---

### 10. **Notifications** - `(dashboard)/notifications/page.tsx`
**API Endpoints**:
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete

---

## Quick Reference - API Endpoints

```
Authentication:
POST   /auth/register          - Create account
POST   /auth/login             - Login
POST   /auth/google-login      - Google OAuth
POST   /auth/refresh           - Refresh token
POST   /auth/logout            - Logout

Groups:
GET    /groups                 - List user's groups
POST   /groups                 - Create group
GET    /groups/:id             - Get group details
PUT    /groups/:id             - Update group  
DELETE /groups/:id             - Delete group
POST   /groups/:id/members     - Add member
DELETE /groups/:id/members/:uid - Remove member
GET    /groups/:id/summary     - Group summary
GET    /groups/:id/timeline    - Expense timeline

Expenses:
POST   /expenses/add           - Add expense
GET    /expenses/group/:id     - Group expenses
GET    /expenses/group/:id/balances - Balances
PUT    /expenses/:id           - Update
DELETE /expenses/:id           - Delete

Personal:
GET    /personal-expenses      - List
POST   /personal-expenses      - Add
PUT    /personal-expenses/:id  - Update
DELETE /personal-expenses/:id  - Delete

Settlements:
GET    /settlements/user       - User settlements
GET    /settlements/group/:id  - Group settlements
POST   /settlements/record     - Record payment

Friends:
GET    /friends                - List friends
POST   /friends/add            - Add friend
DELETE /friends/:id            - Remove
GET    /friends/:id/balance    - Balance

Analytics:
GET    /analytics/dashboard    - Dashboard summary
GET    /analytics/monthly      - Monthly data
GET    /analytics/categories   - Category breakdown
GET    /analytics/insights     - Top insights

Notifications:
GET    /notifications          - List all
PUT    /notifications/:id/read - Mark read
DELETE /notifications/:id      - Delete

Profile:
GET    /profile                - Get profile
PUT    /profile                - Update
PUT    /profile/password       - Change password
POST   /profile/picture        - Upload photo
```

## Common Patterns

### Fetch with Loading State
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetch = async () => {
    try {
      const res = await apiCall('/endpoint');
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || 'Failed to load');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);
```

### Mutation with Error Handling
```typescript
const handleSubmit = async (formData) => {
  setLoading(true);
  setError('');
  try {
    const res = await apiCall('/endpoint', {
      method: 'POST',
      body: formData,
    });
    if (res.success) {
      // Success - redirect or update UI
      toast.success('Created successfully');
      router.push('/success-path');
    } else {
      setError(res.error || 'Operation failed');
    }
  } catch (err) {
    setError('An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Protected Route with Session Check
```typescript
'use client';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    signIn();
    return null;
  }

  return <div>Protected content</div>;
}
```

## Testing the Integration

1. **Test Login**:
   - Go to `http://localhost:3001/login`
   - Use test credentials from backend

2. **Test Protected Pages**:
   - Logged in: `/dashboard` should show stats
   - Not logged in: Should redirect to login

3. **Test API Calls**:
   - Open DevTools > Network
   - Perform action
   - Check request to backend API
   - Verify auth header includes JWT token

4. **Test Backend Connection**:
   ```bash
   curl http://localhost:5000/health
   ```

## Environment Variables

`.env.local` should have:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Next Steps

1. ✅ Dashboard page - DONE
2. ✅ Register page - DONE
3. Create Groups listing & detail pages
4. Create Personal expenses pages
5. Create Friends page
6. Create Settlements page  
7. Create Analytics with charts
8. Create Profile/Settings pages
9. Create Notifications page
10. Handle auth errors & redirects
11. Add form validation
12. Add loading states & toasts
13. Mobile optimization

## Debugging Tips

- Check `.env.local` has correct backend URL
- Verify backend is running: `curl http://localhost:5000/health`
- Check browser DevTools > Network for failed requests
- Check browser console for errors
- Check terminal output for backend issues
- Verify NextAuth session: `/api/auth/session`

---

**Last Updated**: April 11, 2026  
**Web App Port**: 3001  
**Backend Port**: 5000
