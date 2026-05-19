import type { Config } from "tailwindcss";
import preset from "@ai-ops/ui/tailwind-preset";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  safelist: [
    "col-span-1",
    "col-span-3",
    "col-span-4",
    "col-span-6",
    "col-span-8",
    "col-span-12",
    "row-span-1",
    "row-span-2",
    "row-span-3",
  ],
  presets: [preset],
} satisfies Config;
