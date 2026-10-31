from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Integer,
    Float,
    JSON,
)
from sqlalchemy.orm import relationship
from app.database.session import Base


def get_uuid_str() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="user", cascade="all, delete-orphan")
    uploaded_files = relationship("UploadedFile", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    owner = relationship("User", back_populates="projects")
    simulations = relationship("Simulation", back_populates="project", cascade="all, delete-orphan")


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    natural_prompt = Column(Text, nullable=True)
    domain = Column(String(50), default="traffic", nullable=False)  # traffic, crowd, supply_chain
    status = Column(String(50), default="ready", nullable=False)   # ready, running, completed, failed
    configuration = Column(JSON, nullable=False)  # Structured configuration for the simulation
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="simulations")
    project = relationship("Project", back_populates="simulations")
    runs = relationship("SimulationRun", back_populates="simulation", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="simulation", cascade="all, delete-orphan")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    simulation_id = Column(String(36), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    configuration_delta = Column(JSON, nullable=False, default=dict)
    is_baseline = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    simulation = relationship("Simulation", back_populates="scenarios")
    runs = relationship("SimulationRun", back_populates="scenario")


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    simulation_id = Column(String(36), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_id = Column(String(36), ForeignKey("scenarios.id", ondelete="SET NULL"), nullable=True, index=True)
    seed = Column(Integer, default=42, nullable=False)
    duration_seconds = Column(Float, default=300.0, nullable=False)
    time_step = Column(Float, default=0.2, nullable=False)
    status = Column(String(50), default="completed", nullable=False)
    metrics = Column(JSON, nullable=False, default=dict)
    trajectory_data = Column(JSON, nullable=True)  # Keyframes and vehicle snapshots for playback
    ai_analysis = Column(Text, nullable=True)  # Muse Wonder explanation and recommendations
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    simulation = relationship("Simulation", back_populates="runs")
    scenario = relationship("Scenario", back_populates="runs")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)  # image, audio
    size_bytes = Column(Integer, nullable=False)
    segmentation_data = Column(JSON, nullable=True)
    transcription_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    user = relationship("User", back_populates="uploaded_files")


class AIInteraction(Base):
    __tablename__ = "ai_interactions"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    simulation_id = Column(String(36), ForeignKey("simulations.id", ondelete="SET NULL"), nullable=True, index=True)
    model = Column(String(100), nullable=False)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    tool_calls = Column(JSON, nullable=True)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
