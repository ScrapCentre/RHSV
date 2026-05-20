/**
 * Wordmark — inline brand text "ScrapCentre.com" for places where the
 * image logo can't be used (e.g. inline in prose, in toast messages).
 *
 * Renders the brand name in font-bold + text-brand-red per brand-guide.md §4.
 */
import { cn } from "@/lib/utils"

export type WordmarkProps = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const textSize = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
}

export function Wordmark({ size = "md", className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-bold tracking-tight",
        textSize[size],
        className
      )}
      style={{ color: "var(--brand-red)" }}
    >
      ScrapCentre.com
    </span>
  )
}

export default Wordmark
