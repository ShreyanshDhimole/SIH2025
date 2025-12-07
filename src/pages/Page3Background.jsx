// src/pages/Page3Background.jsx
import React from "react";
import { useForm } from "../context/FormContext";
import Select from "../components/form/Select";
import MultiSelect from "../components/form/MultiSelect";
import Textarea from "../components/form/Textarea";
import FileUpload from "../components/form/FileUpload";
import Input from "../components/form/Input";
import "./Page3Background.css";

function Page3Background() {
  const { state, update, goNext, goPrev } = useForm();

  const occupationOptions = [
    { value: "agriculture", label: "Agriculture" },
    { value: "daily_wage", label: "Daily Wage Labor" },
    { value: "self_employed", label: "Self Employed" },
    { value: "salaried", label: "Salaried" },
    { value: "other", label: "Other" },
  ];

  const benefitOptions = [
  { value: "ab_pmjAY", label: "Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)" },
  { value: "pm_pension", label: "Pradhan Mantri Pension Yojana" },
  { value: "pm_kisan", label: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)" },
  { value: "pmuy", label: "Pradhan Mantri Ujjwala Yojana (PMUY)" },
  { value: "other", label: "Other Scheme" },
  ];

  const rationCardOptions = [
    { value: "apl", label: "APL" },
    { value: "bpl", label: "BPL" },
    { value: "aay", label: "AAY" },
    { value: "none", label: "None" },
  ];

  const handleSeasonalChange = (val) => {
    update({ seasonal_income: val });

    if (val !== "yes") {
      update({
        peak_month_income: "",
        lowest_month_income: "",
      });
    }
  };

  return (
    <div className="page page--background">
      <h2 className="page-title">📝 Background Information</h2>

      <div className="container">
        <div className="full-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="header-deco" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="#eef6ff" />
                  <path
                    d="M7 12h10M7 8h10"
                    stroke="#0b63ff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Background Details
            </div>
            <div className="panel-sub">Step 03 · Background</div>
          </div>

          <div className="panel-grid">

            {/* Occupation */}
            <div className="panel-card panel-card--span4">
              <div className="card-heading"><span className="heading-emoji">🧑‍💼</span>Occupation</div>

              <Select
                label="Primary Occupation"
                value={state.primary_occupation}
                onChange={(val) => update({ primary_occupation: val })}
                options={occupationOptions}
                placeholder="Select occupation"
                required
              />

              <Select
                label="Is your income seasonal?"
                value={state.seasonal_income}
                onChange={(val) => handleSeasonalChange(val)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                placeholder="Select"
              />
            </div>

            {/* Reason
            <div className="panel-card panel-card--span8 panel-card--tall">
              <div className="card-heading"><span className="heading-emoji">📝</span>Reason</div>

              <Textarea
                label="Reason for Applying"
                value={state.reason_for_applying}
                onChange={(val) => update({ reason_for_applying: val })}
                placeholder="Explain why you are applying for this benefit"
                rows={6}
                required
              />
            </div> */}

            {/* Seasonal income fields (only if yes) */}
            {state.seasonal_income === "yes" && (
              <div className="panel-card panel-card--span4">
                <div className="card-heading"><span className="heading-emoji">📈</span>Income Details (₹)</div>

                <Input
                  label="Peak month income (in Rs)"
                  value={state.peak_month_income}
                  onChange={(val) => {
                    const digits = val.replace(/\D/g, "").slice(0, 12);
                    update({ peak_month_income: digits });
                  }}
                  placeholder="e.g. 25000"
                  inputMode="numeric"
                  maxLength={12}
                />
                <p className="muted" style={{ marginTop: 6 }}>
                  Highest income earned in any month of the year.
                </p>

                <Input
                  label="Lowest month income (in Rs)"
                  value={state.lowest_month_income}
                  onChange={(val) => {
                    const digits = val.replace(/\D/g, "").slice(0, 12);
                    update({ lowest_month_income: digits });
                  }}
                  placeholder="e.g. 5000"
                  inputMode="numeric"
                  maxLength={12}
                />
                <p className="muted" style={{ marginTop: 6 }}>
                  Lowest income earned in any month that year.
                </p>
              </div>
            )}

            {/* Government benefits */}
            <div className="panel-card panel-card--span4">
              <div className="card-heading"><span className="heading-emoji">🎯</span>Government Benefits</div>

              <MultiSelect
                label="Select Government Benefits"
                value={state.gov_benefits || []}
                onChange={(val) => update({ gov_benefits: val })}
                options={benefitOptions}
              />
            </div>

            {/* Ration card type */}
            <div className="panel-card panel-card--span4">
              <div className="card-heading"><span className="heading-emoji">📇</span>Ration Card</div>

              <Select
                label="Ration Card Type"
                value={state.ration_card_type}
                onChange={(val) => update({ ration_card_type: val })}
                options={rationCardOptions}
                placeholder="Select one"
              />
            </div>

            {/* Supporting Documents */}
            <div className="panel-card panel-card--span8">
              <div className="card-heading"><span className="heading-emoji">📤</span>Supporting Government Documents</div>

              <FileUpload
                label="Upload Supporting Govt Documents"
                onChange={(file) => update({ support_documents: file })}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {/* Notes */}
            <div className="panel-card panel-card--span4 panel-card--tall">
              <div className="card-heading"><span className="heading-emoji">💡</span>Notes</div>
              <div className="info-content">
                <p>Attach income certificate, ration card, pension slip etc.</p>
                <p className="muted">Tip: Combine images into a single PDF for faster upload.</p>
              </div>
            </div>

            {/* Extra Attachments */}
            <div className="panel-card panel-card--span8">
              <div className="card-heading"><span className="heading-emoji">📎</span>Additional Attachments</div>

              <FileUpload
                label="Upload any other relevant files"
                onChange={(file) => update({ additional_household_files: file })}
                accept=".zip,.pdf,.jpg,.png"
              />
            </div>
          </div>

          <div className="panel-actions">
            <button className="btn btn-secondary" onClick={goPrev}>Back</button>
            <button className="btn btn-primary" onClick={goNext}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page3Background;
