# Food Shop — Vercel Ready Website

This is a responsive, no-build static website with:
- Mobile/tablet/desktop responsive design
- Menu categories
- Add-to-cart functionality
- WhatsApp checkout
- Call button
- Google Maps button
- About, photos and reviews sections
- No database or paid service required for the starter version

## 1. Personalise it
Open `config.js` and change:
- `shopName`
- `phone`
- `address`
- `mapsUrl`
- Menu items, prices, descriptions and images

## 2. Deploy to Vercel
### Option A — easiest
1. Create a GitHub account if you don't have one.
2. Create a new repository.
3. Upload `index.html`, `styles.css`, `app.js`, and `config.js`.
4. Open Vercel and sign in with GitHub.
5. Click **Add New → Project**.
6. Import your GitHub repository.
7. For a static site, Vercel can deploy the files directly. Click **Deploy**.
8. Vercel will give you a `*.vercel.app` address.

### Option B — Vercel CLI
Install Node.js, then run:
`npx vercel`

## WhatsApp number
Use country code + number without `+` or spaces.
India example:
`919876543210`

## Important
This version sends orders to WhatsApp. It does not process online payments, manage delivery drivers, or store orders in a database. Those features can be added later.
