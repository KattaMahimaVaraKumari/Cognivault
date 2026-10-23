"""Execution script for Block 4B: Final Held-Out Test Evaluation of Logistic Regression."""

from cognivault.evaluate_lr import (
    evaluate_logistic_regression_test,
    generate_lr_test_report,
    save_lr_test_artifacts,
)


def main():
    print("Evaluating Logistic Regression on the held-out test partition (400 rows)...")
    test_results, fitted_pipeline = evaluate_logistic_regression_test()

    saved_paths = save_lr_test_artifacts(test_results, fitted_pipeline=fitted_pipeline)
    print(f"Saved test results JSON to: {saved_paths['json']}")
    print(f"Saved fitted model to: {saved_paths['model']}")

    report_path = generate_lr_test_report(test_results)
    print(f"Generated test report at: {report_path}")

    m = test_results["test_metrics"]
    print("\n--- Final Test Metrics (400 rows) ---")
    print(f"  Accuracy:             {m['accuracy']:.4f}")
    print(f"  Balanced Accuracy:    {m['balanced_accuracy']:.4f}")
    print(f"  Macro F1:             {m['macro_f1']:.4f}")
    print(f"  Weighted F1:          {m['weighted_f1']:.4f}")
    print(f"  High Recall:          {m['high_recall']:.4f}")
    print(f"  Critical Recall:      {m['critical_recall']:.4f}")
    print(f"  Combined Exact Recall:{m['combined_high_critical_recall_exact']:.4f}")
    print(f"  Severe Tier Recall:   {m['severe_tier_detection_recall']:.4f}")


if __name__ == "__main__":
    main()
