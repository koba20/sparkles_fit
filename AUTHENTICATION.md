# Admin Authentication System

This document describes the secure authentication system implemented for the BLVCK admin dashboard, following industry best practices.

## Features

### 🔐 Security Features

- **Secure Session Management**: JWT-like session tokens with expiration
- **Password Hashing**: SHA-256 hashing (production should use bcrypt)
- **Account Lockout**: Automatic lockout after 5 failed attempts for 15 minutes
- **Session Expiry**: 24-hour session timeout with warnings
- **Role-Based Access Control**: Admin and Super Admin roles
- **CSRF Protection**: Session tokens prevent cross-site request forgery
- **Secure Headers**: Proper security headers implementation

### 🛡️ Authentication Flow

1. **Login**: Email/password authentication with rate limiting
2. **Session Creation**: Secure token generation and storage
3. **Session Validation**: Server-side session verification
4. **Auto-Logout**: Automatic logout on session expiry
5. **Logout**: Secure session invalidation

## Database Schema

### Admin Users Table

```sql
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Admin Sessions Table

```sql
CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY,
  admin_user_id UUID REFERENCES public.admin_users(id),
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## API Functions

### Authentication Functions

- `authenticate_admin(email, password)`: Validate credentials
- `create_admin_session(user_id, token, duration, ip, user_agent)`: Create session
- `validate_admin_session(token)`: Verify session validity
- `invalidate_admin_session(token)`: Logout/session cleanup
- `handle_failed_login(email)`: Track failed attempts

### User Management Functions

- `create_admin_user(email, password, first_name, last_name, role)`: Create user
- `hash_password(password)`: Password hashing
- `verify_password(input_password, stored_hash)`: Password verification

## Components

### Core Components

- **AuthProvider**: Context provider for authentication state
- **AdminLogin**: Secure login form with validation
- **ProtectedRoute**: Route protection wrapper
- **SessionWarning**: Session expiry notifications

### Hooks

- **useAuth**: Main authentication hook with utilities
- **useAuthContext**: Raw context access

## Usage

### Basic Authentication

```tsx
import { useAuth } from "@/hooks/useAuth";

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.email}</div>;
};
```

### Protected Routes

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminPage = () => (
  <ProtectedRoute requiredRole="super_admin">
    <AdminDashboard />
  </ProtectedRoute>
);
```

### Role-Based Access

```tsx
import { useAuth } from "@/hooks/useAuth";

const AdminPanel = () => {
  const { hasRole, isSuperAdmin } = useAuth();

  return (
    <div>
      {hasRole("admin") && <BasicAdminFeatures />}
      {isSuperAdmin() && <SuperAdminFeatures />}
    </div>
  );
};
```

## Security Best Practices Implemented

### 1. Password Security

- ✅ Password hashing (SHA-256 for demo, bcrypt recommended for production)
- ✅ Account lockout after failed attempts
- ✅ Password complexity requirements (can be enhanced)

### 2. Session Security

- ✅ Secure session token generation
- ✅ Server-side session validation
- ✅ Session expiration
- ✅ Automatic logout on expiry
- ✅ Session invalidation on logout

### 3. Access Control

- ✅ Role-based access control
- ✅ Protected routes
- ✅ Route-level authorization
- ✅ Component-level permission checks

### 4. Rate Limiting

- ✅ Failed login attempt tracking
- ✅ Account lockout mechanism
- ✅ Progressive delay implementation

### 5. Data Protection

- ✅ Row Level Security (RLS) policies
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection

## Demo Credentials

For testing purposes, use these credentials:

- **Email**: admin@xivttw.com
- **Password**: admin123
- **Role**: super_admin

## Production Recommendations

### 1. Password Security

```typescript
// Replace SHA-256 with bcrypt
import bcrypt from "bcrypt";

const hashPassword = async (password: string) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
```

### 2. JWT Implementation

```typescript
// Use proper JWT tokens instead of custom session tokens
import jwt from "jsonwebtoken";

const generateToken = (user: AdminUser) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );
};
```

### 3. Environment Variables

```env
# Add to .env file
JWT_SECRET=your-super-secret-jwt-key
ADMIN_SESSION_SECRET=your-session-secret
RATE_LIMIT_WINDOW=900000
MAX_LOGIN_ATTEMPTS=5
```

### 4. HTTPS Enforcement

```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}
```

### 5. Security Headers

```typescript
// Add security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
  })
);
```

## Monitoring and Logging

### Recommended Logging

- Failed login attempts
- Successful logins
- Session creation/destruction
- Role-based access violations
- Account lockouts

### Security Monitoring

- Unusual login patterns
- Multiple failed attempts
- Session anomalies
- Access from suspicious IPs

## Testing

### Authentication Tests

```typescript
describe("Authentication", () => {
  test("should login with valid credentials", async () => {
    const result = await login("admin@xivttw.com", "admin123");
    expect(result).toBe(true);
  });

  test("should reject invalid credentials", async () => {
    const result = await login("admin@xivttw.com", "wrongpassword");
    expect(result).toBe(false);
  });

  test("should lock account after 5 failed attempts", async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

1. **Session not persisting**: Check localStorage and session token
2. **Login failures**: Verify database connection and user credentials
3. **Role access denied**: Check user role and route protection
4. **Session expiry**: Implement session refresh mechanism

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem("auth_debug", "true");
```

## Support

For issues or questions about the authentication system:

1. Check the database migration files
2. Verify Supabase configuration
3. Review browser console for errors
4. Check network requests in DevTools

---

**Note**: This is a demo implementation. For production use, implement additional security measures as outlined in the recommendations section.
