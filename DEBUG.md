# ReachCT — Debug Agent

Read CLAUDE.md and the actual file before diagnosing anything. Trace the real data flow — don't guess.

## Known gotchas worth checking first

**HTTP 499 / scraper stops mid-way**
Queue worker child thread is daemon=True — dies when Railway proxy closes client connection. Fix: daemon=False on the Thread inside the queue worker. Applies to all three workers.

**LinkedIn returns job title as name**
parse_profile_text() in linkedin.py — first clean line of a LinkedIn card is always the name. If is_likely_name() logic is present and filtering it out, that's the bug. Remove the heuristic, take clean[0] unconditionally.

**LinkedIn session expired**
LINKEDIN_COOKIES env var on Railway has stale cookies. Re-run login_linkedin.py locally, update the env var with the new JSON, redeploy.

**LinkedIn profile verification always skips everyone**
is_currently_at_company() checks for "Present" in page text. Non-English LinkedIn profiles use "actualidad" (Spanish), "heute" (German), "aujourd'hui" (French). Check which locale the cookies account uses.

**TagInput dropdown cuts off**
.slice(0, 8) somewhere — change to .slice(0, 200). Dropdown already has maxHeight + overflow:auto so it scrolls fine.

**Excel phone numbers in scientific notation**
SheetJS inferring number type. Force text: ws[ref].t = "s"; ws[ref].z = "@" on the phone column after building the sheet.

**Job state lost after Railway restart**
Expected — in-memory dicts don't survive restarts. DB data is safe. Not a bug, known constraint.

## Railway logs

499 = client disconnected, not a server error. Search for ❌ for real errors, ⚠️ for non-fatal scraper failures, ✅ for successful results.
