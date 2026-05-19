/**
 * Tailwind preset shared by all apps.
 * Apps extend this via `presets: [require('@ai-ops/ui/tailwind-preset')]`.
 *
 * Dark operational design system — see docs/design.md
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Core surfaces
        canvas: "#0B0D10",
        panel: "#111418",
        elevated: "#171B21",
        "border-op": "#242933",
        hairline: "#2F3541",
        // Text colors
        "text-primary": "#F5F7FA",
        "text-secondary": "#A6B0BF",
        "text-tertiary": "#738093",
        "text-muted": "#5B6472",
        // Operational state colors
        ai: "#7C8CFF",
        event: "#4DA3FF",
        success: "#3FB950",
        warning: "#D29922",
        error: "#F85149",
        trace: "#A371F7",
        // Legacy brand kept for backwards-compat
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
};
