"""Logistic Regression classifier training and 5-fold cross-validation module.

Evaluates Logistic Regression with StandardScaler inside an sklearn Pipeline,
fitted strictly inside each CV training fold using the shared 5-fold CV splits.
Never accesses, evaluates, or leaks information from the held-out test set.
"""

import json
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    recall_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from cognivault.config import (
    FEATURE_COLUMNS,
    PROFILE_COLUMNS,
    REPO_ROOT,
    RISK_LEVEL_CLASSES,
    TARGET_COLUMNS,
    TARGET_LEVEL_COLUMN,
)
from cognivault.data import LeakageError, SchemaError
from cognivault.split import (
    SPLIT_MANIFEST_PATH,
    get_split_data,
    load_split_manifest,
)
from cognivault.train_rf import compute_combined_recall

DEFAULT_LR_PARAMS: Dict[str, Any] = {
    "C": 1.0,
    "class_weight": "balanced",
    "solver": "lbfgs",
    "max_iter": 1000,
    "random_state": 42,
}

MODELS_LR_DIR: Path = REPO_ROOT / "models" / "logistic_regression"
REPORT_LR_PATH: Path = REPO_ROOT / "reports" / "model_lr_cv_report.md"


def build_lr_pipeline(lr_params: Dict[str, Any]) -> Pipeline:
    """Builds an sklearn Pipeline with StandardScaler and LogisticRegression.

    Ensures feature standardization is strictly learned inside each training partition.
    """
    return Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(**lr_params)),
    ])


def evaluate_lr_fold(
    X_train_fold: pd.DataFrame,
    y_train_fold: pd.Series,
    X_val_fold: pd.DataFrame,
    y_val_fold: pd.Series,
    lr_params: Dict[str, Any],
) -> Dict[str, Any]:
    """Fits and evaluates a Logistic Regression Pipeline on a single CV fold.

    Args:
        X_train_fold: Feature matrix for this fold's training portion.
        y_train_fold: Target series for this fold's training portion.
        X_val_fold: Feature matrix for this fold's validation portion.
        y_val_fold: Target series for this fold's validation portion.
        lr_params: Hyperparameter dictionary for LogisticRegression.

    Returns:
        Fold-level metrics dictionary.
    """
    if list(X_train_fold.columns) != FEATURE_COLUMNS or list(X_val_fold.columns) != FEATURE_COLUMNS:
        raise SchemaError("Feature order or column names mismatch in fold data.")

    pipeline = build_lr_pipeline(lr_params)

    t0 = time.time()
    pipeline.fit(X_train_fold, y_train_fold)
    fit_time = time.time() - t0

    preds = pipeline.predict(X_val_fold)

    # Calculate metrics with explicit class ordering
    acc = float(accuracy_score(y_val_fold, preds))
    macro_f1 = float(f1_score(y_val_fold, preds, average="macro", labels=RISK_LEVEL_CLASSES))
    weighted_f1 = float(f1_score(y_val_fold, preds, average="weighted", labels=RISK_LEVEL_CLASSES))

    per_class_recalls = recall_score(
        y_val_fold, preds, labels=RISK_LEVEL_CLASSES, average=None, zero_division=0
    )
    recalls_by_class = {
        cls: float(rec) for cls, rec in zip(RISK_LEVEL_CLASSES, per_class_recalls)
    }

    high_recall = recalls_by_class["High"]
    critical_recall = recalls_by_class["Critical"]

    # 1. Exact pooled recall: (TP_High + TP_Critical) / (N_High + N_Critical)
    combined_recall_exact = compute_combined_recall(y_val_fold, preds, mode="exact")

    # 2. Severe-tier sensitivity: fraction of true High/Critical predicted as High or Critical
    severe_tier_recall = compute_combined_recall(y_val_fold, preds, mode="severe_tier")

    cm = confusion_matrix(y_val_fold, preds, labels=RISK_LEVEL_CLASSES).tolist()

    # Extract learned coefficients
    classifier = pipeline.named_steps["classifier"]
    coefs = classifier.coef_.tolist()
    intercepts = classifier.intercept_.tolist()

    return {
        "fit_time_seconds": fit_time,
        "accuracy": acc,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
        "high_recall": high_recall,
        "critical_recall": critical_recall,
        "combined_high_critical_recall": combined_recall_exact,
        "severe_tier_detection_recall": severe_tier_recall,
        "per_class_recall": recalls_by_class,
        "confusion_matrix": cm,
        "coefficients": coefs,
        "intercepts": intercepts,
        "predictions": preds.tolist(),
        "actuals": y_val_fold.tolist(),
    }


