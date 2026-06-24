# ReachCT — UX Agent

Read CLAUDE.md and the relevant page files before changing anything. The design language is consistent — understand it before extending it.

## The design language

#E8005A pink is the brand. Syne for headings, DM Sans for body, all inline styles. Cards at 16px border radius, inputs at 10px, buttons at 7-8px. Dense — this is a data tool, not a marketing page.

## What the current UX is optimised for

- **Data workers** who run searches repeatedly and want fast feedback
- **Queue transparency** — users need to know their job is running, not frozen
- **Copy-friendliness** — everything that can be copied easily should be
- **Progressive disclosure** — don't show actions until they're relevant (Add to Database only when there are results, Stop only when loading, etc.)

## Non-obvious things

The Mailmeteor banner sits at the **bottom** of LinkedIn results, not the top. Users should see the data first, then the workflow instructions. Moving it back to the top degrades the experience.

The LinkedIn URL cell uses click-to-copy with a fade "✓ copied" confirmation rather than a button — keeps the table clean and the interaction feels natural once you know it's there.

Save button on LinkedIn rows turns green and locks after saving — if you edit the email after saving, _saved resets to false so they have to save again. This prevents stale data in the DB.

Add to Database only appears on LinkedIn results once at least one row is saved, and shows the count. Sending unsaved rows to the DB defeats the manual verification workflow.

## Feel free to improve on anything

The current patterns are good but not sacred. If you see a better way to handle queue feedback, result display, or workflow guidance — propose it. The goal is a tool people enjoy using, not pixel-perfect consistency with what already exists.
