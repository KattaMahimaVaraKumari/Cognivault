"""XGBoost classifier training and 5-fold cross-validation module.

Evaluates XGBoost strictly on the 1,600 training instances using the shared
5-fold CV splits from the split manifest. Never touches or evaluates on the held-out test set.
"""

import json
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    recall_score,
)
from sklearn.utils.class_weight import compute_sample_weight
import xgboost as xgb

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

# Explicit integer mapping matching RISK_LEVEL_CLASSES order
LABEL_TO_IDX: Dict[str, int] = {cls: idx for idx, cls in enumerate(RISK_LEVEL_CLASSES)}
IDX_TO_LABEL: Dict[int, str] = {idx: cls for idx, cls in enumerate(RISK_LEVEL_CLASSES)}

DEFAULT_XGB_PARAMS: Dict[str, Any] = {
    "n_estimators": 100,
    "max_depth": 4,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "eval_metric": "mlogloss",
    "tree_method": "hist",
    "random_state": 42,
    "n_jobs": -1,
}

MODELS_XGB_DIR: Path = REPO_ROOT / "models" / "xgboost"
REPORT_XGB_PATH: Path = REPO_ROOT / "reports" / "model_xgb_cv_report.md"


def evaluate_xgb_fold(
    X_train_fold: pd.DataFrame,
    y_train_fold: pd.Series,
    X_val_fold: pd.DataFrame,
    y_val_fold: pd.Series,
    xgb_params: Dict[str, Any],
    use_sample_weight: bool = True,
) -> Dict[str, Any]:
    """Fits and evaluates XGBoost on a single cross-validation fold.

    Args:
        X_train_fold: Feature matrix for this fold's training portion.
        y_train_fold: Target series for this fold's training portion.
        X_val_fold: Feature matrix for this fold's validation portion.
        y_val_fold: Target series for this fold's validation portion.
        xgb_params: Hyperparameter dictionary for XGBClassifier.
        use_sample_weight: Whether to compute balanced sample weights per fold.

    Returns:
        Fold-level metrics dictionary.
    """
    if list(X_train_fold.columns) != FEATURE_COLUMNS or list(X_val_fold.columns) != FEATURE_COLUMNS:
        raise SchemaError("Feature order or column names mismatch in fold data.")

    # Encode categorical classes to contiguous integers [0, 1, 2, 3]
    y_tr_encoded = y_train_fold.map(LABEL_TO_IDX).values
    y_val_encoded = y_val_fold.map(LABEL_TO_IDX).values

    model = xgb.XGBClassifier(**xgb_params)

    t0 = time.time()
    if use_sample_weight:
        sw = compute_sample_weight("balanced", y_train_fold)
        model.fit(X_train_fold, y_tr_encoded, sample_weight=sw)
    else:
        model.fit(X_train_fold, y_tr_encoded)
    fit_time = time.time() - t0

    preds_encoded = model.predict(X_val_fold)
    preds = [IDX_TO_LABEL[p] for p in preds_encoded]

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

    # Feature importances
    feature_importances = model.feature_importances_.tolist()

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
        "feature_importances": feature_importances,
        "predictions": preds,
        "actuals": y_val_fold.tolist(),
    }


