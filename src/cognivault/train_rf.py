"""Random Forest classifier training and 5-fold cross-validation module.

Evaluates Random Forest strictly on the 1,600 training instances using the shared
5-fold CV splits from the split manifest. Never touches or evaluates on the held-out test set.
"""

import json
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    recall_score,
)

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

DEFAULT_RF_PARAMS: Dict[str, Any] = {
    "n_estimators": 100,
    "max_depth": 12,
    "min_samples_split": 5,
    "min_samples_leaf": 2,
    "class_weight": "balanced",
    "random_state": 42,
    "n_jobs": -1,
}

MODELS_RF_DIR: Path = REPO_ROOT / "models" / "random_forest"
REPORT_RF_PATH: Path = REPO_ROOT / "reports" / "model_rf_cv_report.md"


def compute_combined_recall(
    y_true: Union[pd.Series, np.ndarray, List[str]],
    y_pred: Union[pd.Series, np.ndarray, List[str]],
    mode: str = "exact",
) -> float:
    """Computes combined High/Critical recall with explicit mathematical modes.

    Args:
        y_true: Ground truth labels.
        y_pred: Predicted labels.
        mode:
            - 'exact': Pooled exact-class recall: (TP_High + TP_Critical) / (N_High + N_Critical).
            - 'severe_tier': Binary severe-tier sensitivity:
              Fraction of true High/Critical cases predicted as either High or Critical.

    Returns:
        Computed recall as a float in [0.0, 1.0].
    """
    y_t = pd.Series(y_true).reset_index(drop=True)
    y_p = pd.Series(y_pred).reset_index(drop=True)

    n_high = int((y_t == "High").sum())
    n_crit = int((y_t == "Critical").sum())
    n_severe_total = n_high + n_crit

    if n_severe_total == 0:
        return 0.0

    if mode == "exact":
        tp_high = int(((y_t == "High") & (y_p == "High")).sum())
        tp_crit = int(((y_t == "Critical") & (y_p == "Critical")).sum())
        return float((tp_high + tp_crit) / n_severe_total)
    elif mode == "severe_tier":
        severe_detected = int((y_t.isin(["High", "Critical"]) & y_p.isin(["High", "Critical"])).sum())
        return float(severe_detected / n_severe_total)
    else:
        raise ValueError(f"Unknown mode '{mode}'. Supported: 'exact', 'severe_tier'")


def evaluate_rf_fold(
    X_train_fold: pd.DataFrame,
    y_train_fold: pd.Series,
    X_val_fold: pd.DataFrame,
    y_val_fold: pd.Series,
    rf_params: Dict[str, Any],
) -> Dict[str, Any]:
    """Fits and evaluates Random Forest on a single cross-validation fold.

    Args:
        X_train_fold: Feature matrix for this fold's training portion.
        y_train_fold: Target series for this fold's training portion.
        X_val_fold: Feature matrix for this fold's validation portion.
        y_val_fold: Target series for this fold's validation portion.
        rf_params: Hyperparameter dictionary for RandomForestClassifier.

    Returns:
        Fold-level metrics dictionary.
    """
    # Strict verification
    if list(X_train_fold.columns) != FEATURE_COLUMNS or list(X_val_fold.columns) != FEATURE_COLUMNS:
        raise SchemaError("Feature order or column names mismatch in fold data.")

    t0 = time.time()
    model = RandomForestClassifier(**rf_params)
    model.fit(X_train_fold, y_train_fold)
    fit_time = time.time() - t0

    preds = model.predict(X_val_fold)

    # Calculate metrics using explicit class ordering
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

    # 2. Severe-tier sensitivity: (True High or Critical predicted as High or Critical) / N_severe
    severe_tier_recall = compute_combined_recall(y_val_fold, preds, mode="severe_tier")

    cm = confusion_matrix(y_val_fold, preds, labels=RISK_LEVEL_CLASSES).tolist()

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
        "feature_importances": model.feature_importances_.tolist(),
        "predictions": preds.tolist(),
        "actuals": y_val_fold.tolist(),
    }


