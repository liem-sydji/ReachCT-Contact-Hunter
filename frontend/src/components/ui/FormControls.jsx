/** Cream fill, chunky ink outline, marigold focus ring. */

export function TextInput({ label, id, className = "", ...rest }) {
  const inputId = id || rest.name;
  return (
    <label className={`gh-field ${className}`} htmlFor={inputId}>
      {label && <span className="gh-field__label">{label}</span>}
      <input id={inputId} className="gh-input" {...rest} />
    </label>
  );
}

export function SelectInput({ label, id, children, className = "", ...rest }) {
  const inputId = id || rest.name;
  return (
    <label className={`gh-field ${className}`} htmlFor={inputId}>
      {label && <span className="gh-field__label">{label}</span>}
      <select id={inputId} className="gh-input gh-select" {...rest}>
        {children}
      </select>
    </label>
  );
}

export function Checkbox({ label, id, className = "", ...rest }) {
  const inputId = id || rest.name;
  return (
    <label className={`gh-check ${className}`} htmlFor={inputId}>
      <input id={inputId} type="checkbox" className="gh-check__input" {...rest} />
      <span className="gh-check__box" aria-hidden="true" />
      {label && <span className="gh-check__label">{label}</span>}
    </label>
  );
}

/** Toggle knob styled like a tiny gauge. */
export function Toggle({ label, id, checked, onChange, className = "", ...rest }) {
  const inputId = id || rest.name;
  return (
    <label className={`gh-toggle ${className}`} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className="gh-toggle__input"
        checked={checked}
        onChange={onChange}
        role="switch"
        {...rest}
      />
      <span className="gh-toggle__track" aria-hidden="true">
        <span className="gh-toggle__knob">
          <span className="gh-toggle__needle" />
        </span>
      </span>
      {label && <span className="gh-toggle__label">{label}</span>}
    </label>
  );
}
