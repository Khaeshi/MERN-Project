# Deployment Guide — Cafe Prince

This document explains how the project is structured, deployed, and how the different services communicate. Read this before making any changes to the deployment setup.

```bash
https://mern-project-one-pearl.vercel.app/
```
---

## Architecture Overview

```
Browser
  │
  ▼
Vercel (Frontend — Next.js)
  │  mern-project-one-pearl.vercel.app
  │
  │  /api/* requests → proxied via next.config.js rewrites
  │
  ▼
Render (Backend — Express.js)
  │  cafe-backend-fx7c.onrender.com
  │
  ▼
MongoDB Atlas (Database)
```

The frontend and backend are on **separate platforms** but are made to behave as **same-origin** through Vercel's rewrite proxy. This is critical for cookies to work correctly.

---

## Services

| Service | Platform | URL |
|---------|----------|-----|
| Frontend (Next.js) | Vercel | https://mern-project-one-pearl.vercel.app |
| Backend (Express.js) | Render | https://cafe-backend-fx7c.onrender.com |
| Database | MongoDB Atlas | Cluster0 |

---

## Why the Vercel Proxy Matters

Cookies cannot be shared across different domains (e.g. `vercel.app` and `onrender.com`). To solve this, all API calls are routed through Vercel using `next.config.js` rewrites:

```js
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://cafe-backend-fx7c.onrender.com/api/:path*',
    },
  ];
}
```

This means:
- The **browser** only ever talks to `mern-project-one-pearl.vercel.app`
- Vercel **internally forwards** `/api/*` requests to Render
- Cookies are set on the `vercel.app` domain and work correctly

**Never bypass the proxy.** If `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL` points directly to Render, cookies will break.

---

## Environment Variables

### Vercel (Frontend)

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://mern-project-one-pearl.vercel.app` | Must point to Vercel, NOT Render |
| `NEXT_PUBLIC_BACKEND_URL` | `https://mern-project-one-pearl.vercel.app` | Must point to Vercel, NOT Render |

### Render (Backend)

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Controls cookie security settings |
| `PORT` | `5000` | Express server port |
| `MONGO_URI` | `mongodb+srv://...` | Must use `&appName=` not ` appName=` (no space) |
| `JWT_SECRET` | `<secret>` | Used to sign all JWT tokens |
| `JWT_EXPIRE` | `30d` | Token expiry duration |
| `CLIENT_URL` | `https://mern-project-one-pearl.vercel.app` | Used for OAuth redirects |
| `FRONTEND_URL` | `https://mern-project-one-pearl.vercel.app` | Used for CORS |
| `GOOGLE_CALLBACK_URL` | `https://mern-project-one-pearl.vercel.app/api/auth/google/callback` | Must go through Vercel proxy |
| `GOOGLECLIENTID` | `<from Google Console>` | OAuth client ID |
| `GOOGLECLIENTSECRET` | `<from Google Console>` | OAuth client secret |
| `AWS_BUCKET_NAME` | `<bucket>` | S3 image uploads |
| `AWS_REGION` | `<region>` | S3 region |
| `AWS_SECRET_ACCESS_KEY` | `<key>` | S3 credentials |

---

## Google OAuth Setup

Google Console must have the following configured under **OAuth 2.0 Credentials**:

### Authorized JavaScript Origins
```
http://localhost:5000
http://localhost:3000
https://mern-project-one-pearl.vercel.app
https://cafe-backend-fx7c.onrender.com
```

### Authorized Redirect URIs
```
http://localhost:5000/api/auth/google/callback
http://localhost:3000/
https://mern-project-one-pearl.vercel.app/api/auth/google/callback
https://cafe-backend-fx7c.onrender.com/api/auth/google/callback
```

The `GOOGLE_CALLBACK_URL` on Render must be `https://mern-project-one-pearl.vercel.app/api/auth/google/callback` so the OAuth callback goes through the Vercel proxy and the cookie is set on the correct domain.

---

## Authentication Flow

### Google OAuth (Customer Login)

```
1. User clicks "Sign in with Google" on Vercel frontend
2. Frontend calls /api/auth/google → Vercel proxies to Render
3. Render redirects to Google
4. Google redirects back to mern-project-one-pearl.vercel.app/api/auth/google/callback
5. Vercel proxies to Render → Render generates JWT
6. Render sets httpOnly cookie on vercel.app domain
7. Render redirects user to /success page
8. /success page calls checkAuth() to populate auth context
9. User is redirected to home page, authenticated
```

### Admin Login (Staff)

```
1. Staff visits /login page
2. Submits email + password
3. Frontend calls /api/admin/auth/login → Vercel proxies to Render
4. Render validates credentials, returns JWT token in response body
5. Frontend stores token in localStorage as 'adminToken'
6. All subsequent admin requests send token as Authorization: Bearer <token>
7. /api/admin/auth/verify confirms token validity on each page load
```

---

## Token Format

All tokens are generated using `utils/generateToken.js`:

```js
jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' })
```

---


## Deploying Changes

### Frontend (Vercel)
Vercel auto-deploys on every push to the main branch. After changing environment variables, trigger a manual redeploy:
> Vercel Dashboard → Deployments → Redeploy

### Backend (Render)
Render auto-deploys on push to main. After changing environment variables, trigger a manual redeploy:
> Render Dashboard → Manual Deploy → Deploy latest commit

---

## Local Development

```bash
# Backend (.env)
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_local_secret
CLIENT_URL=http://localhost:3000
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GOOGLECLIENTID=...
GOOGLECLIENTSECRET=...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

In local development, the Vercel proxy is not active, so `NEXT_PUBLIC_API_URL` should point directly to `localhost:5000`. The `next.config.js` rewrites only apply in production on Vercel.

---

## Common Issues
```bash
```
