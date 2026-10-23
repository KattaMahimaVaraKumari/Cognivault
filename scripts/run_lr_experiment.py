"""Execution script for Block 3B: Logistic Regression 5-Fold Cross-Validation."""

from cognivault.train_lr import (
    DEFAULT_LR_PARAMS,
    generate_lr_report,
    run_lr_cross_validation,
    save_lr_artifacts,
)


def main():
    print("Running Logistic Regression 5-Fold Cross-Validation on training split (1,600 rows)...")
    cv_results = run_lr_cross_validation(lr_params=DEFAULT_LR_PARAMS)

    json_path = save_lr_artifacts(cv_results)
    print(f"Saved results JSON to: {json_path}")

    report_path = generate_lr_report(cv_results)
    print(f"Generated report at: {report_path}")

    print("\n--- Summary Metrics (Mean +/- Std) ---")
    summary = cv_results["summary_metrics"]
    for k, v in summary.items():
        print(f"  {k}: {v['mean']:.4f} +/- {v['std']:.4f}")

    print("\n--- Fold Breakdown ---")
    for f in cv_results["fold_details"]:
        print(
            f"  Fold {f['fold']}: Macro F1={f['macro_f1']:.4f}, "
            f"Accuracy={f['accuracy']:.4f}, "
            f"High Recall={f['high_recall']:.4f}, "
            f"Critical Recall={f['critical_recall']:.4f}, "
            f"Combined Exact Recall={f['combined_high_critical_recall']:.4f}, "
            f"Severe Tier Recall={f['severe_tier_detection_recall']:.4f}, "
            f"Fit Time={f['fit_time_seconds']:.4f}s"
        )


if __name__ == "__main__":
    main()
