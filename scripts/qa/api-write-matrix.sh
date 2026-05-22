#!/usr/bin/env bash
#
# api-write-matrix.sh — exercise every mutating /api endpoint across all roles
# and CSRF states, emitting a TSV matrix to stdout.
#
# Built by the "API Write-Matrix Auditor" pass (2026-05-22). Companion to
# RHSV-docs/v2-qa-api-matrix-2026-05-22.md.
#
# WHAT IT DOES
#   For each mutating endpoint it issues, per role:
#     - WITHOUT CSRF token  -> expect 403 "CSRF token invalid or missing"
#     - WITH a BAD token    -> expect 403
#     - WITH a good token   -> expect 2xx / 4xx (validation), proving the gate opens
#   Plus cross-role probes (wrong role -> 401/403) and malformed-body probes.
#
# USAGE
#   BASE=https://scrapcentre.online ./scripts/qa/api-write-matrix.sh           # full run
#   BASE=https://scrapcentre.online ./scripts/qa/api-write-matrix.sh --quick   # CSRF/role probes only
#
# REQUIREMENTS
#   - curl, sed   (POSIX; runs on macOS bash 3.2)
#   - The 5 demo logins below must exist (password env PW, default below).
#   - Re-seed demo leads first for stable IDs:
#       ssh scrap@192.168.0.211 'cd /opt/scrapcentre && sudo -u scrap bash -lc \
#         "set -a && source .env.local && set +a && ALLOW_PROD_SEED=1 npx tsx scripts/seed-demo-leads.ts"'
#
# NOTE ON CSRF MODEL
#   NextAuth issues the token in the JSON body of GET /api/auth/csrf AND as the
#   httpOnly cookie __Host-next-auth.csrf-token (value: <token>%7C<hmac>).
#   lib/middleware/csrf.ts validates the X-CSRF-Token header against the cookie
#   half. curl's cookie jar carries the cookie automatically; we read the token
#   from the JSON body and echo it in the header — the double-submit pair.
#
set -u
export PATH=/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin:${PATH:-}

BASE="${BASE:-https://scrapcentre.online}"
PW="${PW:-NovalytixTest2026!}"
QUICK=0
[ "${1:-}" = "--quick" ] && QUICK=1

D="$(mktemp -d /tmp/api-write-matrix.XXXXXX)"
trap 'rm -rf "$D"' EXIT

# ---- demo logins -----------------------------------------------------------
# role | provider | field | identifier
LOGINS="
admin|credentials|email|admin.test@scrapcentre.online
client|credentials|email|client.test@scrapcentre.online
exec|credentials|email|exec.test@scrapcentre.online
partner|rvsf-credentials|rvsfId|partner.test@scrapcentre.online
centre|scrapcentre-credentials|email|centre.test@scrapcentre.online
"

jar_for() { echo "$D/cj_$1.txt"; }

csrf_for() {
  curl -s -c "$1" -b "$1" "$BASE/api/auth/csrf" \
    | sed -E 's/.*"csrfToken":"([^"]+)".*/\1/'
}

login() {
  local role="$1" provider="$2" field="$3" ident="$4"
  local jar; jar="$(jar_for "$role")"
  : > "$jar"
  local tok; tok="$(csrf_for "$jar")"
  curl -s -o /dev/null -c "$jar" -b "$jar" \
    -X POST "$BASE/api/auth/callback/${provider}?json=true" \
    --data-urlencode "${field}=${ident}" \
    --data-urlencode "password=${PW}" \
    --data-urlencode "csrfToken=${tok}" \
    --data-urlencode "json=true"
  local sess; sess="$(curl -s -b "$jar" "$BASE/api/auth/session")"
  case "$sess" in
    *'"role"'*) echo "[login] $role OK" >&2 ;;
    *)          echo "[login] $role FAILED: $sess" >&2 ;;
  esac
}

# req <method> <path> <role> <csrf:yes|no|bad> [json-body|EMPTY] [content-type]
req() {
  local method="$1" path="$2" role="$3" csrf="$4" body="${5:-EMPTY}" ct="${6:-application/json}"
  local jar; jar="$(jar_for "$role")"
  [ "$role" = "anon" ] && { jar="$D/cj_anon.txt"; : > "$jar"; }
  local args=(-s -o "$D/_b.txt" -w "%{http_code}" -X "$method" -b "$jar")
  if [ "$csrf" = "yes" ]; then
    args+=(-H "X-CSRF-Token: $(csrf_for "$jar")")
  elif [ "$csrf" = "bad" ]; then
    args+=(-H "X-CSRF-Token: deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef")
  fi
  if [ -n "$body" ] && [ "$body" != "EMPTY" ]; then
    args+=(--data-binary "$body" -H "Content-Type: $ct")
  fi
  local code snip
  code="$(curl "${args[@]}" "$BASE$path")"
  snip="$(head -c 150 "$D/_b.txt" | tr '\n\t' '  ' | tr -d '\r')"
  printf "%s\t%s\t%s\t%s\t%s\t%s\n" "$method" "$path" "$role" "$csrf" "$code" "$snip"
}

