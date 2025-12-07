// src/pages/Page5Submission.jsx
import React, { useState } from 'react';
import { useForm } from '../context/FormContext';
import { supabase } from '../supabaseClient'; 
// ADDED IMPORT: Utility function for batch uploading files to Supabase Storage
import { uploadAllApplicationFiles } from '../utils/storageUploader';

function Page5Submission() {
  const { state, reset } = useForm();
  const [submissionStatus, setSubmissionStatus] = useState('pending'); // 'pending', 'submitting', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState(null);

  // --- Utility function to clean data for text/numeric DB insertion ---
  const getCleanData = (formData) => {
    
    // List all keys that must be EXCLUDED from the main database table.
    const excludeKeys = new Set([
        // File/Blob fields (These are handled separately by storageUploader)
        'selfie', 
        'obc_certificate', 
        'bank_statement', 
        'electricity_bill_upload_last_month', 
        'support_documents', 
        'additional_files',
        'additional_household_files', 
        'other_land_document',
        
        // URL fields (if they exist)
        'electricity_bill_upload_last_month_url',
        'selfie_url',
        'obc_certificate_url',
        'bank_statement_url',
        'support_documents_url',
        'additional_files_url',
        
        // Temporary/UI/Schema Mismatch Fields
        'peak_months',
        'total_land_holding',
        'certificate_income_type',
        'reason_for_applying',
        'status_mobile',
        'application_id',      
        'currentStep', 
        'layoutConfig', 
        'errors', 
        'canProceedPersonal',
        'status_otp',
    ]);
    
    // Numeric fields that should be converted to null if empty
    const numericFields = new Set([
        'peak_month_income',
        'lowest_month_income',
        'avg_monthly_family_income',
        'other_land_size_hectare',
        'electricity_month1_amount',
        'electricity_month1_units',
        'electricity_month2_amount',
        'electricity_month2_units',
        'electricity_month3_amount',
        'electricity_month3_units',
    ]);
    
    // Integer fields that should be converted to null if empty
    const integerFields = new Set([
        'household_size',
        'num_earners',
        'lpg_refills_per_year',
        'num_phones',
    ]);
    
    // 1. Filter the formData entries to EXCLUDE all keys listed above.
    const filteredEntries = Object.entries(formData).filter(([key]) => !excludeKeys.has(key));

    // 2. Create the clean data object from the filtered entries.
    let data = Object.fromEntries(filteredEntries);
    
    // 3. Convert empty strings to null for numeric and integer fields
    for (const key of numericFields) {
      if (data[key] === '' || data[key] === undefined) {
        data[key] = null;
      }
    }
    
    for (const key of integerFields) {
      if (data[key] === '' || data[key] === undefined) {
        data[key] = null;
      }
    }
    
    // 4. Set the final submission status
    data.submission_status = 'processing_pending'; // Reflects the new workflow

    // 5. Clean up the phone_recharges array 
    if (Array.isArray(data.phone_recharges)) {
      data.phone_recharges = data.phone_recharges.map(p => ({
        // Convert empty string averages to null for database compatibility
        avg: p.avg && p.avg !== "" ? p.avg : null
      }));
    }
    
    return data;
  };

  const handleSubmit = async () => {
    if (submissionStatus !== 'pending') return;

    setSubmissionStatus('submitting');
    const applicationData = getCleanData(state);
    
    let newId = null;
    try {
      // 1. Insert the main application data (text/numeric only) to get the unique ID
      const { data: insertedData, error: dbError } = await supabase
        .from('loan_applications')
        .insert([applicationData])
        .select('id') 
        .single();
        
      if (dbError) throw dbError;

      newId = insertedData.id;
      
      // 2. FILE UPLOAD STEP: Call the external utility using the new ID and the full state
      console.log(`Application inserted with ID: ${newId}. Starting file uploads to Supabase Storage...`);
      await uploadAllApplicationFiles(newId, state);

      console.log('All files uploaded successfully to Supabase Storage.');

      setSubmissionStatus('success');
      reset(); 

    } catch (error) {
      console.error('Submission failed:', error.message);
      
      let message = error.message;

      // Check for specific file upload error message
      if (message && message.includes('Storage Upload Failed')) {
        message = `File upload failed after saving application data. You must configure RLS policies for the loan-documents bucket. Error: ${error.message}`;
      } else if (error.code === '42703') {
        message = `A schema mismatch occurred. The problematic key was likely sent to the database. Console shows the full error.`;
      }
      
      // Report success if data was saved but file failed
      if (newId) {
        message = `Data saved (ID: ${newId}), but file upload failed. Error: ${message}`;
      }

      setErrorMsg(`Submission failed: ${message}`);
      setSubmissionStatus('error');
    }
  };

  // --- Conditional Rendering based on Submission Status ---
  if (submissionStatus === 'success') {
    return (
      <div className="page page--confirmation">
        <h2 className="page-title">🎉 Application Complete!</h2>
        <p>Your data and documents have been successfully saved for processing.</p>
        <p style={{ marginTop: '1rem' }}>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Start New Application
          </button>
        </p>
      </div>
    );
  }

  if (submissionStatus === 'error') {
    return (
      <div className="page page--error">
        <h2 className="page-title">❌ Submission Error</h2>
        <p className="alert alert-error">{errorMsg}</p>
        <button onClick={() => setSubmissionStatus('pending')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Try Again
        </button>
      </div>
    );
  }

  // --- Default Review/Submit View ---
  return (
    <div className="page page--final-review">
      <h2 className="page-title">Review & Submit</h2>
      
      <div className="alert alert-info">
        Confirm your details below. Clicking "Submit" will save your data and upload documents.
      </div>
      
      <div className="panel-actions" style={{ marginTop: '20px' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit} 
          disabled={submissionStatus === 'submitting'}
        >
          {submissionStatus === 'submitting' ? 'Submitting Data & Files...' : 'Confirm and Submit Application'}
        </button>
      </div>
    </div>
  );
}

export default Page5Submission;