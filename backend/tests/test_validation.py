import pytest
from pathlib import Path
import pandas as pd
import tempfile
from training.validate_dataset import validate_dataset

def test_validate_missing_file():
    """Validates that a non-existent dataset path returns False cleanly."""
    non_existent = Path("data/non_existent_dataset_12345.csv")
    assert validate_dataset(non_existent) is False

def test_validate_valid_dataset():
    """Validates that an authentic conforming dataset passes all 10 checks."""
    data = {
        "report_id": [1, 2, 3, 4],
        "report_date": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"],
        "location": ["Offshore Rig A", "Platform B", "Compressor C", "Workshop D"],
        "report_type": ["Unsafe Act", "Unsafe Condition", "Near Miss", "Unsafe Act"],
        "report_text": [
            "Worker entered confined space without gas testing.",
            "High pressure line leaking crude oil at 1200 PSI.",
            "Loose scaffolding board at height without fall harness.",
            "Debris left on walkway creating tripping hazard."
        ],
        "hazard_category": ["Confined Space", "Pressure", "Working at Height", "Housekeeping"],
        "sif_precursor": [1, 1, 1, 0],
        "severity": ["Critical", "High", "High", "Low"],
        "risk_score": [92, 85, 78, 18],
        "recommended_action": ["Evacuate and test gas", "Isolate line", "Erect tie-off", "Clear pathway"]
    }
    df = pd.DataFrame(data)
    
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as tmp:
        df.to_csv(tmp.name, index=False)
        tmp_path = Path(tmp.name)

    try:
        assert validate_dataset(tmp_path) is True
    finally:
        if tmp_path.exists():
            tmp_path.unlink()