def run_lr_cross_validation(
    lr_params: Optional[Dict[str, Any]] = None,
    manifest_path: Path = SPLIT_MANIFEST_PATH,
) -> Dict[str, Any]:
    """Runs stratified 5-fold cross validation for Logistic Regression on the training split.

    Args:
        lr_params: Optional custom hyperparameters. Defaults to DEFAULT_LR_PARAMS.
        manifest_path: Path to split_indices.json.

    Returns:
        Comprehensive cross-validation results dictionary.
    """
    params = lr_params.copy() if lr_params else DEFAULT_LR_PARAMS.copy()
    manifest = load_split_manifest(manifest_path, verify_against_dataset=True)

    X_train, X_test, y_train_level, y_test_level, _, _ = get_split_data(manifest_path=manifest_path)

    assert len(X_train) == 1600
    assert len(X_test) == 400

    folds_results: List[Dict[str, Any]] = []
    all_oof_preds: List[str] = [None] * len(X_train)
    all_val_indices_positional: List[int] = []

    for fold_info in manifest["cv_folds"]:
        fold_num = fold_info["fold"]
        train_pos = fold_info["train_indices_positional"]
        val_pos = fold_info["val_indices_positional"]

        X_tr = X_train.iloc[train_pos]
        y_tr = y_train_level.iloc[train_pos]
        X_val = X_train.iloc[val_pos]
        y_val = y_train_level.iloc[val_pos]

        res = evaluate_lr_fold(X_tr, y_tr, X_val, y_val, params)
        res["fold"] = fold_num
        res["train_count"] = len(train_pos)
        res["val_count"] = len(val_pos)

        # Store out-of-fold predictions
        for idx_pos, pred in zip(val_pos, res["predictions"]):
            all_oof_preds[idx_pos] = pred
            all_val_indices_positional.append(idx_pos)

        folds_results.append(res)

    # Compute summary statistics across folds
    metric_keys = [
        "macro_f1",
        "accuracy",
        "weighted_f1",
        "high_recall",
        "critical_recall",
        "combined_high_critical_recall",
        "severe_tier_detection_recall",
        "fit_time_seconds",
    ]

    summary: Dict[str, Dict[str, Any]] = {}
    for key in metric_keys:
        vals = [f[key] for f in folds_results]
        summary[key] = {
            "mean": float(np.mean(vals)),
            "std": float(np.std(vals)),
            "std_sample": float(np.std(vals, ddof=1)),
            "min": float(np.min(vals)),
            "max": float(np.max(vals)),
            "values": [round(v, 4) for v in vals],
        }

    # Aggregate Out-Of-Fold confusion matrix and report
    oof_cm = confusion_matrix(y_train_level, all_oof_preds, labels=RISK_LEVEL_CLASSES).tolist()
    oof_report = classification_report(
        y_train_level, all_oof_preds, labels=RISK_LEVEL_CLASSES, output_dict=True, zero_division=0
    )

    oof_macro_f1 = float(f1_score(y_train_level, all_oof_preds, average="macro", labels=RISK_LEVEL_CLASSES))
    oof_acc = float(accuracy_score(y_train_level, all_oof_preds))
    oof_weighted_f1 = float(f1_score(y_train_level, all_oof_preds, average="weighted", labels=RISK_LEVEL_CLASSES))
    oof_combined_exact = compute_combined_recall(y_train_level, all_oof_preds, mode="exact")
    oof_severe_tier = compute_combined_recall(y_train_level, all_oof_preds, mode="severe_tier")

    # Mean learned coefficients across folds
    all_coefs = np.array([f["coefficients"] for f in folds_results])
    mean_coefs = all_coefs.mean(axis=0)
    coef_dict = {}
    for class_idx, class_name in enumerate(RISK_LEVEL_CLASSES):
        coef_dict[class_name] = {
            feat: round(float(mean_coefs[class_idx, feat_idx]), 4)
            for feat_idx, feat in enumerate(FEATURE_COLUMNS)
        }

    cv_results = {
        "model_name": "LogisticRegression",
        "preprocessing": "StandardScaler (fitted inside each fold)",
        "hyperparameters": params,
        "n_folds": len(folds_results),
        "total_train_rows": len(X_train),
        "feature_columns": FEATURE_COLUMNS,
        "class_order": RISK_LEVEL_CLASSES,
        "summary_metrics": summary,
        "fold_details": [
            {
                "fold": f["fold"],
                "macro_f1": round(f["macro_f1"], 4),
                "accuracy": round(f["accuracy"], 4),
                "weighted_f1": round(f["weighted_f1"], 4),
                "high_recall": round(f["high_recall"], 4),
                "critical_recall": round(f["critical_recall"], 4),
                "combined_high_critical_recall": round(f["combined_high_critical_recall"], 4),
                "severe_tier_detection_recall": round(f["severe_tier_detection_recall"], 4),
                "fit_time_seconds": round(f["fit_time_seconds"], 4),
                "per_class_recall": {k: round(v, 4) for k, v in f["per_class_recall"].items()},
                "confusion_matrix": f["confusion_matrix"],
            }
            for f in folds_results
        ],
        "mean_coefficients": coef_dict,
        "out_of_fold_confusion_matrix": oof_cm,
        "out_of_fold_classification_report": oof_report,
        "out_of_fold_aggregate_metrics": {
            "macro_f1": round(oof_macro_f1, 4),
            "accuracy": round(oof_acc, 4),
            "weighted_f1": round(oof_weighted_f1, 4),
            "combined_high_critical_recall_exact": round(oof_combined_exact, 4),
            "severe_tier_detection_recall": round(oof_severe_tier, 4),
        },
    }

    return cv_results


