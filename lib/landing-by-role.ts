// Single source of truth for post-login landing pages keyed by NextAuth role.
// Imported by `/post-login` (the dispatcher), `/login`, and `/rvsf` so that
// an already-authenticated user who visits a login surface is sent to the
// same destination they'd reach after a fresh sign-in.

export const LANDING_BY_ROLE: Record<string, string> = {
    admin:           "/admin",
    executive:       "/admin",                  // exec uses same admin shell for now
    client:          "/me",
    rvsf_admin:      "/rvsf/marketplace",
    rvsf_executive:  "/rvsf/marketplace",
    partner:         "/rvsf/marketplace",       // legacy alias for rvsf_*
    // The "rvsf" role is created exclusively by Novalytix's /rvsf_leads
    // buy-flow (POST /api/rvsf/purchase). Those records live in the legacy
    // RVSFUser collection without a linkedRvsfId, so they can't use the v2
    // /rvsf/marketplace path (which requires a CC under their RVSF). Send
    // them to the Novalytix-built dashboard instead — that's what they paid
    // for. The dashboard strict-equals `role === "rvsf"` and queries the
    // legacy `purchasedStates` array on RVSFUser, so the routing here and
    // the page guard there agree.
    rvsf:            "/rvsf_leads/dashboard",
    // v2 CC operator dashboard — the Novalytix `/scrapcentre/dashboard` page
    // strict-equals `role === "scrapcentre"` and queries legacy collections
    // (B2BPickup/Valuation/etc.), so cc_operator users would bounce. v2 ships
    // a parallel `/cc/dashboard` keyed on the unified Lead model + linkedCcId.
    cc_operator:     "/cc/dashboard",
    scrapcentre:     "/scrapcentre/dashboard",  // legacy alias — keeps Novalytix flow alive
}

/**
 * Resolve the landing path for a given session role.
 * Falls back to `/` if the role is unknown / missing.
 */
export function landingForRole(role: string | null | undefined): string {
    if (!role) return "/"
    return LANDING_BY_ROLE[role] ?? "/"
}

/**
 * True when the role belongs to the RVSF tenant (admin, executive, or a
 * legacy "partner" / "rvsf" alias). Used by `/rvsf` to decide whether an
 * already-authenticated visitor should skip the login form.
 */
export function isRvsfRole(role: string | null | undefined): boolean {
    return (
        role === "rvsf_admin" ||
        role === "rvsf_executive" ||
        role === "partner" ||
        role === "rvsf"
    )
}
