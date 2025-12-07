// src/pages/Page2Personal.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "../context/FormContext";
import Input from "../components/form/Input";
import Textarea from "../components/form/Textarea";
import FileUpload from "../components/form/FileUpload";
import OTPInput from "../components/form/OTPInput";
import { isValidAadhaar, isValidMobile, isValidPin } from "../utils/validators";
import "./Page2Personal.css";

function Page2Personal() {
  const {
    state,
    setField,
    goNext,
    goPrev,
    canProceedPersonal,
    layoutConfig,
    errors,
    validatePersonal,
  } = useForm();

  const [selfiePreview, setSelfiePreview] = useState(null);

  /* ------------------ Selfie Preview Handler ------------------ */
  useEffect(() => {
    if (state.selfie && typeof state.selfie !== "string") {
      const url = URL.createObjectURL(state.selfie);
      setSelfiePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (state.selfie && typeof state.selfie === "string") {
      setSelfiePreview(state.selfie);
      return;
    }
    setSelfiePreview(null);
  }, [state.selfie]);

  const handleSelfieChange = (file) => {
    setField("selfie", file);
  };

  const handleObcCertChange = (file) => {
    setField("obc_certificate", file);
  };

  return (
    <div className="page page--personal">
      <h2 className="page-title">👤 Personal Information</h2>

      <div className={layoutConfig?.containerClass ?? "container"}>
        <div className="full-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="header-deco" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="4" fill="#fff7ed" />
                  <path
                    d="M8 12h8M8 9h8"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Fill your Details
            </div>
            <div className="panel-sub">Step 02 · Personal Information</div>
          </div>

          {/* ------------------ GRID START ------------------ */}
          <div className="panel-grid">
            
            {/* ------------ Card 1: Identity + Mobile + OTP ------------ */}
            <div className="panel-card">
              <div className="card-heading">
                <span className="heading-emoji">👤</span> Identity
              </div>

              {/* Full Name */}
              <Input
                label="Full Name"
                value={state.full_name}
                onChange={(val) => setField("full_name", val)}
                placeholder="Enter your full name"
                required
              />
              {errors.full_name && <p className="field-error">{errors.full_name}</p>}

              {/* Mobile Number */}
              <Input
                label="Mobile Number"
                type="tel"
                value={state.mobile_number}
                onChange={(val) => {
                  const digits = val.replace(/\D/g, "").slice(0, 10);
                  setField("mobile_number", digits);
                }}
                placeholder="Enter mobile number"
                inputMode="numeric"
                maxLength={10}
                required
              />
              {/* Live Validation */}
              {state.mobile_number &&
                !isValidMobile(state.mobile_number) && (
                  <p className="field-error">Enter a valid 10-digit mobile number.</p>
                )}

              <OTPInput
                mobile={state.mobile_number}
                onVerified={() => setField("status_otp", "verified")}
              />
            </div>

            {/* ------------ Card 2: Address ------------ */}
            <div className="panel-card">
              <div className="card-heading">
                <span className="heading-emoji">🏠</span> Address
              </div>

              {/* Address */}
              <Textarea
                label="Address"
                value={state.address}
                onChange={(val) => setField("address", val)}
                placeholder="Enter your address"
                required
              />
              {errors.address && <p className="field-error">{errors.address}</p>}

              <div className="two-cols">
                {/* PIN */}
                <div>
                  <Input
                    label="PIN Code"
                    value={state.pin}
                    onChange={(val) => {
                      const digits = val.replace(/\D/g, "").slice(0, 6);
                      setField("pin", digits);
                    }}
                    placeholder="6-digit PIN"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                  {state.pin && !isValidPin(state.pin) && (
                    <p className="field-error">PIN must be 6 digits.</p>
                  )}
                </div>

                {/* Aadhaar */}
                <div>
                  <Input
                    label="Aadhaar Number"
                    value={state.aadhaar_number}
                    onChange={(val) => {
                      const digits = val.replace(/\D/g, "").slice(0, 12);
                      setField("aadhaar_number", digits);
                    }}
                    placeholder="12-digit Aadhaar"
                    inputMode="numeric"
                    maxLength={12}
                    required
                  />
                  {state.aadhaar_number &&
                    !isValidAadhaar(state.aadhaar_number) && (
                      <p className="field-error">Aadhaar must be 12 digits.</p>
                    )}
                </div>
              </div>
            </div>

            {/* ------------ Card 3: Selfie Upload & OBC Certificate ------------ */}
            <div className="panel-card panel-card--wide">
              <div className="card-heading">
                <span className="heading-emoji">📸</span> Upload
              </div>

              <FileUpload
                label="Upload Selfie"
                onChange={handleSelfieChange}
                accept="image/*"
                required
              />
              {errors.selfie && <p className="field-error">{errors.selfie}</p>}

              {selfiePreview && (
                <div className="selfie-preview">
                  <p className="muted">Preview</p>
                  <img src={selfiePreview} alt="preview" className="selfie-img" />
                </div>
              )}

              <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #eef2f7" }} />

              <div style={{ marginTop: 8 }}>
                <label className="input-label" style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Upload OBC Caste Certificate 
                  
                </label>
                <FileUpload
                  label="OBC Caste Certificate"
                  onChange={handleObcCertChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {errors.obc_certificate && <p className="field-error">{errors.obc_certificate}</p>}
                <p className="muted" style={{ marginTop: 8 }}>
                  If you belong to OBC, please upload the caste certificate to avail this scheme.
                </p>
              </div>
            </div>

            {/* ------------ Card 4: Notes ------------ */}
            <div className="panel-card panel-card--info">
              <div className="card-heading">
                <span className="heading-emoji">💡</span> Important
              </div>
              <div className="info-content">
                Please ensure your Aadhaar and mobile match your documents.  
                Your selfie should be clear and recent.
              </div>
            </div>

          </div>
          {/* ------------------ GRID END ------------------ */}

          <div className="panel-actions">
            <button className="btn btn-secondary" onClick={goPrev}>Back</button>
            <button
              className="btn btn-primary"
              onClick={() => goNext(validatePersonal)}
              disabled={!canProceedPersonal}
            >
              Next
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Page2Personal;
