# Cognivault AI — Classifier Model Selection Report (Block 4A)

**Date:** 2026-10-15  
**Evaluation Scope:** 4-Class Classification (`burnout_risk_level`: Low, Moderate, High, Critical)  
**Evaluation Protocol:** Stratified 5-Fold Cross-Validation on the 1,600 training rows only  
**Held-Out Test Set:** 400 rows (Strictly isolated; zero evaluations conducted)  

---

## 1. Executive Summary & Provisional Model Selection

Three candidate classification models were implemented, tuned, and evaluated across identical five-fold stratified cross-validation splits using the shared manifest ([`data/interim/split_indices.json`](file:///d:/ml%20model/Cognivault/data/interim/split_indices.json)) and the exact nine approved model features:

1. **Random Forest Classifier** (`RandomForestClassifier`, depth=12, balanced weights)
2. **Logistic Regression Pipeline** (`Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression(C=1.0, class_weight='balanced'))])`)
3. **XGBoost Classifier** (`xgb.XGBClassifier`, depth=4, lr=0.1, sub=0.8, col=0.8, balanced sample weights)

### Provisional Selection: **Logistic Regression Pipeline**
The **Logistic Regression Pipeline** is selected as the winning classifier for the final held-out test evaluation. It achieves the **highest cross-validation Macro F1 (0.8657)**, the **highest Accuracy (86.13%)**, and an outstanding **Critical Recall of 94.29%**, while offering complete linear transparency, standardized coefficients for explainability, and near-instantaneous inference (~11ms fit time).

---

## 2. Comprehensive 3-Way Classifier Cross-Validation Comparison

All metrics were computed across the exact same 5 CV folds (320 validation samples per fold, 1,280 training samples per fold):

| Metric | Random Forest (3A) | Logistic Regression (3B) | XGBoost (3C) | Top Performer |
|---|:---:|:---:|:---:|:---:|
| **Macro F1 (Primary Metric)** | 0.8440 ± 0.0169 | **0.8657 ± 0.0144** | 0.8500 ± 0.0150 | **Logistic Regression (+0.0157 over XGB)** |
| **Accuracy** | 0.8406 ± 0.0168 | **0.8613 ± 0.0164** | 0.8469 ± 0.0151 | **Logistic Regression (+0.0144 over XGB)** |
| **Weighted F1** | 0.8407 ± 0.0170 | **0.8607 ± 0.0168** | 0.8466 ± 0.0154 | **Logistic Regression (+0.0141 over XGB)** |
| **High Recall** | **0.8109 ± 0.0433** | **0.8109 ± 0.0459** | 0.8087 ± 0.0410 | **Tied (LR / RF)** |
| **Critical Recall** | 0.8286 ± 0.0542 | **0.9429 ± 0.0313** | 0.8686 ± 0.0464 | **Logistic Regression (+0.0743 over XGB)** |
| **Combined Exact High/Crit Recall** | 0.8157 ± 0.0409 | **0.8472 ± 0.0378** | 0.8252 ± 0.0343 | **Logistic Regression (+0.0220 over XGB)** |
| **Severe-Tier Detection Recall** | 0.9008 ± 0.0321 | **0.9228 ± 0.0367** | 0.9118 ± 0.0265 | **Logistic Regression (+0.0110 over XGB)** |
| **Fold-to-Fold Macro F1 Stability** | Min: 0.8119, Max: 0.8590 | **Min: 0.8462, Max: 0.8816** | Min: 0.8281, Max: 0.8665 | **Logistic Regression (Lowest variance)** |
| **Mean Fit Time** | 0.1138s | **0.0111s** | 0.1802s | **Logistic Regression (~16x faster)** |

*Note on standard deviations:* Shown as population std ($\text{ddof}=0$). Sample standard deviations ($\text{ddof}=1$) are recorded in the respective model reports.

---

## 3. Selection Rationale Against Project Rules

Section 3 and Section 5 of [`PROJECT_CONTEXT.md`](file:///d:/ml%20model/Cognivault/PROJECT_CONTEXT.md) lay down explicit rules for model selection:

1. **Primary Metric (Cross-Validation Macro F1):**
   - Logistic Regression leads with **0.8657**, outperforming XGBoost (0.8500) by +0.0157 and Random Forest (0.8440) by +0.0217.
2. **Cost-Sensitive Objective ("Missing a high-risk student is the costly error"):**
   - Under-triaging a student in **Critical** burnout risk is the most dangerous failure mode in an awareness prototype.
   - Logistic Regression achieves a **94.29% Critical Recall** (165 out of 175 Out-of-Fold Critical instances identified; missing only 10, all classified as High).
   - In contrast, Random Forest missed 30 Critical instances (82.86% recall), and XGBoost missed 23 Critical instances (86.86% recall).
3. **Principle of Parsimony & Simplicity:**
   - *Project Rule:* "Prefer the simpler model if its macro F1 is within one standard deviation of the best and its High/Critical recall is not materially worse."
   - Here, Logistic Regression is not merely *within* one standard deviation of the complex models—**it outright outperforms them** while being substantially simpler, lighter, and faster.
4. **Interpretability & Explainability:**
   - Logistic Regression directly exposes linear log-odds coefficients per feature and class (e.g. `academic_emotional_exhaustion` coefficient of $+0.8738$ for Critical; `avg_sleep_hours` coefficient of $-0.6946$ for Critical).
   - This linear structure guarantees consistent, intuitive directionality for the downstream SHAP explainer and What-If simulator.

---

## 4. Metric Clarifications & Derivations

To maintain mathematical rigor across the project, two complementary recall metrics are tracked:

1. **Combined Exact-Class High/Critical Recall:**
   $$\text{Combined Recall}_{\text{exact}} = \frac{TP_{\text{High}} + TP_{\text{Critical}}}{N_{\text{High}} + N_{\text{Critical}}} = \frac{373 + 165}{460 + 175} = \frac{538}{635} = \mathbf{84.72\%}$$
   Evaluates exact target agreement for the two highest tiers.

2. **Severe-Tier Detection Recall (Safety / Clinical Screening):**
   $$\text{Severe Tier Recall} = \frac{\text{True High/Crit Cases Predicted as High or Crit}}{N_{\text{High}} + N_{\text{Critical}}} = \frac{(373 + 38) + (10 + 165)}{460 + 175} = \frac{586}{635} = \mathbf{92.28\%}$$
   Evaluates whether severe cases are safely retained within the combined severe tier. For Logistic Regression, only 49 out of 635 severe cases were routed to lower tiers (all to Moderate; zero to Low).

---

## 5. Verification of Protocol & Isolation

1. **Shared Split Manifest Integrity:**  
   All three models were evaluated strictly using the partitions in [`data/interim/split_indices.json`](file:///d:/ml%20model/Cognivault/data/interim/split_indices.json) (SHA-256: `f9c492abe9d7956429719ce5ab06d073a91fe1de8ec50148a105c71cdc1958de`).
2. **Zero Test Set Leakage:**  
   The 400 held-out test rows were never used for model fitting, hyperparameter exploration, threshold tuning, or scaling.
3. **Feature Space Sanctity:**  
   $X$ is strictly restricted to the 9 approved questionnaire features. Profile fields (`institution`, `degree`, `year`, `branch`, `living_arrangement`) and targets were excluded from model inputs.
4. **Raw Dataset Sanctity:**  
   The raw CSV ([`data/raw/cognivault_final_dataset.csv`](file:///d:/ml%20model/Cognivault/data/raw/cognivault_final_dataset.csv)) remains byte-for-byte unchanged with SHA-256: `b2c24f334cd6cef42265c29659b28291f040ab17ec30278aa175af3d06e2a762`.

---

## 6. Project Limitations & Synthetic Scope

- **Synthetic Nature:** All labels and data are synthetic. Metrics indicate agreement with synthetic generation rules and do not constitute clinical or real-world validity.
- **Awareness Prototype Only:** The model outputs an informational risk awareness indicator, not a medical or clinical burnout diagnosis.
- **Sub-tier Thresholding:** All classification boundaries are derived from the 0–100 continuous score thresholds ($<30, 30–<50, 50–<70, \ge 70$).

---

## 7. Protocol for Block 4B (Final Test Set Evaluation)

When authorized to proceed to the held-out test evaluation:
1. **Fit Candidate Model:** Fit the selected `Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression(C=1.0, class_weight='balanced', random_state=42))])` on the **complete 1,600 training instances**.
2. **Single-Pass Test Prediction:** Generate predictions on the **400 held-out test instances** exactly once.
3. **No Retuning:** Under no circumstances will hyperparameters, features, or thresholds be adjusted after viewing test set performance.
4. **Final Reporting:** Report final Test Accuracy, Test Macro F1, Test Weighted F1, Test High/Critical Recall, Confusion Matrix, and generalization delta (Test vs. CV).
