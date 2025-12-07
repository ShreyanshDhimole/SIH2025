// src/components/form/CheckboxGroup.jsx
import React from 'react';

function CheckboxGroup({ label, items, values, onChange }) {
  const handleChange = (key, checked) => {
    onChange({ ...values, [key]: checked });
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="checkbox-group">
        {items.map((item) => (
          <label key={item.key} className="checkbox-label">
            <input
              type="checkbox"
              checked={values[item.key] || false}
              onChange={(e) => handleChange(item.key, e.target.checked)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default CheckboxGroup;