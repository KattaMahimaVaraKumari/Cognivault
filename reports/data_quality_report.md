# Cognivault AI — Data Quality and Audit Report (Block 1)

**Date of Execution:** 2026-10-15  
**Audit Target:** `data/raw/cognivault_final_dataset.csv`  
**Pipeline Component:** ML Data Loader & Strict Validator  

---

## 1. File Integrity & Provenance

| Metric | Measured Value | Status |
|---|---|---|
| **File Path** | `data/raw/cognivault_final_dataset.csv` | Verified |
| **SHA-256 Hash (Initial)** | `b2c24f334cd6cef42265c29659b28291f040ab17ec30278aa175af3d06e2a762` | Matched |
| **SHA-256 Hash (Final)** | `b2c24f334cd6cef42265c29659b28291f040ab17ec30278aa175af3d06e2a762` | Unchanged |
| **Row Count** | 2,000 (excluding header) | Verified |
| **Column Count** | 16 | Verified |

The raw CSV file remains byte-for-byte identical to the original input.

---

## 2. Dataset Schema & Data Types

The file contains 16 columns divided into three functional groups:

| Column Name | Inferred Dtype | Functional Group | Role in Modeling |
|---|---|---|---|
| `institution` | `object` | Profile / Metadata | Excluded from $X$ (Protected) |
| `degree` | `object` | Profile / Metadata | Excluded from $X$ (Protected) |
| `year` | `int64` | Profile / Metadata | Excluded from $X$ (Protected) |
| `branch` | `object` | Profile / Metadata | Excluded from $X$ (Protected) |
| `living_arrangement` | `object` | Profile / Metadata | Excluded from $X$ (Protected) |
| `study_hours_outside_classes_per_day` | `float64` | Candidate Feature 1 | Primary Input $X$ |
| `academic_tasks_per_week` | `int64` | Candidate Feature 2 | Primary Input $X$ |
| `academic_workload` | `int64` | Candidate Feature 3 | Primary Input $X$ |
| `time_pressure` | `int64` | Candidate Feature 4 | Primary Input $X$ |
| `avg_sleep_hours` | `float64` | Candidate Feature 5 | Primary Input $X$ |
| `wakes_up_tired` | `int64` | Candidate Feature 6 | Primary Input $X$ |
| `physical_activity_days_per_week` | `int64` | Candidate Feature 7 | Primary Input $X$ |
| `difficulty_concentrating` | `int64` | Candidate Feature 8 | Primary Input $X$ |
| `academic_emotional_exhaustion` | `int64` | Candidate Feature 9 | Primary Input $X$ |
| `burnout_risk_score` | `float64` | Target (Continuous) | Regression Target ($y_{score}$) |
| `burnout_risk_level` | `object` | Target (Categorical) | Classification Target ($y_{level}$) |

---

## 3. Data Cleanness & Anomaly Checks

| Audit Criterion | Check Performed | Measured Result | Threshold / Rule | Status |
|---|---|---|---|---|
| **Missing / Null Values** | `df.isnull().sum()` | **0** across all 16 columns | Must be 0 | **PASS** |
| **Exact Duplicate Rows** | `df.duplicated().sum()` | **0** duplicate rows | Must be 0 | **PASS** |
| **Duplicate Feature Vectors** | `df.duplicated(subset=FEATURES).sum()` | **0** duplicate vectors | Must be 0 | **PASS** |
| **Score Bounds** | `min` / `max` of `burnout_risk_score` | `0.0` to `100.0` | [0.0, 100.0] | **PASS** |
| **Score-to-Level Consistency** | Rule matching score vs class | **0 mismatches** (100% agreement) | 0 mismatches | **PASS** |
| **Feature Boundary Violations** | Value checks vs allowed ranges | **0 violations** | 0 violations | **PASS** |

---

## 4. Feature Space & Numeric Precision

| Feature | Type / Constraint | Min | Max | Unique Values | Observed Precision / Step |
|---|---|---|---|---|---|
| `study_hours_outside_classes_per_day` | Numeric | 0.5 | 7.0 | 14 | Steps of `0.5` (1 decimal place) |
| `academic_tasks_per_week` | Integer | 1 | 17 | 17 | Discrete integers (0 decimal places) |
| `academic_workload` | Integer (Likert) | 1 | 5 | 5 | Discrete integers (1, 2, 3, 4, 5) |
| `time_pressure` | Integer (Likert) | 1 | 5 | 5 | Discrete integers (1, 2, 3, 4, 5) |
| `avg_sleep_hours` | Numeric | 3.5 | 10.0 | 65 | Tenths / 1 decimal place (e.g. 5.2, 6.7) |
| `wakes_up_tired` | Integer (Likert) | 1 | 5 | 5 | Discrete integers (1, 2, 3, 4, 5) |
| `physical_activity_days_per_week` | Integer | 0 | 7 | 8 | Discrete integers (0, 1, ..., 7) |
| `difficulty_concentrating` | Integer (Likert) | 1 | 5 | 5 | Discrete integers (1, 2, 3, 4, 5) |
| `academic_emotional_exhaustion` | Integer (Likert) | 1 | 5 | 5 | Discrete integers (1, 2, 3, 4, 5) |