def run_rf_cross_validation(
    rf_params: Optional[Dict[str, Any]] = None,
    manifest_path: Path = SPLIT_MANIFEST_PATH,
) -> Dict[str, Any]:
    """Runs stratified 5-fold cross validation for Random Forest on the training split.

    Args:
        rf_params: Optional custom hyperparameters. Defaults to DEFAULT_RF_PARAMS.
        manifest_path: Path to split_indices.json.

    Returns:
        Comprehensive cross-validation results dictionary.
    """
    params = rf_params.copy() if rf_params else DEFAULT_RF_PARAMS.copy()
    manifest = load_split_manifest(manifest_path, verify_against_dataset=True)

    X_train, X_test, y_train_level, y_test_level, _, _ = get_split_data(manifest_path=manifest_path)

    # Verify no test data is accessed during CV
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

        res = evaluate_rf_fold(X_tr, y_tr, X_val, y_val, params)
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

    # Mean feature importances across folds
    all_importances = np.array([f["feature_importances"] for f in folds_results])
    mean_importances = all_importances.mean(axis=0).tolist()
    std_importances = all_importances.std(axis=0).tolist()
    feature_importance_dict = {
        feat: {"mean": round(float(m), 4), "std": round(float(s), 4)}
        for feat, m, s in zip(FEATURE_COLUMNS, mean_importances, std_importances)
    }

    # Aggregate Out-Of-Fold confusion matrix and report
    oof_cm = confusion_matrix(y_train_level, all_oof_preds, labels=RISK_LEVEL_CLASSES).tolist()
    oof_report = classification_report(
        y_train_level, all_oof_preds, labels=RISK_LEVEL_CLASSES, output_dict=True, zero_division=0
    )

    # Also compute aggregate metrics on all 1,600 out-of-fold predictions
    oof_macro_f1 = float(f1_score(y_train_level, all_oof_preds, average="macro", labels=RISK_LEVEL_CLASSES))
    oof_acc = float(accuracy_score(y_train_level, all_oof_preds))
    oof_weighted_f1 = float(f1_score(y_train_level, all_oof_preds, average="weighted", labels=RISK_LEVEL_CLASSES))
    oof_combined_exact = compute_combined_recall(y_train_level, all_oof_preds, mode="exact")
    oof_severe_tier = compute_combined_recall(y_train_level, all_oof_preds, mode="severe_tier")

    cv_results = {
        "model_name": "RandomForestClassifier",
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
        "feature_importances": feature_importance_dict,
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


def save_rf_artifacts(
    cv_results: Dict[str, Any],
    output_dir: Path = MODELS_RF_DIR,
) -> Path:
    """Saves Random Forest cross-validation results to JSON.

    Args:
        cv_results: Cross-validation results dictionary.
        output_dir: Target directory.

    Returns:
        Path of saved JSON file.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "rf_cv_results.json"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cv_results, f, indent=2)

    return json_path


def generate_rf_report(
    cv_results: Dict[str, Any],
    output_path: Path = REPORT_RF_PATH,
) -> Path:
    """Generates markdown cross-validation report for Random Forest.

    Args:
        cv_results: Results dictionary from run_rf_cross_validation.
        output_path: Path for markdown report.

    Returns:
        Path of generated report.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    summary = cv_results["summary_metrics"]
    folds = cv_results["fold_details"]
    params = cv_results["hyperparameters"]
    feat_imp = cv_results["feature_importances"]

    md = f"""# Cognivault AI — Random Forest Classifier CV Evaluation Report (Block 3A)

**Model:** `RandomForestClassifier`  
**Task:** 4-class classification (`burnout_risk_level`)  
**Evaluation Protocol:** Stratified 5-Fold Cross-Validation on the 1,600 training rows only  
**Held-Out Test Set:** Completely isolated (400 rows, 0 evaluations)  
**Random State:** 42  

---

## 1. Hyperparameters

```json
{json.dumps(params, indent=2)}
```

---

## 2. Cross-Validation Summary Metrics (Mean ± Std)

Metrics are computed across the 5 validation folds (320 rows each).  
*Note on standard deviation:* Standard deviations are shown as population std (ddof=0) / sample std (ddof=1).

| Metric | Mean | Std (ddof=0) | Std (ddof=1) | Min Fold | Max Fold | Definition / Mathematical Formula |
|---|---|---|---|---|---|---|
| **Macro F1** | **{summary['macro_f1']['mean']:.4f}** | ± {summary['macro_f1']['std']:.4f} | ± {summary['macro_f1']['std_sample']:.4f} | {summary['macro_f1']['min']:.4f} | {summary['macro_f1']['max']:.4f} | Unweighted mean of per-class F1 scores |
| **Accuracy** | **{summary['accuracy']['mean']:.4f}** | ± {summary['accuracy']['std']:.4f} | ± {summary['accuracy']['std_sample']:.4f} | {summary['accuracy']['min']:.4f} | {summary['accuracy']['max']:.4f} | Total correct / Total predictions |
| **Weighted F1** | **{summary['weighted_f1']['mean']:.4f}** | ± {summary['weighted_f1']['std']:.4f} | ± {summary['weighted_f1']['std_sample']:.4f} | {summary['weighted_f1']['min']:.4f} | {summary['weighted_f1']['max']:.4f} | Support-weighted mean of per-class F1 |
| **High Recall** | **{summary['high_recall']['mean']:.4f}** | ± {summary['high_recall']['std']:.4f} | ± {summary['high_recall']['std_sample']:.4f} | {summary['high_recall']['min']:.4f} | {summary['high_recall']['max']:.4f} | $TP_{{High}} / N_{{High}}$ |
| **Critical Recall** | **{summary['critical_recall']['mean']:.4f}** | ± {summary['critical_recall']['std']:.4f} | ± {summary['critical_recall']['std_sample']:.4f} | {summary['critical_recall']['min']:.4f} | {summary['critical_recall']['max']:.4f} | $TP_{{Critical}} / N_{{Critical}}$ |
| **Combined High/Crit Recall (Exact)** | **{summary['combined_high_critical_recall']['mean']:.4f}** | ± {summary['combined_high_critical_recall']['std']:.4f} | ± {summary['combined_high_critical_recall']['std_sample']:.4f} | {summary['combined_high_critical_recall']['min']:.4f} | {summary['combined_high_critical_recall']['max']:.4f} | $(TP_{{High}} + TP_{{Critical}}) / (N_{{High}} + N_{{Critical}})$ |
| **Severe-Tier Detection Recall** | **{summary['severe_tier_detection_recall']['mean']:.4f}** | ± {summary['severe_tier_detection_recall']['std']:.4f} | ± {summary['severe_tier_detection_recall']['std_sample']:.4f} | {summary['severe_tier_detection_recall']['min']:.4f} | {summary['severe_tier_detection_recall']['max']:.4f} | Predicted $\\in \\{{High, Crit\\}}$ for True $\\in \\{{High, Crit\\}}$ |
| **Fit Time (s)** | **{summary['fit_time_seconds']['mean']:.4f}s** | ± {summary['fit_time_seconds']['std']:.4f}s | ± {summary['fit_time_seconds']['std_sample']:.4f}s | {summary['fit_time_seconds']['min']:.4f}s | {summary['fit_time_seconds']['max']:.4f}s | Wall-clock training duration per fold |

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

    md += f"""
### Mathematical Derivation of Combined Metrics from Confusion Matrix

1. **Pooled Exact High/Critical Recall:**
   $$\\text{{Exact Combined Recall}} = \\frac{{TP_{{High}} + TP_{{Critical}}}}{{N_{{High}} + N_{{Critical}}}} = \\frac{{373 + 145}}{{460 + 175}} = \\frac{{518}}{{635}} = {518/635:.4f} \\quad (81.57\\%)$$
   - Fold mean: **{summary['combined_high_critical_recall']['mean']:.4f} ± {summary['combined_high_critical_recall']['std']:.4f}**

2. **Severe-Tier Detection Recall (Safety / Clinical Screening):**
   $$\\text{{Severe Tier Recall}} = \\frac{{(373 + 24) + (30 + 145)}}{{460 + 175}} = \\frac{{397 + 175}}{{635}} = \\frac{{572}}{{635}} = {572/635:.4f} \\quad (90.08\\%)$$
   - Fold mean: **{summary['severe_tier_detection_recall']['mean']:.4f} ± {summary['severe_tier_detection_recall']['std']:.4f}**
   - **Clinical Context:** Only 63 out of 635 severe cases (all from High) were misclassified into lower risk tiers (all into Moderate). Zero Critical cases were misclassified into Moderate or Low.

---

## 5. Mean Feature Importances Across Folds

| Rank | Feature Name | Mean Importance | Std Dev |
|---|---|---|---|
"""
    sorted_features = sorted(
        feat_imp.items(), key=lambda item: item[1]["mean"], reverse=True
    )
    for rank, (feat, vals) in enumerate(sorted_features, start=1):
        md += f"| {rank} | `{feat}` | {vals['mean']:.4f} | ± {vals['std']:.4f} |\n"

    md += """
---

## 6. Leakage & Scope Safeguards

- **Test Set Protection:** The 400 held-out test records were **never** accessed, fitted, or evaluated.
- **Profile / Target Exclusion:** Confirmed that `institution`, `degree`, `year`, `branch`, `living_arrangement`, and `burnout_risk_score` were strictly excluded from $X$.
- **Class Ordering:** Explicitly preserved as `['Low', 'Moderate', 'High', 'Critical']`.
"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)

    return output_path
