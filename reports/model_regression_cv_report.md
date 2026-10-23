# Cognivault AI — Continuous Score Regressor CV Evaluation Report (Block 5A)

**Target Variable:** `burnout_risk_score` (Continuous, range 0.0 to 100.0)  
**Evaluation Protocol:** Stratified 5-Fold Cross-Validation on the 1,600 training rows only  
**Primary Selection Metric:** Lowest Mean Absolute Error (MAE)  
**Held-Out Test Set:** 400 rows (Completely isolated during cross-validation)  

---

## 1. Candidate Comparison Summary Across 5 CV Folds

| Model | Preprocessing | MAE (points) | RMSE (points) | $R^2$ Score | Mean Fit Time |
|---|---|:---:|:---:|:---:|:---:|
| **DummyRegressor (Mean Baseline)** | None | 16.1152 ± 0.1816 | 19.7674 ± 0.3611 | -0.0001 | 0.0004s |
| **Ridge Regression (Selected)** | `StandardScaler` (fold-isolated) | **3.3140 ± 0.0873** | **4.1236 ± 0.1295** | **0.9564 ± 0.0029** | **0.0020s** |
| **RandomForestRegressor** | None (Tree-based) | 3.9212 ± 0.1409 | 4.9261 ± 0.1937 | 0.9377 ± 0.0053 | 0.0935s |

---

## 2. Selection Rationale

1. **Lowest Cross-Validation MAE:**  
   Ridge regression achieves a Mean Absolute Error of **3.3140 points** on the 0–100 scale, outperforming RandomForestRegressor (3.9212 points) by over 0.56 points and crushing the Dummy baseline (16.12 points).
2. **Superior Generalization Variance Explained ($R^2$):**  
   Ridge achieves an $R^2$ of **0.9564**, explaining over **95.6%** of total score variance across the 5 CV folds.
3. **Architectural Parity with Classifier:**  
   The Ridge pipeline mirrors the selected Logistic Regression classifier (`StandardScaler` + linear estimator), providing consistent linear coefficient interpretations across both classification and regression tasks.
4. **Computational Efficiency:**  
   Ridge fits in under 5 milliseconds per fold, approximately 30x faster than Random Forest Regressor.

---

## 3. Fold-by-Fold Performance Breakdown (Ridge Regression)

| Fold # | Val Samples | MAE (points) | RMSE (points) | $R^2$ Score | Fit Time (s) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Fold 0 | 320 | 3.2735 | 4.0275 | 0.9564 | 0.0020s |
| Fold 1 | 320 | 3.2607 | 4.1414 | 0.9570 | 0.0020s |
| Fold 2 | 320 | 3.4873 | 4.3690 | 0.9513 | 0.0020s |
| Fold 3 | 320 | 3.2598 | 4.0495 | 0.9602 | 0.0020s |
| Fold 4 | 320 | 3.2885 | 4.0306 | 0.9571 | 0.0020s |

---

## 4. Leakage & Isolation Safeguards

- Preprocessing (`StandardScaler`) is fitted strictly on each CV fold's 1,280 training samples.
- The 400 held-out test rows were **never** accessed, fitted, or evaluated during model selection.
- All 5 profile/demographic columns and categorical targets were excluded from feature inputs.
