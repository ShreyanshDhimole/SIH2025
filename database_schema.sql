-- ============================================================================
-- LOAN APPLICATIONS TABLE
-- Schema designed for SIH 2025 Form Website
-- Includes data from Pages 0-4 (numeric and textual data only)
-- File uploads are stored separately and not included in this schema
-- ============================================================================

CREATE TABLE public.loan_applications (
    -- ========== PRIMARY KEY & TIMESTAMPS ==========
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- ========== PAGE 0: LOAN TYPE ==========
    loan_type text,                          -- 'student' | 'business'
    
    -- ========== PAGE 1: ELIGIBILITY ==========
    obc_category text,                       -- 'yes' | 'no'
    below_3_lakh text,                       -- 'yes' | 'no'
    
    -- ========== PAGE 2: PERSONAL INFORMATION ==========
    full_name text,
    mobile_number text,                      -- 10-digit mobile number
    address text,                            -- Full address
    pin text,                                -- 6-digit PIN code
    aadhaar_number text,                     -- 12-digit Aadhaar
    
    -- ========== PAGE 3: BACKGROUND INFORMATION ==========
    primary_occupation text,                 -- 'agriculture' | 'daily_wage' | 'self_employed' | 'salaried' | 'other'
    seasonal_income text,                    -- 'yes' | 'no'
    peak_month_income numeric,               -- Income in rupees (highest month)
    lowest_month_income numeric,             -- Income in rupees (lowest month)
    gov_benefits jsonb,                      -- Array of selected benefits: ["ab_pmjAY", "pm_pension", ...]
    ration_card_type text,                   -- 'apl' | 'bpl' | 'aay' | 'none'
    
    -- ========== PAGE 4: HOUSEHOLD & INCOME ASSESSMENT ==========
    -- Household Information
    household_size integer,                  -- Number of people in household
    num_earners integer,                     -- Number of earning members
    avg_monthly_family_income numeric,       -- Average monthly income in rupees
    has_children text,                       -- 'yes' | 'no'
    children_school_type text,               -- 'government' | 'private' | 'not_in_school'
    
    -- Assets (Boolean flags - stored as boolean)
    ac boolean NOT NULL DEFAULT false,
    fridge boolean NOT NULL DEFAULT false,
    car boolean NOT NULL DEFAULT false,
    two_wheeler boolean NOT NULL DEFAULT false,
    tv boolean NOT NULL DEFAULT false,
    smartphone boolean NOT NULL DEFAULT false,
    
    -- Utilities
    cooking_fuel text,                       -- 'lpg' | 'solid' | 'other'
    lpg_refills_per_year integer,            -- Number of LPG cylinders per year
    
    -- House Details
    house_type text,                         -- 'kutcha' | 'pakka'
    has_other_land text,                     -- 'yes' | 'no'
    other_land_size_hectare numeric,         -- Land size in hectares
    
    -- Electricity Details
    meter_number text,                       -- Electricity meter number
    electricity_input_method text,           -- 'upload' | 'history'
    electricity_month1_amount numeric,       -- Month 1 bill amount (₹)
    electricity_month1_units numeric,        -- Month 1 units (kWh)
    electricity_month2_amount numeric,       -- Month 2 bill amount (₹)
    electricity_month2_units numeric,        -- Month 2 units (kWh)
    electricity_month3_amount numeric,       -- Month 3 bill amount (₹)
    electricity_month3_units numeric,        -- Month 3 units (kWh)
    
    -- Phones & Recharge
    num_phones integer,                      -- Number of phones in household
    phone_recharges jsonb,                   -- Array: [{ avg: "150" }, { avg: "200" }, ...]
    
    -- ========== SUBMISSION & STATUS TRACKING ==========
    submission_status text NOT NULL DEFAULT 'draft',  -- 'draft' | 'complete' | 'submitted'
    
    CONSTRAINT loan_applications_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for faster lookups by submission status
CREATE INDEX idx_loan_applications_submission_status 
ON public.loan_applications(submission_status);

-- Index for temporal queries
CREATE INDEX idx_loan_applications_created_at 
ON public.loan_applications(created_at DESC);

-- Index for mobile number lookups (if needed for status checks)
CREATE INDEX idx_loan_applications_mobile_number 
ON public.loan_applications(mobile_number);

-- Index for Aadhaar lookups
CREATE INDEX idx_loan_applications_aadhaar_number 
ON public.loan_applications(aadhaar_number);

-- ============================================================================
-- DATA TYPE REFERENCE
-- ============================================================================
-- 
-- TEXT: Used for categorical data and short strings
--   - loan_type, obc_category, primary_occupation, etc.
--
-- NUMERIC: Used for financial amounts and precise decimal values
--   - Income amounts, electricity bills, land size
--   - Supports up to 131,072 digits before decimal point
--
-- INTEGER: Used for whole numbers
--   - household_size, num_earners, lpg_refills_per_year, num_phones
--
-- BOOLEAN: Used for true/false asset ownership flags
--   - ac, fridge, car, two_wheeler, tv, smartphone
--
-- JSONB: Used for arrays and complex nested data
--   - gov_benefits: array of selected government schemes
--   - phone_recharges: array of average monthly recharges per phone
--
-- UUID: Used for unique record identification
--   - id: Primary key with auto-generated UUID
--
-- TIMESTAMP WITH TIME ZONE: Used for audit trail
--   - created_at, updated_at
--

-- ============================================================================
-- SAMPLE DATA QUERY
-- ============================================================================
-- Get all complete submissions with key information:
--
-- SELECT 
--     id,
--     created_at,
--     full_name,
--     mobile_number,
--     loan_type,
--     primary_occupation,
--     avg_monthly_family_income,
--     submission_status
-- FROM public.loan_applications
-- WHERE submission_status = 'complete'
-- ORDER BY created_at DESC;
--

-- ============================================================================
-- NOTES ON FILE UPLOADS (NOT INCLUDED IN THIS TABLE)
-- ============================================================================
--
-- The following file uploads are handled separately and are NOT stored in
-- this table. Create a separate storage system (e.g., Supabase Storage,
-- AWS S3, or a dedicated files table) for these:
--
-- PAGE 2:
--   - selfie (image)
--   - obc_certificate (PDF/image)
--
-- PAGE 3:
--   - support_documents (PDF/image)
--   - additional_household_files (ZIP/PDF/image)
--
-- PAGE 4:
--   - bank_statement (PDF)
--   - electricity_bill_upload_last_month (PDF)
--
-- For file storage, you may want to create a separate table:
-- CREATE TABLE public.loan_application_files (
--     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--     application_id uuid NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
--     file_type text,                      -- 'selfie', 'obc_certificate', etc.
--     file_name text,
--     file_path text,                      -- Path/URL in storage system
--     file_size_bytes bigint,
--     mime_type text,
--     uploaded_at timestamp with time zone DEFAULT now()
-- );
--
