/**
 * BrandLogo — the SINGLE component that renders the ScrapCentre.com logo.
 *
 * Always uses the founder-supplied PNG at public/brand/logo.png.
 * Never use the AI-recreated SVG variants. Per brand-guide.md §4.
 *
 * Usage:
 *   <BrandLogo />              // md size (140x50)
 *   <BrandLogo size="sm" />    // 96x34 — for compact nav
 *   <BrandLogo size="lg" />    // 220x78 — for hero / login screens
 *   <BrandLogo variant="white" /> // wraps in white card on red backgrounds
 */
import Image from "next/image"
import { cn } from "@/lib/utils"

export type BrandLogoProps = {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "white"
  className?: string
  priority?: boolean
}

const dims = {
  sm: { w: 96, h: 34 },
  md: { w: 140, h: 50 },
  lg: { w: 220, h: 78 },
}

export function BrandLogo({
  size = "md",
  variant = "default",
  className,
  priority,
}: BrandLogoProps) {
  const { w, h } = dims[size]
  const img = (
    <Image
      src="/brand/logo.png"
      alt="ScrapCentre.com"
      width={w}
      height={h}
      priority={priority ?? size !== "sm"}
      className={cn("h-auto", className)}
    />
  )

  if (variant === "white") {
    // The logo is designed for white/light backgrounds. On red/dark surfaces,
    // wrap in a white card per brand-guide §4 treatment rules.
    return (
      <span className="inline-block rounded bg-white p-1">{img}</span>
    )
  }

  return img
}

export default BrandLogo
