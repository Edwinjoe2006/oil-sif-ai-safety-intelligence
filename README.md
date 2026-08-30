# OIL-SIF-AI-NEW
## AI/NLP Engine to Detect Serious Injury & Fatality (SIF) Precursors in Oil & Gas Unsafe-Act, Unsafe-Condition, and Near-Miss Reports

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1+-646CFF.svg)](https://vitejs.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg)](https://scikit-learn.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-336791.svg)](https://www.sqlite.org/)
[![Status](https://img.shields.io/badge/Prototype-Smart%20India%20Hackathon-purple.svg)]()

---

> [!IMPORTANT]
> **SYNTHETIC DATASET NOTICE**:
> The dataset used by this prototype is synthetic and intended solely for research, academic evaluation, and hackathon demonstration purposes. **It does NOT represent confidential OIL operational data**, nor does it expose proprietary company records.

---

## 1. Executive Summary & Problem Statement

In Oil & Gas upstream and downstream operations, thousands of safety cards (Unsafe Acts, Unsafe Conditions, and Near Misses) are logged monthly. A fundamental challenge in industrial safety is that **less than 5% of incidents contain precursors to Serious Injuries and Fatalities (SIF)**, yet traditional safety management systems treat all reports with equal weight or rely on manual, subjective review. Consequently, high-potential precursor signals (such as high-pressure leaks, confined-space entry without gas testing, or bypassed safety interlocks) are often lost in noise until a catastrophic loss of control occurs.

**OIL-SIF-AI-NEW** is an enterprise-grade AI Early Warning & Safety Intelligence Platform that automates the real-time detection of SIF precursors. By leveraging CPU-friendly Natural Language Processing (TF-IDF vectorization with balanced Logistic Regression classifiers) and an explainable Risk Engine, the platform immediately quantifies risk (0–100), extracts dangerous factors, maps potential incident escalation pathways, recommends hazard-specific corrective actions, and prioritizes urgent interventions for safety officers.

---

## 2. System Architecture & Intelligence Workflow

```
                        [ Safety Observation Text ]
                    (Unsafe Act / Unsafe Condition / Near Miss)
                                     │
                                     ▼
                      FastAPI Backend: POST /api/analyze
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
 [ Prediction Service ]                               [ Explanation Service ]
  ├── SIF Precursor Classifier                         ├── Dangerous Factor Extraction
  │   (TF-IDF + Balanced Logistic Reg.)                │   (Regex / NLP Pattern Matching)
  ├── Hazard Category Classifier                       ├── "Why is this dangerous?"
  │   (Multi-class Logistic Reg.)                      ├── Potential Consequences
  └── Severity Level Classifier                        └── Potential Escalation Path
      (Multi-class Logistic Reg.)                          (Visual 5-Stage Timeline)
         │                                                       │
         └───────────────────────────┬───────────────────────────┘
                                     ▼
                              [ Risk Engine ]
                      (Independent 0–100 Risk Scoring)
                      *NO dataset risk_score leakage*
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
[ Recommendation Service ]                             [ Similarity Service ]
(Hazard-specific engineering                           (TF-IDF Cosine Similarity
 & administrative controls)                             against historical DB)
         │                                                       │
         └───────────────────────────┬───────────────────────────┘
                                     ▼
                     [ SQLite / PostgreSQL Database ]
                        ├── safety_reports
                        ├── feedback
                        └── corrective_actions
                                     │
                                     ▼
                      [ Modern Industrial Frontend ]
             (React + Vite Dark Industrial Dashboard, KPIs,
        Priority Queue, Time-Series Trends, Copilot, Feedback)
```

---

## 3. Technology Stack

- **Backend Framework**: Python 3.12, FastAPI (high-performance async REST framework)
- **Machine Learning**: Scikit-learn (TF-IDF vectorizers, Logistic Regression with `class_weight="balanced"`), NumPy, Pandas, Joblib
- **Database Layer**: SQLAlchemy 2.0 ORM with native SQLite fallback (`backend/data/oil_sif_safety.db`) and PostgreSQL support
- **Validation**: Pydantic v2 schemas and runtime field validators
- **Frontend Framework**: React 18, Vite 5, Modern Custom Industrial CSS (Dark Navy theme `#070D1E`), Lucide Icons, Chart.js & React-Chartjs-2
- **Testing**: Pytest 8.0+ comprehensive test suite with FastAPI TestClient
- **Containerization**: Docker, Docker Compose (Backend, Frontend, PostgreSQL)

---

## 4. Machine Learning Methodology

### Model Separation & Inference Pipeline
Models are **never trained at API startup**. Model training is an isolated, reproducible batch pipeline (`backend/training/train_models.py`), and the FastAPI application loads trained `.joblib` binary artifacts once into memory at launch via a singleton `PredictionService`.

### Strict Leakage Prevention
- The dataset feature `risk_score` is **strictly excluded** from training input features to prevent target leakage.
- TF-IDF vectorizers are fit **exclusively on the training split** (`X_train`), and only `.transform()` is executed on test sets and live inference.

### Classifiers
1. **SIF Precursor Binary Classifier**:
   - Model: `LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)`
   - Safety Priority: Maximizing **SIF-Positive Recall** so hazardous scenarios are never falsely classified as benign.
2. **Hazard Category Classifier**:
   - Multi-class classifier distinguishing Confined Space, Pressure, Working at Height, Hot Work, Fire/Explosion, Energy Isolation, Chemical Exposure, Electrical, Lifting, Heavy Equipment, PPE, and Housekeeping.
3. **Severity Classifier**:
   - Multi-class classifier predicting Low, Medium, High, and Critical severity ratings.

---

## 5. Explainable Risk Engine (0–100)

The Risk Engine calculates an independent, mathematical risk index from 0 to 100 using four weighted components:

$$\text{Risk Score} = 100 \times \left( w_{\text{sif}} \cdot P(\text{SIF}) + w_{\text{sev}} \cdot S + w_{\text{haz}} \cdot H + w_{\text{fac}} \cdot F \right)$$

- **SIF Probability Component ($w_{\text{sif}} = 0.40$)**: SIF probability output from the machine learning model.
- **Severity Component ($w_{\text{sev}} = 0.30$)**: Critical = 1.0, High = 0.75, Medium = 0.45, Low = 0.15.
- **Hazard Inherent Weight ($w_{\text{haz}} = 0.20$)**: High-energy hazards (Confined Space, Fire/Explosion, Process Safety, Pressure, Energy Isolation = 0.88–1.0; Working at Height, Electrical, Lifting = 0.75–0.85; PPE, Housekeeping = 0.25–0.40).
- **Detected Safety Factors ($w_{\text{fac}} = 0.10$)**: $\min(1.0, \frac{\text{factor count}}{3})$.

### Configurable Risk Levels:
- **0–24**: `LOW` (Green `#10B981`)
- **25–49**: `MEDIUM` (Amber `#F59E0B`)
- **50–74**: `HIGH` (Orange `#F97316`)
- **75–100**: `CRITICAL` (Red `#EF4444`)

---

## 6. Dataset Placement & Training Workflow

### Expected Dataset Location
```
data/OIL_SIF_Synthetic_Dataset_5000.csv
```

### Expected 10 Columns
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `report_id` | Integer / String | Unique report identifier |
| `report_date` | String (YYYY-MM-DD) | Observation date |
| `location` | String | Operational site / rig / facility |
| `report_type` | String | Unsafe Act, Unsafe Condition, Near Miss |
| `report_text` | String | Narrative observation text |
| `hazard_category`| String | Category (Pressure, Confined Space, etc.) |
| `sif_precursor` | Int / Bool / String | SIF indicator (1/0, True/False, Yes/No) |
| `severity` | String | Low, Medium, High, Critical |
| `risk_score` | Numeric (0–100) | Historical reference score (NEVER used as input feature) |
| `recommended_action` | String | Initial recommended mitigation action |

---

## 7. Windows PowerShell Quickstart Guide

### Prerequisites
- Python 3.10+ installed
- Node.js v18+ and npm installed

### Step 1: Clone or Navigate to Project
```powershell
cd "c:\Users\Edwin Joe\OneDrive\Documents\OIL-SIF-AI-NEW"
```

### Step 2: Backend Setup & Virtual Environment
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 3: Dataset Validation & Model Training
Once you have placed `OIL_SIF_Synthetic_Dataset_5000.csv` in the `data/` folder:
```powershell
# 1. Run 10-point dataset integrity audit (does NOT modify CSV)
python training\validate_dataset.py

# 2. Train and save models & vectorizers into backend/models/
python training\train_models.py

# 3. View saved validation metrics
python training\evaluate_models.py
```

### Step 4: Run Backend Server
```powershell
python -m uvicorn app.main:app --reload --port 8000
```
- API Health: `http://localhost:8000/api/health`
- Interactive Swagger UI: `http://localhost:8000/docs`

### Step 5: Run Frontend Development Server
In a separate PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
- Frontend Dashboard: `http://localhost:3000`

---

## 8. Docker Deployment (Optional)

Run the full stack with PostgreSQL using Docker Compose:
```powershell
docker-compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

To stop:
```powershell
docker-compose down
```

---

## 9. Automated Testing

Run the full backend test suite:
```powershell
cd backend
python -m pytest tests/ -v
```
All 14 tests cover:
- Dataset validator and missing-file handling
- Risk engine bounds and threshold categorization
- Factor detection regex and escalation path generation
- API endpoints (`/api/health`, `/api/statistics`, `/api/trends`, `/api/hazards`, `/api/reports`)
- Input validation and graceful 503 error handling when models are un-trained
- Human feedback logging and database persistence

---

## 10. API Specification

### `POST /api/analyze`
**Request**:
```json
{
  "report_text": "High-pressure crude oil injection line developed a severe flange gasket leak at 1200 PSI while maintenance technicians were working without proper protection in the immediate spray zone.",
  "report_type": "Unsafe Condition",
  "location": "Offshore Platform Delta"
}
```

**Response**:
```json
{
  "id": 1,
  "sif_precursor": true,
  "sif_probability": 0.9542,
  "hazard_category": "Pressure",
  "hazard_probability": 0.9214,
  "severity": "Critical",
  "severity_probability": 0.8912,
  "risk_score": 94,
  "risk_level": "CRITICAL",
  "detected_factors": [
    "High Pressure",
    "Loss of Containment / Leak",
    "Worker Exposure"
  ],
  "potential_consequences": [
    "Catastrophic line rupture and uncontrolled high-pressure fluid ejection.",
    "Severe blunt force or penetrating trauma to personnel in the line of fire.",
    "Formation of flammable oil mist or toxic aerosol cloud."
  ],
  "recommended_action": [
    "Immediately isolate the affected pressurized line or equipment at upstream/downstream manifolds.",
    "Depressurize and vent trapped inventory according to approved standard operating procedures (SOP).",
    "Establish an exclusion zone around the spray/spray-zone perimeter and restrict all unauthorized access.",
    "Inspect failed flange, gasket, or valve for mechanical fatigue, thermal degradation, or torque mismatch.",
    "Verify zero energy status and perform positive mechanical blinding before commencing repair work."
  ],
  "escalation_path": [
    { "step_number": 1, "stage": "Unsafe Condition", "description": "Compromised seal or mechanical integrity under high operating pressure." },
    { "step_number": 2, "stage": "Hazard Presence", "description": "High-velocity jet or mist leakage into active work envelope." },
    { "step_number": 3, "stage": "Worker Exposure", "description": "Technicians working directly in line-of-fire without standoff distance." },
    { "step_number": 4, "stage": "Loss of Control", "description": "Sudden catastrophic gasket blowout or piping failure." },
    { "step_number": 5, "stage": "Major Incident (SIF)", "description": "High-pressure fluid injection or flammable vapor ignition causing serious injury/fatality." }
  ],
  "similar_reports": [],
  "copilot": {
    "why_dangerous": "This scenario presents an elevated CRITICAL severity risk involving Pressure. Key contributing factors identified from the report include: High Pressure, Loss of Containment / Leak, Worker Exposure...",
    "potential_consequence": "Catastrophic line rupture and uncontrolled high-pressure fluid ejection.",
    "main_risk_factors": ["High Pressure", "Loss of Containment / Leak", "Worker Exposure"],
    "recommended_immediate_actions": [
      "Immediately isolate the affected pressurized line or equipment at upstream/downstream manifolds.",
      "Depressurize and vent trapped inventory according to approved standard operating procedures (SOP)."
    ],
    "priority": "IMMEDIATE STOP-WORK REQUIRED"
  }
}
```

### Other Endpoints
- `GET /api/reports`: Paginated list of historical reports with search & filtering
- `GET /api/reports/high-risk`: Top high/critical reports
- `GET /api/reports/{id}`: Detailed investigation record
- `PATCH /api/reports/{id}/status`: Updates lifecycle status (`Open`, `In Progress`, `Resolved`)
- `GET /api/statistics`: Real-time KPI statistics and category distributions
- `GET /api/trends`: Time-series risk trends and emerging hazard velocity
- `GET /api/hazards`: Asset hazard breakdown and SIF conversion rates
- `GET /api/risk-priority`: Real-time priority queue sorted by risk score descending
- `GET /api/model-metrics`: Verified metrics from `training_metrics.json`
- `GET /api/similar-reports`: TF-IDF similarity matcher
- `POST /api/feedback`: Human safety officer validation submission
- `GET /api/health`: Comprehensive system, DB, and ML model health check

---

## 11. Smart India Hackathon Demonstration Flow

1. **Dashboard Overview**: Showcase the dark industrial UI, KPI metrics, Safety Risk Overview donut chart, and Emerging Safety Risks.
2. **Demo Scenarios on Analyze Page**:
   - Click **Scenario 1 (High-Pressure Oil Leak)**: Observe instant population without auto-submission.
   - Click **Analyze Safety Report**: Highlight the multi-stage pipeline animation.
   - Walk through the results: Circular Risk Gauge (Score 94, CRITICAL), SIF Precursor (YES), Explainable Risk Factors, Escalation Timeline with disclaimer, and Actionable Controls.
3. **AI Safety Copilot**: Highlight the grounded, non-hallucinated domain reasoning and Immediate Stop-Work priority.
4. **Human-in-the-Loop Feedback**: Demonstrate clicking "Correct" or "Incorrect" to record safety officer feedback into the database.
5. **Safety Reports Explorer**: Demonstrate multi-parameter filtering by Risk Level, Hazard, SIF, and Location.
6. **Emerging Hazards & Model Metrics**: Demonstrate rate-of-change velocity metrics and model audit transparency.
