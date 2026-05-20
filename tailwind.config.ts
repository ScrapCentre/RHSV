import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    // Fixed: removed nonexistent "pages/**" glob (was dead path — design-system §10 / tech-debt note)
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── shadcn/ui semantic tokens (kept for primitive compatibility) ── */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        gray: {
          750: "rgb(55 65 81 / 0.8)",
        },

        /* ── ScrapCentre.com brand color tokens (design-system §2.1) ──
           Use as: bg-brand-red, text-brand-red-dark, border-brand-gray-300, etc. */
        brand: {
          red:        "var(--brand-red)",
          "red-dark": "var(--brand-red-dark)",
          "red-light": "var(--brand-red-light)",
          "red-xlight": "var(--brand-red-xlight)",
          black:      "var(--brand-black)",
          "gray-900": "var(--brand-gray-900)",
          "gray-700": "var(--brand-gray-700)",
          "gray-500": "var(--brand-gray-500)",
          "gray-300": "var(--brand-gray-300)",
          "gray-100": "var(--brand-gray-100)",
          white:      "var(--brand-white)",
          bg:         "var(--brand-bg)",
        },

        /* ── Status tokens ── */
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          error:   "var(--status-error)",
          info:    "var(--status-info)",
        },

        /* ── Lead quality badge tokens ── */
        badge: {
          bronze:       "var(--badge-bronze)",
          "bronze-bg":  "var(--badge-bronze-bg)",
          silver:       "var(--badge-silver)",
          "silver-bg":  "var(--badge-silver-bg)",
          gold:         "var(--badge-gold)",
          "gold-bg":    "var(--badge-gold-bg)",
        },

        /* ── Tier state tokens ── */
        tier: {
          locked:       "var(--tier-locked)",
          "locked-bg":  "var(--tier-locked-bg)",
          unlocked:     "var(--tier-unlocked)",
        },

        /* ── Countdown urgency tokens ── */
        countdown: {
          ok:     "var(--countdown-ok)",
          warn:   "var(--countdown-warn)",
          urgent: "var(--countdown-urgent)",
        },
      },

      fontFamily: {
        /* ── Devanagari font family (design-system §2.2) ── */
        devanagari: ["var(--font-noto-devanagari)", "Noto Sans Devanagari", "Inter", "sans-serif"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.4s ease-out both",
        "pulse-dot":      "pulse-dot 1.5s ease-in-out infinite",
        pulse: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
