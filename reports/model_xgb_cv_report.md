# Cognivault AI — XGBoost Classifier CV Evaluation Report (Block 3C)

**Model:** `xgb.XGBClassifier`  
**Task:** 4-class classification (`burnout_risk_level`)  
**Evaluation Protocol:** Stratified 5-Fold Cross-Validation on the 1,600 training rows only  
**Held-Out Test Set:** Completely isolated (400 rows, 0 evaluations)  
**Random State:** 42  

---

## 1. Hyperparameters & Configuration

```json
{
  "n_estimators": 100,
  "max_depth": 4,
  "learning_rate": 0.1,
  "subsample": 0.8,
  "colsample_bytree": 0.8,
  "eval_metric": "mlogloss",
  "tree_method": "hist",
  "random_state": 42,
  "n_jobs": -1
}
```

- **Sample Weighting:** Balanced sample weighting (`compute_sample_weight('balanced', y_train_fold)`) fitted strictly per fold to mitigate class imbalance on the Critical tier.
- **Explicit Label Order:** `Low -> 0`, `Moderate -> 1`, `High -> 2`, `Critical -> 3`.

---

## 2. Cross-Validation Summary Metrics (Mean ± Std)

Metrics are computed across the 5 validation folds (320 rows each).  
*Standard deviations:* Population std ($	ext{ddof}=0$) / Sample std ($	ext{ddof}=1$).

| Metric | Mean | Std (ddof=0) | Std (ddof=1) | Min Fold | Max Fold | Definition / Mathematical Formula |
|---|---|---|---|---|---|---|
| **Macro F1** | **0.8500** | ± 0.0150 | ± 0.0167 | 0.8281 | 0.8665 | Unweighted mean of per-class F1 scores |
| **Accuracy** | **0.8469** | ± 0.0151 | ± 0.0168 | 0.8219 | 0.8625 | Total correct / Total predictions |
| **Weighted F1** | **0.8466** | ± 0.0154 | ± 0.0172 | 0.8214 | 0.8622 | Support-weighted mean of per-class F1 |
| **High Recall** | **0.8087** | ± 0.0410 | ± 0.0459 | 0.7500 | 0.8587 | $TP_{High} / N_{High}$ |
| **Critical Recall** | **0.8686** | ± 0.0464 | ± 0.0519 | 0.8000 | 0.9143 | $TP_{Critical} / N_{Critical}$ |
| **Combined High/Crit Recall (Exact)** | **0.8252** | ± 0.0343 | ± 0.0383 | 0.7795 | 0.8583 | $(TP_{High} + TP_{Critical}) / (N_{High} + N_{Critical})$ |
| **Severe-Tier Detection Recall** | **0.9118** | ± 0.0265 | ± 0.0297 | 0.8661 | 0.9370 | Predicted $\in \{High, Crit\}$ for True $\in \{High, Crit\}$ |
| **Fit Time (s)** | **0.1785s** | ± 0.0173s | ± 0.0193s | 0.1603s | 0.2105s | Wall-clock XGBoost fit duration per fold |

---

## 3. Fold-by-Fold Performance Breakdown

| Fold # | Val Samples | Macro F1 | Accuracy | Weighted F1 | High Recall | Critical Recall | Combined Exact | Severe Tier Recall | Fit Time (s) |
|---|---|---|---|---|---|---|---|---|---|
| Fold 0 | 320 | 0.8617 | 0.8562 | 0.8564 | 0.8370 | 0.9143 | 0.8583 | 0.9291 | 0.1807s |
| Fold 1 | 320 | 0.8368 | 0.8375 | 0.8364 | 0.7500 | 0.8857 | 0.7874 | 0.8976 | 0.1698s |
| Fold 2 | 320 | 0.8281 | 0.8219 | 0.8214 | 0.7717 | 0.8000 | 0.7795 | 0.8661 | 0.2105s |
| Fold 3 | 320 | 0.8665 | 0.8625 | 0.8622 | 0.8261 | 0.9143 | 0.8504 | 0.9291 | 0.1603s |
| Fold 4 | 320 | 0.8572 | 0.8562 | 0.8566 | 0.8587 | 0.8286 | 0.8504 | 0.9370 | 0.1710s |

