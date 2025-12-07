// src/components/form/Textarea.jsx
import React from 'react';

function Textarea({ label, value, onChange, placeholder, rows = 4, required = false }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <textarea
        className="form-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

export default Textarea;