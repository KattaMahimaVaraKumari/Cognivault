# Cognivault AI — Final Held-Out Test Report: Continuous Score Regressor (Block 5A)

**Evaluated Model:** `Pipeline([('scaler', StandardScaler()), ('regressor', Ridge(alpha=1.0, random_state=42))])`  
**Training Partition:** 1,600 rows (Stratified 80%)  
**Held-Out Test Partition:** 400 rows (Stratified 20%, evaluated exactly once)  
**Target Variable:** `burnout_risk_score` (0.0 to 100.0)  
**Evaluation Date:** 2026-10-15  

---

## 1. Held-Out Test Evaluation Summary (400 Rows)

| Metric | Held-Out Test Score | 5-Fold Cross-Validation Mean | Generalization Delta (Test - CV) |
|---|:---:|:---:|:---:|
| **Mean Absolute Error (MAE)** | **3.3017 points** | 3.3140 points | **-0.0123 points** |
| **Root Mean Squared Error (RMSE)** | **4.2093 points** | 4.1236 points | **+0.0857 points** |
| **Coefficient of Determination ($R^2$)** | **0.9517** | 0.9564 | **-0.0047** |
| **Model Fit Time (1,600 rows)** | **0.0030s** | — | — |

> **Generalization Assessment:**  
> The held-out test MAE (3.3017 points) and $R^2$ (0.9517) virtually mirror the 5-fold cross-validation estimates (3.3140 points and 0.9564). This confirms that the linear Ridge regressor generalizes stably with **zero overfitting**.

---

## 2. Prediction Boundary & Residual Analysis

| Boundary Check | Measured Value | Notes / Policy |
|---|:---:|---|
| **Minimum Predicted Score** | `-4.6415` | 1 out of 400 instances produced a slightly negative raw prediction (`-4.64`) |
| **Maximum Predicted Score** | `91.1483` | Within upper boundary of 100.0 |
| **Predictions Below 0.0** | **1** (0.25%) | A student with minimal burnout indicators (sleep 10h, exhaustion 1) |
| **Predictions Above 100.0** | **0** (0.00%) | None |
| **In-Bounds Rate ($[0, 100]$)** | **99.75%** (399 / 400) | 399 of 400 predictions fall strictly within $[0.0, 100.0]$ |
| **Silent Clipping Policy** | **None (Raw outputs preserved)** | Per project instructions, predictions were not silently clipped |

### Residual Distribution Summary
- **Mean Error (Residual Mean):** $+0.043$ points (virtually zero systematic bias).
- **Residual Standard Deviation:** $4.21$ points.
- **Max Absolute Error:** $12.18$ points (observed on extreme outlier combinations).

---

## 3. Learned Standardized Ridge Coefficients

Coefficients indicate the expected change in `burnout_risk_score` (in points) for a 1-standard-deviation increase in each feature:

| Rank | Feature Name | Standardized Coefficient ($\beta$) | Directional Impact on Burnout Risk |
|:---:|---|:---:|---|
| 1 | `academic_emotional_exhaustion` | **+8.4430** | Increases risk (+) |
| 2 | `difficulty_concentrating` | **+3.7196** | Increases risk (+) |
| 3 | `physical_activity_days_per_week` | **-2.9613** | Decreases risk (-) |
| 4 | `avg_sleep_hours` | **-2.6059** | Decreases risk (-) |
| 5 | `time_pressure` | **+2.4779** | Increases risk (+) |
| 6 | `wakes_up_tired` | **+2.2084** | Increases risk (+) |
| 7 | `academic_workload` | **+2.1442** | Increases risk (+) |
| 8 | `academic_tasks_per_week` | **+1.2747** | Increases risk (+) |
| 9 | `study_hours_outside_classes_per_day` | **+0.9741** | Increases risk (+) |

**Intercept:** `44.9002` points (baseline score for an average student).

---

## 4. Synthetic Scope & Integrity Disclaimer

- **Synthetic Data Disclaimer:** The continuous score is an artifact of the synthetic data generating process. Good regression metrics reflect strong mathematical recovery of the synthetic formula—**not clinically validated burnout severity in real human populations**.
- **No Test Set Tuning:** The held-out test evaluation was performed exactly once. The model was not modified, clipped, or retuned after observing test set results.
