// src/pages/Page1Eligibility.jsx
import React from 'react';
import { useForm } from '../context/FormContext';
import Select from '../components/form/Select';
import { isEligible } from '../utils/validators';

function Page1Eligibility() {
  const { state, update, goNext } = useForm();

  const eligible = isEligible(state.obc_category, state.below_3_lakh);

  const handleNext = () => {
    if (eligible) {
      goNext();
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">Eligibility Check</h2>
      <Select
        label="Do you belong to OBC category?"
        value={state.obc_category}
        onChange={(val) => update({ obc_category: val })}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]}
        placeholder="Select"
        required
      />
      <Select
        label="Is your annual income below 3 Lakh?"
        value={state.below_3_lakh}
        onChange={(val) => update({ below_3_lakh: val })}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]}
        placeholder="Select"
        required
      />

      {state.obc_category && state.below_3_lakh && !eligible && (
        <div className="alert alert-error">
          You are not eligible for this program. Both conditions must be met.
        </div>
      )}

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleNext} disabled={!eligible}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Page1Eligibility;