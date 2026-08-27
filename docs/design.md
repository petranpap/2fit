# 2Gym — Design Tokens

Design direction: grounded in Cyprus — sea-glass and Aegean blue instead of a generic warm-cream palette, citrus/mandarin accent (Cyprus citrus groves) instead of terracotta. Flat, bright, Mediterranean daylight feel — minimal shadow, soft primary-tinted elevation instead of hard drop shadows.

Both typefaces have full Greek glyph coverage — required since most user-facing content (gym names, offers, UI copy) will be in Greek.

## Typography
- **Display:** Archivo Expanded, weight 700–800, tracking -0.01em — wide, athletic stance for hero/headline moments
- **Heading:** Archivo, weight 600–700, tracking -0.005em
- **Body:** Manrope, weight 400–500, line-height 1.5 — clean humanist sans, strong screen legibility at small sizes
- **Caption:** Manrope, weight 500, 12–13px, tracking 0.02em — labels, badges, metadata

## Colors
- **Background:** `#EEF3F1` — pale sea-glass, hints at water rather than a warm beige default
- **Surface:** `#FFFFFF`
- **Primary:** `#0F6E8C` — deep Aegean blue; trust, motion, water
- **Secondary:** `#EF8354` — vivid mandarin/citrus; energy accent for CTAs, offers, highlights
- **Text primary:** `#17211F` — near-black with a faint cool undertone, not pure black
- **Text secondary:** `#5B6B66` — muted grey-green
- **Border:** `#DDE5E1`

## Spacing
- **Base unit:** 4px
- **Scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96

## Border Radius
- **Small:** 6px — inputs, small chips
- **Medium:** 12px — cards
- **Large:** 20px — modals, large containers
- **Full:** 9999px — offer badges, discount pills, category tags (natural fit given how many pill-shaped elements the app has)

## Shadows
Soft, primary-tinted, never pure black — matches the flat, bright Mediterranean aesthetic. No hard drop shadows.
- Cards: `0 4px 16px rgba(15, 78, 92, 0.08)`
- Small elements: `0 2px 6px rgba(15, 78, 92, 0.05)`