# SwitchUp Backend Restoration & JWT Implementation

I have restored your missing source code (`backend/src`) and implemented the requested JWT authentication system with cookies.

## Changes Made

### 1. Source Code Restoration
Your `backend/src` folder was empty. I examined the compiled code in `backend/dist` and fully reconstructed the TypeScript source files:
- `src/index.ts` (Server entry point)
- `src/lib/prisma.ts` (Database client)
- `src/routes/events.ts`, `src/routes/hosts.ts`, `src/routes/bookings.ts` (API routes)

### 2. JWT Authentication Implementation
I rewrote `src/routes/auth.ts` to implement secure, modern authentication:

-   **Sign Up & Login**: Now generates a **JWT (JSON Web Token)** signed with a high-entropy secret.
-   **Cookies**: The token is automatically stored in an `httpOnly` cookie named `token`.
    -   **Update**: Changed `SameSite` to `Lax` to ensure better compatibility during development (preventing cookie blocking).
-   **Verification**: Added a `/me` endpoint that checks this cookie to identify the current user.
-   **Logout**: Successfully clears the cookie.

### 3. Configuration & Security
-   Added `JWT_SECRET` to your `.env` file.
-   Created `tsconfig.json` to fix TypeScript compilation errors.
-   Updated `cors` settings to allow credentials (cookies) to be passed from the frontend and explicitly support the frontend origin.

### 4. Frontend Configuration
-   Updated `frontend/.env` to point `NEXT_PUBLIC_API_URL` to `http://localhost:4000/api`.
-   Refactored `frontend/src/lib/api.ts` to use this environment variable and handle authentication (login/signup) centrally.
-   **Crucial Fix**: Added `credentials: 'include'` to all frontend API calls. This is required for the browser to actually send and receive cookies when talking to a different port (3000 -> 4000).

## How to Verify

1.  **Server Status**: The server is currently running on `http://localhost:4000`.
2.  **Test Endpoint**: You can test the auth flow by hitting `POST /api/auth/signup` or `POST /api/auth/login`. On success, check your browser's DevTools -> Application -> Cookies to see the `token` cookie.
3.  **Frontend Login**: Run the frontend (`npm run dev`) and try logging in. It should now successfully talk to port 4000 and store the cookie.
