# Palette — Dentalkart Clinic Platform

The brand blue here is an **approximation** of Dentalkart's, chosen because the
live site was unreachable from the build environment. It is a deliberate stand-in,
not a sampled brand value. Everything below is the map for replacing it in one pass.

Artboards carry literal hex in inline `style` attributes (that is what makes every
element editable in the canvas properties panel), so a rebrand is a find-and-replace
across `*.dc.html`, not a variable change.

## 1. Brand ramp — replace these on a rebrand

| Hex | Role | Uses |
|---|---|---|
| `#0B5CD5` | **Primary.** Buttons, active states, links, selected borders | 110 |
| `#08306E` | Primary pressed / hover, top utility bar | 11 |
| `#EDF3FE` | Primary tint. Chip and icon-well backgrounds | 24 |
| `#C2D5EE` | Tint border, focused card outline | 11 |
| `#D3E2F8` `#DCE7F7` `#CFE0FA` `#CBDFFA` `#C9DCF7` `#C7D9F0` | Hero, dot grid, dashed placeholder frames | 2 each |
| `#A9C6EC` `#8CACD4` `#7FA5D6` `#6A8DBB` `#5F82AF` | Placeholder-frame strokes and labels | 2 each |
| `#B9D3F6` `#BFD8F7` `#7FAEE8` `#123A6B` | Appointment blocks, restored-tooth fill | 1–2 each |
| `#F3F7FD` `#F7FAFE` `#F3F8FF` `#F7FAFF` `#F4F8FD` `#EEF3FA` `#F9FBFE` `#FBFCFE` | Near-white blue-cast surfaces | 1–9 each |

Dark navy panels (the console sidebar, dark cards, the chairside shell) sit in the
same family and should move with the brand hue:

`#0B1B30` (27) · `#17304F` (7) · `#12294A` (3) · `#1D3A5F` · `#24405F` · `#33506F`
Text on them: `#9DB4CE` · `#C6D6E8` · `#8FA6C2` · `#6E8AAC` · `#6FA6F0` (accent) ·
`#4E85D8` · `#5D93E4` · `#2A4A73`

## 2. Accent — teal

`#00A29B` primary accent · `#0B5A52` deep · `#E7F6F4` tint · `#B2E0D9` `#B7E3DA`
`#6FC3B4` borders · `#37D39B` "automations live" indicator

Chosen to share chroma and lightness with the blue and differ only in hue. If the
real brand accent is warmer, re-derive it in oklch at the same L and C rather than
picking a hex by eye, or the two will fight.

## 3. Semantic — keep these

These carry meaning, not brand. Changing them costs legibility.

| Family | Ink | Tint | Border | Meaning |
|---|---|---|---|---|
| Green | `#0E7A57` | `#E9F7F3` `#F2FBF8` | `#BFE6DB` | Paid, healthy stock, done, on time |
| Amber | `#B45309` `#7A5B14` | `#FFF6E8` `#FFF9EE` `#FFFBF2` | `#F0DBB4` `#F2E2C4` `#E0CBA0` | Low stock, awaiting approval, warning |
| Red | `#B42318` `#8E2A20` | `#FFF0EE` `#FFF6F5` `#FFF1EF` `#FFFBFA` | `#F6CFC9` `#F5D2CC` | Below par, allergy, unpaid, absent |

Dental chart conditions in `Chart.dc.html` are their own scale and should not be
rebranded — they are read clinically:
crown `#F3D9A6`/`#DCB868` · implant `#B7E3DA`/`#6FC3B4` · caries `#F6C3BB`/`#E08D80` ·
missing `#F1F3F6`/`#D7DFE9`

## 4. Neutrals — keep these

Ink `#0F1A2A` · body `#46586F` `#5D6D82` · muted `#8494A8` `#7C8CA0` `#A3B0C0` ·
disabled `#B6C1CF` `#C8D2DE` · rules `#E3E9F0` `#EEF2F7` `#E7EDF5` `#DDE5EF` `#D7DFE9` ·
surfaces `#FFFFFF` `#FAFBFD` `#F5F7FB` `#F1F5FA` `#F4F7FA`

Whites and near-whites are held under 0.02 saturation deliberately. Warm them
together or not at all.

## 5. Do not touch — third-party chrome

`Whatsapp.dc.html` reproduces WhatsApp's own interface so the message flows read as
real. These are Meta's colours, not ours, and must survive any rebrand:

`#075E54` header · `#0A6E62` inactive tab · `#A8CFC9` header subtext ·
`#E9E1D8` `#DED4C8` wallpaper · `#DCF8C6` outgoing bubble · `#4FC3F7` read receipts ·
`#17242F` message text · `#7C8C82` timestamps · `#D6E6E0` `#526B63` day divider

## Typography

Display `'Instrument Serif'`, fallback `Georgia, serif` — patient-facing headlines only.
UI and body `'Plus Jakarta Sans'`, fallback `'Segoe UI', system-ui, sans-serif`.
Both load from Google Fonts, the one external host the canvas permits. PNG/PDF export
cannot embed webfonts, so exports render the fallbacks — the stacks are metric-close
on purpose. Swap in the real brand face by editing the two `<link>` and `font-family`
declarations at the top of each artboard.

## Doing the swap

1. Decide the new primary, then re-derive the ramp in oklch at fixed chroma so tints
   and dark panels stay harmonious. Do not hand-pick each stop.
2. Find-and-replace across `*.dc.html`, section 1 only.
3. Re-check contrast on the dark navy panels — `#6FA6F0` on `#0B1B30` is the tightest
   pair in the set and the first thing a hue shift breaks.
4. Re-seed and republish the canvas (see the seeding command in the session notes).
