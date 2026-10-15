# Cognivault AI - PROJECT_CONTEXT.md

Put this file in the repo root. Every block prompt starts with: "Read PROJECT_CONTEXT.md first."
If something in the code disagrees with this file, STOP and report the disagreement. Do not silently pick one.

## 1. What we are building (ML part only)

Cognivault AI is an explainable student burnout-RISK AWARENESS prototype. Our team owns ONLY the ML part.
FastAPI, React and the database belong to others; we deliver a stable Python inference function.

The ML part must provide:
1. A classifier for risk level: Low / Moderate / High / Critical.
2. A regressor for the 0-100 risk score (the app shows e.g. "61/100 - High").
3. SHAP explanations of the prediction.
4. A what-if simulator (change sleep / workload / activity, show before/after model output).
5. A saved pipeline + metadata + one `predict()` function.

It is NOT a diagnostic tool and NOT clinically validated.

## 2. The data (dataset v2.0, seed 42)

Files (already exist - do not regenerate or overwrite without being asked):
- `cognivault_dataset.csv` - 2,000 rows, 18 columns, ALL rows synthetic (`data_source = "synthetic"`)
- `cognivault_hci_preferences.csv` - app-preference fields, NEVER model inputs
- `generate_dataset.py` - generator; contains the true formula (`base_score`, `WEIGHTS`, `THRESHOLDS`, `FEATURES`)
- `ml_training.py` - first model comparison; defines `FEATURE_COLUMNS`, `FEATURE_SCHEMA`, `validate_feature_frame()`
- `explanation_faithfulness.py` - Phase 2 experiment (already run once)
- `data_dictionary.md`, `dataset_report.md`

Columns by role:
| Role | Columns | In X? |
|---|---|---|
| Identifier / metadata | `student_id`, `data_source` | NEVER |
| Profile (analysis only) | `institution`, `degree`, `year`, `branch`, `living_arrangement` | NO |
| **Features (X) - exactly these 9, in this order** | see table below | YES |
| Targets | `burnout_risk_score`, `burnout_risk_level` | NEVER in X |

The 9 features:
| Column | Type | Allowed values | Risk direction |
|---|---|---|---|
| `study_hours_outside_classes_per_day` | float | 0-12, step 0.5 (DAILY hours, not weekly) | higher = more risk |
| `academic_tasks_per_week` | int | 0-25 (a count) | higher = more risk |
| `academic_workload` | int | 1-5 | higher = more risk |
| `time_pressure` | int | 1-5 | higher = more risk |
| `avg_sleep_hours` | float | 3.0-10.0, step 0.5 | LOWER = more risk |
| `wakes_up_tired` | int | 1-5 | higher = more risk |
| `physical_activity_days_per_week` | int | 0-7 (days with >= 30 min activity) | LOWER = more risk |
| `difficulty_concentrating` | int | 1-5 | higher = more risk |
| `academic_emotional_exhaustion` | int | 1-5 | higher = more risk |

Profile fields are excluded from X on purpose: the formula does not use them, they add no signal (ablation in
`ml_training.py` confirmed this), and a student cannot "change their branch" in a what-if. Do not add them to X.

## 3. How the labels were made (synthetic proxy, NOT real burnout)

Six indices, each 0-1 (1 = most risk):
```
workload      = 0.40*(academic_workload-1)/4 + 0.30*min(study_hours/9,1) + 0.30*min(tasks/18,1)
time_pressure = (time_pressure-1)/4
sleep         = 0.60*clip((8-avg_sleep_hours)/4,0,1) + 0.40*(wakes_up_tired-1)/4
activity      = 1 - min(physical_activity_days/5, 1)
concentration = (difficulty_concentrating-1)/4
exhaustion    = (academic_emotional_exhaustion-1)/4

base  = 100*(0.18*workload + 0.14*time_pressure + 0.18*sleep + 0.08*activity + 0.16*concentration + 0.26*exhaustion)
        + 10*workload*sleep
score = round(clip(base + Normal(0, 4), 0, 100), 1)
```
Thresholds: Low < 30 | Moderate 30-<50 | High 50-<70 | Critical >= 70.
Class counts: Low 419, Moderate 670, High 576, Critical 335.
The source of truth is `generate_dataset.py`; if this text and the code differ, the code wins and you must report it.

## 4. Results we already have (do not "improve" these by tuning on the test set)

Held-out test (stratified 80/20, seed 42, 400 rows), from `ml_training.py`:
| Model | Accuracy | Macro F1 |
|---|---|---|
| Logistic Regression | 0.860 | 0.865 |
| Random Forest | 0.850 | 0.859 |
| Decision Tree | 0.735 | 0.754 |

- 100% of errors are to the ADJACENT risk level (never Low <-> Critical).
- Linear regression on the score gets R^2 = 0.963: labels are nearly a linear function of the inputs.
- The noise-free formula reproduces only ~87% of stored labels. So ~87% is the realistic ceiling.
  100% accuracy is impossible here without removing the noise or leaking the target. We do NOT chase it.

Explanation faithfulness (score regressors, 400 explained rows, label-noise SD 4):
| Explainer | Global rank corr. | Local rank corr. (mean) | Top-1 driver match |
|---|---|---|---|
| Linear Regression | 1.00 | 0.98 | 95% |
| XGBoost | 1.00 | 0.95 | 90% |
| Random Forest | 0.90 | 0.92 | 80% |
Baselines (global-average only / another student's explanation) score about 0.07 / 0.03 local corr.
Single seed, single split: treat differences of a few hundredths as noise.

## 5. Decisions already locked (do not reopen without a reason)

- Primary selection metric: macro F1. Secondary: High and Critical recall (missing a high-risk student is the costly error).
- Selection uses stratified 5-fold CV on the TRAIN split only. The test set is used once, for the final report.
- Hyper-parameters: small, fixed grids at most. No tuning on the test set.
- Class imbalance is mild (17-34% per class): use `class_weight="balanced"` where supported; do NOT use SMOTE.
- Keep the simpler model if a complex one is not meaningfully better. Logistic Regression is the current front-runner.
- Seed = 42 everywhere.
- Never present accuracy as real-world burnout detection. It measures agreement with our synthetic rule.
- What-if outputs are hypothetical model outputs, not proof that a habit change reduces real burnout.
- SHAP shows what the MODEL uses, not the causes of a student's burnout.

## 6. Open items / assumptions to verify

- The 9 features are an ASSUMED mapping of our 16-question Google Form. The exact question wording, Likert anchors
  and units must be checked against the real form before any real data is used.
- Real validation needs consented responses plus an independent validated burnout measure. Not available yet.
- Classifier-probability faithfulness (vs the 0-100 score) is not yet tested.

## 7. Global rules for every block (paste once at the start of each Antigravity session)

1. Read PROJECT_CONTEXT.md first. Do NOT re-audit the project from scratch.
2. Change or create only the files named in the block. Never overwrite the dataset or the existing scripts unless told to.
3. Write verbose, readable code: clear variable names, comments explaining why, no clever one-liners.
4. Run the code and the tests. Report the exact commands and the real output. Never invent metrics.
5. If a test fails, fix it inside this block. Do not move on.
6. Keep X to the 9 features. No IDs, profile fields, targets, HCI columns or anything derived from the targets.
7. Seed 42. No tuning on the test set. No promise of 100% accuracy.
8. End with: files changed, commands run, pass/fail, unresolved issues.
