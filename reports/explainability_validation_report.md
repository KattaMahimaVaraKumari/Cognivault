# Cognivault AI — Explainability Validation Report (Block 6)

**Purpose:** Validates the individual explanation engine across diverse student personas.  
**Validation Criteria:**  
1. Exact additive reconstruction of continuous scores ($\|\text{intercept} + \sum \text{contrib} - \hat{y}\| < 10^{-5}$).  
2. Exact additive reconstruction of classifier logits.  
3. Correct probability normalization (sum of probabilities = 1.0).  
4. Non-causal, safe interpretation compliance.  

---

## Persona 1: Low Risk Profile (Healthy Sleep & Habits)

### 1. Model Predictions
- **Predicted Risk Level:** `Low`
- **Predicted Numerical Score:** `7.24 / 100`
- **Class Probabilities:**  
  - Low: `99.99%`  
  - Moderate: `0.01%`  
  - High: `0.00%`  
  - Critical: `0.00%`  

### 2. Additive Continuous Score Contributions (Ridge)
- **Base Score (Intercept):** `44.90` points

| Rank | Feature Name | Input Value | Z-Score | $\beta$ Weight | Contribution (Points) | Direction |
|:---:|---|:---:|:---:|:---:|:---:|---|
| 1 | `academic_emotional_exhaustion` | 1.0 | -1.61 | +8.44 | **-13.63** | pushes downward |
| 2 | `difficulty_concentrating` | 1.0 | -1.72 | +3.72 | **-6.39** | pushes downward |
| 3 | `physical_activity_days_per_week` | 5.0 | +1.55 | -2.96 | **-4.59** | pushes downward |
| 4 | `wakes_up_tired` | 1.0 | -1.85 | +2.21 | **-4.08** | pushes downward |
| 5 | `avg_sleep_hours` | 8.5 | +1.55 | -2.61 | **-4.05** | pushes downward |
| 6 | `time_pressure` | 2.0 | -0.92 | +2.48 | **-2.28** | pushes downward |
| 7 | `academic_workload` | 2.0 | -0.92 | +2.14 | **-1.97** | pushes downward |
| 8 | `academic_tasks_per_week` | 6.0 | -0.31 | +1.27 | **-0.39** | pushes downward |
| 9 | `study_hours_outside_classes_per_day` | 2.5 | -0.29 | +0.97 | **-0.28** | pushes downward |

**Mathematical Reconstruction Proof:**  
$$\text{Intercept} (44.9002) + \sum \text{Contributions} = \mathbf{7.2393}$$  
- **Raw Pipeline Prediction:** `7.2393`  
- **Reconstruction Difference:** `0.00e+00` (**Exact Bit-Level Match: True**)

### 3. Classifier Predicted Class Contributions (Logistic Regression Logit)
- **Target Class Analyzed:** `Low`
- **Class Intercept Logit:** `-0.9931`
- **Top 3 Positive Logit Drivers:**  
  - `academic_emotional_exhaustion`: +7.63 logit points (Input: 1.0)
  - `difficulty_concentrating`: +3.61 logit points (Input: 1.0)
  - `physical_activity_days_per_week`: +2.69 logit points (Input: 5.0)

**Logit Reconstruction Proof:**  
- **Reconstructed Logit:** `20.7132`  
- **Actual Model Logit:** `20.7132`  
- **Logit Difference:** `0.00e+00` (**Exact Bit-Level Match: True**)

---

## Persona 2: Moderate Risk Profile (Average Academic Stress)

### 1. Model Predictions
- **Predicted Risk Level:** `Moderate`
- **Predicted Numerical Score:** `47.90 / 100`
- **Class Probabilities:**  
  - Low: `0.08%`  
  - Moderate: `61.59%`  
  - High: `38.32%`  
  - Critical: `0.01%`  

### 2. Additive Continuous Score Contributions (Ridge)
- **Base Score (Intercept):** `44.90` points

| Rank | Feature Name | Input Value | Z-Score | $\beta$ Weight | Contribution (Points) | Direction |
|:---:|---|:---:|:---:|:---:|:---:|---|
| 1 | `physical_activity_days_per_week` | 2.0 | -0.37 | -2.96 | **+1.09** | pushes upward |
| 2 | `academic_emotional_exhaustion` | 3.0 | +0.08 | +8.44 | **+0.68** | pushes upward |
| 3 | `study_hours_outside_classes_per_day` | 3.5 | +0.49 | +0.97 | **+0.48** | pushes upward |
| 4 | `academic_tasks_per_week` | 8.0 | +0.29 | +1.27 | **+0.37** | pushes upward |
| 5 | `difficulty_concentrating` | 3.0 | +0.08 | +3.72 | **+0.29** | pushes upward |
| 6 | `avg_sleep_hours` | 6.5 | -0.08 | -2.61 | **+0.21** | pushes upward |
| 7 | `wakes_up_tired` | 3.0 | -0.03 | +2.21 | **-0.06** | pushes downward |
| 8 | `time_pressure` | 3.0 | -0.02 | +2.48 | **-0.05** | pushes downward |
| 9 | `academic_workload` | 3.0 | -0.01 | +2.14 | **-0.01** | pushes downward |

