# MR5 School — Ganesha 3D Model License Compliance

## Mandatory Attribution

The following text **must remain visible** in the product UI:

```
Indigo Ganesha - Avatar by ultranique (https://skfb.ly/6FRHv) is licensed under CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/)
```

## Where Attribution Appears

| Location | Implementation |
|----------|----------------|
| Every page | `LicenseAttributionBar` in `app/layout.tsx` |
| Site footer | `ModelCreditNotice` in `components/layout/footer.tsx` |
| About page | `#3d-attributions` section |
| Classroom loader | `ModelCreditNotice` variant=loading |
| 3D scene HUD | `ModelCreditNotice` variant=scene |
| 3D scene metadata | `userData.license` on Ganesha group |
| License file | `/licenses/ganesha.txt` |
| Asset registry | `data/3d-asset-registry.json` |
| Admin | `/admin/assets` |

## File Locations

```
client-main/
├── public/
│   ├── models/ganesha.glb
│   └── licenses/ganesha.txt
├── data/3d-asset-registry.json
├── lib/3d/model-registry.ts
├── lib/3d/aws-assets.ts
├── lib/3d/ganesha-loader.ts
└── components/3d/GaneshaModel.tsx
```

## AWS Deployment Flow

1. Upload `ganesha.glb` to S3 with `Content-Type: model/gltf-binary`
2. Serve via CloudFront with long cache + immutable flag
3. Set `NEXT_PUBLIC_CDN_GANESHA_MODEL` or `NEXT_PUBLIC_CDN_BASE_URL`
4. Invalidate CloudFront path on model updates

## Performance

- Lazy load + dynamic import (implemented)
- Mobile tier disables model (implemented)
- Phase 2: Draco compression, 1024px textures

## Compliance Checklist

- [x] Mandatory credit text in code (`GANESHA_CREDIT_MANDATORY`)
- [x] Every-page attribution bar
- [x] License file at `/licenses/ganesha.txt`
- [x] JSON asset registry
- [x] Admin asset manager at `/admin/assets`
- [ ] Draco production asset (recommended)