# ---- authenticate ----------------------------------------------------------
echo "## Logging in 5 demo roles against $BASE" >&2
echo "$LOGINS" | while IFS='|' read -r role provider field ident; do
  [ -z "$role" ] && continue
  login "$role" "$provider" "$field" "$ident"
done
echo "" >&2

# ---- demo IDs (re-seed first; update if seed output changes) ----------------
LEAD_A="6a0ff620a901fd5c89185f5e"   # marketplace, unlock-ready
LEAD_B="6a0ff621a901fd5c89185f61"   # unlocked, active chat, open offer
UNLOCK_C="6a0ff63081e11d95763a19f7" # Lead C unlock (refund pending)
BADID="000000000000000000000000"    # syntactically valid, nonexistent

echo -e "METHOD\tPATH\tROLE\tCSRF\tHTTP\tSNIPPET"

# ===========================================================================
# 1. CSRF-GATED ADMIN ROUTES  (withAuth or explicit requireCsrf)
#    Expect: no/bad -> 403 CSRF ; yes -> 2xx/4xx
# ===========================================================================
for c in no bad yes; do req PATCH  /api/admin/settings                       admin "$c" '{}'; done
for c in no yes;     do req POST   /api/admin/mock-config                    admin "$c" '{}'; done
for c in no yes;     do req POST   /api/admin/reseed-demo                     admin "$c" '{}'; done
for c in no yes;     do req POST   /api/admin/triage/alerts                   admin "$c" '{}'; done
for c in no yes;     do req PATCH  "/api/admin/triage/alerts/$BADID"          admin "$c" '{"status":"approved"}'; done
for c in no yes;     do req POST   /api/admin/executives                      admin "$c" '{"name":"QA","email":"qa@x.com","phone":"9000000001","password":"Test123456"}'; done
for c in no yes;     do req DELETE "/api/admin/executives/$BADID"             admin "$c"; done
for c in no yes;     do req POST   /api/admin/scrap-center-users              admin "$c" '{}'; done
for c in no yes;     do req DELETE "/api/admin/scrap-center-users/$BADID"     admin "$c"; done
for c in no yes;     do req POST   /api/admin/rvsf-generator                  admin "$c" '{}'; done
for c in no yes;     do req DELETE "/api/admin/rvsf-generator/$BADID"         admin "$c"; done
for c in no yes;     do req POST   /api/admin/requests/approve                admin "$c" '{}'; done
for c in no yes;     do req DELETE /api/admin/requests/delete                 admin "$c"; done
for c in no yes;     do req PATCH  "/api/admin/bulk-outsourcing/$BADID"       admin "$c" '{"status":"approved"}'; done
for c in no yes;     do req DELETE "/api/admin/bulk-outsourcing/$BADID"       admin "$c"; done
for ep in approve reject request-info; do
  for c in no yes;   do req POST   "/api/admin/rvsfs/$BADID/$ep"              admin "$c" '{}'; done
done
for c in no yes;     do req POST   "/api/admin/refund-review/$UNLOCK_C/decide" admin "$c" '{}'; done

# CSRF-gated, session-based (explicit requireCsrf added 2026-05-22)
for c in no bad yes; do req PATCH  "/api/admin/contact/$BADID"               admin "$c" '{"status":"reviewed"}'; done
for c in no bad yes; do req POST   /api/settings/scrapRates                  admin "$c" '{"scrapPricePerKg":25,"pickupChargePerKm":5,"rvsfLeadPrice":499}'; done
for c in no bad yes; do req POST   /api/triage/decide                        admin "$c" "{\"leadStateId\":\"$BADID\",\"decision\":\"marketplace\"}"; done

# ===========================================================================
# 2. CSRF-GATED RVSF / CLIENT / CC ROUTES  (withAuth)
# ===========================================================================
for c in no yes;     do req POST   "/api/leads/$LEAD_A/unlock"                partner "$c" '{}'; done
for c in no yes;     do req POST   "/api/leads/$LEAD_B/reveal-customer-number" partner "$c" '{}'; done
for c in no yes;     do req POST   "/api/leads/$LEAD_B/reject"                partner "$c" '{"reason":"customer_unreachable","reasonNote":"qa probe test"}'; done
for c in no yes;     do req POST   /api/rvsf/ccs                              partner "$c" '{}'; done
for c in no yes;     do req POST   "/api/chat/threads/$LEAD_B/messages"       partner "$c" '{"text":"qa"}'; done
for ep in accept counter reject; do
  for c in no yes;   do req POST   "/api/chat/offers/$BADID/$ep"              partner "$c" '{"amount":5000}'; done
