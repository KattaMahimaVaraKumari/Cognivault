"""Script to generate explainability reports for Cognivault AI.

Generates:
1. reports/feature_importance_report.md (Global feature importance analysis)
2. reports/explainability_validation_report.md (Persona-based individual explanations & additive validation)
"""

import sys
from pathlib import Path

# Add src to sys.path if not present
src_path = Path(__file__).resolve().parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from cognivault.explainability import (
    generate_explainability_validation_report,
    generate_feature_importance_report,
)


def main() -> None:
    print("=" * 60)
    print("Cognivault AI - Block 6: Generating Explainability Reports")
    print("=" * 60)

    print("\n1. Generating Global Feature Importance Report...")
    path1 = generate_feature_importance_report()
    print(f"   [SUCCESS] Saved to: {path1}")

    print("\n2. Generating Explainability Validation Report (Persona Audits)...")
    path2 = generate_explainability_validation_report()
    print(f"   [SUCCESS] Saved to: {path2}")

    print("\n" + "=" * 60)
    print("All explainability reports generated successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()
