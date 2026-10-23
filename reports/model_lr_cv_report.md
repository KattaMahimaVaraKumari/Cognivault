# Cognivault AI — Logistic Regression Classifier CV Evaluation Report (Block 3B)

**Model:** `LogisticRegression` inside `Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression())])`  
**Task:** 4-class classification (`burnout_risk_level`)  
**Evaluation Protocol:** Stratified 5-Fold Cross-Validation on the 1,600 training rows only  
**Held-Out Test Set:** Completely isolated (400 rows, 0 evaluations)  
**Random State:** 42  

---

## 1. Hyperparameters & Pipeline Configuration

```json
{
  "C": 1.0,
  "class_weight": "balanced",
  "solver": "lbfgs",
  "max_iter": 1000,
  "random_state": 42
}
```

- **Preprocessing:** `StandardScaler` fitted strictly on training indices of each CV fold.
- **Pipeline Architecture:** Scikit-learn `Pipeline` guarantees zero leakage across training and validation folds.

---

## 2. Cross-Validation Summary Metrics (Mean ± Std)

Metrics are computed across the 5 validation folds (320 rows each).  
*Standard deviations:* Population std ($	ext{ddof}=0$) / Sample std ($	ext{ddof}=1$).

| Metric | Mean | Std (ddof=0) | Std (ddof=1) | Min Fold | Max Fold | Definition / Mathematical Formula |
|---|---|---|---|---|---|---|
| **Macro F1** | **0.8657** | ± 0.0144 | ± 0.0161 | 0.8462 | 0.8816 | Unweighted mean of per-class F1 scores |
| **Accuracy** | **0.8613** | ± 0.0164 | ± 0.0183 | 0.8406 | 0.8812 | Total correct / Total predictions |
| **Weighted F1** | **0.8607** | ± 0.0168 | ± 0.0188 | 0.8391 | 0.8810 | Support-weighted mean of per-class F1 |
| **High Recall** | **0.8109** | ± 0.0459 | ± 0.0513 | 0.7500 | 0.8587 | $TP_{High} / N_{High}$ |
| **Critical Recall** | **0.9429** | ± 0.0313 | ± 0.0350 | 0.8857 | 0.9714 | $TP_{Critical} / N_{Critical}$ |
| **Combined High/Crit Recall (Exact)** | **0.8472** | ± 0.0378 | ± 0.0423 | 0.7874 | 0.8819 | $(TP_{High} + TP_{Critical}) / (N_{High} + N_{Critical})$ |
| **Severe-Tier Detection Recall** | **0.9228** | ± 0.0367 | ± 0.0411 | 0.8583 | 0.9528 | Predicted $\in \{High, Crit\}$ for True $\in \{High, Crit\}$ |
| **Fit Time (s)** | **0.0110s** | ± 0.0015s | ± 0.0017s | 0.0100s | 0.0140s | Wall-clock pipeline training duration per fold |

---

## 3. Fold-by-Fold Performance Breakdown

| Fold # | Val Samples | Macro F1 | Accuracy | Weighted F1 | High Recall | Critical Recall | Combined Exact | Severe Tier Recall | Fit Time (s) |
|---|---|---|---|---|---|---|---|---|---|
| Fold 0 | 320 | 0.8782 | 0.8750 | 0.8749 | 0.8478 | 0.9714 | 0.8819 | 0.9528 | 0.0140s |
| Fold 1 | 320 | 0.8462 | 0.8406 | 0.8391 | 0.7609 | 0.9714 | 0.8189 | 0.9055 | 0.0101s |
| Fold 2 | 320 | 0.8510 | 0.8438 | 0.8430 | 0.7500 | 0.8857 | 0.7874 | 0.8583 | 0.0110s |
| Fold 3 | 320 | 0.8716 | 0.8656 | 0.8656 | 0.8587 | 0.9429 | 0.8819 | 0.9528 | 0.0100s |
| Fold 4 | 320 | 0.8816 | 0.8812 | 0.8810 | 0.8370 | 0.9429 | 0.8661 | 0.9449 | 0.0100s |

---

## 4. Out-of-Fold Confusion Matrix

