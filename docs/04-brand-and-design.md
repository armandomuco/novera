# Brand And Design

## Name Recommendation

Fifteen name options:

| Name | Memorability | Pronunciation | Brand Potential | Product Fit | Global Fit | Domain Flexibility |
| --- | --- | --- | --- | --- | --- | --- |
| Novera | High | Easy | High | High | High | High |
| Kentro | High | Easy | High | High | High | Medium |
| Memora | High | Easy | Medium | High | High | Medium |
| Synora | High | Easy | High | High | High | High |
| Auralis | Medium | Medium | High | Medium | High | Medium |
| Clario | Medium | Easy | Medium | Medium | High | Medium |
| Nexora | High | Easy | Medium | High | High | Medium |
| Firmora | Medium | Easy | Medium | Medium | Medium | Medium |
| Veyra | High | Easy | High | Medium | High | High |
| Cogniva | Medium | Medium | Medium | High | High | Medium |
| Klera | Medium | Easy | Medium | Medium | High | High |
| Omniva | Medium | Easy | Medium | High | High | Medium |
| Linkora | Medium | Easy | Medium | High | High | Medium |
| StrataIQ | Medium | Easy | Medium | High | Medium | Medium |
| Orvian | Medium | Easy | High | Medium | High | High |

Top three: Novera, Synora, Kentro.

Recommended final name: **Novera**.

Domain availability and trademark availability must be verified separately before use.

## Logo Direction

Symbol: a structured knowledge-node mark formed from four connected planes around a protected center. It should feel like a business memory map, not a neural network.

Wordmark: geometric sans serif, medium weight, slightly wide letterforms, clear spacing.

Typography direction: Inter or Satoshi-style sans for product UI; a refined geometric wordmark for brand applications.

Primary colors:

- Ink: `#111827`
- Teal: `#0F766E`
- Blue: `#2563EB`
- Mist: `#F8FAFC`
- Line: `#CBD5E1`

Secondary colors:

- Slate: `#475569`
- Emerald: `#10B981`
- Amber: `#F59E0B`
- Red: `#EF4444`

Light mode: dark wordmark, teal/blue symbol, white or mist background.

Dark mode: white wordmark, lighter teal/blue symbol, ink background.

Favicon: icon-only mark in teal over white or dark ink.

Usage rules:

- Keep clear space equal to the symbol width around the mark.
- Do not stretch, rotate, or add shadows.
- Avoid robot heads, brains, glowing circuits, generic chat bubbles, and dense neural meshes.

## Initial SVG Logo

```svg
<svg width="180" height="44" viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Novera logo">
  <rect x="2" y="2" width="40" height="40" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
  <path d="M22 8L34 15V29L22 36L10 29V15L22 8Z" stroke="#0F766E" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M22 8V22M10 15L22 22L34 15M10 29L22 22L34 29M22 36V22" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="22" cy="22" r="3.5" fill="#0F766E"/>
  <text x="54" y="29" fill="#111827" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="0">Novera</text>
</svg>
```

The reusable SVG file is stored at `apps/web/public/brand/novera-logo.svg`.

## UI/UX Design System

Visual direction: modern executive SaaS. The interface should feel calm, structured, and intelligent, with enough polish to impress investors and enough restraint to feel trustworthy to business users.

### Color Palette

- Background light: `#F8FAFC`
- Surface light: `#FFFFFF`
- Text primary: `#111827`
- Text secondary: `#475569`
- Border: `#CBD5E1`
- Primary: `#0F766E`
- Action: `#2563EB`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`

Dark theme:

- Background: `#0B1220`
- Surface: `#111827`
- Text primary: `#F8FAFC`
- Text secondary: `#CBD5E1`
- Border: `#334155`
- Primary: `#2DD4BF`
- Action: `#60A5FA`

### Typography

Use Inter or a similar geometric sans. Avoid decorative display fonts inside the app. Headings use 600-700 weight. Body text uses 400-500 weight. Letter spacing stays normal.

### Spacing

Use a 4px base grid:

- 4px: tiny gaps.
- 8px: control padding and compact gaps.
- 16px: default spacing.
- 24px: section spacing.
- 32px: large panel spacing.
- 48px: page-level spacing.

### Border Radius

Cards, inputs, and buttons use 8px radius. Pills and badges may be fully rounded. Avoid oversized soft cards.

### Components

Buttons: primary, secondary, destructive, icon-only, and ghost. Use icons for clear tools and text for explicit commands.

Inputs: label, helper text, validation message, disabled state, loading state, and password visibility control where relevant.

Cards: individual repeated items only, such as projects, risks, documents, and summary widgets. Do not nest cards inside cards.

Tables: compact rows, sticky header where useful, sortable columns, clear empty state, and pagination.

Modals: focused task dialogs with title, body, primary action, secondary action, and escape/overlay close rules when safe.

Navigation: persistent desktop sidebar, compact mobile top bar with drawer, visible active state, organization switcher.

Badges: use for role, status, source type, processing status, risk severity, and integration state.

Loading states: skeleton rows for tables, spinner only for short button actions, progress state for document processing.

Empty states: explain what is missing and provide one clear action.

Error states: state what failed, preserve user input, offer retry where possible, and avoid exposing internals.

Responsive behavior: dashboard becomes single-column on small screens, tables get horizontal overflow or card alternatives, primary actions remain reachable.

Accessibility: WCAG AA contrast, keyboard navigation, visible focus rings, semantic headings, labels for form fields, ARIA only where semantic HTML is insufficient.
