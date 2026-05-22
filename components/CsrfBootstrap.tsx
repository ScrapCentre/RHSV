"use client"

/**
 * CsrfBootstrap — installs the global CSRF fetch interceptor.
 *
 * `installCsrfFetch()` is called at module-evaluation time (not in a
 * useEffect) so `window.fetch` is patched the instant this client bundle
 * loads — before any user-triggered mutating request can fire. Rendering
 * nothing; this component exists only to pull the install into the tree.
 */

import { installCsrfFetch } from "@/lib/install-csrf-fetch"

installCsrfFetch()

export default function CsrfBootstrap() {
  return null
}
