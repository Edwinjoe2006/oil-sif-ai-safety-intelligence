# DATASET DIRECTORY: OIL-SIF-AI-NEW

Expected Dataset File:
`OIL_SIF_Synthetic_Dataset_5000.csv`

Expected Full Path:
`data/OIL_SIF_Synthetic_Dataset_5000.csv`

Expected Columns:
1. `report_id` - Unique identifier for the report
2. `report_date` - Date of the incident/observation (YYYY-MM-DD)
3. `location` - Operational site (e.g., Offshore Platform A, Compressor Station 2, Drilling Rig 4)
4. `report_type` - Type of report (Unsafe Act, Unsafe Condition, Near Miss)
5. `report_text` - Full narrative description
6. `hazard_category` - Category (Confined Space, Working at Height, Electrical, Fire/Explosion, Heavy Equipment, Energy Isolation, Pressure, Chemical Exposure, Process Safety, PPE, Lifting, Housekeeping)
7. `sif_precursor` - Serious Injury/Fatality Precursor indicator (Yes/No or 1/0 or True/False)
8. `severity` - Severity classification (Low, Medium, High, Critical)
9. `risk_score` - Historical or baseline risk score (0–100) (Used for comparison only, NEVER as a training input)
10. `recommended_action` - Initial recommended mitigation action

NOTE:
Do not commit raw confidential data. The dataset for this prototype is synthetic and intended for educational/research purposes.
