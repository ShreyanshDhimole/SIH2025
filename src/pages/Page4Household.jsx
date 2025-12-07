// src/pages/Page4Household.jsx
import React from "react";
import { useForm } from "../context/FormContext";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import CheckboxGroup from "../components/form/CheckboxGroup";
import FileUpload from "../components/form/FileUpload";
import "./Page4Household.css";

function Page4Household() {
  const { state, update, goNext, goPrev } = useForm();

  const schoolTypeOptions = [
    { value: "government", label: "Government School" },
    { value: "private", label: "Private School" },
    { value: "not_in_school", label: "Not in School" },
  ];

  // Top-level cooking fuel choices (LPG or Solid)
  const cookingFuelOptions = [
    { value: "lpg", label: "LPG" },
    { value: "solid", label: "Solid fuel (Coal / Wood)" },
    { value: "other", label: "Other" },
  ];

  const houseTypeOptions = [
    { value: "kutcha", label: "Kutcha" },
    { value: "pakka", label: "Pakka" },
  ];

  const assetItems = [
    { key: "ac", label: "Air Conditioner" },
    { key: "fridge", label: "Refrigerator" },
    { key: "car", label: "Car" },
    { key: "two_wheeler", label: "Two Wheeler" },
    { key: "tv", label: "Television" },
    { key: "smartphone", label: "Smartphone" },
  ];

  const assetValues = {
    ac: state.ac,
    fridge: state.fridge,
    car: state.car,
    two_wheeler: state.two_wheeler,
    tv: state.tv,
    smartphone: state.smartphone,
  };

  const numericSanitize = (raw) => {
    // allow digits and optional decimal point (single)
    const sanitized = String(raw).replace(/[^\d.]/g, "");
    const parts = sanitized.split(".");
    return parts.length <= 1 ? sanitized : `${parts[0]}.${parts.slice(1).join("")}`;
  };

  const handleAssetsChange = (values) => {
    update(values);
  };

  const handleCookingFuelChange = (val) => {
    update({ cooking_fuel: val });
    if (val !== "lpg") update({ lpg_refills_per_year: "" });
  };

  const handleElectricityMethodChange = (val) => {
    update({ electricity_input_method: val });

    if (val !== "upload") update({ electricity_bill_upload_last_month: null });
    if (val !== "history") {
      update({
        electricity_month1_amount: "",
        electricity_month1_units: "",
        electricity_month2_amount: "",
        electricity_month2_units: "",
        electricity_month3_amount: "",
        electricity_month3_units: "",
      });
    }
  };

  // Phones: single average per phone (state.phone_recharges = [{ avg: "" }, ...])
  const ensurePhoneRecharges = (n) => {
    const current = Array.isArray(state.phone_recharges) ? state.phone_recharges.slice() : [];
    const needed = Number(n) || 0;

    while (current.length < needed) {
      current.push({ avg: "" });
    }
    if (current.length > needed) current.length = needed;

    if (!Array.isArray(state.phone_recharges) || current.length !== state.phone_recharges.length) {
      update({ phone_recharges: current });
    }
    return current;
  };

  const handleNumPhonesChange = (val) => {
    const digits = String(val).replace(/\D/g, "");
    update({ num_phones: digits });
    ensurePhoneRecharges(digits || 0);
  };

  const updatePhoneAverage = (phoneIndex, rawVal) => {
    const sanitized = numericSanitize(rawVal);
    const arr = Array.isArray(state.phone_recharges) ? state.phone_recharges.slice() : [];
    while (arr.length <= phoneIndex) arr.push({ avg: "" });
    arr[phoneIndex] = { ...(arr[phoneIndex] || {}), avg: sanitized };
    update({ phone_recharges: arr });
  };

  const renderPhoneAverageBlocks = () => {
    const n = Number(state.num_phones) || 0;
    if (n <= 0) return null;
    ensurePhoneRecharges(n);
    const arr = Array.isArray(state.phone_recharges) ? state.phone_recharges : [];

    return (
      <div className="phone-scroll-area" style={{ marginTop: 10 }}>
        <div className="hint">
          For each phone, please enter the <strong>average monthly recharge (₹)</strong> for that device.
          Example: if you usually spend about ₹150 per month on Phone 1, enter <strong>150</strong>.
        </div>

        {Array.from({ length: n }).map((_, i) => {
          const phone = arr[i] || { avg: "" };
          return (
            <div
              key={`phone-${i}`}
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 8,
                background: "white",
                border: "1px solid rgba(10,20,40,0.04)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Phone {i + 1}</div>

              <Input
                label={`Average monthly recharge for Phone ${i + 1} (₹)`}
                value={phone.avg}
                onChange={(val) => updatePhoneAverage(i, val)}
                placeholder="e.g. 150"
                inputMode="decimal"
              />

              <div className="hint" style={{ marginTop: 8 }}>
                Enter amount in rupees (₹). If you are not sure, give a best estimate.
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page page--household">
      <h2 className="page-title">🏠 Household & Income Assessment</h2>

      <div className="container container--wide">
        <div className="full-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="header-deco" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="4" fill="#f0fdf4" />
                  <path d="M7 12h10M7 9h6" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Household Details
            </div>
            <div className="panel-sub">Step 04 · Household</div>
          </div>

          <div className="panel-grid panel-grid--dense">
            {/* Household counts */}
            <div className="panel-card panel-card--span4">
              <div className="card-heading"><span className="heading-emoji">👪</span>Household</div>

              <Input
                label="Household Size"
                type="number"
                value={state.household_size}
                onChange={(val) => update({ household_size: val })}
                placeholder="Number of members"
                required
              />

              <Input
                label="Number of Earners in a Family"
                type="number"
                value={state.num_earners}
                onChange={(val) => update({ num_earners: val })}
                placeholder="Number of earning members"
                required
              />

              <Input
                label="Monthly Family Income (₹)"
                type="number"
                value={state.avg_monthly_family_income}
                onChange={(val) => update({ avg_monthly_family_income: numericSanitize(val) })}
                placeholder="e.g. 20000"
                inputMode="decimal"
              />
              <div className="hint">
                Enter the total family income you usually receive in one month (all earners combined). If unsure, give your best estimate.
              </div>

              {/* Bank Statement upload */}
              <div style={{ marginTop: 12 }}>
                <FileUpload
                  label="Upload Bank Statement (PDF)"
                  onChange={(file) => update({ bank_statement: file })}
                  accept=".pdf"
                />
                <div className="hint">Upload a copy of your bank statement (PDF) if available. This helps verify declared income.</div>
              </div>

              {/* Children Yes/No */}
              <div style={{ marginTop: 12 }}>
                <Select
                  label="Do you have children?"
                  value={state.has_children}
                  onChange={(val) => {
                    update({ has_children: val });
                    if (val !== "yes") update({ children_school_type: "" });
                  }}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  placeholder="Select"
                />
                <div className="hint">Choose <strong>Yes</strong> if there are children living in the house. If Yes, you'll be asked about their school.</div>
              </div>

              {state.has_children === "yes" && (
                <div style={{ marginTop: 10 }}>
                  <Select
                    label="Children School Type"
                    value={state.children_school_type}
                    onChange={(val) => update({ children_school_type: val })}
                    options={schoolTypeOptions}
                    placeholder="Select school type"
                    required
                  />
                  <div className="hint">Pick the type of school most children attend (if different, choose the main one).</div>
                </div>
              )}
            </div>

            {/* Assets */}
            <div className="panel-card panel-card--span8 panel-card--tall">
              <div className="card-heading"><span className="heading-emoji">📦</span>Assets Owned</div>
              <CheckboxGroup
                label="Select assets you own"
                items={assetItems}
                values={assetValues}
                onChange={handleAssetsChange}
              />
              <div className="info-content muted">Tick items the household currently owns and uses.</div>
            </div>

            {/* Utilities */}
            <div className="panel-card panel-card--span4">
              <div className="card-heading"><span className="heading-emoji">🔥</span>Utilities</div>

              <Select
                label="Cooking Fuel"
                value={state.cooking_fuel}
                onChange={(val) => handleCookingFuelChange(val)}
                options={cookingFuelOptions}
                placeholder="Select fuel type"
                required
              />
              <div className="hint">Choose the main fuel used for cooking. If LPG, we will ask how many cylinders you use per year.</div>

              {state.cooking_fuel === "lpg" && (
                <div style={{ marginTop: 10 }}>
                  <Input
                    label="LPG refills per year (cylinders/year)"
                    type="number"
                    value={state.lpg_refills_per_year}
                    onChange={(val) => update({ lpg_refills_per_year: String(val).replace(/\D/g, "") })}
                    placeholder="e.g. 12"
                    inputMode="numeric"
                  />
                  <div className="hint">Enter number of LPG cylinders your household uses each year (whole number).</div>
                </div>
              )}
            </div>

            {/* Land Details - NEW */}
            <div className="panel-card panel-card--span6">
              <div className="card-heading"><span className="heading-emoji">🌾</span>Land Details</div>

              <Select
                label="Current House Type"
                value={state.house_type}
                onChange={(val) => update({ house_type: val })}
                options={houseTypeOptions}
                placeholder="Select house type"
              />
              <div className="hint" style={{ marginTop: 6 }}>
                <strong>Kutcha</strong>: house built with non-permanent materials (mud, thatch). <strong>Pakka</strong>: permanent materials (brick, concrete).
              </div>

              
              

              <Select
                label="Do you have land other than your house?"
                value={state.has_other_land}
                onChange={(val) => {
                  update({ has_other_land: val });
                  if (val !== "yes") update({ other_land_size_hectare: "" });
                }}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                placeholder="Select"
                style={{ marginTop: 12 }}
              />
              <div className="hint">Choose <strong>Yes</strong> if your family owns any farming land, plots, or extra land apart from the house area.</div>

              {state.has_other_land === "yes" && (
                <div style={{ marginTop: 10 }}>
                  <Input
                    label="Land Size (in Hectare)"
                    value={state.other_land_size_hectare}
                    onChange={(val) => update({ other_land_size_hectare: numericSanitize(val) })}
                    placeholder="e.g. 0.75"
                    inputMode="decimal"
                  />
                  <div className="hint" style={{ marginTop: 6 }}>
                    Enter the total area of land (other than house) in <strong>hectares</strong>. 1 hectare ≈ 2.47 acres.
                  </div>
                </div>
              )}
            </div>

            {/* Electricity */}
            <div className="panel-card panel-card--span6">
              <div className="card-heading"><span className="heading-emoji">⚡</span>Electricity</div>

              <Input
                label="Electricity Meter Number"
                value={state.meter_number}
                onChange={(val) => update({ meter_number: val })}
                placeholder="Enter meter number (required)"
                required
              />
              <div className="hint">
                Meter number is printed on your electricity bill or meter box. Example: <em>1234-5678-90</em>. Enter it exactly.
              </div>

              <Select
                label="Provide electricity bill using"
                value={state.electricity_input_method}
                onChange={(val) => handleElectricityMethodChange(val)}
                options={[
                  { value: "upload", label: "Upload last month's bill (PDF)" },
                  { value: "history", label: "Enter last 3 months' amounts & units" },
                ]}
                placeholder="Select method"
              />
              <div className="hint">Choose one method — upload the PDF OR type the last 3 months' amounts and used units (kWh).</div>

              {state.electricity_input_method === "upload" && (
                <div style={{ marginTop: 10 }}>
                  <FileUpload
                    label="Upload last month's electricity bill (PDF)"
                    onChange={(file) => update({ electricity_bill_upload_last_month: file })}
                    accept=".pdf"
                  />
                  <div className="hint">Upload the bill PDF for the most recent month. This is the easiest way to verify usage.</div>
                </div>
              )}

              {state.electricity_input_method === "history" && (
                <div style={{ marginTop: 10 }}>
                  <div className="hint">Type the bill amount (₹) and the units used (kWh) for the last three months. Month 1 = most recent month.</div>

                  <div className="two-col-row" style={{ marginTop: 8 }}>
                    <div>
                      <Input
                        label="Month 1 - Amount (₹)"
                        value={state.electricity_month1_amount}
                        onChange={(val) => update({ electricity_month1_amount: numericSanitize(val) })}
                        placeholder="e.g. 850.50"
                        inputMode="decimal"
                      />
                    </div>
                    <div>
                      <Input
                        label="Month 1 - Units (kWh)"
                        value={state.electricity_month1_units}
                        onChange={(val) => update({ electricity_month1_units: numericSanitize(val) })}
                        placeholder="e.g. 210"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  <div className="two-col-row" style={{ marginTop: 8 }}>
                    <div>
                      <Input
                        label="Month 2 - Amount (₹)"
                        value={state.electricity_month2_amount}
                        onChange={(val) => update({ electricity_month2_amount: numericSanitize(val) })}
                        placeholder="e.g. 920"
                        inputMode="decimal"
                      />
                    </div>
                    <div>
                      <Input
                        label="Month 2 - Units (kWh)"
                        value={state.electricity_month2_units}
                        onChange={(val) => update({ electricity_month2_units: numericSanitize(val) })}
                        placeholder="e.g. 230"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  <div className="two-col-row" style={{ marginTop: 8 }}>
                    <div>
                      <Input
                        label="Month 3 - Amount (₹)"
                        value={state.electricity_month3_amount}
                        onChange={(val) => update({ electricity_month3_amount: numericSanitize(val) })}
                        placeholder="e.g. 780"
                        inputMode="decimal"
                      />
                    </div>
                    <div>
                      <Input
                        label="Month 3 - Units (kWh)"
                        value={state.electricity_month3_units}
                        onChange={(val) => update({ electricity_month3_units: numericSanitize(val) })}
                        placeholder="e.g. 195"
                        inputMode="decimal"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Phones & Recharge - simplified: one avg per phone */}
            <div className="panel-card panel-card--span6">
              <div className="card-heading"><span className="heading-emoji">📱</span>Phones & Recharge</div>

              <Input
                label="Number of Phones"
                type="number"
                value={state.num_phones}
                onChange={(val) => handleNumPhonesChange(val)}
                placeholder="Number of phones"
              />
              <div className="hint" style={{ marginTop: 6 }}>
                Enter how many active phones are used by your household. For each phone, enter one value: the average monthly recharge (₹).
              </div>
              <div className="phone-scroll-area">
                {renderPhoneAverageBlocks()}
              </div>
            </div>

            {/* Tips */}
            <div className="panel-card panel-card--span4">
              <div className="card-heading"><span className="heading-emoji">💡</span>Tips</div>
              <div className="info-content muted">Combine small images into a single PDF for faster uploads.</div>
            </div>

            {/* Extra attachments */}
            <div className="panel-card panel-card--span8">
              <div className="card-heading"><span className="heading-emoji">📎</span>Additional Attachments</div>
              <FileUpload
                label="Upload other documents"
                onChange={(file) => update({ additional_household_files: file })}
                accept=".zip,.pdf,.jpg,.png"
              />
            </div>
          </div>

          <div className="panel-actions">
            <button className="btn btn-secondary" onClick={goPrev} type="button">Back</button>
            <button className="btn btn-primary" onClick={goNext} type="button">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page4Household;
