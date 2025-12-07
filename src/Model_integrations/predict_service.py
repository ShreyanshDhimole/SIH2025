# predict_service.py
import os
import json
import logging
from typing import Any, Dict
from decimal import Decimal

import numpy as np
import joblib
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
import tensorflow as tf

from dotenv import load_dotenv
load_dotenv()


# ---------------------------
# CONFIG (via env vars)
# ---------------------------
DATABASE_URL = os.getenv("DATABASE_URL")  # e.g. "postgres://user:pass@host:5432/dbname"
MODEL_PATH = os.getenv("MODEL_PATH", "income_ann_optuna_model_estimated_best.h5")
SCALER_PATH = os.getenv("SCALER_PATH", "income_numeric_scaler.pkl")
ENCODERS_PATH = os.getenv("ENCODERS_PATH", "income_label_encoders.pkl")
METADATA_PATH = os.getenv("METADATA_PATH", "income_model_metadata.pkl")
MODEL_NAME = os.getenv("MODEL_NAME", "income_ann_optuna")
MODEL_VERSION = os.getenv("MODEL_VERSION", "v1")

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("predict_service")

# ---------------------------
# Load artifacts
# ---------------------------
logger.info("Loading model and artifacts...")
model = tf.keras.models.load_model(MODEL_PATH)
scaler = None
try:
    scaler = joblib.load(SCALER_PATH)
except Exception as e:
    logger.warning("Could not load scaler: %s", e)

label_encoders = {}
try:
    label_encoders = joblib.load(ENCODERS_PATH)
except Exception as e:
    logger.warning("Could not load label encoders: %s", e)

metadata = {}
try:
    metadata = joblib.load(METADATA_PATH)
except Exception as e:
    logger.warning("Could not load metadata: %s", e)

NUMERIC_COLS = metadata.get("numeric_cols", []) or []
CAT_COLS = metadata.get("cat_cols", []) or []

logger.info("NUMERIC_COLS: %s", NUMERIC_COLS)
logger.info("CAT_COLS: %s", CAT_COLS)

# ---------------------------
# DB helpers
# ---------------------------
def get_db_conn():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL not set")
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def fetch_application_row(application_id: str) -> Dict[str, Any]:
    q = "SELECT * FROM public.loan_applications WHERE id = %s;"
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(q, (application_id,))
            row = cur.fetchone()
            return dict(row) if row else None

def insert_model_output(application_id: str, predicted: float, features: dict, raw: dict, preprocessing_log: str = None, confidence: float = None):
    insert_q = """
    INSERT INTO public.loan_application_model_outputs
      (application_id, model_name, model_version, predicted_income, prediction_confidence, prediction_raw, features_used, preprocessing_log)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id, created_at;
    """
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                insert_q,
                (
                    application_id,
                    MODEL_NAME,
                    MODEL_VERSION,
                    Decimal(str(predicted)),
                    Decimal(str(confidence)) if confidence is not None else None,
                    json.dumps(raw),
                    json.dumps(features),
                    preprocessing_log,
                ),
            )
            result = cur.fetchone()
            conn.commit()
            return result

# ---------------------------
# Preprocessing utilities
# ---------------------------
def safe_float(x, default=0.0):
    try:
        if x is None:
            return default
        return float(x)
    except Exception:
        try:
            return float(str(x).replace(",", ""))
        except Exception:
            return default

def encode_categorical(col: str, value: Any):
    """
    Uses the LabelEncoder saved during training. Training used:
        le.fit_transform(X[col].astype(str).fillna("__MISSING__"))
    So we try to transform 'value' as str, and on failure map to '__MISSING__' if available,
    otherwise fallback to 0.
    """
    le = label_encoders.get(col)
    if le is None:
        # no encoder available: try to return string hash-like fallback (not ideal)
        return 0
    try:
        return int(le.transform([str(value) if value is not None else "__MISSING__"])[0])
    except Exception:
        # try to use "__MISSING__" if present
        try:
            return int(le.transform(["__MISSING__"])[0])
        except Exception:
            # fallback: first class index
            return 0

