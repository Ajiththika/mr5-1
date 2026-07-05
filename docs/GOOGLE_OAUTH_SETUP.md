# Google OAuth Setup — MR5 School

## Local (macOS)

Port **5000** is often taken by AirPlay. This project uses **5001**.

| Setting | Value |
|---------|-------|
| Frontend | `http://localhost:3000` |
| API | `http://localhost:5001` |
| OAuth callback | `http://localhost:5001/api/auth/google/callback` |

## Google Cloud Console (required)

Open https://console.cloud.google.com/apis/credentials → your OAuth client.

### Authorized JavaScript origins

```
http://localhost:3000
http://localhost:5001
```

### Authorized redirect URIs (only this)

```
http://localhost:5001/api/auth/google/callback
```

Remove any `3000` or `5000` callback entries. Save. Wait ~1 minute.

**This is the only fix for Error 400: redirect_uri_mismatch.** The app already sends this URI.

## Verify

```bash
curl -sI http://localhost:5001/api/auth/google | grep -i location
# must include: redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fapi%2Fauth%2Fgoogle%2Fcallback
```

Then: http://localhost:3000/login → Google
