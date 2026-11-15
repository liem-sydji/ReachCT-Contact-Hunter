const STARS = [
  [8, 12], [18, 40], [28, 22], [42, 55], [55, 18],
  [67, 34], [78, 12], [88, 48], [12, 70], [35, 82],
  [60, 66], [82, 78], [48, 30], [72, 58], [22, 50],
];

export default function StarfieldPanel({
  children,
  grid = true,
  className = "",
}) {
  return (
    <div className={`y2k-starfield ${className}`.trim()}>
      <div aria-hidden="true">
        {STARS.map(([x, y], i) => (
          <span
            key={i}
            className="y2k-starfield__star"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${(i % 7) * 0.28}s`,
            }}
          />
        ))}
        {grid && <div className="y2k-starfield__grid" />}
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
