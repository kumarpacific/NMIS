# User Role System Documentation

## Overview
The application now supports three user roles with a role-based access control (RBAC) system:

### User Roles
1. **Admin** (Highest Level)
   - Full access to all features
   - Can manage all settings and configurations
   - Can view and export all logs

2. **Maintainer** (Medium Level)
   - Can view logs and dashboards
   - Can manage certain settings
   - Limited administrative capabilities
   - Cannot modify system-level configurations

3. **User** (Standard Level)
   - Can view their own dashboard
   - Can access logs (read-only)
   - Limited access to settings (self-only)
   - No administrative capabilities

## Architecture

### Auth Context (`src/lib/authContext.tsx`)
- Manages authentication state globally
- Stores user information (id, email, name, role)
- Persists user data to localStorage
- Provides `useAuth()` hook for accessing auth state

### Components Updated

#### Login (`src/app/components/Login.tsx`)
- Added role selection dropdown
- Users select their role during login
- Three options: User, Maintainer, Admin

#### ProtectedRoute (`src/app/components/ProtectedRoute.tsx`)
- Enhanced with role-based protection
- Supports `requiredRole` prop to restrict access
- Uses role hierarchy for permission checking
- Redirects unauthorized users to dashboard

#### DashboardLayout (`src/app/components/DashboardLayout.tsx`)
- Displays current user's name and role
- Shows role in welcome message and user profile
- Uses `logout()` from auth context

#### App (`src/app/App.tsx`)
- Wrapped with `AuthProvider` at root level
- Provides authentication context to all components

## Usage Examples

### Checking User Role
```tsx
import { useAuth } from '@/lib/authContext';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Redirect to="/" />;
  
  if (user.role === 'admin') {
    // Show admin-only content
  }
}
```

### Protecting Routes by Role
```tsx
<Route
  path="/admin/settings"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminSettings />
    </ProtectedRoute>
  }
/>
```

### Role Hierarchy
- User: Level 1
- Maintainer: Level 2
- Admin: Level 3

Users can access routes requiring their level or lower. For example, a Maintainer (level 2) cannot access routes requiring Admin (level 3).

## Persistence
- User authentication state is stored in localStorage
- User data survives page refreshes
- Data is cleared on logout

## Testing the System
1. Open the app and go to login page
2. Enter any email and password
3. Select a role from the dropdown: User, Maintainer, or Admin
4. Click "Sign In"
5. Observe user name and role displayed in:
   - Top right corner of dashboard
   - User profile section in sidebar
6. Try accessing different features based on role
7. Log out to clear session

## Future Enhancements
- Backend integration for role validation
- API-level permission checks
- Role-specific UI elements and features
- Fine-grained permission system
- Audit logging for role-based actions
