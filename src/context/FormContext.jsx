import React, { createContext, useContext, useState, useMemo } from 'react';
import { isValidPin, isValidAadhaar } from '../utils/validators';

const FormContext = createContext();

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
};

const getInitialState = () => ({
  // start at 0 so Page0 (Loan Type) is the first step.
  // If you prefer to keep step numbering starting at 1, set this to 1 and adapt your pages accordingly.
  currentStep: 0,

  // NEW: Page 0
  loan_type: '', // 'student' | 'business'

  // existing personal/background fields
  obc_category: '',
  below_3_lakh: '',
  full_name: '',
  mobile_number: '',
  address: '',
  pin: '',
  aadhaar_number: '',
  primary_occupation: '',
  seasonal_income: '',
  peak_months: [],
  reason_for_applying: '',
  gov_benefits: [],

  // household (some already present in your original but keep here)
  household_size: '',
  num_earners: '',
  children_school_type: '',
  cooking_fuel: '',
  certificate_income_type: '',

  // assets
  ac: false,
  fridge: false,
  car: false,
  two_wheeler: false,
  tv: false,
  smartphone: false,

  // electricity & meter
  meter_number: '',
  electricity_input_method: '', // 'upload' | 'history'
  electricity_bill_upload_last_month: null,
  electricity_bill_upload_last_month_url: null,

  // electricity history fields
  electricity_month1_amount: '',
  electricity_month1_units: '',
  electricity_month2_amount: '',
  electricity_month2_units: '',
  electricity_month3_amount: '',
  electricity_month3_units: '',

  // phones & recharge
  num_phones: '',
  // NEW: array of { avg: "" } for each phone (used in Page4)
  phone_recharges: [],

  // LPG
  lpg_refills_per_year: '',

  // land / documents
  total_land_holding: '',
  has_other_land: '',
  other_land_size_hectare: '',
  other_land_document: null,

  // uploads & attachments
  bank_statement: null,
  obc_certificate: null,
  selfie: null,
  support_documents: null,
  additional_household_files: null,
  status_otp: '',
  
  // Status check page fields (NOT sent to database)
  status_mobile: '',
  application_id: ''
});

export const FormProvider = ({ children }) => {
  const [state, setState] = useState(getInitialState());
  const [errors, setErrors] = useState({});

  const setField = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const update = (patch) => {
    setState((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => {
        if (next[k]) delete next[k];
      });
      return next;
    });
  };

  // new: navigate directly to a step index
  const goToStep = (stepIndex) => {
    setState((prev) => ({ ...prev, currentStep: Number(stepIndex) }));
  };

  const goNext = (validateFn) => {
    if (typeof validateFn === 'function') {
      // goNext calls validateFn with the current state (so validators can use state)
      const res = validateFn(state);
      if (!res.ok) {
        setErrors(res.errors || {});
        return false;
      }
    }
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    return true;
  };

  const goPrev = () => {
    setState((prev) => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  };

  const reset = () => {
    setState(getInitialState());
    setErrors({});
  };

  const layoutConfig = useMemo(
    () => ({
      containerClass: 'panel panel--rounded',
      columns: 3,
      cardClass: 'panel-card'
    }),
    []
  );

  const canProceedPersonal = useMemo(() => {
    return (
      !!state.full_name &&
      !!state.mobile_number &&
      !!state.address &&
      isValidPin(state.pin) &&
      isValidAadhaar(state.aadhaar_number) &&
      !!state.selfie
    );
  }, [state.full_name, state.mobile_number, state.address, state.pin, state.aadhaar_number, state.selfie]);

  const validatePersonal = (s = state) => {
    const e = {};
    if (!s.full_name) e.full_name = 'Full name is required';
    if (!s.mobile_number) e.mobile_number = 'Mobile number is required';
    if (!s.address) e.address = 'Address is required';
    if (!isValidPin(s.pin)) e.pin = 'PIN must be 6 digits';
    if (!isValidAadhaar(s.aadhaar_number)) e.aadhaar_number = 'Aadhaar must be 12 digits';
    if (!s.selfie) e.selfie = 'Selfie is required';
    return { ok: Object.keys(e).length === 0, errors: e };
  };

  return (
    <FormContext.Provider
      value={{
        state,
        setField,
        update,
        goNext,
        goPrev,
        goToStep,     // new
        reset,
        errors,
        setErrors,
        layoutConfig,
        canProceedPersonal,
        validatePersonal
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
