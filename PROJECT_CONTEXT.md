# Cognivault AI — Dataset-Only Project Context & Antigravity Prompts

Put this file in the project repository root as `PROJECT_CONTEXT.md`. The team will provide Antigravity with this Markdown file and exactly one dataset file: `data/raw/cognivault_final_dataset.csv` (SHA-256: `b2c24f334cd6cef42265c29659b28291f040ab17ec30278aa175af3d06e2a762`). Do not assume any other source code, reports, Google Form, generator, or previous model files exist.

---

## 0. Non-negotiable scope
We are building the ML component only for Cognivault AI, an explainable student burnout-risk awareness prototype. Other team members handle the frontend, FastAPI/backend, and database.
The only data source is the provided CSV (`data/raw/cognivault_final_dataset.csv`).
- Do not ask for or use Google Form responses.
- Do not collect new student data.
- Do not fabricate, augment, regenerate, or synthesize more records.
- Do not assume any scripts or reports exist besides this context file and the provided CSV.
- Never overwrite the raw CSV. Keep it byte-for-byte unchanged.
- Do not use profile columns as model features in the primary experiment.
- All data/labels are understood to be synthetic. The output is not a diagnosis, clinical assessment, or validated real-world burnout prediction.

The deliverable should eventually include: validated data-loading code, three comparable classifiers, a separate score regressor, evaluation reports, saved model artifacts/metadata, a stable prediction function, SHAP explanations, a what-if simulator, tests, and a model card.

---

## 1. CSV Schema & Measured Findings
The raw CSV (`data/raw/cognivault_final_dataset.csv`) has 2,000 rows and 16 columns, with no missing values, no exact duplicate rows, and no duplicate vectors across the nine intended feature columns.

### Columns in the provided CSV
**Profile/metadata columns (exclude from model inputs $X$):**
- `institution` (IIIT Pune: 1,800, Unspecified: 100, JNTUH: 100)
- `degree` (B.Tech: 1,800, M.Tech: 200)
- `year` (Year 1: 460, Year 2: 460, Year 3: 720, Year 4: 360)
- `branch` (CSE: 1,088, ECE: 737, AI & DS: 77, Cyber Security: 56, Microelectronics and VLSI Design: 42)
- `living_arrangement` (Hostel: 1,730, Day Scholar: 155, PG/Other: 115)

**Nine intended model features, in this exact order:**
1. `study_hours_outside_classes_per_day` (float: 0.5 to 7.0 in increments of 0.5)
2. `academic_tasks_per_week` (int: 1 to 17)
3. `academic_workload` (int: 1 to 5)
4. `time_pressure` (int: 1 to 5)
5. `avg_sleep_hours` (float: 3.5 to 10.0, tenths/1 decimal place)
6. `wakes_up_tired` (int: 1 to 5)
7. `physical_activity_days_per_week` (int: 0 to 7)
8. `difficulty_concentrating` (int: 1 to 5)
9. `academic_emotional_exhaustion` (int: 1 to 5)

**Targets:**
- `burnout_risk_score` — continuous numeric score, range 0.0–100.0 (1 decimal place).
- `burnout_risk_level` — categorical class with values `Low`, `Moderate`, `High`, `Critical`.

$X$ must contain exactly the nine features above. Do not use profile fields, target columns, IDs if encountered, or any field derived from either target.

### Measured Class Counts and Percentages
- `Moderate`: 725 (36.25%)
- `High`: 575 (28.75%)
- `Low`: 481 (24.05%)
- `Critical`: 219 (10.95%)

### Score-to-Level Threshold Consistency
- Low: score < 30
- Moderate: 30 ≤ score < 50
- High: 50 ≤ score < 70
- Critical: score ≥ 70
Verified: 0 threshold mismatches across all 2,000 rows.

---

## 2. Data Cleaning Principles
Cleaning means detecting and handling genuine data-quality defects, not changing valid data to make accuracy higher.
- Audit shape, column names, data types, missing values, duplicates, numeric ranges, precision, and threshold consistency.
- Never overwrite the source CSV (`data/raw/cognivault_final_dataset.csv`).
- Do not automatically drop rows, impute, clip, round, deduplicate, or relabel.
- If genuine data defects prevent safe training, create a separate cleaned copy plus a row-level change log. If validation passes cleanly (as in the raw file), use it as-is.
- Any learned preprocessing (scaling, encoding) must be fitted strictly inside training folds (zero data leakage).
- Record and verify the SHA-256 hash before and after all tasks.

---

## 3. Classification and Regression are Separate Tasks
### Classification
- Predict `burnout_risk_level` (`Low`, `Moderate`, `High`, `Critical`).
- Candidate models:
  1. Logistic Regression
  2. Random Forest
  3. XGBoost
- Evaluation: Stratified 80/20 train/test split with seed 42 (1,600 train / 400 test).
- Model selection: Stratified 5-fold cross-validation on training partition only. Primary metric: Macro F1. Also report accuracy, weighted F1, High recall, Critical recall, and fit times.
- Explicit class order: `['Low', 'Moderate', 'High', 'Critical']`.

### Regression
- Predict `burnout_risk_score` as a continuous value from 0 to 100. Evaluated separately with regression metrics (MAE, RMSE, $R^2$).

---

## 4. Global Instructions for Every Block
1. Read `PROJECT_CONTEXT.md` first.
2. Use only the supplied CSV. No Google Form, external data, new data collection, or generated records.
3. Inspect the repository, but do not assume any other files exist.
4. Never overwrite the original CSV.
5. Keep $X$ to the exact nine features listed here.
6. Audit and document data quality before training.
7. No leakage. Split before learned preprocessing; CV only on training rows.
8. Use seed 42 for the main split and reproducible model settings.
9. Never tune or select models on held-out test metrics.
10. Run code and tests; report exact commands and real outputs only.
11. End every block with: files changed, commands run, tests passed/failed, actual metrics if applicable, and unresolved issues.
12. The dataset is synthetic; do not claim real-world or clinical validity.

---

## Block Roadmap
- **BLOCK 1**: Inspect, clean if necessary, and validate the CSV. (Data audit, schema/type validation, tests, `data_quality_report.md`. No model training).
- **BLOCK 2**: Split manifest, baseline models, training pipeline infrastructure.
- **BLOCK 3A/3B/3C**: Classifier exploration and comparison (Logistic Regression, Random Forest, XGBoost).
- **BLOCK 4**: Regression model for `burnout_risk_score`.
- **BLOCK 5**: SHAP explanations and What-if simulator.
- **BLOCK 6**: Inference function, packaging, model card, and final tests.