// src/pages/Page0LoanType.jsx
import React, { useState } from "react";
import { useForm } from "../context/FormContext";
import "./Page0LoanType.css";

function Page0LoanType({ goNext }) {
  // useForm gives state + update; if your router uses its own goNext, pass it as prop.
  const { state, update } = useForm();
  const [selected, setSelected] = useState(state.loan_type || "");

  const handleSelect = (val) => {
    setSelected(val);
    update({ loan_type: val });
  };

  const handleContinue = () => {
    if (!selected) return; // no-op; button disabled in UI
    // If Student Loan -> go to Eligibility (Page 1)
    // If Business Loan -> you might route to Page 1 too or a different flow
    // We'll call goNext() to step forward to whatever page sequence you have set.
    if (typeof goNext === "function") goNext();
  };

  return (
    <div className="page page--loan-type">
      <h2 className="page-title">Choose Loan Type</h2>

      <div className="container container--wide">
        <div className="full-panel small-panel">
          <div className="panel-header">
            <div className="panel-title">Which loan do you want to apply for?</div>
            <div className="panel-sub">Step 0 · Loan Type</div>
          </div>

          <div className="loan-options">
            <button
              type="button"
              className={`loan-card ${selected === "student" ? "loan-card--active" : ""}`}
              onClick={() => handleSelect("student")}
            >
              <div className="loan-emoji">🎓</div>
              <div className="loan-label">Student Loan</div>
              <div className="loan-desc">Support for tuition, books and education expenses.</div>
            </button>

            <button
              type="button"
              className={`loan-card ${selected === "business" ? "loan-card--active" : ""}`}
              onClick={() => handleSelect("business")}
            >
              <div className="loan-emoji">🏢</div>
              <div className="loan-label">Business Loan</div>
              <div className="loan-desc">Working capital, inventory and business growth support.</div>
            </button>
          </div>

          <div className="panel-actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                // If you have a previous navigation, call it. Otherwise do nothing.
                if (typeof goNext === "function") {
                  /* no-op: there's no prev from page 0 */
                }
              }}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              type="button"
              onClick={handleContinue}
              disabled={!selected}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page0LoanType;
