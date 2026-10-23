"""Execution script for Block 3A: Random Forest 5-Fold Cross-Validation."""

from cognivault.train_rf import (
    DEFAULT_RF_PARAMS,
    generate_rf_report,
    run_rf_cross_validation,
    save_rf_artifacts,
)


def main():
    print("Running Random Forest 5-Fold Cross-Validation on training split (1,600 rows)...")
    cv_results = run_rf_cross_validation(rf_params=DEFAULT_RF_PARAMS)

    json_path = save_rf_artifacts(cv_results)
    print(f"Saved results JSON to: {json_path}")

    report_path = generate_rf_report(cv_results)
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
            f"Fit Time={f['fit_time_seconds']:.4f}s"
        )


if __name__ == "__main__":
    main()
