Implement and finalize Milestone 4 (M4: Full CMS Admin Panel at `/admin`) for the Creator Media Kit & Endorsement Hub adhering to anti-slop guidelines (Neo-Brutalism Soft: warm paper `#FAF8F5`, Mustard `#FFD166`, Coral `#EF476F`, Mint `#06D6A0`, `2px solid #1E1E1E` border, `4px 4px 0px #1E1E1E` hard shadow, Plus Jakarta Sans, Space Mono), continuing from completed milestones M1-M3.

Working directory: /Users/adechairullah/CODING/SUMBAR_TERKINI
Integrity mode: development

## Requirements

### R1. Protected Admin Gate (`/admin`)
Implement a protected admin gate at `/admin` supporting Supabase Auth and a passcode fallback supporting the `ADMIN_PASSCODE` environment variable with fallback to `admin123` or `sumbar2026`.

### R2. Profile & Hero Editor
Provide an interface to edit creator profile and hero settings: avatar image, creator name, handle, bio, slot availability toggle and status text, theme preset selector, and draggable stickers manager (add, edit, and delete sticker text, emoji, and rotation).

### R3. Social Media & Engagement Manager
Provide a platform cards management interface to toggle between MANUAL and AUTO_API sync modes, edit metrics (followers, average views, likes, comments), edit demographic breakdowns (gender percentages, top cities), provide a real-time automatic ER calculation helper (`(likes + comments) / followers * 100`) with 1-click apply, and provide a "Test & Sync Now" trigger button for `/api/sync-socials`.

### R4. Rate Card & Package Builder
Provide CRUD capabilities for endorsement packages including package name, platform, price, description, deliverables list, discount percentage, tier, `is_popular` toggle, and `is_price_hidden` toggle for private WhatsApp negotiation.

### R5. Contact & CTA Settings
Provide settings management for WhatsApp business number with formatting validation, automated WhatsApp order template text, business email, and media kit PDF download URL.

### R6. Live Preview & Real-time Synchronization
Provide live preview capability (split-screen or instant sync) utilizing the repository DAL and realtime broadcast.

### R7. Code Quality & Verification
Ensure zero TypeScript compilation errors (`tsc --noEmit`), zero ESLint errors (`npm run lint`), a clean production build (`npm run build`), and automated tests covering the admin panel without regressions against the existing 281 tests.

## Acceptance Criteria

### Admin Security & Access
- [ ] Unauthenticated requests to `/admin` are gated by Supabase Auth and passcode fallback (`ADMIN_PASSCODE` or default `admin123` / `sumbar2026`).
- [ ] Submitting valid credentials or the correct passcode unlocks the admin dashboard.

### Profile & Content Management
- [ ] Profile and hero fields (avatar, creator name, handle, bio, slot availability toggle and status, theme preset) update and persist via the repository DAL.
- [ ] Draggable stickers manager allows adding, editing, and deleting sticker text, emoji, and rotation, with changes reflected on the public hero.

### Social Media & Metrics Management
- [ ] Social platforms list allows toggling between MANUAL and AUTO_API sync modes.
- [ ] Metric counts (followers, avg views, likes, comments) and demographic distributions can be edited manually.
- [ ] The ER helper calculates `(likes + comments) / followers * 100` and updates the ER field upon 1-click apply.
- [ ] Clicking "Test & Sync Now" triggers `/api/sync-socials` and reflects returned data.

### Endorsement Packages & Contact Settings
- [ ] Endorsement packages can be created, edited, and deleted with name, platform, price, description, deliverables list, discount percentage, tier, `is_popular` toggle, and `is_price_hidden` toggle.
- [ ] Contact settings (WhatsApp number with validation, automated order template text, business email, and media kit PDF URL) update and persist.
- [ ] Updates reflect in real time or via live preview on the public page.

### Verification & Production Build
- [ ] `tsc --noEmit` exits with code 0.
- [ ] `npm run lint` exits with code 0.
- [ ] `npm run build` exits with code 0.
- [ ] All automated test suites (existing 281 tests plus new admin panel tests) pass with 100% success.
