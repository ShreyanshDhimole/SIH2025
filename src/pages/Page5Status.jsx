// src/pages/Page5Status.jsx
import React, { useState } from "react";
import { useForm } from "../context/FormContext";
import Input from "../components/form/Input";
import OTPInput from "../components/form/OTPInput";
import { isValidMobile } from "../utils/validators";
import "./Page5Status.css";

function Page5Status() {
  const { state, update, goPrev } = useForm();
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const handleCheckStatus = async () => {
    setError("");
    setStatusResult(null);

    // Validate mobile or application ID
    if (!isValidMobile(state.status_mobile) && !state.application_id?.trim()) {
      setError("Enter a valid mobile number or application ID.");
      return;
    }

    if (!otpVerified) {
      setError("Please verify your mobile number via OTP first.");
      return;
    }

    try {
      setLoading(true);

      await new Promise((r) => setTimeout(r, 900));

      setStatusResult({
        application_id: state.application_id || "APP123456",
        status: "Under Review",
        message:
          "Your application is being reviewed. You will be notified once processed.",
        last_updated: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--status">
      <h2 className="page-title">🔎 Application Status Check</h2>

      <div className="container">
        <div className="full-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="header-deco" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="4" fill="#eef2ff" />
                  <path d="M7 12h10M7 9h6" stroke="#4f46e5" strokeWidth="1.2" />
                </svg>
              </span>
              Status Lookup
            </div>
            <div className="panel-sub">Step 05 · Status</div>
          </div>

          <div className="panel-grid">
            
            {/* Input Card */}
            <div className="panel-card panel-card--wide">
              <div className="card-heading">
                <span className="heading-emoji">📱</span> Verify & Lookup
              </div>

              {/* MOBILE NUMBER VALIDATION */}
              <Input
                label="Mobile Number"
                type="tel"
                value={state.status_mobile || ""}
                onChange={(val) => {
                  const digits = val.replace(/\D/g, "").slice(0, 10);
                  update({ status_mobile: digits });
                  setOtpVerified(false);
                }}
                placeholder="Enter mobile number"
                inputMode="numeric"
                maxLength={10}
                required
              />

              {state.status_mobile &&
                !isValidMobile(state.status_mobile) && (
                  <p className="field-error">Please enter a valid 10-digit mobile number.</p>
                )}

              <OTPInput
                mobile={state.status_mobile}
                onVerified={() => {
                  setOtpVerified(true);
                  setError("");
                }}
                onFailed={() => {
                  setOtpVerified(false);
                  setError("OTP verification failed. Please try again.");
                }}
              />

              <Input
                label="Application ID (optional)"
                value={state.application_id || ""}
                onChange={(val) => update({ application_id: val })}
                placeholder="Enter application ID"
              />

              {error && <div className="form-error">{error}</div>}

              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleCheckStatus}
                  disabled={loading}
                >
                  {loading ? <span className="btn-loading" /> : "Check Status"}
                </button>

                <button className="btn btn-secondary" onClick={goPrev}>
                  Back
                </button>
              </div>
            </div>

            {/* STATUS RESULT CARD */}
            <div className="panel-card panel-card--info">
              <div className="card-heading">
                <span className="heading-emoji">📋</span> Result
              </div>

              {!statusResult && (
                <div className="info-content muted">
                  Enter mobile number → verify OTP → click "Check Status"
                </div>
              )}

              {statusResult && (
                <div className="status-result">
                  <div className="status-row">
                    <div className="status-label">Application ID</div>
                    <div className="status-value">{statusResult.application_id}</div>
                  </div>

                  <div className="status-row">
                    <div className="status-label">Status</div>
                    <div className="status-value status-badge">
                      {statusResult.status}
                    </div>
                  </div>

                  <div className="status-row">
                    <div className="status-label">Message</div>
                    <div className="status-value">{statusResult.message}</div>
                  </div>

                  <div className="status-row">
                    <div className="status-label">Last Updated</div>
                    <div className="status-value">{statusResult.last_updated}</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Page5Status;
