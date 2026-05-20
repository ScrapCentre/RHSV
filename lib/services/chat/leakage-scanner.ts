/**
 * Chat-content leakage scanner — PURE FUNCTION.
 *
 * Scans chat messages for off-platform-contact patterns (phone numbers,
 * WhatsApp links, "let's talk outside", etc.) — drives the admin refund
 * review screen highlighting per locked decision 2026-05-20 §15.2 Phase 2.
 *
 * Pattern set defaults defined here; production deployment loads pattern
 * list from ConfigSetting.refund.flaggedRegexes so updates don't need
 * code deploys.
 *
 * Run at REJECT TIME (not admin-review time) per Backend §6 rationale:
 * messages are already loaded, single iteration is free, reproducibility
 * matters if RVSF disputes a denial.
 */

export type LeakagePattern = {
  name: string
  pattern: RegExp
}

export type LeakageMatch = {
  patternName: string
  messageId: string
  matchedSubstring: string
}

export const DEFAULT_PATTERNS: LeakagePattern[] = [
  { name: "phone_number_e164",    pattern: /\+?91[6-9]\d{9}/g },
  { name: "phone_number_local",   pattern: /\b[6-9]\d{9}\b/g },
  { name: "wa_me_link",           pattern: /wa\.me\/\d+/gi },
  { name: "whatsapp_link",        pattern: /(https?:\/\/)?(www\.)?whatsapp\.com/gi },
  { name: "whatsapp_keyword",     pattern: /\bwhatsapp\b/gi },
  { name: "email",                pattern: /[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi },
  { name: "off_platform_outside", pattern: /\b(let'?s )?talk (outside|directly|off[- ]platform)\b/gi },
  { name: "off_platform_call",    pattern: /\bcall me (directly|on)\b/gi },
  { name: "off_platform_my_num",  pattern: /\bmy (whatsapp|number|phone)\b/gi },
  { name: "off_platform_send",    pattern: /\b(send|message) (to|me on) (whatsapp|gpay|paytm)\b/gi },
]

export type ScannableMessage = {
  id: string
  text: string
}

export function scanForLeakage(
  messages: ScannableMessage[],
  patterns: LeakagePattern[] = DEFAULT_PATTERNS
): LeakageMatch[] {
  const out: LeakageMatch[] = []
  for (const msg of messages) {
    if (!msg.text) continue
    for (const p of patterns) {
      // Re-create the regex per match cycle to reset lastIndex on /g flag
      const re = new RegExp(p.pattern.source, p.pattern.flags)
      let m: RegExpExecArray | null
      while ((m = re.exec(msg.text)) !== null) {
        out.push({
          patternName: p.name,
          messageId: msg.id,
          matchedSubstring: m[0],
        })
        if (!re.global) break
      }
    }
  }
  return out
}