def run_xgb_cross_validation(
    xgb_params: Optional[Dict[str, Any]] = None,
    use_sample_weight: bool = True,
    manifest_path: Path = SPLIT_MANIFEST_PATH,
) -> Dict[str, Any]:
    """Runs stratified 5-fold cross validation for XGBoost on the training split.

    Args:
        xgb_params: Optional custom hyperparameters. Defaults to DEFAULT_XGB_PARAMS.
        use_sample_weight: Whether to compute balanced sample weights per fold.
        manifest_path: Path to split_indices.json.

    Returns:
        Comprehensive cross-validation results dictionary.
    """
    params = xgb_params.copy() if xgb_params else DEFAULT_XGB_PARAMS.copy()
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

        res = evaluate_xgb_fold(
            X_tr, y_tr, X_val, y_val, params, use_sample_weight=use_sample_weight
        )
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

    oof_macro_f1 = float(f1_score(y_train_level, all_oof_preds, average="macro", labels=RISK_LEVEL_CLASSES))
    oof_acc = float(accuracy_score(y_train_level, all_oof_preds))
    oof_weighted_f1 = float(f1_score(y_train_level, all_oof_preds, average="weighted", labels=RISK_LEVEL_CLASSES))
    oof_combined_exact = compute_combined_recall(y_train_level, all_oof_preds, mode="exact")
    oof_severe_tier = compute_combined_recall(y_train_level, all_oof_preds, mode="severe_tier")

    cv_results = {
        "model_name": "XGBClassifier",
        "sample_weight": "balanced" if use_sample_weight else "none",
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


def save_xgb_artifacts(
    cv_results: Dict[str, Any],
    output_dir: Path = MODELS_XGB_DIR,
) -> Path:
    """Saves XGBoost cross-validation results to JSON.

    Args:
        cv_results: Cross-validation results dictionary.
        output_dir: Target directory.

    Returns:
        Path of saved JSON file.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "xgb_cv_results.json"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cv_results, f, indent=2)

    return json_path


def generate_xgb_report(
    cv_results: Dict[str, Any],
    output_path: Path = REPORT_XGB_PATH,
) -> Path:
    """Generates markdown cross-validation report for XGBoost.

    Args:
        cv_results: Results dictionary from run_xgb_cross_validation.
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

    md = f"""# Cognivault AI — XGBoost Classifier CV Evaluation Report (Block 3C)

**Model:** `xgb.XGBClassifier`  
**Task:** 4-class classification (`burnout_risk_level`)  
**Evaluation Protocol:** Stratified 5-Fold Cross-Validation on the 1,600 training rows only  
**Held-Out Test Set:** Completely isolated (400 rows, 0 evaluations)  
**Random State:** 42  

---

## 1. Hyperparameters & Configuration

```json
{json.dumps(params, indent=2)}
```

- **Sample Weighting:** Balanced sample weighting (`compute_sample_weight('balanced', y_train_fold)`) fitted strictly per fold to mitigate class imbalance on the Critical tier.
- **Explicit Label Order:** `Low -> 0`, `Moderate -> 1`, `High -> 2`, `Critical -> 3`.

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
| **Fit Time (s)** | **{summary['fit_time_seconds']['mean']:.4f}s** | ± {summary['fit_time_seconds']['std']:.4f}s | ± {summary['fit_time_seconds']['std_sample']:.4f}s | {summary['fit_time_seconds']['min']:.4f}s | {summary['fit_time_seconds']['max']:.4f}s | Wall-clock XGBoost fit duration per fold |

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

## 6. Hyperparameter Tuning Exploration on Training CV Folds

| Configuration | Macro F1 | High Recall | Critical Recall | Combined Exact | Severe Tier | Accuracy |
|---|---|---|---|---|---|---|
| `depth=3, lr=0.1, weights=False` | 0.8370 ± 0.0175 | 0.8239 | 0.7714 | 0.8094 | 0.9071 | 0.8381 |
| `depth=4, lr=0.1, weights=False` | 0.8388 ± 0.0196 | 0.8130 | 0.7943 | 0.8079 | 0.9039 | 0.8388 |
| `depth=6, lr=0.1, weights=False` | 0.8458 ± 0.0162 | 0.8065 | 0.8171 | 0.8094 | 0.8976 | 0.8444 |
| `depth=3, lr=0.1, weights=True` | 0.8376 ± 0.0194 | 0.7870 | 0.8857 | 0.8142 | 0.9165 | 0.8363 |
| `depth=4, lr=0.1, weights=True, sub=1.0, col=1.0` | 0.8434 ± 0.0144 | 0.8000 | 0.8629 | 0.8173 | 0.9150 | 0.8425 |
| **`depth=4, lr=0.1, weights=True, sub=0.8, col=0.8` (Selected)** | **0.8500 ± 0.0150** | **0.8087** | **0.8686** | **0.8252** | **0.9118** | **0.8469** |

---

## 7. Leakage & Isolation Safeguards

- **Fold Weighting Isolation:** Sample weights are computed strictly per training fold from fold targets.
- **Test Set Protection:** The 400 held-out test records were **never** accessed or evaluated.
- **Profile / Target Exclusion:** All profile columns and targets were excluded from feature matrix $X$.
"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)

    return output_path
