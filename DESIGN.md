---
name: Stillwell
description: Considered homes, warm editorial typography, and a useful shortlist.
colors:
  paper: "#faf9f6"
  ink: "#252b20"
  muted: "#62675d"
  olive: "#344427"
  olive-hover: "#25351b"
  line: "#dddfd5"
  surface: "#f0f1e9"
  white: "#fff"
  error: "#a13328"
  outline-border: "#cbd0c1"
  field-border: "#ccd1c2"
  footer: "#e9ecdf"
typography:
  display:
    fontFamily: "Stillwell Serif, Georgia, serif"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Stillwell Serif, Georgia, serif"
    fontSize: "56px"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Stillwell Serif, Georgia, serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  control:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.6
  admin-title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  wordmark:
    fontFamily: "Stillwell Serif, Georgia, serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
rounded:
  tag: "4px"
  field: "6px"
  button: "7px"
  toast: "8px"
  image: "12px"
  dialog: "16px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  section-heading: "28px"
  tablet-gutter: "32px"
  editor-gap: "40px"
  desktop-gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.olive}"
    textColor: "{colors.white}"
    typography: "{typography.control}"
    rounded: "{rounded.button}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.olive-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.button}"
    padding: "12px 24px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
  save-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    size: "40px"
  detail-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.image}"
    padding: "28px"
  detail-tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
    padding: "4px 9px"
  property-image:
    rounded: "{rounded.image}"
---

# Design System: Stillwell

## Overview

**Creative North Star: "The Considered Home"**

Stillwell borrows the calm of a residential architecture practice: generous warm paper, deep olive controls, considered photographic crops, and an editorial serif. Homes lead the experience. The interface gives prices, places, and practical facts enough space to be read without competing with the photography.

Public browsing, property details, saved homes, and sign-in share this welcoming editorial character. Administration uses the same palette and controls with precise sans-serif headings, compact tables, visible statuses, and direct forms. This is one identity with density adjusted to the task.

**Key Characteristics:**
- Warm, quiet surfaces with olive action emphasis.
- Large serif public headings and clear sans-serif controls.
- Rounded photographs, restrained borders, and flat cards.
- Responsive reading order and browser-native navigation.
- Practical, denser administration with explicit states.

This document records the implementation in `app/globals.css` and the active application components. Frontmatter values are normative; responsive overrides and interaction details below explain their use. The sidecar supplies extensions and portable component specimens.

## Colors

The palette combines warm paper and muted green neutrals with a single deep olive accent.

### Primary
- **Deep Olive** (`olive`): primary actions, selected search tabs, saved hearts, focus outlines, and success marks.
- **Dark Olive** (`olive-hover`): the primary button hover state.

### Neutral
- **Warm Paper** (`paper`): page canvas, fields, image labels, caption surfaces, and dialogs.
- **Garden Ink** (`ink`): headings, prices, controls, and readable dark text.
- **Quiet Moss** (`muted`): supporting copy, locations, field help, and metadata.
- **Soft Divider** (`line`): section boundaries, table rows, header, and editor sections.
- **Pale Olive Surface** (`surface`): detail enquiry panel, compact search, editor publishing panel, and detail tags.
- **White** (`white`): text on filled olive actions and selected transaction tabs.
- **Outline Border** (`outline-border`): secondary buttons and admin filters.
- **Field Border** (`field-border`): enquiry, setup, and listing editor fields.
- **Footer Green** (`footer`): the shared footer and gallery stage background.

The error color is a restrained brick red (`error`) used for messages and field guidance. Administrative statuses also use local pale green, amber, and gray fills; the words Published, Draft, and Archived carry their meaning alongside color.

**The Olive Action Rule.** Use deep olive for an action or selected state; let photography and warm paper carry the public page.

## Typography

**Display Font:** Cormorant Garamond, self-hosted under the CSS family **Stillwell Serif**, with Georgia and serif fallbacks.

**Body Font:** self-hosted **DM Sans**, with a sans-serif fallback. Available weights are regular, medium, semibold, and bold (400–700). The serif supplies medium and semibold (500–600).

**Character:** The serif gives public headings a domestic, editorial cadence. The sans-serif keeps prices, navigation, filters, and administration legible and exact. Headings use balanced wrapping and tight tracking; ordinary interface labels retain sentence case.

