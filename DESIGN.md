---
name: Vibe App — Campus Radio
description: Warm, friendly social planning for life after class.
colors:
  primary: "#B94732"
  primary-hover: "#9F3927"
  coral-soft: "#FBE0D5"
  nav-coral: "#FBE9E0"
  blue: "#315F80"
  blue-soft: "#DDECF6"
  lavender: "#EEE4F5"
  lavender-ink: "#70528E"
  background: "#FFF9F4"
  surface: "#FFFFFF"
  text: "#322B29"
  secondary-text: "#685C56"
  muted-text: "#786A62"
  border: "#E9DDD4"
  success: "#26734E"
  danger: "#B6363D"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(42px, 4.8vw, 70px)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(28px, 3vw, 38px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "21px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.5
rounded:
  label: "8px"
  field: "10px"
  control: "12px"
  panel: "16px"
  pill: "24px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  page: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "11px 19px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "11px 19px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "11px 14px"
  navigation:
    backgroundColor: "{colors.nav-coral}"
    textColor: "{colors.secondary-text}"
    padding: "15px 18px"
  activity-label:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.lavender-ink}"
    rounded: "{rounded.label}"
    padding: "6px 10px"
  plan-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "22px"
---

# Design System: Vibe App

## Overview

**Creative North Star: "Campus Radio"**

The user selected warm coral, blue, and a softer feel for every page. The system combines rounded Manrope lettering, pale colored surfaces, and familiar app controls. Personality comes from friendly language and activity colors while practical plan details remain easy to scan.

**Key Characteristics:**
- Warm light surfaces with dark, legible text.
- Coral primary actions and sky blue welcome areas.
- Consistent activity colors from discovery to plan details.
- Spacious desktop work areas and comfortable mobile controls.

## Colors

The palette pairs warm coral with cool sky blue, grounded by cocoa text and off-white surfaces.

### Primary

**Campus Coral** identifies primary actions and selected navigation. Its darker hover shade preserves white-label contrast. **Soft Coral** supports Party labels; the pale navigation shade gives the desktop rail its identity.

### Secondary

**Radio Blue** carries welcome panels, the AI assistant action, and focus outlines. **Sky Blue** is the supporting surface. **Soft Lavender** with lavender ink identifies Outing plans and interest labels.

### Neutral

**Warm Off-white** is the app ground. **White** separates interactive cards and fields. Cocoa, secondary, and muted text carry successive information levels. The warm border color separates content without strong shadows.

**The Activity Continuity Rule.** Use `TYPE_CONFIG` in `src/theme.js` for activity identity across cards and details. Party is peach, Trip green, Outing lavender, Food Run yellow, Sports blue, and Study Sesh pink. Pair every color with an activity name.

## Typography

**Display Font:** Manrope, with sans-serif fallback.

**Body Font:** Manrope, with sans-serif fallback.

Manrope weights 400, 500, 600, 700, and 800 are self-hosted under `public/fonts`, with their OFL license. Bold, rounded headings provide the expressive voice; body copy stays calm and readable.

### Hierarchy

- Display typography belongs to authentication introductions; it steps down on phones.
- Headline typography identifies the current page.
- Title typography identifies a plan card; modal headings use a slightly larger size.
- Body typography explains actions and plan details. Longer copy uses more generous line height.
- Labels use sentence case and semibold or bold weight. Form inputs use 16px on phones.

**The One Family Rule.** Use the bundled Manrope family throughout, including controls. Allow long names and titles to wrap inside their containers.

## Layout

The app shell caps at 1500px. Desktop navigation occupies a 244px rail, narrowing to 210px below 1100px. The work area caps at 1160px; profile and detail surfaces cap at 900px. Default page padding is 48px, reducing to 28px and then 20px at smaller widths.

At 800px and below, navigation becomes a four-item bottom bar with safe-area padding. Page content reserves space for it. Plan details use a back action on phones. Plan lists use two columns and become one below 560px. Activity filters scroll horizontally inside their own row.

Dialogs center on desktop and become bottom sheets below 600px. Compact rating and cancellation dialogs stay centered. Long form bodies scroll inside the dialog, keeping the close control reachable.

## Elevation & Depth

Plan cards use borders. Welcome and profile surfaces use flat color. Dialogs and transient suggestions use soft shadows to clarify their position above the app.

### Shadow Vocabulary

- **Raised surface:** `0 12px 36px rgba(73,45,31,0.08)` for elevated supporting content.
- **Dialog:** `0 20px 70px rgba(57,38,28,0.18)` over a translucent cocoa backdrop.

## Shapes

Use gently rounded controls, restrained card corners, circular avatars, and small rounded activity labels. Pill shapes belong to filters and compact badges. The radio brand mark is a simple circular line icon, consistent with Lucide icon strokes throughout the app.

## Components

### Buttons

Primary actions use coral with white labels; welcome and assistant actions use blue. Secondary actions use white with a warm border. Primary controls have a minimum height of 46px; modal and touch controls retain at least 44px. Hover changes color and focus uses a visible blue outline.

### Chips

Activity filters are white with borders and become cocoa with white labels when selected. Form choices become soft coral with darker text and a stronger border. Selection is also exposed through `aria-pressed` or `aria-selected`.

### Cards / Containers

Plan cards group type, title, description, location and time, then host and capacity. The footer is separated by a fine rule. A category label identifies the activity; availability remains explicit text. Cards with join requests keep a natural content height.

### Inputs / Fields

Inputs have a white ground, warm border, readable placeholder, and visible label. Blue borders and focus outlines identify keyboard focus. Errors use pale red with dark red text. Disabled controls reduce opacity while retaining their dimensions.

### Navigation

Desktop navigation uses a coral-tinted rail with white active surfaces. Mobile navigation shows icons with labels and a pale coral selected item. Create remains easy to reach in both layouts.

### Dialogs and Motion

Shared dialogs lock background scroll, contain keyboard focus, close with Escape, and return focus to the opener. Dialog entry is a short 20px rise over 240ms; interaction colors transition over 180ms. Reduced-motion preferences disable both.

## Do's and Don'ts

### Do:
- **Do** pair activity colors with readable labels.
- **Do** preserve warm coral and sky blue across new screens.
- **Do** provide visible focus, useful empty states, and descriptive field labels.
- **Do** check long names, narrow screens, and scrolling dialog content.

### Don't:
- **Don't** use color alone to communicate selection or availability.
- **Don't** replace the locally hosted font with a system display face.
- **Don't** add ornamental gradients or glows to the flat, soft surface language.
- **Don't** turn the radio identity into unfamiliar controls or navigation.
