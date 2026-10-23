"""Execution script for Block 5A: Score Regression CV Comparison and Final Test Evaluation."""

from cognivault.train_regression import (
    evaluate_selected_regression_test,
    generate_regression_cv_report,
    generate_regression_test_report,
    run_regression_cross_validation,
    save_regression_artifacts,
)


def main():
    print("1. Running 5-Fold Cross-Validation for Regression Candidates...")
    cv_results = run_regression_cross_validation()
    print("   Candidates evaluated: DummyRegressor, Ridge, RandomForestRegressor")

    print("\n2. Evaluating Selected Model (Ridge) on 400-row Held-Out Test Set...")
    test_results, fitted_pipeline = evaluate_selected_regression_test(selected_model_name="Ridge")

    print("\n3. Saving Artifacts and Generating Reports...")
    saved_paths = save_regression_artifacts(
        cv_results=cv_results,
        test_results=test_results,
        fitted_pipeline=fitted_pipeline,
    )
    for name, path in saved_paths.items():
        print(f"   Saved {name}: {path}")

    cv_report_path = generate_regression_cv_report(cv_results)
    print(f"   Generated CV report: {cv_report_path}")

    test_report_path = generate_regression_test_report(test_results, cv_results=cv_results)
    print(f"   Generated Test report: {test_report_path}")

    print("\n--- Regression Candidates 5-Fold CV Summary ---")
    for name, c in cv_results["candidates"].items():
        m = c["summary_metrics"]
        print(f"  {name:<22}: MAE={m['mae']['mean']:.4f} +/- {m['mae']['std']:.4f}, RMSE={m['rmse']['mean']:.4f}, R2={m['r2']['mean']:.4f}")

    print("\n--- Final Held-Out Test Metrics (Ridge, 400 rows) ---")
    tm = test_results["test_metrics"]
    print(f"  Test MAE:   {tm['mae']:.4f} points")
    print(f"  Test RMSE:  {tm['rmse']:.4f} points")
    print(f"  Test R2:    {tm['r2']:.4f}")

    b = test_results["prediction_boundary_analysis"]
    print(f"  Boundary: min={b['min_prediction']:.4f}, max={b['max_prediction']:.4f}, below_zero={b['count_below_zero']}, above_100={b['count_above_100']}")


if __name__ == "__main__":
    main()