done
for c in no yes;     do req POST   "/api/cc/leads/$BADID/accept"              centre  "$c" '{}'; done
for c in no yes;     do req POST   /api/cc/change-password                    centre  "$c" '{}'; done
for c in no yes;     do req POST   "/api/digielv/checklist/$BADID"            client  "$c" '{}'; done

# ===========================================================================
# 3. ROLE-GATE CROSS CHECKS  (good CSRF, WRONG role -> expect 401/403)
# ===========================================================================
req POST   /api/settings/scrapRates           client  yes '{"scrapPricePerKg":25}'
req PATCH  "/api/admin/contact/$BADID"        exec    yes '{"status":"reviewed"}'
req POST   /api/triage/decide                 client  yes "{\"leadStateId\":\"$BADID\",\"decision\":\"marketplace\"}"
req POST   "/api/leads/$LEAD_A/unlock"        client  yes '{}'
req POST   /api/rvsf/ccs                      client  yes '{}'
req POST   /api/cc/change-password            admin   yes '{}'
req POST   "/api/admin/rvsfs/$BADID/approve"  client  yes '{}'

# ===========================================================================
# 4. ZERO-AUTH ENDPOINTS  (no session, no CSRF — should they be open?)
#    b2b-register / b2b-partner: KNOWN GAP — anon reaches the mutating handler.
# ===========================================================================
req POST   /api/b2b-register                            anon no '{}'
req PATCH  "/api/b2b-register?id=$BADID"                 anon no '{"status":"approved"}'
req DELETE "/api/b2b-register?id=$BADID"                 anon no
req POST   /api/b2b-partner                             anon no '{}'

# ===========================================================================
# 5. ANONYMOUS PUBLIC FUNNEL  (lead creation; no session expected)
# ===========================================================================
req POST   /api/contact          anon no '{}'
req POST   /api/register         anon no '{}'
req POST   /api/calc/tier1       anon no '{}'
req POST   /api/car-price        anon no '{}'
req POST   /api/vehicle-lookup   anon no '{}'
req POST   /api/otp/issue        anon no '{}'
req POST   /api/otp/verify       anon no '{}'
req POST   /api/rvsf/apply       anon no '{}'
req POST   /api/rvsf/purchase    anon no '{}'
req POST   /api/sell-vehicle     anon no '{}'
req POST   /api/buy-vehicle      anon no '{}'
req POST   /api/exchange-vehicle anon no '{}'
req POST   /api/valuation        anon no '{}'
req POST   /api/wizard-lead      anon no '{}'

# ===========================================================================
# 6. CRON + WEBHOOK  (secret/HMAC-gated; anon must be rejected)
# ===========================================================================
for ep in dsc-nudge offer-expiry stale-leads weight-trueup payment-reconcile \
          notification-flush refresh-urls revive-queue ping-pong-flag; do
  req POST "/api/cron/$ep" anon no
done
req POST /api/payments/razorpay/webhook anon no '{}'

if [ "$QUICK" -eq 1 ]; then exit 0; fi

# ===========================================================================
# 7. MALFORMED-BODY PROBES  (non-JSON body -> should be 400, NOT 500)
# ===========================================================================
MALFORMED='not json at all <<<'
req POST  /api/contact          anon  no  "$MALFORMED"
req POST  /api/register         anon  no  "$MALFORMED"
req POST  /api/calc/tier1       anon  no  "$MALFORMED"
req POST  /api/wizard-lead      anon  no  "$MALFORMED"
req POST  /api/sell-vehicle     anon  no  "$MALFORMED"
req POST  /api/buy-vehicle      anon  no  "$MALFORMED"
req POST  /api/b2b-register     anon  no  "$MALFORMED"
req PATCH /api/admin/settings   admin yes "$MALFORMED"
req POST  /api/triage/decide    admin yes "$MALFORMED"

# ===========================================================================
# 8. MALFORMED-OBJECTID PROBES  ([id] routes -> should be 400, NOT 500 CastError)
# ===========================================================================
req POST  /api/chat/offers/notanobjectid/accept              partner yes '{"amount":5000}'
req POST  /api/chat/offers/notanobjectid/reject              partner yes '{"amount":5000}'
req POST  /api/leads/notanobjectid/reveal-customer-number    partner yes '{}'
req PATCH /api/admin/contact/notanobjectid                   admin   yes '{"status":"reviewed"}'
req POST  /api/cc/leads/notanobjectid/accept                 centre  yes '{}'

echo "## done" >&2
