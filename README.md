# 🏠 Realty Portal — Buyer Dashboard

A full-stack buyer portal with JWT authentication and property favourites management.

**Stack:** React · Node.js/Express · SQLite · JWT

---

## Project Structure

```
realty-portal/
├── backend/
│   ├── db/
│   │   └── setup.js          # SQLite schema + seed data
│   ├── middleware/
│   │   └── auth.js           # JWT sign + verify middleware
│   ├── routes/
│   │   ├── auth.js           # POST /register, POST /login, GET /me
│   │   ├── properties.js     # GET /properties, GET /properties/:id
│   │   └── favourites.js     # GET/POST/DELETE /favourites/:id
│   └── index.js              # Express app entry point
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx   # Auth state (user, login, logout, token)
        ├── pages/
        │   ├── AuthPage.jsx      # Login + Register (single page, toggled)
        │   └── Dashboard.jsx     # Buyer portal with properties grid + tabs
        ├── components/
        │   ├── PropertyCard.jsx  # Card with heart toggle
        │   └── Toast.jsx         # Notification toasts
        ├── api.js                # Fetch wrapper with Bearer token headers
        └── App.jsx               # Routes + protected/public route guards
```

---

## Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** v9+

### 1. Install dependencies

```bash
# From the project root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev        # uses nodemon (auto-restart)
# or
npm start          # plain node
```

The API runs on **http://localhost:4000**

> The SQLite database (`backend/db/portal.db`) is created automatically on first run, along with 6 sample property listings.

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

The app runs on **http://localhost:5173**

---

## Example Flows

### Sign up → Login → Add Favourite

1. Open **http://localhost:5173**
2. Click **"Create account"**
3. Fill in your name, email and a password (min 6 chars) → **Create Account**
4. You're redirected to the dashboard automatically
5. Browse the property listings
6. Click the **heart icon** on any property card → it turns gold and the property is saved
7. Switch to the **"My Favourites"** tab to see only your saved properties
8. Click the heart again to **remove** it from favourites
9. Click **Sign out** — you're redirected back to the login page
10. Sign back in with the same credentials — your favourites are persisted in the DB

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ✗ | Create new account |
| POST | `/api/auth/login` | ✗ | Login, receive JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/properties` | ✓ | List all properties with favourite status |
| GET | `/api/properties/:id` | ✓ | Single property |
| GET | `/api/favourites` | ✓ | Current user's favourited properties |
| POST | `/api/favourites/:propertyId` | ✓ | Add property to favourites |
| DELETE | `/api/favourites/:propertyId` | ✓ | Remove from favourites |

All protected routes require `Authorization: Bearer <token>` header.

---

## Security Notes

- Passwords are hashed with **bcryptjs** (cost factor 12) — never stored in plain text
- JWTs are signed with a secret key and expire after **7 days**
- Foreign key constraints and a `UNIQUE(user_id, property_id)` index prevent duplicate favourites
- Users can only read and modify **their own** favourites — the `user_id` is taken from the verified JWT, never from request body
- Server-side validation on all inputs (email format, password length, name length)

---

## Environment Variables (optional)

Create a `.env` file in `/backend`:

```
PORT=4000
JWT_SECRET=your-secure-secret-here
```

By default it uses port `4000` and a fallback dev secret.