### Hierarchy
- **Display:** the desktop home heading uses the frontmatter display role. At tablet widths it becomes medium weight and steps to (58px) and then (48px); mobile uses medium (55px), unit line height, and a maximum width of (390px).
- **Headline:** standard public page headings use the headline role, reducing to (46px) on mobile. The property title is (55px), then (45px) at tablet and (43px) on mobile. Section headings are generally (32–43px), depending on context.
- **Title:** desktop property card titles use the title role, falling to (25px) at tablet and returning to (29px) in the full-width mobile card. They retain the serif; prices stay in DM Sans.
- **Body:** the body role is the global default. Public descriptive copy commonly uses (14px), line height (1.9), and a maximum of (65ch) on a property description. Mobile descriptive copy is (13px).
- **Control / Label:** buttons use the control role; field labels use the label role. Form input text is (14px), increasing to (16px) for mobile enquiry and editor fields. Numeric prices use tabular numerals in cards and tables.
- **Admin Title:** the listing manager uses the admin-title role, reducing to (27px) on mobile. Editor titles use (30px), then (26px) on mobile. Admin section titles use medium DM Sans (17px).
- **Wordmark:** the wordmark uses the serif role, reducing to (38px) at tablet and (37px) in the mobile header.

**The Two Voices Rule.** Use the serif for public editorial hierarchy and the sans-serif for controls, facts, prices, and administrative hierarchy.

## Layout

The public container is centered and capped at (1440px). It has desktop side gutters of (48px), then (32px) at widths up to (1200px), and (20px) at widths up to (650px). The principal responsive thresholds are (1200px), (900px), and (650px); a desktop refinement starts at (1201px). A separate wide-screen query starts at (1700px), but the later desktop heading rule keeps the current hero heading at (64px).

On desktop the home hero uses two columns with a narrow copy/search side and broad image side (0.75fr / 1.25fr), a (40px) gap, and a minimum image height of (466px). Mobile changes the reading order to heading, short supporting copy, photograph, search, and then homes. The mobile hero image is (260px) high with slightly smaller (10px) corners.

Property collections have three equal columns. Desktop cards have (28px) horizontal gaps and (42px) row gaps; tablet tightens these to (20px) and (32px). At the mobile threshold, cards become one column with (30px) gaps. Card images use a wide ratio (1.65), a tighter tablet ratio (1.3), and a mobile ratio (1.55). Text lives below the image on the page canvas, without an enclosing card box.

The property detail has a gallery above a main reading column and a sticky enquiry panel. The desktop body ratio is (1.6fr / 1fr), with a (100px) gap that narrows at tablet sizes. At mobile, the panel moves into the reading order after the facts and before descriptive sections; it is no longer sticky. The gallery changes from a main image plus two side images to one main image.

The admin and editor cap at (1180px). The editor has a main form and a (290px) publishing panel, which narrows to (260px) before stacking at the tablet threshold. Mobile turns listing table rows into compact two-column records with a full-width property identity; table semantics remain intact. The publishing panel becomes one column, photo previews become two columns, and the URL/photo action stacks.

## Elevation & Depth

The system is flat by default. Warm paper, pale olive panels, one-pixel dividers, photographic crops, and spacing establish hierarchy. Property cards do not cast shadows. Only modal dialogs and the expanded mobile navigation use shadows; their depth communicates an overlay rather than decoration.

### Shadow Vocabulary
- **Modal lift** (`0 24px 80px #17211030`): native gallery and enquiry dialogs, with a dark translucent backdrop (`#172110a6`).
- **Menu edge** (`0 14px 20px #252b200d`): the expanded mobile navigation below the header.

**The Flat Surface Rule.** Keep resting content flat; reserve lift for modal and navigation overlays.

## Shapes

Photographic frames and substantive panels use the image radius. Fields and secondary gallery controls use the field radius; buttons have a slightly softer button radius. Tags are compact with the tag radius. Dialogs have the largest corner radius. Save, close, menu, and sign-out controls use circles; the circular silhouette identifies a compact icon action rather than a content container.

Borders are thin and quiet. The focus indicator is a two-pixel olive outline offset by (4px) on anchors, buttons, and ordinary fields; the search location group has a two-pixel outline offset by (2px) while focused. Inputs use an olive caret. Outline and focus treatments remain distinct from the muted structural dividers.

## Components

### Buttons

Quietly rounded controls with enough height for deliberate interaction.
- **Primary:** the primary frontmatter variant, minimum height (48px), horizontal icon gap (16px). Hover uses dark olive; active press scales to (0.98).
- **Outline:** transparent surface, one-pixel outline border, and the same geometry. Hover fills with pale green (`#e9eddf`).
- **Icon:** a transparent circle (44px), with a pale green hover fill (`#e8ebdf`). Card save controls are the smaller (40px) variant.
- **Text link:** sans-serif, medium (14px), minimum height (44px). Hover underlines the text and shifts an arrow (4px) to the right.
- **Busy:** disabled buttons dim to (0.6) opacity and use a waiting cursor; actions display specific Saving, Sending, or Uploading wording where implemented.

### Chips

Small labels describe state without becoming decorative pills. Public detail tags use the detail-tag variant at (11px). Photo transaction labels use paper over imagery. Admin status badges use (11px) type, compact padding (4px 8px), and the tag radius. Published, Draft, and Archived are always written explicitly; these badges are not interactive filters.

### Cards / Containers

