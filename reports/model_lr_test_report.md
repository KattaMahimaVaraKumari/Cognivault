# Cognivault AI — Final Held-Out Test Evaluation Report (Block 4B)

**Evaluated Model:** `Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression(C=1.0, class_weight='balanced'))])`  
**Training Partition:** 1,600 rows (Stratified 80%)  
**Held-Out Test Partition:** 400 rows (Stratified 20%, evaluated exactly once)  
**Evaluation Date:** 2026-10-15  
**Random State:** 42  

---

## 1. Summary of Held-Out Test Results (400 Rows)

| Metric | Held-Out Test Score | Cross-Validation Mean (5 Folds) | Generalization Delta (Test - CV) |
|---|:---:|:---:|:---:|
| **Macro F1** | **0.8413** | 0.8657 ± 0.0144 | **-0.0244** |
| **Accuracy** | **0.8350** (334/400) | 0.8613 ± 0.0164 | **-0.0263** |
| **Balanced Accuracy** | **0.8472** | — | — |
| **Weighted F1** | **0.8354** | 0.8607 ± 0.0168 | **-0.0253** |
| **High Recall** | **0.7739** (89/115) | 0.8109 ± 0.0459 | **-0.0370** |
| **Critical Recall** | **0.9091** (40/44) | 0.9429 ± 0.0313 | **-0.0338** |
| **Combined Exact High/Crit Recall** | **0.8113** (129/159) | 0.8472 ± 0.0378 | **-0.0359** |
| **Severe-Tier Detection Recall** | **0.8994** (143/159) | 0.9228 ± 0.0367 | **-0.0235** |

> **Generalization Finding:**  
> The held-out test Macro F1 (0.8413) and Accuracy (0.8350) closely track the 5-fold cross-validation estimates (0.8657 and 0.8613) within ~0.025, confirming **strong generalization with zero evidence of severe overfitting**.

---

## 2. Per-Class Test Performance Breakdown

Explicit class ordering: `['Low', 'Moderate', 'High', 'Critical']`.

| Class | Precision | Recall | F1-Score | Support (Actual Instances) |
|---|:---:|:---:|:---:|:---:|
| **Low** | 0.9432 | 0.8646 | 0.9022 | 96 |
| **Moderate** | 0.8079 | 0.8414 | 0.8243 | 145 |
| **High** | 0.8018 | 0.7739 | 0.7876 | 115 |
| **Critical** | 0.8000 | 0.9091 | 0.8511 | 44 |
| **Macro Average** | **0.8382** | **0.8472** | **0.8413** | **400** |
| **Weighted Average** | **0.8378** | **0.8350** | **0.8354** | **400** |

---

## 3. Held-Out Test Confusion Matrix

Predictions on the 400 held-out test rows:

| Actual \ Predicted | Predicted Low | Predicted Moderate | Predicted High | Predicted Critical | Total True | Exact Recall |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Actual Low** | **83** | 13 | 0 | 0 | 96 | 86.46% |
| **Actual Moderate** | 5 | **122** | 18 | 0 | 145 | 84.14% |
| **Actual High** | 0 | 16 | **89** | 10 | 115 | 77.39% |
| **Actual Critical** | 0 | 0 | 4 | **40** | 44 | 90.91% |
| **Total Predicted** | 88 | 151 | 111 | 50 | **400** | — |

---

## 4. Mathematical Derivations of Combined Severe Metrics

1. **Combined Exact High/Critical Recall:**
   $$\text{Exact Combined Recall} = \frac{TP_{High} + TP_{Critical}}{N_{High} + N_{Critical}} = \frac{89 + 40}{115 + 44} = \frac{129}{159} = \mathbf{0.8113} \quad (81.13\%)$$

2. **Severe-Tier Detection Recall (Safety / Clinical Screening):**
   $$\text{Severe Tier Recall} = \frac{89 + 10 + 4 + 40}{115 + 44} = \frac{143}{159} = \mathbf{0.8994} \quad (89.94\%)$$

---

## 5. Error Analysis

An inspection of all misclassified instances in the 400-row test partition reveals:
1. **100% Adjacent-Tier Errors:** Every single error occurs strictly between adjacent risk levels (e.g. Moderate $\leftrightarrow$ Low or Moderate $\leftrightarrow$ High).
2. **Zero Catastrophic False Negatives:**
   - **Zero** Critical instances were predicted as Low or Moderate (0% under-triage below High).
   - **Zero** High instances were predicted as Low.
3. **Critical Recall Sensitivity:** Out of 44 true Critical instances, **40 were identified as Critical** (90.91%), and the remaining 4 were classified as High. None were under-triaged into Moderate or Low.

---

## 6. Learned Standardized Coefficients (Fitted Model)

Fitted on the complete 1,600 training instances:

| Feature Name | Low | Moderate | High | Critical |
|---|:---:|:---:|:---:|:---:|
| `study_hours_outside_classes_per_day` | -0.6491 | -0.3118 | +0.2331 | +0.7278 |
| `academic_tasks_per_week` | -0.5706 | -0.2232 | +0.1303 | +0.6635 |
| `academic_workload` | -1.1575 | -0.2916 | +0.3095 | +1.1396 |
| `time_pressure` | -1.4175 | -0.3787 | +0.3483 | +1.4479 |
| `avg_sleep_hours` | +1.5687 | +0.5857 | -0.4411 | -1.7133 |
| `wakes_up_tired` | -1.4071 | -0.3815 | +0.4305 | +1.3581 |
| `physical_activity_days_per_week` | +1.7370 | +0.5111 | -0.5437 | -1.7044 |
| `difficulty_concentrating` | -2.1032 | -0.4642 | +0.6527 | +1.9147 |
| `academic_emotional_exhaustion` | -4.7288 | -1.5402 | +1.4071 | +4.8620 |

---

## 7. Scope & Non-negotiables Reminder

- **Synthetic Nature:** All evaluations reflect agreement with the synthetic generating distribution. These metrics do not establish clinical validity or diagnostic efficacy on real-world humans.
- **Informational Awareness:** Cognivault AI is an explainable awareness prototype designed to prompt self-reflection, not a medical or diagnostic instrument.
- **Single-Pass Integrity:** This evaluation was performed exactly once on the held-out test partition. No hyperparameter tuning or feature alterations were made based on these test results.
