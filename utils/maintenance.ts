// Single switch for the maintenance takeover. Flip to `false` to put the real
// app back — nothing else has to change, `app/_layout.tsx` reads this flag and
// renders `MaintenanceScreen` in place of the router stack.
export const MAINTENANCE_MODE = false;

// Shown under the heading. Keep it short — it sits on one or two lines.
export const MAINTENANCE_MESSAGE =
  "The dashboard is temporarily offline - features are being added";

// Terminal style status lines. Left column is padded with dots in the
// component, so only the label and its state belong here.
export const MAINTENANCE_LINES = [
  { label: "stat sync", state: "paused" },
  { label: "database", state: "migrating" },
  { label: "dashboard", state: "offline" },
] as const;