Property cards present image, transaction label, independent save button, price, linked title, location, and compact bed/bath/area facts. The image and title are native links to the detail page. The image link is removed from the tab order so keyboard users encounter the meaningful title link once. Image hover gently scales to (1.035) over (0.5s) with `cubic-bezier(.2,.7,.2,1)`; the frame clips the image.

The detail panel is a pale olive container with the detail-panel geometry, a sans-serif price, one primary enquiry action, one outline save action, and quiet metadata. Contact actions appear only on property detail pages.

### Inputs / Fields

Fields use the input variant with a one-pixel field border and minimum height (46px). Labels sit above fields with a (6px) gap. Textareas resize vertically and use line height (1.65). Error messages use brick red and appear with an alert or field association; the editor marks invalid fields with `aria-invalid` and clears the relevant field error when corrected. Native HTML required, email, length, and numeric constraints complement submission validation.

Search combines Buy/Rent pressed-state buttons, a location field, and native selects. Selected transaction tabs are olive with white text; unselected tabs sit on a pale gray-green track. Search submits a browser-native GET form to `/homes`; filters are represented in the URL. Results sort with a native select for recommended or either price direction.

### Navigation

The header is paper with a bottom divider. At desktop widths it is (76px) high; tablet also uses (76px), and mobile uses (72px). The serif wordmark anchors the left edge. Desktop links have an olive underline for hover and active state, with a (0.2s) expansion. Saved count appears as a small circle when nonzero. Mobile replaces desktop navigation with a menu button and a full-width dropdown below the header; its button exposes `aria-expanded`.

Application route links render actual HTML anchors, preserving ordinary browser navigation, history, and open-in-new-tab behavior. Sign-in and sign-out anchors target the top frame. The skip link becomes visible on focus and leads to the main content.

### Saved Homes & Sign-in

The heart is an independent toggle with `aria-pressed` and an accessible save/unsave name. A saved heart is olive and filled; busy state disables repeated submission. An anonymous save opens sign-in with the exact home and pending save preserved in the return URL. After sign-in, the detail page completes that save and removes the pending query from history. A signed-in save updates the shared count and persistent saved list, then shows a status toast; failures use the same visible status channel.

Sign-in pairs a courtyard photograph and editorial heading with a full-width Continue with ChatGPT anchor. Mobile places the sign-in content before the photograph. The page preserves the intended return path, including an administrative route where relevant.

### Gallery & Enquiry Dialogs

Both use native HTML dialogs. The gallery opens the selected photo, provides previous/next buttons, numbered progress, selectable thumbnails, left/right keyboard navigation, and native Escape dismissal. Its desktop image uses containment rather than cropping; mobile narrows arrow controls and makes thumbnails scroll horizontally.

The enquiry dialog opens from a property detail and names that property. It collects name, email, optional phone, and a message, then shows sending, recoverable error, or a centered success state. Editing clears a submission error. Close and backdrop click dismiss the enquiry; native Escape behavior remains available. Demonstration listings identify that the enquiry goes to the admin portal and does not contact a real agent. The form dialog uses a maximum width of (500px), maximum height of (90vh), and desktop padding (38px), narrowing to mobile padding (38px 24px 28px).

### Administration

The listing manager uses compact sans-serif headings, simple tabs, searchable listing records, a native status select, and explicit Edit/View anchors. Enquiries are readable entries with sender, property, local timestamp, message, and an email anchor. Empty collections describe the next action in plain language.

The editor groups essentials, place, description, features, photos, and visibility. Save controls show progress and preserve errors for correction; a successful save returns through native navigation to the admin list. Photos show a cover label on the first item, individual remove controls, upload progress, and an HTTPS image URL alternative. Draft, Published, and Archived visibility choices explain where the home appears. Server authorization governs admin changes; the presentation does not substitute for access checks.

Motion is brief and tied to a state: button transitions (0.18s), navigation and save feedback (0.2s), gallery image hover (0.35s), and card image hover (0.5s). Toasts fade and travel (20px) into place, then remain visible for (4.2s). Reduced-motion preference removes transitions and animation, restores automatic scrolling, and suppresses property-card image scaling.

## Do's and Don'ts

### Do:
- **Do** give home photography, prices, places, and facts a clear reading order.
- **Do** pair editorial serif headings with precise sans-serif controls and administrative headings.
- **Do** use olive for primary actions, selection, and visible keyboard focus.
- **Do** keep cards flat and use pale olive panels for grouped actions.
- **Do** preserve native anchors, semantic labels, explicit statuses, and pending saves through sign-in.
- **Do** identify demonstration inventory and illustrative photography where the application does so.

### Don't:
- **Don't** add enquiry actions to property cards or the browse page.
- **Don't** replace the established warm paper and olive identity with unrelated accent colors.
- **Don't** add shadows to resting property cards or decorative metrics to administration.
- **Don't** use color alone to communicate listing status or remove visible keyboard focus.
- **Don't** apply public display typography to the dense admin hierarchy.
- **Don't** add travel animation when reduced motion is requested.