---

## 4. Out-of-Fold Confusion Matrix

Predictions aggregated across all 5 validation folds (1,600 training instances):

| Actual \ Predicted | Low | Moderate | High | Critical | Total True | Exact Class Recall |
|---|---|---|---|---|---|---|
| **Low** | 353 | 32 | 0 | 0 | 385 | 91.69% |
| **Moderate** | 37 | 478 | 65 | 0 | 580 | 82.41% |
| **High** | 0 | 56 | 372 | 32 | 460 | 80.87% |
| **Critical** | 0 | 0 | 23 | 152 | 175 | 86.86% |

### Mathematical Derivation of Combined Metrics from Confusion Matrix

1. **Pooled Exact High/Critical Recall:**
   $$\text{Exact Combined Recall} = \frac{TP_{High} + TP_{Critical}}{N_{High} + N_{Critical}} = \frac{372 + 152}{460 + 175} = \frac{524}{635} = 0.8252 \quad (82.52\%)$$
   - Fold mean: **0.8252 ± 0.0343**

2. **Severe-Tier Detection Recall (Safety / Clinical Screening):**
   $$\text{Severe Tier Recall} = \frac{372 + 32 + 23 + 152}{460 + 175} = \frac{579}{635} = 0.9118 \quad (91.18\%)$$
   - Fold mean: **0.9118 ± 0.0265**

---

## 5. Mean Feature Importances Across Folds

| Rank | Feature Name | Mean Importance | Std Dev |
|---|---|---|---|
| 1 | `academic_emotional_exhaustion` | 0.3903 | ± 0.0062 |
| 2 | `difficulty_concentrating` | 0.1430 | ± 0.0148 |
| 3 | `time_pressure` | 0.1166 | ± 0.0167 |
| 4 | `academic_workload` | 0.0787 | ± 0.0081 |
| 5 | `avg_sleep_hours` | 0.0723 | ± 0.0051 |
| 6 | `wakes_up_tired` | 0.0720 | ± 0.0037 |
| 7 | `physical_activity_days_per_week` | 0.0516 | ± 0.0015 |
| 8 | `study_hours_outside_classes_per_day` | 0.0382 | ± 0.0011 |
| 9 | `academic_tasks_per_week` | 0.0373 | ± 0.0021 |

---

## 6. Hyperparameter Tuning Exploration on Training CV Folds

| Configuration | Macro F1 | High Recall | Critical Recall | Combined Exact | Severe Tier | Accuracy |
|---|---|---|---|---|---|---|
| `depth=3, lr=0.1, weights=False` | 0.8370 ± 0.0175 | 0.8239 | 0.7714 | 0.8094 | 0.9071 | 0.8381 |
| `depth=4, lr=0.1, weights=False` | 0.8388 ± 0.0196 | 0.8130 | 0.7943 | 0.8079 | 0.9039 | 0.8388 |
| `depth=6, lr=0.1, weights=False` | 0.8458 ± 0.0162 | 0.8065 | 0.8171 | 0.8094 | 0.8976 | 0.8444 |
| `depth=3, lr=0.1, weights=True` | 0.8376 ± 0.0194 | 0.7870 | 0.8857 | 0.8142 | 0.9165 | 0.8363 |
| `depth=4, lr=0.1, weights=True, sub=1.0, col=1.0` | 0.8434 ± 0.0144 | 0.8000 | 0.8629 | 0.8173 | 0.9150 | 0.8425 |
| **`depth=4, lr=0.1, weights=True, sub=0.8, col=0.8` (Selected)** | **0.8500 ± 0.0150** | **0.8087** | **0.8686** | **0.8252** | **0.9118** | **0.8469** |

---

## 7. Leakage & Isolation Safeguards

- **Fold Weighting Isolation:** Sample weights are computed strictly per training fold from fold targets.
- **Test Set Protection:** The 400 held-out test records were **never** accessed or evaluated.
- **Profile / Target Exclusion:** All profile columns and targets were excluded from feature matrix $X$.
