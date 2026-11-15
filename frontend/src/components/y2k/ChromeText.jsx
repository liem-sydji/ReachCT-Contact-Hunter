export default function ChromeText({ children, className = "", style, as: Tag = "span" }) {
  return (
    <Tag className={`y2k-chrome ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
