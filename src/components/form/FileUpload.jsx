// src/components/form/FileUpload.jsx
import React from 'react';

function FileUpload({ label, onChange, accept, required = false }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onChange(file || null);
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input type="file" className="form-file" onChange={handleFileChange} accept={accept} />
    </div>
  );
}

export default FileUpload;