## 2026-11-07T09:18:21Z

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
