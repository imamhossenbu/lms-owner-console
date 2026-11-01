# Admin Panel Guidelines & Standards

These rules are strictly enforced across the `lms-admin-panel` codebase:

---

## 1. Modular Architecture (Small Sub-Components)
- Always break down pages, layouts, and complex forms into small, focused sub-components.
- Keep page files (`page.tsx`) lightweight, using them primarily to assemble sub-components and bind page-level state.
- Extract form fields, badges, summary cards, and action bars into dedicated files in `src/components/`.

---

## 2. Design System: Strict `globals.css` Tokens for Typography & Colors
- All text styles, fonts, weights, colors, and background fills MUST strictly use the predefined classes in `src/app/globals.css`.
- **Typography Tokens**:
  - Headings: `heading-display-h1`, `heading-h1-bold`, `heading-h2-bold`, `heading-h3`, `heading-h4`, `heading-h5`, `heading-h6`.
  - Body: `body-xl-regular`, `body-l-medium`, `body-regular`, `body-medium`, `body-sm-medium`, `body-sm-regular`, `body-xsm-medium`, `body-xsm-regular`, `body-2xsm-regular`.
  - Titles & Labels: `title-bold`, `title-medium`, `title-sm`.
- **Color Tokens**:
  - Brand: `text-brand-orange`, `text-brand-orange-hover`, `bg-brand-orange`, `bg-brand-orange-light`, `border-brand-orange`.
  - Neutral / Text: `text-primary-500` (#0F172A), `text-primary-400` (#334155), `text-primary-300` (#64748B), `subtext-500`.
  - Status: `text-red`, `text-red-dark`, `bg-red-14`, `border-red`, `text-green`, `bg-green-bg`, `border-green`, `text-blue`, `bg-blue-14`, `border-blue`, `text-yellow`, `bg-yellow-bg`, `bg-yellow-14`, `border-yellow`, `text-purple`, `bg-purple-14`.
  - Borders & Cards: `border-dash`, `dashboard-card`, `edupro-glow-btn`.
- **Strict Prohibition**: NEVER use arbitrary Tailwind classes or inline hex colors (e.g. `text-[11px]`, `bg-[#EFF6FF]`, `text-[#059669]`) when corresponding tokens exist in `globals.css`.

---

## 3. Reusable Components First
- Prioritize reusable components located in `src/components/ui/`, `src/components/common/`, and `src/components/layout/`.
- Every shared component must have typed TypeScript props and sensible defaults.
- Prevent duplicate implementations of buttons, inputs, alerts, modals, and badges.

---

## 4. Proper Frontend Validation
- All forms must use `react-hook-form` with `zod` schemas via `@hookform/resolvers/zod`.
- Show immediate, human-readable error messages below each input field.
- Form submit buttons must indicate loading state and be disabled while submitting.

---

## 5. Proper Toast Notifications
- Use `sonner` (`toast`) for all asynchronous actions.
- Implement the complete lifecycle: `toast.loading(...)` -> `toast.success(...)` or `toast.error(...)`.
- Format backend API error messages into clear, friendly English before displaying.

---

## 6. Proper Skeleton Loading
- When loading data or navigating async views, render animated skeleton placeholders matching the exact shape of the layout.
- Use `animate-pulse` with rounded borders matching the design system (`rounded-xl`, `bg-slate-100` / `bg-slate-200`).
- Avoid empty white screens or bare spinning icons without layout structure.

---

## 7. Single Language Policy
- **English Only**: The entire user interface must always remain in English.
- **No Language Toggler/Selector**: NEVER include any language selector, dropdown, toggle button, or globe icon anywhere in the application.

---

## 8. Data Tables & Column-Wise Borders
- **Reusable Data Tables**: Always use or compose data tables with consistent layout, headers, sorting, pagination, and clean hover states.
- **Mandatory Column Borders**: All tables across the application MUST include column-wise vertical borders (`divide-x divide-dash` or `border-r border-dash`) between cells and header columns, in addition to standard row borders (`divide-y divide-dash` / `border-b border-dash`).
- **Consistent Cell Geometry**: Maintain aligned padding (`px-3.5 py-3`), clear column header typography (`body-xsm-medium text-primary-400 font-semibold`), and structured action menus.

---

## 9. Universal Badge Component (`ToneBadge`) & Single-Line Policy
- **Single Universal Badge Component**: Everywhere across the entire application (tables, headers, profile cards, status pills, count badges, tags), ALWAYS use the unified `ToneBadge` component (`src/components/ui/ToneBadge.tsx`).
- **No Ad-Hoc Badges**: NEVER write custom `<span>` or `<div>` elements with arbitrary inline colors, borders, or padding for badges or status indicators.
- **Strict Single-Line Text**: All badges, tone tags, status pills, count indicators, category tags, and course chips MUST always remain strictly on a single line (`whitespace-nowrap shrink-0 inline-flex items-center`).
- **No Text Wrapping**: Badge text must NEVER wrap onto two or more lines under any viewport, column width, or flex container constraints.
- **Consistent Layout**: Use `inline-flex items-center whitespace-nowrap shrink-0` guaranteed by `ToneBadge` across all badge and chip components to ensure visual integrity and geometry.

# Project Development Rules — MUST FOLLOW

Follow these rules for every new feature, page, component, and UI modification. These are mandatory project-wide conventions, not optional suggestions.

### 1. Proper Validation & Toast Notifications
- Always implement proper client-side and server-side validation wherever applicable.
- Show clear, user-friendly validation messages for invalid or missing inputs.
- Use the project's existing toast notification system for success, error, warning, and informational feedback.
- Never use `alert()` for notifications.
- Handle API errors, loading states, and failed requests properly.
- Prevent duplicate submissions when a request is in progress.

### 2. Proper Content-Filled Skeleton Loading (Strictly No Empty/Hollow Cards)
- Always implement appropriate skeleton loading states for data-driven pages and components.
- **Strictly No Hollow/Blank Cards**: Skeletons must NEVER render empty placeholder cards (`<div className="h-72 ..."/>` or large blank grey containers).
- **Replicate Full Internal Content**: Every skeleton component MUST accurately replicate the internal geometry and structure of its final content:
  - Tables: Realistic header cells and body rows with avatars, text lines, badges, and vertical column borders (`divide-x divide-dash`).
  - Charts: Realistic vertical bar columns of varying heights, horizontal progress tracks, or circular donut rings with central metric counters and legend pills.
  - Forms: Actual input field outlines, labels, alert boxes with checklists, and action buttons.
  - Profile & Header Banners: Back buttons, avatar circles, name lines, status badges, and tab bars.
- Skeletons must match the layout and dimensions of the actual content.
- Use reusable skeleton components wherever possible.
- Avoid unnecessary layout shifts, blank screens, and excessive loading spinners.
- Handle loading, empty, error, and success states separately.

### 3. Always Use Reusable Components
- Before creating a new component, check whether an existing reusable component can be used.
- Extract repeated UI patterns into reusable components instead of duplicating code.
- Follow the existing project architecture, folder structure, naming conventions, and coding style.
- Keep components modular, maintainable, and easy to update.
- Avoid unnecessary duplication and overly large components.
- Extend existing shared components when appropriate instead of rebuilding them.

### 4. Follow `globals.css` for Styling
- Always inspect and reuse existing utility classes, CSS variables, design tokens, and shared styles defined in `globals.css`.
- Use existing global classes for text colors, background colors, typography, borders, spacing, and other common styling whenever available.
- Do not introduce arbitrary colors, font sizes, or duplicate CSS rules when an existing project convention can be reused.
- Maintain consistent typography, colors, spacing, and visual hierarchy across the entire application.
- Add new global styles only when genuinely necessary, and keep them reusable.
- Follow the existing theme and dark-mode conventions, if applicable.

### 5. Always Use DataTable for Tables
- Always use the project's existing reusable DataTable component for tabular data.
- Do not create a separate custom HTML table when the DataTable component can handle the requirement.
- **Every table must have visible borders between columns**, in addition to appropriate row borders.
- Ensure table headers and cells are consistently aligned and styled.
- Preserve existing DataTable features such as sorting, pagination, filtering, search, and responsive behavior wherever applicable.
- Use reusable column definitions and appropriate cell renderers.
- Handle loading, empty, and error states consistently with the project's existing DataTable conventions.
- If the DataTable lacks a required feature, extend the reusable component rather than creating a duplicate implementation.

### 6. Persistent URL State & Tab/Page Preservation Across Reloads
- **URL Parameter Synchronization**: Every tabbed interface, sub-view, active filter, pagination state, and search term MUST synchronize with the URL (via `?tab=...`, `?page=...`, `?status=...`, `?q=...` query parameters) and persist in `sessionStorage` where appropriate.
- **Strict Reload Preservation**: When a user refreshes or reloads the browser from any tab or page (`load dile`), the application MUST stay on that exact tab/page without resetting to the default view or the first tab.
- **App Router `<Suspense>` Requirement**: In Next.js App Router, every page or component that reads `useSearchParams()` MUST be wrapped inside a `<Suspense>` boundary with a matching rich skeleton fallback to guarantee optimal streaming and static export safety.


### 7. Framer Motion Everywhere (Mandatory Animations)
- **Single Animation Library**: All UI animation MUST use `framer-motion` (already installed). Do not add other animation libraries or hand-written CSS keyframes for interactive UI.
- **Page Entry**: Every page's root content animates in (`motion.div` with `initial={{ opacity: 0, y: 6 }}` → `animate={{ opacity: 1, y: 0 }}`, ~0.25s `easeOut`).
- **Lists, Tables & Grids**: Rows and cards animate in with a short stagger (the shared `DataTable` already does this for every table). Grids that add/remove items use `AnimatePresence` + `layout`.
- **Overlays**: Modals, drawers, dropdowns and popovers animate open/close with `AnimatePresence` (fade + slight scale/slide). `ModalShell` already does this — reuse it.
- **Active Indicators**: Tabs, segmented controls and toggles use an animated indicator (`layoutId` shared-layout pill or spring `animate`), e.g. `PillTabs`, `SegmentedControl`, `ToggleSwitch`.
- **Feedback**: Clickable controls give tactile feedback (`whileTap={{ scale: 0.92–0.97 }}`; cards may `whileHover={{ y: -2 }}`).
- **Keep it subtle**: Durations 0.15–0.3s, springs for indicators; never block interaction or delay content noticeably. Prefer adding motion to shared `ui/` components so every page inherits it.

### Final Requirement
Before implementing anything, inspect the existing project structure and identify the available shared components, DataTable, toast system, validation utilities, skeleton components, and global CSS classes.

Reuse existing implementations whenever possible. Do not install additional packages or introduce a new library if the project already has a suitable solution.

Apply these rules consistently to all future development and preserve the existing project conventions.