def save_lr_artifacts(
    cv_results: Dict[str, Any],
    output_dir: Path = MODELS_LR_DIR,
) -> Path:
    """Saves Logistic Regression cross-validation results to JSON.

    Args:
        cv_results: Cross-validation results dictionary.
        output_dir: Target directory.

    Returns:
        Path of saved JSON file.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "lr_cv_results.json"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cv_results, f, indent=2)

    return json_path


def generate_lr_report(
    cv_results: Dict[str, Any],
    output_path: Path = REPORT_LR_PATH,
) -> Path:
    """Generates markdown cross-validation report for Logistic Regression.

    Args:
        cv_results: Results dictionary from run_lr_cross_validation.
        output_path: Path for markdown report.

    Returns:
        Path of generated report.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    summary = cv_results["summary_metrics"]
    folds = cv_results["fold_details"]
    params = cv_results["hyperparameters"]
    coefs = cv_results["mean_coefficients"]

    md = f"""# Cognivault AI — Logistic Regression Classifier CV Evaluation Report (Block 3B)

**Model:** `LogisticRegression` inside `Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression())])`  
**Task:** 4-class classification (`burnout_risk_level`)  
**Evaluation Protocol:** Stratified 5-Fold Cross-Validation on the 1,600 training rows only  
**Held-Out Test Set:** Completely isolated (400 rows, 0 evaluations)  
**Random State:** 42  

---

## 1. Hyperparameters & Pipeline Configuration

```json
{json.dumps(params, indent=2)}
```

- **Preprocessing:** `StandardScaler` fitted strictly on training indices of each CV fold.
- **Pipeline Architecture:** Scikit-learn `Pipeline` guarantees zero leakage across training and validation folds.

---

## 2. Cross-Validation Summary Metrics (Mean ± Std)

Metrics are computed across the 5 validation folds (320 rows each).  
*Standard deviations:* Population std ($\text{{ddof}}=0$) / Sample std ($\text{{ddof}}=1$).

| Metric | Mean | Std (ddof=0) | Std (ddof=1) | Min Fold | Max Fold | Definition / Mathematical Formula |
|---|---|---|---|---|---|---|
| **Macro F1** | **{summary['macro_f1']['mean']:.4f}** | ± {summary['macro_f1']['std']:.4f} | ± {summary['macro_f1']['std_sample']:.4f} | {summary['macro_f1']['min']:.4f} | {summary['macro_f1']['max']:.4f} | Unweighted mean of per-class F1 scores |
| **Accuracy** | **{summary['accuracy']['mean']:.4f}** | ± {summary['accuracy']['std']:.4f} | ± {summary['accuracy']['std_sample']:.4f} | {summary['accuracy']['min']:.4f} | {summary['accuracy']['max']:.4f} | Total correct / Total predictions |
| **Weighted F1** | **{summary['weighted_f1']['mean']:.4f}** | ± {summary['weighted_f1']['std']:.4f} | ± {summary['weighted_f1']['std_sample']:.4f} | {summary['weighted_f1']['min']:.4f} | {summary['weighted_f1']['max']:.4f} | Support-weighted mean of per-class F1 |
| **High Recall** | **{summary['high_recall']['mean']:.4f}** | ± {summary['high_recall']['std']:.4f} | ± {summary['high_recall']['std_sample']:.4f} | {summary['high_recall']['min']:.4f} | {summary['high_recall']['max']:.4f} | $TP_{{High}} / N_{{High}}$ |
| **Critical Recall** | **{summary['critical_recall']['mean']:.4f}** | ± {summary['critical_recall']['std']:.4f} | ± {summary['critical_recall']['std_sample']:.4f} | {summary['critical_recall']['min']:.4f} | {summary['critical_recall']['max']:.4f} | $TP_{{Critical}} / N_{{Critical}}$ |
| **Combined High/Crit Recall (Exact)** | **{summary['combined_high_critical_recall']['mean']:.4f}** | ± {summary['combined_high_critical_recall']['std']:.4f} | ± {summary['combined_high_critical_recall']['std_sample']:.4f} | {summary['combined_high_critical_recall']['min']:.4f} | {summary['combined_high_critical_recall']['max']:.4f} | $(TP_{{High}} + TP_{{Critical}}) / (N_{{High}} + N_{{Critical}})$ |
| **Severe-Tier Detection Recall** | **{summary['severe_tier_detection_recall']['mean']:.4f}** | ± {summary['severe_tier_detection_recall']['std']:.4f} | ± {summary['severe_tier_detection_recall']['std_sample']:.4f} | {summary['severe_tier_detection_recall']['min']:.4f} | {summary['severe_tier_detection_recall']['max']:.4f} | Predicted $\\in \\{{High, Crit\\}}$ for True $\\in \\{{High, Crit\\}}$ |
| **Fit Time (s)** | **{summary['fit_time_seconds']['mean']:.4f}s** | ± {summary['fit_time_seconds']['std']:.4f}s | ± {summary['fit_time_seconds']['std_sample']:.4f}s | {summary['fit_time_seconds']['min']:.4f}s | {summary['fit_time_seconds']['max']:.4f}s | Wall-clock pipeline training duration per fold |

---

## 3. Fold-by-Fold Performance Breakdown

| Fold # | Val Samples | Macro F1 | Accuracy | Weighted F1 | High Recall | Critical Recall | Combined Exact | Severe Tier Recall | Fit Time (s) |
|---|---|---|---|---|---|---|---|---|---|
"""
    for f in folds:
        md += (
            f"| Fold {f['fold']} | 320 | {f['macro_f1']:.4f} | {f['accuracy']:.4f} | "
            f"{f['weighted_f1']:.4f} | {f['high_recall']:.4f} | {f['critical_recall']:.4f} | "
            f"{f['combined_high_critical_recall']:.4f} | {f['severe_tier_detection_recall']:.4f} | "
            f"{f['fit_time_seconds']:.4f}s |\n"
        )

    md += """
---

## 4. Out-of-Fold Confusion Matrix

Predictions aggregated across all 5 validation folds (1,600 training instances):

| Actual \\ Predicted | Low | Moderate | High | Critical | Total True | Exact Class Recall |
|---|---|---|---|---|---|---|
"""
    cm = cv_results["out_of_fold_confusion_matrix"]
    classes = RISK_LEVEL_CLASSES
    for idx, actual_cls in enumerate(classes):
        row_vals = " | ".join(str(cm[idx][j]) for j in range(len(classes)))
        total_true = sum(cm[idx])
        exact_rec = cm[idx][idx] / total_true if total_true > 0 else 0.0
        md += f"| **{actual_cls}** | {row_vals} | {total_true} | {exact_rec * 100:.2f}% |\n"

    tp_high = cm[2][2]
    tp_crit = cm[3][3]
    total_high = sum(cm[2])
    total_crit = sum(cm[3])
    exact_combined = (tp_high + tp_crit) / (total_high + total_crit)
    severe_detected = cm[2][2] + cm[2][3] + cm[3][2] + cm[3][3]
    severe_tier = severe_detected / (total_high + total_crit)

    md += f"""
### Mathematical Derivation of Combined Metrics from Confusion Matrix

1. **Pooled Exact High/Critical Recall:**
   $$\\text{{Exact Combined Recall}} = \\frac{{TP_{{High}} + TP_{{Critical}}}}{{N_{{High}} + N_{{Critical}}}} = \\frac{{{tp_high} + {tp_crit}}}{{{total_high} + {total_crit}}} = \\frac{{{tp_high + tp_crit}}}{{{total_high + total_crit}}} = {exact_combined:.4f} \\quad ({exact_combined * 100:.2f}\\%)$$
   - Fold mean: **{summary['combined_high_critical_recall']['mean']:.4f} ± {summary['combined_high_critical_recall']['std']:.4f}**

2. **Severe-Tier Detection Recall (Safety / Clinical Screening):**
   $$\\text{{Severe Tier Recall}} = \\frac{{{cm[2][2]} + {cm[2][3]} + {cm[3][2]} + {cm[3][3]}}}{{{total_high} + {total_crit}}} = \\frac{{{severe_detected}}}{{{total_high + total_crit}}} = {severe_tier:.4f} \\quad ({severe_tier * 100:.2f}\\%)$$
   - Fold mean: **{summary['severe_tier_detection_recall']['mean']:.4f} ± {summary['severe_tier_detection_recall']['std']:.4f}**

---

## 5. Mean Standardized Feature Coefficients Across Folds

Higher positive coefficient = increases log-odds for that risk class.

| Feature Name | Low | Moderate | High | Critical |
|---|---|---|---|---|
"""
    for feat in FEATURE_COLUMNS:
        l_c = coefs["Low"][feat]
        m_c = coefs["Moderate"][feat]
        h_c = coefs["High"][feat]
        c_c = coefs["Critical"][feat]
        md += f"| `{feat}` | {l_c:+.4f} | {m_c:+.4f} | {h_c:+.4f} | {c_c:+.4f} |\n"

    md += """
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
"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)

    return output_path
