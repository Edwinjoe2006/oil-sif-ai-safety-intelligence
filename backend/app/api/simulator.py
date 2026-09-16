from fastapi import APIRouter
from app.services.simulator_service import simulator_service
from app.models.schemas import SimulatorInput, SimulatorResponse

router = APIRouter(prefix="/simulator", tags=["What-If Risk Simulator"])

@router.post("/simulate", response_model=SimulatorResponse)
def run_simulation(payload: SimulatorInput):
    return simulator_service.simulate_risk(payload.model_dump())
