// src/components/form/Select.jsx
import React from 'react';

function Select({ label, value, onChange, options, placeholder, required = false }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;