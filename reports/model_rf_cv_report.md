# Cognivault AI — Random Forest Classifier CV Evaluation Report (Block 3A)

**Model:** `RandomForestClassifier`  
**Task:** 4-class classification (`burnout_risk_level`)  
**Evaluation Protocol:** Stratified 5-Fold Cross-Validation on the 1,600 training rows only  
**Held-Out Test Set:** Completely isolated (400 rows, 0 evaluations)  
**Random State:** 42  

---

## 1. Hyperparameters

```json
{
  "n_estimators": 100,
  "max_depth": 12,
  "min_samples_split": 5,
  "min_samples_leaf": 2,
  "class_weight": "balanced",
  "random_state": 42,
  "n_jobs": -1
}
```

---

## 2. Cross-Validation Summary Metrics (Mean ± Std)

Metrics are computed across the 5 validation folds (320 rows each).  
*Note on standard deviation:* Standard deviations are shown as population std (ddof=0) / sample std (ddof=1).

| Metric | Mean | Std (ddof=0) | Std (ddof=1) | Min Fold | Max Fold | Definition / Mathematical Formula |
|---|---|---|---|---|---|---|
| **Macro F1** | **0.8440** | ± 0.0169 | ± 0.0189 | 0.8119 | 0.8590 | Unweighted mean of per-class F1 scores |
| **Accuracy** | **0.8406** | ± 0.0168 | ± 0.0188 | 0.8094 | 0.8562 | Total correct / Total predictions |
| **Weighted F1** | **0.8407** | ± 0.0170 | ± 0.0190 | 0.8091 | 0.8566 | Support-weighted mean of per-class F1 |
| **High Recall** | **0.8109** | ± 0.0433 | ± 0.0484 | 0.7391 | 0.8478 | $TP_{High} / N_{High}$ |
| **Critical Recall** | **0.8286** | ± 0.0542 | ± 0.0606 | 0.7429 | 0.8857 | $TP_{Critical} / N_{Critical}$ |
| **Combined High/Crit Recall (Exact)** | **0.8157** | ± 0.0409 | ± 0.0458 | 0.7402 | 0.8583 | $(TP_{High} + TP_{Critical}) / (N_{High} + N_{Critical})$ |
| **Severe-Tier Detection Recall** | **0.9008** | ± 0.0321 | ± 0.0359 | 0.8425 | 0.9370 | Predicted $\in \{High, Crit\}$ for True $\in \{High, Crit\}$ |
| **Fit Time (s)** | **0.1123s** | ± 0.0022s | ± 0.0025s | 0.1100s | 0.1162s | Wall-clock training duration per fold |

---

## 3. Fold-by-Fold Performance Breakdown

| Fold # | Val Samples | Macro F1 | Accuracy | Weighted F1 | High Recall | Critical Recall | Combined Exact | Severe Tier Recall | Fit Time (s) |
|---|---|---|---|---|---|---|---|---|---|
| Fold 0 | 320 | 0.8532 | 0.8562 | 0.8566 | 0.8478 | 0.8286 | 0.8425 | 0.9370 | 0.1105s |
| Fold 1 | 320 | 0.8423 | 0.8375 | 0.8370 | 0.7826 | 0.8857 | 0.8110 | 0.8976 | 0.1118s |
| Fold 2 | 320 | 0.8119 | 0.8094 | 0.8091 | 0.7391 | 0.7429 | 0.7402 | 0.8425 | 0.1100s |
| Fold 3 | 320 | 0.8590 | 0.8500 | 0.8500 | 0.8478 | 0.8857 | 0.8583 | 0.9213 | 0.1162s |
| Fold 4 | 320 | 0.8533 | 0.8500 | 0.8506 | 0.8370 | 0.8000 | 0.8268 | 0.9055 | 0.1132s |

---

## 4. Out-of-Fold Confusion Matrix

Predictions aggregated across all 5 validation folds (1,600 training instances):

| Actual \ Predicted | Low | Moderate | High | Critical | Total True | Exact Class Recall |
|---|---|---|---|---|---|---|
| **Low** | 340 | 45 | 0 | 0 | 385 | 88.31% |
| **Moderate** | 34 | 487 | 59 | 0 | 580 | 83.97% |
| **High** | 0 | 63 | 373 | 24 | 460 | 81.09% |
| **Critical** | 0 | 0 | 30 | 145 | 175 | 82.86% |

### Mathematical Derivation of Combined Metrics from Confusion Matrix

1. **Pooled Exact High/Critical Recall:**
   $$\text{Exact Combined Recall} = \frac{TP_{High} + TP_{Critical}}{N_{High} + N_{Critical}} = \frac{373 + 145}{460 + 175} = \frac{518}{635} = 0.8157 \quad (81.57\%)$$
   - Fold mean: **0.8157 ± 0.0409**

2. **Severe-Tier Detection Recall (Safety / Clinical Screening):**
   $$\text{Severe Tier Recall} = \frac{(373 + 24) + (30 + 145)}{460 + 175} = \frac{397 + 175}{635} = \frac{572}{635} = 0.9008 \quad (90.08\%)$$
   - Fold mean: **0.9008 ± 0.0321**
   - **Clinical Context:** Only 63 out of 635 severe cases (all from High) were misclassified into lower risk tiers (all into Moderate). Zero Critical cases were misclassified into Moderate or Low.

---

## 5. Mean Feature Importances Across Folds

| Rank | Feature Name | Mean Importance | Std Dev |
|---|---|---|---|
| 1 | `academic_emotional_exhaustion` | 0.3084 | ± 0.0014 |
| 2 | `difficulty_concentrating` | 0.1431 | ± 0.0080 |
| 3 | `avg_sleep_hours` | 0.1322 | ± 0.0056 |
| 4 | `time_pressure` | 0.1034 | ± 0.0061 |
| 5 | `academic_workload` | 0.0793 | ± 0.0040 |
| 6 | `wakes_up_tired` | 0.0726 | ± 0.0055 |
| 7 | `physical_activity_days_per_week` | 0.0615 | ± 0.0019 |
| 8 | `academic_tasks_per_week` | 0.0514 | ± 0.0019 |
| 9 | `study_hours_outside_classes_per_day` | 0.0482 | ± 0.0028 |

---

## 6. Leakage & Scope Safeguards

- **Test Set Protection:** The 400 held-out test records were **never** accessed, fitted, or evaluated.
- **Profile / Target Exclusion:** Confirmed that `institution`, `degree`, `year`, `branch`, `living_arrangement`, and `burnout_risk_score` were strictly excluded from $X$.
- **Class Ordering:** Explicitly preserved as `['Low', 'Moderate', 'High', 'Critical']`.
