// src/App.jsx
import React from 'react';
import { FormProvider, useForm } from './context/FormContext';
import Stepper from './components/Stepper/Stepper';
import FormCard from './components/FormCard';
import Page0LoanType from './pages/Page0LoanType';
import Page1Eligibility from './pages/Page1Eligibility';
import Page2Personal from './pages/Page2Personal';
import Page3Background from './pages/Page3Background';
import Page4Household from './pages/Page4Household';
import Page5Submission from './pages/page5Submission'; // <-- RENAMED/NEW FILE

function AppContent() {
  const { state, goNext, goPrev, goToStep } = useForm();

  const renderPage = () => {
    switch (Number(state.currentStep)) {
      case 0:
        return <Page0LoanType goNext={goNext} goPrev={goPrev} goToStep={goToStep} />;
      case 1:
        return <Page1Eligibility goNext={goNext} goPrev={goPrev} goToStep={goToStep} />;
      case 2:
        return <Page2Personal goNext={goNext} goPrev={goPrev} goToStep={goToStep} />;
      case 3:
        return <Page3Background goNext={goNext} goPrev={goPrev} goToStep={goToStep} />;
      case 4:
        return <Page4Household goNext={goNext} goPrev={goPrev} goToStep={goToStep} />;
      case 5:
        // This is the new submission page where the database insert happens
        return <Page5Submission goNext={goNext} goPrev={goPrev} goToStep={goToStep} />; 
      default:
        return <Page0LoanType goNext={goNext} goPrev={goPrev} goToStep={goToStep} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">⚖</span>
          <span className="logo-text">NBCFDC Loan Detail</span>
        </div>
      </header>

      <div className="stepper-container">
        {/* Assuming Stepper uses context to show progress */}
        <Stepper /> 
      </div>

      <div className="content-container">
        <FormCard>{renderPage()}</FormCard>
      </div>
    </div>
  );
}

function App() {
  return (
    <FormProvider>
      <AppContent />
    </FormProvider>
  );
}

export default App;