def build_feature_vector_from_row(row: Dict[str, Any]):
    """
    Build numeric vector and categorical ints following the exact order:
     - numeric inputs in NUMERIC_COLS order
     - categorical columns in CAT_COLS order
    Returns: (inputs_dict, features_dict, preprocessing_log)
    """
    features = {}
    preprocessing_notes = []

    # NUMERIC vector
    num_vals = []
    for col in NUMERIC_COLS:
        # Map training numeric column names to DB columns.
        # We'll try direct mapping; if not present, attempt common derived names.
        val = None
        if col in row:
            val = row.get(col)
        else:
            # fallback mapping heuristics:
            # e.g., training col "electricity_avg_amount" may not exist in DB; compute if possible.
            if col == "electricity_avg_amount":
                vals = [
                    safe_float(row.get("electricity_month1_amount"), None),
                    safe_float(row.get("electricity_month2_amount"), None),
                    safe_float(row.get("electricity_month3_amount"), None),
                ]
                valid = [v for v in vals if v is not None]
                val = float(np.mean(valid)) if valid else 0.0
            elif col == "phone_recharges_avg":
                pr = row.get("phone_recharges")
                v = 0.0
                try:
                    if pr:
                        if isinstance(pr, str):
                            pr_list = json.loads(pr)
                        else:
                            pr_list = pr
                        vals = []
                        for e in pr_list:
                            if isinstance(e, dict):
                                a = e.get("avg") or e.get("value")
                                if a is not None:
                                    try:
                                        vals.append(float(a))
                                    except:
                                        pass
                        v = float(np.mean(vals)) if vals else 0.0
                    else:
                        v = 0.0
                except Exception:
                    v = 0.0
                val = v
            elif col == "other_land_size_hectare":
                # check has_other_land flag
                if row.get("has_other_land") in ("no", "false", False, None):
                    val = 0.0
                else:
                    val = safe_float(row.get("other_land_size_hectare"), 0.0)
            else:
                val = safe_float(row.get(col), 0.0)
        num_vals.append(safe_float(val, 0.0))
        features[col] = safe_float(val, 0.0)

    # scale numeric
    if scaler is not None and len(num_vals) > 0:
        try:
            scaled = scaler.transform([np.array(num_vals, dtype=np.float32)])[0].astype(np.float32)
            numeric_input = scaled.reshape(1, -1)
        except Exception as e:
            preprocessing_notes.append(f"Scaler failed: {e} — sending raw numeric values.")
            numeric_input = np.array([num_vals], dtype=np.float32)
    else:
        numeric_input = np.array([num_vals], dtype=np.float32)

    # categorical features
    cat_inputs = {}
    for col in CAT_COLS:
        raw_val = row.get(col, None)
        enc_val = encode_categorical(col, raw_val)
        cat_inputs[col] = np.array([[int(enc_val)]], dtype=np.int32)
        features[col] = raw_val if raw_val is not None else "__MISSING__"

    # assemble inputs dict (match keras input names: "numeric_inputs" + each categorical col name)
    inputs = {}
    if len(NUMERIC_COLS) > 0:
        inputs["numeric_inputs"] = numeric_input
    for k, v in cat_inputs.items():
        inputs[k] = v

    preprocessing_log = "; ".join(preprocessing_notes) if preprocessing_notes else None
    return inputs, features, preprocessing_log

# ---------------------------
# Prediction endpoint logic
# ---------------------------
app = FastAPI(title="Income Model Prediction Service")

@app.get("/predict/{application_id}")
def predict_application(application_id: str):
    # 1) fetch application
    row = fetch_application_row(application_id)
    if not row:
        raise HTTPException(status_code=404, detail="application not found")

    # 2) build features & inputs
    inputs, features_used, preproc_log = build_feature_vector_from_row(row)

    # 3) run model
    try:
        # model expects a dict of numpy arrays; keras will accept predict(inputs)
        preds = model.predict(inputs, verbose=0)
        # preds shape (1,1)
        pred_val = float(preds.reshape(-1)[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"model prediction failed: {e}")

    # optional: if you have a confidence metric, compute here (we don't in this model)
    confidence = None

    # 4) write to DB outputs table
    raw_output = {"pred_array": preds.tolist()}
    try:
        insert_res = insert_model_output(application_id, pred_val, features_used, raw_output, preprocessing_log=preproc_log, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"failed to store prediction: {e}")

    return {
        "application_id": application_id,
        "predicted_income": pred_val,
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "db_inserted": insert_res,
        "features_used": features_used,
        "preprocessing_log": preproc_log,
    }

# ---------------------------
# Optional: Batch endpoint to predict all 'complete' applications w/o existing output
# (Be careful running on large datasets.)
# ---------------------------
@app.post("/predict/batch")
def batch_predict(limit: int = 100):
    """
    Predict up to `limit` applications whose submission_status='complete' and which
    don't already have an entry in model outputs.
    """
    q = """
    SELECT la.id
    FROM public.loan_applications la
    LEFT JOIN public.loan_application_model_outputs mo ON mo.application_id = la.id AND mo.model_name = %s AND mo.model_version = %s
    WHERE la.submission_status = 'complete' AND mo.application_id IS NULL
    ORDER BY la.created_at DESC
    LIMIT %s;
    """
    ids = []
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(q, (MODEL_NAME, MODEL_VERSION, limit))
            rows = cur.fetchall()
            ids = [r['id'] for r in rows]

    results = []
    for aid in ids:
        try:
            out = predict_application(aid)
            results.append({"id": aid, "status": "ok", "pred": out["predicted_income"]})
        except Exception as e:
            results.append({"id": aid, "status": "error", "error": str(e)})

    return {"count": len(results), "results": results}
