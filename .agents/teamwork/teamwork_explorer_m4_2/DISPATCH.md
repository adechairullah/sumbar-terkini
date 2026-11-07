## 2026-11-07T09:35:29Z
You are an Explorer agent for Milestone 4 (M4: Full CMS Admin Panel at `/admin`).
Working directory: /Users/adechairullah/CODING/SUMBAR_TERKINI
Your state folder: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_explorer_m4_2/
Scope document: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/orchestrator_1/PROJECT.md
Original request file: /Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/ORIGINAL_REQUEST.md

Task: CMS Editors & State Management Implementation Plan
1. Read PROJECT.md and ORIGINAL_REQUEST.md.
2. Plan the implementation of the core editor components:
   - `src/components/admin/ProfileHeroEditor.tsx`:
     * Fields: avatar URL, creator name, handle, bio, slot availability toggle and status text (`slot_status_text`), theme preset selector (`neo-warm`, `neo-mint`, `neo-mustard`).
     * Draggable stickers manager sub-editor: list existing stickers, add new sticker (text <= 24 chars, emoji picker/input, rotation slider [-45 to 45]), delete sticker, update rotation.
     * Persistence: `repository.updateSiteSettings()`.
   - `src/components/admin/SocialMediaManager.tsx`:
     * Platform cards list (5 platforms).
     * Toggle `sync_mode`: MANUAL vs AUTO_API.
     * Manual metrics editors: followers_count, avg_views, avg_likes, avg_comments.
     * Demographic distribution editor: gender (male % + female % = 100%), top cities list.
     * Real-time automatic ER calculation helper: `((likes + comments) / followers) * 100`, safe against 0 followers, 1-click apply button to write into `engagement_rate`.
     * "Test & Sync Now" button: triggers POST to `/api/sync-socials`, displays sync status badge/result.
     * Persistence: `repository.updateSocialPlatform(id, data)`.
   - `src/components/admin/PackageBuilder.tsx`:
     * List endorsement packages from `repository.getEndorsePackages()`.
     * Create / Edit modal or inline form: package name, platform, price (IDR), description, deliverables list (add/remove deliverable tags), discount percentage, tier (`starter`, `standard`, `vip`, `bundle`), `is_popular` toggle, `is_price_hidden` toggle.
     * Delete package with confirmation.
     * Persistence: `repository.createEndorsePackage`, `updateEndorsePackage`, `deleteEndorsePackage`.
   - `src/components/admin/ContactSettingsEditor.tsx`:
     * WhatsApp business number with Indonesian format validation (`08xxx` -> `628xxx`).
     * Automated WhatsApp order template text editor.
     * Business email with email regex validation.
     * Media kit PDF download URL with `.pdf` validation.
     * Persistence: `repository.updateSiteSettings()`.
3. Provide exact component interface specifications, types, form state management, validation logic, and code structures.

Subagent output requirements:
Write a detailed implementation plan to `/Users/adechairullah/CODING/SUMBAR_TERKINI/.agents/teamwork/teamwork_explorer_m4_2/handoff.md`.
Send a message when you complete with a concise summary and pointing to handoff.md.