> **Precision Finding on Sleep Hours:**  
> The `avg_sleep_hours` feature varies continuously in tenths of an hour (e.g., 3.6, 5.2, 6.7, 7.8) with 65 distinct values. The data loader does **not** force 0.5-hour binning, preserving the observed 0.1-hour precision.

---

## 5. Target Analysis & Consistency

### 5.1 Continuous Score Distribution (`burnout_risk_score`)
- **Min:** `0.0`
- **Max:** `100.0`
- **Mean:** `44.99`
- **Standard Deviation:** `19.65`
- **Median:** `43.3`
- **Precision:** 1 decimal place

### 5.2 Categorical Class Distribution (`burnout_risk_level`)

| Class | Count | Percentage | Class Ordering Index |
|---|---|---|---|
| **Moderate** | 725 | 36.25% | 1 |
| **High** | 575 | 28.75% | 2 |
| **Low** | 481 | 24.05% | 0 |
| **Critical** | 219 | 10.95% | 3 |
| **Total** | **2,000** | **100.00%** | — |

### 5.3 Score-to-Level Threshold Verification
Threshold definitions:
- **Low:** $\text{score} < 30.0$ (Observed min: 0.0, max: 29.9, count: 481)
- **Moderate:** $30.0 \le \text{score} < 50.0$ (Observed min: 30.0, max: 49.9, count: 725)
- **High:** $50.0 \le \text{score} < 70.0$ (Observed min: 50.0, max: 69.9, count: 575)
- **Critical:** $\text{score} \ge 70.0$ (Observed min: 70.0, max: 100.0, count: 219)

**Result:** Zero rows violate the mapping rule.

---

## 6. Profile / Metadata Distributions (Non-Modeling Features)

These features represent demographic and institutional context. Per non-negotiable scope, they are excluded from feature matrix $X$ to prevent bias, spurious correlations, and demographic leakage:

- **Institution:**
  - `IIIT Pune`: 1,800 (90.0%)
  - `JNTUH`: 100 (5.0%)
  - `Unspecified`: 100 (5.0%)
- **Degree:**
  - `B.Tech`: 1,800 (90.0%)
  - `M.Tech`: 200 (10.0%)
- **Academic Year:**
  - Year 3: 720 (36.0%)
  - Year 1: 460 (23.0%)
  - Year 2: 460 (23.0%)
  - Year 4: 360 (18.0%)
- **Branch:**
  - `CSE`: 1,088 (54.4%)
  - `ECE`: 737 (36.85%)
  - `AI & DS`: 77 (3.85%)
  - `Cyber Security`: 56 (2.8%)
  - `Microelectronics and VLSI Design`: 42 (2.1%)
- **Living Arrangement:**
  - `Hostel`: 1,730 (86.5%)
  - `Day Scholar`: 155 (7.75%)
  - `PG/Other`: 115 (5.75%)

---

## 7. Data Cleaning Action & Decision

- **Data Quality Assessment:** The dataset has zero nulls, zero duplicate rows, zero duplicate feature vectors, perfectly bounded numeric features, consistent data types, and 100% threshold consistency between score and level.
- **Decision:** **No modifications or cleaning transformations are required.**
- **Preservation Action:** The original dataset `data/raw/cognivault_final_dataset.csv` is used directly in its raw form without row dropping, imputation, clipping, or synthetic re-sampling.

---

## 8. Implemented Block 1 Components

1. **`src/cognivault/config.py`**:
   - Defines paths, hashes, feature and profile column lists, explicit class ordering (`['Low', 'Moderate', 'High', 'Critical']`), and validation constraints.
2. **`src/cognivault/data.py`**:
   - `compute_sha256()` & `verify_raw_dataset_hash()`: Verifies raw CSV integrity.
   - `validate_dataframe()`: Enforces strict schema, null checks, category validity, integer/range constraints, and score-to-level alignment.
   - `load_raw_data()`: Safe data loader that verifies hash before ingestion.
   - `get_feature_matrix_and_targets()`: Strict slice yielding $X$ (exact 9 features) and targets, raising `LeakageError` if metadata or targets are detected in $X$.
   - `audit_dataset()`: Non-destructive data auditor.
3. **`tests/test_data.py`**:
   - 15 unit tests covering file existence, SHA-256 integrity, schema validation, null values, invalid categories, out-of-range features, float values on integer columns, threshold consistency, and leakage prevention.
   - **Test Status:** 15 / 15 passed in 0.42s.
4. **`pyproject.toml`**:
   - Configures `pytest` with `pythonpath = ["src"]` and dependencies.
5. **`requirements.txt`**:
   - Specifies dependencies (`pandas`, `numpy`, `scikit-learn`, `xgboost`, `pytest`).
