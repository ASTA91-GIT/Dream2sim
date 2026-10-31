from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.simulation_schema import SimulationConfig


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class NaturalPromptRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None
    domain: Optional[str] = "traffic"
    context: Optional[Dict[str, Any]] = None


class AIInterpretationResponse(BaseModel):
    summary: str
    identified_entities: List[str]
    identified_constraints: List[str]
    suggested_configuration: SimulationConfig
    clarifications_needed: List[str] = []
    reasoning: Optional[str] = None


class AIChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class AIChatRequest(BaseModel):
    simulation_id: Optional[str] = None
    messages: List[AIChatMessage]
    current_config: Optional[SimulationConfig] = None


class AnalysisRequest(BaseModel):
    simulation_id: str
    run_id: Optional[str] = None
    question: Optional[str] = None


class AnalysisResponse(BaseModel):
    summary: str
    key_findings: List[str]
    bottlenecks: List[str]
    optimization_recommendations: List[str]
    engineering_insights: str
