import { useEffect, useRef, useState } from "react";

const Select = ({ id, label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="toolbar-group custom-select-wrap" ref={wrapRef}>
      <span className="toolbar-label" id={`${id}-label`}>
        {label}
      </span>
      <div className="custom-select">
        <button
          type="button"
          id={id}
          className="custom-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${id}-label`}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{selected?.label}</span>
          <svg className="custom-select-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {open && (
          <div className="custom-select-menu" role="listbox">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                className={`custom-select-option ${
                  value === option.value ? "custom-select-option-active" : ""
                }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;
