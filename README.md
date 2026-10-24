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
├── notebooks/                               # 🌟 Exploratory & Training Notebooks
│   ├── 01_data_cleaning.ipynb               # Step 1: Data quality audit & cleaning
│   ├── 02_eda.ipynb                         # Step 2: Visualizations, distributions & correlations
│   └── 03_model_training_and_evaluation.ipynb # Step 3: Feature selection, 5-Fold CV, and evaluation
│
├── models/
│   ├── logistic_regression_model.joblib     # 🏆 Selected champion model artifact (~2 KB)
│   └── random_forest_model.joblib           # Benchmark ensemble model artifact
│
├── docs/
│   └── BACKEND_INTEGRATION_GUIDE.md         # 🔌 Backend & API integration instructions
│
├── src/cognivault/
│   ├── config.py                            # Central configuration (feature names, ranges, paths)
│   ├── features.py                          # Data cleaning & feature separation functions
│   └── predict.py                           # Single-line inference helper for backend
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
3. `notebooks/03_model_training_and_evaluation.ipynb`: Runs 5-fold cross-validation and generates evaluation metrics and confusion matrix.

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

## 🏆 Selected Champion Model: Logistic Regression

The primary classifier deployed for backend inference is **Logistic Regression** (`models/logistic_regression_model.joblib`):

- **Architecture:** `StandardScaler` + `LogisticRegression(C=1.0, class_weight='balanced', solver='lbfgs')`
- **Performance:**
  - **Macro F1:** **84.1%** on held-out test data (**86.6%** in 5-fold cross-validation)
  - **Overall Accuracy:** **83.5%**
  - **Critical Burnout Recall:** **90.9%** (successfully identifies >90% of students in severe burnout)
  - **High Risk Recall:** **77.4%**
- **File Size:** **~2 KB** (Loads in <1 millisecond in FastAPI)
- **Automatic Scaling:** `StandardScaler` is inside the pipeline, so raw survey numbers can be passed directly without manual normalization.

For complete backend API code snippets, see [`docs/BACKEND_INTEGRATION_GUIDE.md`](file:///d:/ml%20model/Cognivault/docs/BACKEND_INTEGRATION_GUIDE.md).

---

## 🎓 Viva / Academic Defense Q&A

**Q1: Why was Logistic Regression selected as the final classifier?**  
*Answer:* In our cross-validation experiments, Logistic Regression achieved the highest Macro F1 (86.6%) and the highest recall on Critical burnout cases (90.9%), while being ultra-lightweight (~2 KB) and inherently explainable through odds ratios.

**Q2: Why did you check Precision and Macro F1 instead of just Accuracy?**  
*Answer:* In real student burnout data, Critical risk is a minority class (~10.8%). Accuracy alone can hide poor minority detection. Macro F1 averages the F1-score across all 4 classes equally, ensuring the model is penalized if it misses high-risk students.

**Q3: Why did you exclude demographic features (degree, branch, year)?**  
*Answer:* Demographics add demographic bias, lack predictive signal for individual burnout habits, and cannot be changed by a student. Excluding them keeps the model actionable and focused strictly on workload and wellness behaviors.

**Q4: How did you ensure there is no data leakage?**  
*Answer:* We split our data into 80% train and 20% test using a stratified split *before* modeling. `StandardScaler` was fitted strictly on the training partition inside the pipeline.
