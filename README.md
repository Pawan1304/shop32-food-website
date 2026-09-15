# Sudh Vaishno Tandoor — Vercel website
Customized for Sudh Vaishno Tandoor, Gate No. 2, GMCH, Chandigarh.
Pure vegetarian • Since 1996 • Owner: Sudhir Mandal • Registered by MC Chandigarh.

Upload/replace these files in your GitHub repository:
- index.html
- styles.css
- app.js
- config.js
- menu-poster.jpg


## SEO files
- `robots.txt` — allows search engine crawling and points to the sitemap.
- `sitemap.xml` — lists the public homepage for search engines.
- `index.html` — contains canonical URL, Open Graph/Twitter metadata, and Restaurant structured data.

Master website URL: https://sudhirtandoor32.vercel.app/

## Website UX upgrade — September 2026

This master includes:
- PWA install controls + manifest + service worker
- Mobile hero with Order Food, Call, WhatsApp and Maps actions
- Smaller hero background image treatment
- Compact mobile experience section and food feature cards
- Phone food showcase with a reliable first image
- Multi-photo Today's Menu carousel
- Editable About / Story cards through Admin
- Food & Moments photo/video uploads with captions and delete/edit controls
- Swipeable customer review carousel with automatic movement and 1-second interaction pause
- Admin review manager for website reviews and displayed Google rating/count

### Required Supabase migration
Run `supabase-website-content-migration.sql` once in the Supabase SQL Editor before using the new About / Story and Review management features. It adds the required media fields/categories and creates `site_reviews` and `site_settings`.

The review manager edits the reviews shown on this website. It does not edit Google Maps reviews.