**Mathematical Reconstruction Proof:**  
$$\text{Intercept} (44.9002) + \sum \text{Contributions} = \mathbf{47.9023}$$  
- **Raw Pipeline Prediction:** `47.9023`  
- **Reconstruction Difference:** `0.00e+00` (**Exact Bit-Level Match: True**)

### 3. Classifier Predicted Class Contributions (Logistic Regression Logit)
- **Target Class Analyzed:** `Moderate`
- **Class Intercept Logit:** `+4.5692`
- **Top 3 Positive Logit Drivers:**  
  - `wakes_up_tired`: +0.01 logit points (Input: 3.0)
  - `time_pressure`: +0.01 logit points (Input: 3.0)
  - `academic_workload`: +0.00 logit points (Input: 3.0)

**Logit Reconstruction Proof:**  
- **Reconstructed Logit:** `3.9746`  
- **Actual Model Logit:** `3.9746`  
- **Logit Difference:** `0.00e+00` (**Exact Bit-Level Match: True**)

---

## Persona 3: Critical Risk Profile (Severe Exhaustion & Sleep Deficit)

### 1. Model Predictions
- **Predicted Risk Level:** `Critical`
- **Predicted Numerical Score:** `92.00 / 100`
- **Class Probabilities:**  
  - Low: `0.00%`  
  - Moderate: `0.00%`  
  - High: `0.01%`  
  - Critical: `99.99%`  

### 2. Additive Continuous Score Contributions (Ridge)
- **Base Score (Intercept):** `44.90` points

| Rank | Feature Name | Input Value | Z-Score | $\beta$ Weight | Contribution (Points) | Direction |
|:---:|---|:---:|:---:|:---:|:---:|---|
| 1 | `academic_emotional_exhaustion` | 5.0 | +1.78 | +8.44 | **+15.00** | pushes upward |
| 2 | `difficulty_concentrating` | 5.0 | +1.87 | +3.72 | **+6.97** | pushes upward |
| 3 | `physical_activity_days_per_week` | 0.0 | -1.65 | -2.96 | **+4.88** | pushes upward |
| 4 | `avg_sleep_hours` | 4.5 | -1.71 | -2.61 | **+4.47** | pushes upward |
| 5 | `time_pressure` | 5.0 | +1.78 | +2.48 | **+4.40** | pushes upward |
| 6 | `wakes_up_tired` | 5.0 | +1.79 | +2.21 | **+3.95** | pushes upward |
| 7 | `academic_workload` | 5.0 | +1.82 | +2.14 | **+3.91** | pushes upward |
| 8 | `academic_tasks_per_week` | 12.0 | +1.49 | +1.27 | **+1.89** | pushes upward |
| 9 | `study_hours_outside_classes_per_day` | 5.0 | +1.66 | +0.97 | **+1.61** | pushes upward |

**Mathematical Reconstruction Proof:**  
$$\text{Intercept} (44.9002) + \sum \text{Contributions} = \mathbf{91.9961}$$  
- **Raw Pipeline Prediction:** `91.9961`  
- **Reconstruction Difference:** `0.00e+00` (**Exact Bit-Level Match: True**)

### 3. Classifier Predicted Class Contributions (Logistic Regression Logit)
- **Target Class Analyzed:** `Critical`
- **Class Intercept Logit:** `-6.5435`
- **Top 3 Positive Logit Drivers:**  
  - `academic_emotional_exhaustion`: +8.64 logit points (Input: 5.0)
  - `difficulty_concentrating`: +3.59 logit points (Input: 5.0)
  - `avg_sleep_hours`: +2.94 logit points (Input: 4.5)

**Logit Reconstruction Proof:**  
- **Reconstructed Logit:** `20.7042`  
- **Actual Model Logit:** `20.7042`  
- **Logit Difference:** `0.00e+00` (**Exact Bit-Level Match: True**)

---

## 4. Verification & Scope Conclusion

- **Numerical Exactness:** Confirmed that for all student personas, additive feature contributions sum exactly to the continuous score and class logit with zero numerical discrepancy ($< 10^{-5}$).
- **Interpretability Transparency:** Feature importances and instance explanations are 100% auditable without approximations or sampling noise.
- **Scope Compliance:** Explanations faithfully expose internal model calculations without making unsupported real-world medical or causal claims.
