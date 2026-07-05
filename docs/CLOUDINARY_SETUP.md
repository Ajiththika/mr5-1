# Cloudinary — MR5 School

## Architecture

| Upload type | Path | Secrets |
|-------------|------|---------|
| **Signed (recommended)** | Browser → `/api/upload` → Express → Cloudinary SDK | Server-only `CLOUDINARY_API_SECRET` |
| **Unsigned (widget only)** | Browser → Cloudinary API with upload preset | Public `NEXT_PUBLIC_*` only |

Never put `CLOUDINARY_API_SECRET` in the frontend.

## Backend `.env` (Mr5-School-API-main/.env)

```env
CLOUDINARY_CLOUD_NAME=mr5
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Verify: `GET http://localhost:5001/api/upload/config` → `{ configured: true, cloudName: "mr5" }`

## Frontend `.env` (client-main/.env)

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=mr5
# Optional — only for CldUploadWidget unsigned uploads:
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mr5_unsigned
```

Restart Next.js after changing `NEXT_PUBLIC_*` variables.

## Create unsigned upload preset (optional)

1. Cloudinary Dashboard → **Settings** → **Upload** → **Upload presets**
2. **Add upload preset**
   - Name: `mr5_unsigned`
   - Signing mode: **Unsigned**
   - Folder: `mr5_uploads` (optional)
3. Set `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mr5_unsigned`

Profile/course uploads use **signed** `/api/upload` and do not require a preset.

## Correct URLs

- Upload API: `https://api.cloudinary.com/v1_1/mr5/image/upload`
- Delivery CDN: `https://res.cloudinary.com/mr5/...`

Malformed URL `https://api.cloudinary.com/v1_1//upload` means `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is empty — restart the dev server after fixing `.env`.

## Localhost testing

1. Sign in (cookies required for `/api/upload`)
2. Upload from Profile → Edit → avatar
3. Check Network tab: `POST /api/upload` → 200 with `secure_url`
