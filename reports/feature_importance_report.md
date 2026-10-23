# Cognivault AI — Global Feature Importance Report (Block 6)

**Purpose:** Comprehensive global interpretability of the trained Ridge score regressor and Logistic Regression classifier.  
**Scope:** Machine learning model interpretability on synthetic student dataset.  
**Models Analyzed:**  
- Regressor: `models/regression/regression_final_model.joblib`  
- Classifier: `models/logistic_regression/lr_final_model.joblib`  

---

## 1. Ridge Score Regressor: Standardized Coefficients

Coefficients indicate the expected additive shift in continuous `burnout_risk_score` (points on 0–100 scale) for every 1-standard-deviation increase in the feature.

**Model Baseline Intercept:** `44.9002` points (score for an average student where all z-scores = 0).

| Rank | Feature Name | Standardized $\beta$ (points/SD) | Directional Risk Impact | Plain English Description |
|:---:|---|:---:|---|---|
| 1 | `academic_emotional_exhaustion` | **+8.4430** | Increases risk (+) | Leading driver of score increase (+8.44 pts/SD) |
| 2 | `difficulty_concentrating` | **+3.7196** | Increases risk (+) | Strong cognitive fatigue contributor (+3.72 pts/SD) |
| 3 | `physical_activity_days_per_week` | **-2.9613** | Decreases risk (-) | Leading physical protective factor (-2.96 pts/SD) |
| 4 | `avg_sleep_hours` | **-2.6059** | Decreases risk (-) | Leading rest protective factor (-2.61 pts/SD) |
| 5 | `time_pressure` | **+2.4779** | Increases risk (+) | Substantial time stress driver (+2.48 pts/SD) |
| 6 | `wakes_up_tired` | **+2.2084** | Increases risk (+) | Morning fatigue symptom driver (+2.21 pts/SD) |
| 7 | `academic_workload` | **+2.1442** | Increases risk (+) | Curriculum load contributor (+2.14 pts/SD) |
| 8 | `academic_tasks_per_week` | **+1.2747** | Increases risk (+) | Weekly task volume contributor (+1.27 pts/SD) |
| 9 | `study_hours_outside_classes_per_day` | **+0.9741** | Increases risk (+) | Independent study hours contribution (+0.97 pts/SD) |

---

## 2. Logistic Regression Classifier: Standardized Log-Odds Coefficients

In multinomial Logistic Regression, each class has a linear logit equation:
$$z_k = \text{intercept}_k + \sum_{j=1}^9 \beta_{k, j} \cdot \left(\frac{x_j - \mu_j}{\sigma_j}\right)$$
Class probabilities are computed by taking the softmax across all four logits: $P(Y=k) = \frac{e^{z_k}}{\sum_{m} e^{z_m}}$.

| Feature Name | Low Tier | Moderate Tier | High Tier | Critical Tier |
|---|:---:|:---:|:---:|:---:|
| `study_hours_outside_classes_per_day` | -0.6491 | -0.3118 | +0.2331 | **+0.7278** |
| `academic_tasks_per_week` | -0.5706 | -0.2232 | +0.1303 | **+0.6635** |
| `academic_workload` | -1.1575 | -0.2916 | +0.3095 | **+1.1396** |
| `time_pressure` | -1.4175 | -0.3787 | +0.3483 | **+1.4479** |
| `avg_sleep_hours` | +1.5687 | +0.5857 | -0.4411 | **-1.7133** |
| `wakes_up_tired` | -1.4071 | -0.3815 | +0.4305 | **+1.3581** |
| `physical_activity_days_per_week` | +1.7370 | +0.5111 | -0.5437 | **-1.7044** |
| `difficulty_concentrating` | -2.1032 | -0.4642 | +0.6527 | **+1.9147** |
| `academic_emotional_exhaustion` | -4.7288 | -1.5402 | +1.4071 | **+4.8620** |

**Class Intercepts:**
- **Low:** `-0.9931`
- **Moderate:** `+4.5692`
- **High:** `+2.9674`
- **Critical:** `-6.5435`

---

## 3. Mathematical Interpretation Guidelines

1. **Log-Odds vs. Probabilities:**  
   A positive coefficient for a class means increasing that feature raises the relative log-odds for that class. Because probabilities are normalized via softmax, an increase in one class's logit simultaneously lowers the probabilities of all other classes.
2. **Standardization Context:**  
   Features are standardized ($z = \frac{x - \mu}{\sigma}$). This ensures coefficients are directly comparable in effect size regardless of original units (e.g., Likert 1–5 vs. sleep hours 3.5–10).

---

## 4. Safe Interpretation & Synthetic Scope Disclaimer

> DISCLAIMER: Explanations describe statistical associations within the trained models on a synthetic dataset. They indicate which features drove the model's output; they do NOT constitute medical advice, psychological diagnosis, or proof of causal burnout mechanisms.
