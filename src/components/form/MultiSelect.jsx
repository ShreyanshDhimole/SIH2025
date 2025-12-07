// src/components/form/MultiSelect.jsx
import React from 'react';

function MultiSelect({ label, value, onChange, options, required = false }) {
  const handleToggle = (optValue) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="multi-select">
        {options.map((opt) => (
          <label key={opt.value} className="checkbox-label">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => handleToggle(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default MultiSelect;