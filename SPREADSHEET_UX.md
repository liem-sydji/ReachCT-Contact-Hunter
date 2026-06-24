# ReachCT — Spreadsheet UX Overhaul

## The goal

The database view (SpreadsheetPage.jsx) should feel indistinguishable from Excel or Google Sheets. Right now it looks like a React table that someone added editing to. It needs to feel like a native spreadsheet that happens to live in a browser.

## Current problems to fix without being asked

**Column ordering is wrong.**
Columns are derived dynamically from the order keys appear in the JSONB data field. This means "city" often ends up first because of insertion order. Enforce a canonical column order for known DB kinds:

Maps: `name → email → phone → website → city → country → company_type`
LinkedIn: `full_name → job_title → profile_title → company → email → linkedin_url → location`

Unknown columns go after the known ones. Never let insertion order dictate what the user sees first.

**The spreadsheet doesn't feel like a spreadsheet.**
Real spreadsheets have: frozen row numbers, frozen column headers, selected cell highlight, keyboard navigation between cells (Tab, Enter, arrow keys), visible grid lines on every cell, column resize by dragging the header border, row height consistency. Most of these are missing or incomplete.

**Cell editing is clunky.**
Click once to select, click again to edit is the Excel pattern. Currently a single click goes straight to edit mode which feels jumpy. Selected state (blue highlight, no cursor) should be the first click. Double-click or just starting to type should enter edit mode.

**No column width control.**
All columns are a fixed 180px. Name columns need more space, status columns need less. Users should be able to drag column header borders to resize — exactly like Excel.

**Row numbers column is too narrow and the delete button is hidden.**
The × delete button appearing on hover is good. But the row number gutter should be wider (at least 48px), and the hover state should highlight the entire row number gutter pink, not just show a tiny ×.

**No frozen first column.**
On wide tables (LinkedIn has 7 columns) the name column scrolls off screen. The first data column should be sticky/frozen like Excel freezes pane A.

**Empty rows feel disconnected.**
The 50 empty rows below data are the right idea but they need to match the exact same row height and grid lines as data rows so it genuinely looks like an empty spreadsheet, not a table with placeholder rows bolted on.

**No visual indication of unsaved changes.**
When a cell is edited and blurred, it saves via API. If the save fails silently, the user has no idea. Edited cells should briefly flash green on successful save, red on failure.

**The top bar doesn't show enough context.**
Just the db name and row count. Should also show: column count, last updated time if available, and the kind badge (Maps / LinkedIn) as a small pill.

**Add column UX is buried.**
The "+ Column" button is hidden in the header of an empty column to the right. It should be more discoverable — either a persistent button in the toolbar or a clearer affordance.

**No row selection for bulk delete.**
Users can only delete rows one at a time. A checkbox column (or click-to-select row numbers like Excel) with a bulk delete action would save a lot of time when cleaning data.

**Ctrl+Z undo is missing.**
Every real spreadsheet has it. At minimum, undoing the last cell edit before navigating away should work.

## The standard to meet

Open Excel or Google Sheets. Every interaction you take for granted there — clicking a cell, tabbing to the next, resizing a column, selecting a range, copying a block — should work the same way here. If a user coming from Excel has to relearn anything, that's a UX failure.

Don't add features Excel doesn't have. Don't remove features that are already working. Focus entirely on making what exists feel native and polished.

## Implementation notes

- Column order: derive columns in fetchAll() using a priority list, not just Object.keys() order
- Cell selection model: track `selectedCell` (single) separately from `editCell`. Click = select, double-click or keypress = edit
- Column resize: onMouseDown on the right edge of a `<th>`, track mousemove delta, update column widths in a local widths state object
- Keyboard nav: onKeyDown on the edit input — Tab moves right, Shift+Tab moves left, Enter moves down, Escape cancels edit
- Frozen first column: `position: sticky, left: COL_WIDTH_0` on the first data `<td>` and `<th>`, same z-index pattern as the row number column
- Save feedback: after the PATCH resolves, briefly set a `savedCell` state that triggers a green background transition on that cell
- Row selection: replace the row number `<td>` click handler with a toggle that adds the row id to a `selectedRows` Set, show a "Delete X rows" button in the toolbar when selection is non-empty
