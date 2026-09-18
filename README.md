# Sudh Vaishno Tandoor — Final Responsive Master

This package is based ONLY on the newest master used for the latest website work.

## Latest fixes
- Mobile hero scroll-down control is fixed above the bottom navigation and remains visible on the first screen.
- Phone showcase logo/image is visible on mobile and desktop and remains editable from Admin.
- Floating water bottle is moved away from the story food imagery and keeps its motion.
- Amul Butter floating image now has smooth motion.
- Menu photos are slightly larger while keeping cards compact.
- Menu items show inline − / quantity / + controls after adding.
- About Us homepage shows a comfortable short preview only.
- `story.html` contains the complete About/Story content with full images and full text.
- Admin upload now has explicit Title + Description inputs.
- Admin photo management defaults to the newest 6 items with See more / See less.
- Admin review management defaults to the newest 3 items with See more / See less.
- Branding settings update existing Supabase `site_settings` rows or insert them if missing.
- PWA service-worker cache version bumped and `story.html` added to the app shell.

## Supabase
No new SQL is required for these UI fixes if the existing `supabase-vnext-content-fix.sql` was already run.

## Motion polish
The current master includes a CSS-only premium motion layer for hover, focus, entrance, card, button, navigation, carousel, floating-food, phone-showcase, and ambient effects. It preserves the existing layout/functionality and includes `prefers-reduced-motion` support. The service-worker cache was bumped to v6 so the new stylesheet is picked up after deployment.
