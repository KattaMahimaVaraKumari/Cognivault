# Cognivault AI — Student Burnout Risk Awareness ML

An explainable machine learning prototype that predicts student burnout risk levels (`Low`, `Moderate`, `High`, `Critical`) using lifestyle and academic workload survey data.

---

## 📁 Repository Structure

```
Cognivault/
│
├── data/
│   ├── raw/
│   │   └── cognivault_final_dataset.csv     # Original raw survey dataset (2,000 rows)
│   └── processed/
│       └── cognivault_cleaned_dataset.csv   # Cleaned dataset (1,900 rows, Unspecified institution removed)
│
├── notebooks/                               # 🌟 Main Project Workflow
│   ├── 01_data_cleaning.ipynb               # Step 1: Data quality audit & cleaning
│   ├── 02_eda.ipynb                         # Step 2: Visualizations, distributions & correlations
│   └── 03_model_training_and_evaluation.ipynb # Step 3: Feature selection, 5-Fold CV, RF training & evaluation
│
├── models/
│   └── random_forest_model.joblib           # Trained Random Forest model artifact
│
├── src/cognivault/
│   ├── config.py                            # Central configuration (feature names, ranges, paths)
│   └── features.py                          # Data cleaning & feature separation functions
│
├── tests/
│   ├── test_features.py                     # Feature schema & cleaning tests
│   └── test_model.py                        # Model loading & inference tests
│
├── requirements.txt                         # Python dependencies
└── README.md                                # Project documentation & viva guide
```

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/KattaMahimaVaraKumari/Cognivault.git
cd Cognivault
pip install -r requirements.txt
```

### 2. Running the Notebooks
Open the notebooks in JupyterLab, Jupyter Notebook, or VS Code, and run them in order:
1. `notebooks/01_data_cleaning.ipynb`: Inspects raw data, audits missing values, and saves the cleaned dataset.
2. `notebooks/02_eda.ipynb`: Displays 4 interactive graphs analyzing distributions, habits across risk levels, and correlations.
3. `notebooks/03_model_training_and_evaluation.ipynb`: Runs 5-fold cross-validation, trains the Random Forest, and generates evaluation metrics, confusion matrix, and feature importance.

### 3. Running Unit Tests
To run the automated tests:
```bash
python -m pytest -v
```

---

## 📊 The 9 Survey Features

The model strictly uses these 9 survey features (demographic fields like branch and year are excluded to prevent bias and ensure lifestyle actionability):

| Feature Name | Description | Range | Risk Direction |
|---|---|---|---|
| `study_hours_outside_classes_per_day` | Daily study time outside lectures | 0.0 – 12.0 hrs | Higher = More risk |
| `academic_tasks_per_week` | Weekly assignments / homework | 0 – 25 tasks | Higher = More risk |
| `academic_workload` | Self-rated academic workload | 1 – 5 | Higher = More risk |
| `time_pressure` | Perceived deadline pressure | 1 – 5 | Higher = More risk |
| `avg_sleep_hours` | Average sleep per night | 3.0 – 10.0 hrs | **Lower = More risk** |
| `wakes_up_tired` | Morning fatigue level | 1 – 5 | Higher = More risk |
| `physical_activity_days_per_week` | Active days (>= 30 mins) | 0 – 7 days | **Lower = More risk** |
| `difficulty_concentrating` | Concentration difficulty | 1 – 5 | Higher = More risk |
| `academic_emotional_exhaustion` | Emotional fatigue | 1 – 5 | Higher = More risk |

---

## 🤖 Model & Results Summary

- **Algorithm:** Random Forest Classifier (`n_estimators=100`, `class_weight='balanced'`, `random_state=42`)
- **Validation Strategy:** Stratified 80/20 train/test split + Stratified 5-Fold Cross-Validation on the training split (zero data leakage).
- **Test Performance:**
  - **Accuracy:** ~79.2%
  - **Macro F1:** ~78.4%
  - **High Risk Recall:** ~74.8%
  - **Critical Risk Recall:** ~68.3%
- **Confusion Matrix:** All classification errors are between adjacent risk tiers (e.g., Moderate confused with Low or High). The model **never confuses Low risk with Critical risk**.
- **Top Feature Drivers:** `academic_emotional_exhaustion`, `avg_sleep_hours`, and `difficulty_concentrating`.

---

## 🎓 Viva / Academic Defense Q&A

**Q1: Why did you choose Random Forest over other models?**  
*Answer:* Random Forest is an ensemble of decision trees. It captures non-linear interactions between lifestyle habits (like high workload combined with sleep deprivation) without overfitting, handles mild class imbalance via `class_weight='balanced'`, and provides intuitive feature importance scores.

**Q2: Why did you exclude demographic features (degree, branch, year)?**  
*Answer:* Demographics add demographic bias, lack predictive signal for individual burnout habits, and cannot be changed by a student. Excluding them keeps the model actionable and focused strictly on workload and wellness behaviors.

**Q3: How did you ensure there is no data leakage?**  
*Answer:* We split our data into 80% train and 20% test using a stratified split *before* modeling. Cross-validation was performed *only* on the training data. The 20% test set was evaluated exactly once at the end.

**Q4: Is this a clinical diagnostic tool?**  
*Answer:* No. It is an educational awareness prototype trained on synthetic survey data to demonstrate machine learning concepts. It is not a clinical or medical diagnostic tool.
