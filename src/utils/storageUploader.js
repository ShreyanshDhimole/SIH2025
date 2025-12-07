// src/utils/storageUploader.js

import { supabase } from '../supabaseClient'; // Ensure this path is correct

// 1. Define all file fields and their target folder path within the bucket
// This configuration MUST match the keys used in your FormContext state.
const FILE_FIELDS_MAP = [
  { key: 'selfie', path: 'selfie' }, 
  { key: 'obc_certificate', path: 'caste_cert' }, 
  { key: 'bank_statement', path: 'bank_statement' }, 
  { key: 'electricity_bill_upload_last_month', path: 'electricity_bill' }, 
  { key: 'support_documents', path: 'support_docs' }, 
  { key: 'additional_files', path: 'additional' },
  { key: 'additional_household_files', path: 'additional_hh' },
];

const BUCKET_NAME = 'loan-documents';

/**
 * Uploads a single file to Supabase Storage.
 * @param {string} applicationId - The unique UUID of the loan application row.
 * @param {File | Blob | null} file - The file object to upload.
 * @param {string} path - The sub-folder path (e.g., 'selfie', 'bank_statement').
 * @returns {Promise<string | null>} The path to the uploaded file, or null if no file was present.
 */
const uploadSingleFile = async (applicationId, file, path) => {
  if (!(file instanceof File) && !(file instanceof Blob)) {
    return null; 
  }

  // File path structure: BUCKET_NAME/APPLICATION_ID/FILE_TYPE/original_filename.ext
  // This groups all documents for one application under its unique ID.
  const filePath = `${applicationId}/${path}/${file.name}`;
  
  console.log(`Attempting to upload file to: ${BUCKET_NAME}/${filePath}`);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false // Prevent accidental overwrites
    });
    
  if (error) {
    console.error(`Error uploading ${file.name}:`, error);
    // Re-throw the error to be caught by the calling function (uploadAllApplicationFiles)
    throw new Error(`Storage Upload Failed for ${file.name}: ${error.message}`);
  }
  
  return filePath;
};


/**
 * Handles the batch upload of all application documents stored in the form state.
 * @param {string} applicationId - The unique UUID of the loan application row.
 * @param {Object} formData - The complete state object from FormContext.
 * @returns {Promise<void>} Resolves when all files are uploaded successfully.
 */
export const uploadAllApplicationFiles = async (applicationId, formData) => {
    // Collect all upload promises
    const uploadPromises = FILE_FIELDS_MAP.map(({ key, path }) => 
        uploadSingleFile(applicationId, formData[key], path)
    );
    
    // Use Promise.all to run all uploads concurrently
    // Note: Promise.all will reject immediately if *any* promise rejects.
    await Promise.all(uploadPromises);
    
    console.log('Batch file upload completed successfully to Supabase Storage.');
};