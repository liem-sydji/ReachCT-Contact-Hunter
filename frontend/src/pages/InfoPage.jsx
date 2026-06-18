import { InnerHeader } from "../components/shared.jsx";

const SECTIONS = [
  {
    title: "What is ReachCT?",
    content: "ReachCT is an internal B2B contact intelligence tool. It automatically searches Google Maps for companies in any city and country, visits their websites to extract emails and phone numbers, and stores everything in a shared database. Instead of spending hours researching companies manually, ReachCT does it in minutes — giving your team a ready-to-use contact list for outreach.",
  },
  {
    title: "How to make a search",
    steps: [
      "Click Start New Search from the home screen.",
      "Select a Business Type from the dropdown — e.g. Marketing Agency, IT Company.",
      "Type the City and Country in English — e.g. Madrid, Spain (not España).",
      "Set the Start and End index. Start at 0 and End at 25 for your first search — we recommend keeping searches to 25 listings at a time to avoid overloading the server and keep queue wait times short for other users. The tool supports up to 50 listings in a single search. For larger datasets, run searches in batches (0–25, then 25–50).",
      "Click Search. ReachCT scrolls Google Maps, visits each company website, and extracts contact details automatically.",
      "Once done, your results appear in a table. Export to Excel or Copy Table to paste into Google Sheets.",
    ],
  },
  {
    title: "How to pull from database",
    steps: [
      "Click Pull From Database from the home screen.",
      "Filter by Company Type, Country, and/or City using the dropdowns. All filters are optional — leave them empty to see everything.",
      "Click Pull Data to retrieve matching companies from the database.",
      "Export to Excel or Copy Table to use the data in your outreach.",
    ],
  },
  {
    title: "What if my search takes too long?",
    content: "If another team member is already running a search, yours will be queued — you'll see a message telling you your queue position. This is normal. Your search starts automatically once the previous one finishes. Don't close the tab or refresh while waiting. All results save to the shared database automatically, so even if you close the tab after the search completes, the data is never lost and can be retrieved from Pull From Database.",
  },
];

export default function InfoPage() {
  return (
    <div className="inner-page">
      <InnerHeader title="How to use ReachCT" />
      <div className="info-wrap">
        {SECTIONS.map((s, i) => (
          <div key={i} className="info-section">
            <div className="info-head">
              <div className="info-num">{i + 1}</div>
              <h2 className="info-title">{s.title}</h2>
            </div>
            {s.content && <p className="info-body">{s.content}</p>}
            {s.steps && (
              <div className="info-body">
                <ol>{s.steps.map((step, j) => <li key={j}>{step}</li>)}</ol>
              </div>
            )}
            {i < SECTIONS.length - 1 && <div className="info-divider" />}
          </div>
        ))}
      </div>
    </div>
  );
}
