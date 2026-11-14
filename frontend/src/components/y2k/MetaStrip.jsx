function barcodeBars(seed = "REACHCT") {
  const bars = [];
  for (let i = 0; i < seed.length * 3; i += 1) {
    const code = seed.charCodeAt(i % seed.length) + i;
    const wide = code % 3 === 0;
    bars.push({
      width: wide ? 3 : 1,
      gap: code % 5 === 0,
    });
  }
  return bars;
}

export default function MetaStrip({
  code = "REACH-Y2K-26",
  year = "2026",
  blurb = "Spec sheet // print object // not a SaaS template",
  className = "",
}) {
  const bars = barcodeBars(code);

  return (
    <div className={`y2k-meta ${className}`.trim()} aria-hidden="true">
      <div className="y2k-meta__cell">
        <div className="y2k-meta__barcode">
          {bars.map((b, i) => (
            <span
              key={i}
              style={{
                width: b.width,
                marginRight: b.gap ? 3 : 1,
                opacity: b.gap ? 0 : 1,
              }}
            />
          ))}
        </div>
        <span className="y2k-meta__caps">{code}</span>
      </div>

      <div className="y2k-meta__cell">
        <div className="y2k-meta__swatches">
          <i style={{ background: "var(--paper)" }} />
          <i style={{ background: "var(--ink)" }} />
          <i style={{ background: "var(--pink)" }} />
          <i style={{ background: "var(--orange)" }} />
          <i style={{ background: "var(--cobalt)" }} />
          <i style={{ background: "var(--mint)" }} />
        </div>
        <span className="y2k-meta__caps">Swatch row</span>
      </div>

      <div className="y2k-meta__cell">
        <p className="y2k-meta__caps" style={{ margin: 0 }}>{blurb}</p>
      </div>

      <div className="y2k-meta__cell">
        <div className="y2k-meta__arrows">▶▶▶▶</div>
        <span className="y2k-meta__caps">Signal lock</span>
      </div>

      <div className="y2k-meta__cell">
        <div className="y2k-meta__year">{year}</div>
        <span className="y2k-meta__caps">Edition</span>
      </div>
    </div>
  );
}