Predictions aggregated across all 5 validation folds (1,600 training instances):

| Actual \ Predicted | Low | Moderate | High | Critical | Total True | Exact Class Recall |
|---|---|---|---|---|---|---|
| **Low** | 355 | 30 | 0 | 0 | 385 | 92.21% |
| **Moderate** | 35 | 485 | 60 | 0 | 580 | 83.62% |
| **High** | 0 | 49 | 373 | 38 | 460 | 81.09% |
| **Critical** | 0 | 0 | 10 | 165 | 175 | 94.29% |

### Mathematical Derivation of Combined Metrics from Confusion Matrix

1. **Pooled Exact High/Critical Recall:**
   $$\text{Exact Combined Recall} = \frac{TP_{High} + TP_{Critical}}{N_{High} + N_{Critical}} = \frac{373 + 165}{460 + 175} = \frac{538}{635} = 0.8472 \quad (84.72\%)$$
   - Fold mean: **0.8472 ± 0.0378**

2. **Severe-Tier Detection Recall (Safety / Clinical Screening):**
   $$\text{Severe Tier Recall} = \frac{373 + 38 + 10 + 165}{460 + 175} = \frac{586}{635} = 0.9228 \quad (92.28\%)$$
   - Fold mean: **0.9228 ± 0.0367**

---

## 5. Mean Standardized Feature Coefficients Across Folds

Higher positive coefficient = increases log-odds for that risk class.

| Feature Name | Low | Moderate | High | Critical |
|---|---|---|---|---|
| `study_hours_outside_classes_per_day` | +0.7089 | +0.2290 | -0.6305 | -0.3075 |
| `academic_tasks_per_week` | +0.6543 | +0.1275 | -0.5607 | -0.2211 |
| `academic_workload` | +1.1142 | +0.3001 | -1.1320 | -0.2824 |
| `time_pressure` | +1.4104 | +0.3428 | -1.3857 | -0.3675 |
| `avg_sleep_hours` | -1.6547 | -0.4308 | +1.5176 | +0.5679 |
| `wakes_up_tired` | +1.3331 | +0.4152 | -1.3751 | -0.3732 |
| `physical_activity_days_per_week` | -1.6542 | -0.5271 | +1.6850 | +0.4962 |
| `difficulty_concentrating` | +1.8705 | +0.6443 | -2.0586 | -0.4562 |
| `academic_emotional_exhaustion` | +4.6848 | +1.3589 | -4.5577 | -1.4860 |

---

## 6. Hyperparameter Tuning Exploration on Training CV Folds

| Setting | Macro F1 | High Recall | Critical Recall | Combined Exact | Severe Tier | Accuracy |
|---|---|---|---|---|---|---|
| `C=0.01, class_weight=None` | 0.7769 ± 0.0245 | 0.8087 | 0.4343 | 0.7055 | 0.8646 | 0.8156 |
| `C=0.1, class_weight=None` | 0.8595 ± 0.0145 | 0.8478 | 0.7543 | 0.8220 | 0.9055 | 0.8619 |
| `C=1.0, class_weight=None` | 0.8649 ± 0.0140 | 0.8413 | 0.8229 | 0.8362 | 0.9150 | 0.8644 |
| `C=0.1, class_weight=balanced` | 0.8618 ± 0.0198 | 0.7891 | 0.9486 | 0.8331 | 0.9118 | 0.8575 |
| **`C=1.0, class_weight=balanced` (Selected)** | **0.8657 ± 0.0144** | **0.8109** | **0.9429** | **0.8472** | **0.9228** | **0.8613** |
| `C=5.0, class_weight=balanced` | 0.8622 ± 0.0161 | 0.8130 | 0.9314 | 0.8457 | 0.9244 | 0.8581 |

---

## 7. Leakage & Isolation Safeguards

- **Strict Preprocessing Isolation:** `StandardScaler` was instantiated inside an `sklearn.pipeline.Pipeline` and fitted purely on each fold's training rows.
- **Test Set Protection:** The 400 held-out test records were **never** accessed or evaluated.
- **Profile / Target Exclusion:** All profile columns and targets were excluded from feature matrix $X$.
