# Google OAuth Setup — MR5 School

## 1. Google Cloud Console

1. Open https://console.cloud.google.com/ and select or create a project.
2. **APIs & Services → OAuth consent screen**
   - User type: **External** (testing) or **Internal** (Google Workspace)
   - App name, support email, developer contact
   - Scopes: `email`, `profile`, `openid`
   - If status is **Testing**, add your Gmail under **Test users**
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Type: **Web application**
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/google/callback`
4. Copy the **Client ID** and **Client secret**.

## 2. API `.env`

In `Mr5-School-API-main/.env`:

```env
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

Use port **3000** for the callback so auth cookies are set on the same origin as the Next.js app (proxied `/api/*`).

## 3. Restart API

```bash
cd Mr5-School-API-main && npm run dev
```

You should **not** see: `Google OAuth not configured`.

## 4. Verify

```bash
curl -I http://localhost:3000/api/auth/google
```

Expect `302` to `accounts.google.com`, not JSON `503`.

## 5. Production

| Setting | Example |
|---------|---------|
| `GOOGLE_CALLBACK_URL` | `https://mr5school.com/api/auth/google/callback` |
| `CLIENT_URL` | `https://mr5school.com` |
| Google redirect URI | Must match `GOOGLE_CALLBACK_URL` exactly |

Publish the OAuth consent screen or add all users as test users.
