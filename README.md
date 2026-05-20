# ScrapCentre.com

Production site: **https://scrapcentre.com**
Staging / preview: **https://scrapcentre.online**

A national lead-generation marketplace for India's Registered Vehicle Scrapping Facility (RVSF) industry. Customers get a transparent quote for their end-of-life vehicle; RVSFs buy quality leads at ₹0.75/kg.

A Unit of **RESTOREHEALTH MEDICARE PVT. LTD.** (the RVSF in Auraiya, UP — `RVSF Facility, A-4, UPSIDC Industrial Area, Plasticity, Dibiyapur, Auraiya`).

## Tech stack

- **Next.js 15** App Router + **React 19** + **TypeScript**
- **MongoDB Atlas** + **Mongoose**
- **NextAuth v4** (multiple credential providers + Google + Firebase Phone OTP)
- **Tailwind CSS** + **shadcn/ui**
- **Cloudinary** uploads
- **Firebase Auth** (phone OTP)
- Hosted on Cloudflare DNS; deployment target TBD

## Local development

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI, Cloudinary keys, Firebase config, etc.

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server on `:3000` |
| `npm run build` | Production build |
| `npm run start` | Start the production server on `:3000` |
| `npm run lint` | Run ESLint |

## Project structure

```
app/         Next.js App Router pages + API routes
components/  React components
lib/         Auth, DB, services, helpers
models/      Mongoose schemas
public/      Static assets (logo, favicons, brand)
scripts/     One-off ops scripts
```

## Documentation

For product decisions, architecture, build plan, brand guidelines, and the v2 roadmap, see the docs index (private; not in this repo) maintained by the founder team.

## License

Private. © Restore Health Medicare Pvt. Ltd. All rights reserved.
