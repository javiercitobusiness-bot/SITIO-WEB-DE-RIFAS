"""
Modelos para eventos/dinámicas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EventStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    FINISHED = "finished"

class SymbolType(str, Enum):
    DIAMOND = "diamond"
    STAR = "star"

class EventPrize(BaseModel):
    """Premio de un evento"""
    name: str
    amount: int
    description: str
    prize_type: str = "main"  # main, daily, daily_inverse, repechaje

class EventPlan(BaseModel):
    """Plan de compra para un evento"""
    id: str
    name: str
    price: int
    numbers_count: int
    description: str

class EventTemplate(BaseModel):
    """Plantilla para crear eventos rápidamente"""
    id: str
    name: str
    description: str
    icon: str
    default_prizes: List[EventPrize]
    default_plans: List[EventPlan]
    default_total_numbers: int

class EventCreate(BaseModel):
    """Crear nuevo evento"""
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field(default="")
    template_id: Optional[str] = None
    prizes: List[EventPrize] = []
    plans: List[EventPlan] = []
    total_numbers: int = Field(default=1000000, ge=100, le=10000000)
    price_per_number: int = Field(default=500, ge=100, le=10000)
    start_date: datetime
    end_date: datetime
    image_url: Optional[str] = None
    symbol_type: SymbolType = SymbolType.DIAMOND
    lottery_name: Optional[str] = None

class EventUpdate(BaseModel):
    """Actualizar evento"""
    name: Optional[str] = None
    description: Optional[str] = None
    prizes: Optional[List[EventPrize]] = None
    plans: Optional[List[EventPlan]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[EventStatus] = None
    image_url: Optional[str] = None
    price_per_number: Optional[int] = None
    total_numbers: Optional[int] = None
    symbol_type: Optional[SymbolType] = None
    lottery_name: Optional[str] = None

class Event(BaseModel):
    """Evento/Dinámica completa"""
    id: str
    name: str
    description: str
    prizes: List[EventPrize]
    plans: List[EventPlan]
    total_numbers: int
    sold_numbers: int = 0
    price_per_number: int = 500
    start_date: datetime
    end_date: datetime
    status: EventStatus = EventStatus.DRAFT
    image_url: Optional[str] = None
    symbol_type: SymbolType = SymbolType.DIAMOND
    lottery_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Plantillas predefinidas
EVENT_TEMPLATES = {
    "diamantes": EventTemplate(
        id="diamantes",
        name="Dinámica de Diamantes",
        description="Venta de diamantes enumerados con premios en efectivo",
        icon="💎",
        default_prizes=[
            EventPrize(name="Premio Principal", amount=100000000, description="Gran premio en efectivo"),
            EventPrize(name="Repechaje", amount=50000000, description="Segundo premio"),
            EventPrize(name="Premios Diarios", amount=5000000, description="8 premios diarios")
        ],
        default_plans=[
            EventPlan(id="basico", name="Plan Básico", price=20000, numbers_count=40, description="40 números"),
            EventPlan(id="medio", name="Plan Medio", price=50000, numbers_count=100, description="100 números"),
            EventPlan(id="premium", name="Plan Premium", price=100000, numbers_count=200, description="200 números")
        ],
        default_total_numbers=1000000
    ),
    "moto": EventTemplate(
        id="moto",
        name="Gánate una Moto",
        description="Rifa de motocicleta con números de la suerte",
        icon="🏍️",
        default_prizes=[
            EventPrize(name="Moto 0KM", amount=15000000, description="Motocicleta nueva"),
            EventPrize(name="Segundo Premio", amount=5000000, description="Premio en efectivo"),
            EventPrize(name="Tercer Premio", amount=2000000, description="Premio en efectivo")
        ],
        default_plans=[
            EventPlan(id="basico", name="Plan Básico", price=10000, numbers_count=5, description="5 números"),
            EventPlan(id="medio", name="Plan Medio", price=25000, numbers_count=15, description="15 números"),
            EventPlan(id="premium", name="Plan Premium", price=50000, numbers_count=35, description="35 números")
        ],
        default_total_numbers=10000
    ),
    "carro": EventTemplate(
        id="carro",
        name="Gánate un Carro",
        description="Rifa de automóvil con números de la suerte",
        icon="🚗",
        default_prizes=[
            EventPrize(name="Carro 0KM", amount=80000000, description="Automóvil nuevo"),
            EventPrize(name="Segundo Premio", amount=20000000, description="Premio en efectivo"),
            EventPrize(name="Tercer Premio", amount=10000000, description="Premio en efectivo")
        ],
        default_plans=[
            EventPlan(id="basico", name="Plan Básico", price=50000, numbers_count=10, description="10 números"),
            EventPlan(id="medio", name="Plan Medio", price=100000, numbers_count=25, description="25 números"),
            EventPlan(id="premium", name="Plan Premium", price=200000, numbers_count=60, description="60 números")
        ],
        default_total_numbers=50000
    ),
    "tecnologia": EventTemplate(
        id="tecnologia",
        name="Pack Tecnológico",
        description="Gana iPhone, MacBook y más",
        icon="📱",
        default_prizes=[
            EventPrize(name="iPhone + MacBook", amount=12000000, description="Pack Apple completo"),
            EventPrize(name="PlayStation 5", amount=3000000, description="Consola de videojuegos"),
            EventPrize(name="AirPods Pro", amount=1500000, description="Audífonos inalámbricos")
        ],
        default_plans=[
            EventPlan(id="basico", name="Plan Básico", price=15000, numbers_count=10, description="10 números"),
            EventPlan(id="medio", name="Plan Medio", price=35000, numbers_count=30, description="30 números"),
            EventPlan(id="premium", name="Plan Premium", price=70000, numbers_count=70, description="70 números")
        ],
        default_total_numbers=20000
    ),
    "viaje": EventTemplate(
        id="viaje",
        name="Viaje Todo Incluido",
        description="Gana un viaje con todo pago",
        icon="✈️",
        default_prizes=[
            EventPrize(name="Viaje a Cancún", amount=15000000, description="7 días todo incluido para 2"),
            EventPrize(name="Viaje Nacional", amount=5000000, description="Fin de semana en hotel 5 estrellas"),
            EventPrize(name="Bono de Viaje", amount=2000000, description="Para usar en cualquier destino")
        ],
        default_plans=[
            EventPlan(id="basico", name="Plan Básico", price=20000, numbers_count=10, description="10 números"),
            EventPlan(id="medio", name="Plan Medio", price=45000, numbers_count=30, description="30 números"),
            EventPlan(id="premium", name="Plan Premium", price=90000, numbers_count=70, description="70 números")
        ],
        default_total_numbers=15000
    )
}
