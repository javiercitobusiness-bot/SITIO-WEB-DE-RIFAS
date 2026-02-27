"""
Modelos de datos para la Dinámica de Diamantes
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PaymentPlanEnum(str, Enum):
    """Planes de pago disponibles"""
    BASICO = "basico"
    MEDIO = "medio"
    PREMIUM = "premium"

class PaymentPlan(BaseModel):
    """Definición de plan de pago"""
    id: str
    name: str
    price_cop: int
    diamonds_count: int
    description: str

class PurchaseRequest(BaseModel):
    """Solicitud de compra"""
    plan: PaymentPlanEnum
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: EmailStr
    customer_phone: str = Field(..., pattern=r'^\+?[\d\s\-()]+$')
    discount_code: Optional[str] = None
    influencer_code: Optional[str] = None
    payment_method: Optional[str] = "bold"  # "bold" o "mercadopago"

class PurchaseResponse(BaseModel):
    """Respuesta después de crear compra"""
    payment_link: str
    payment_reference: str
    plan: str
    diamonds_count: int
    amount: int
    currency: str = "COP"

class DiamondAssignment(BaseModel):
    """Asignación de diamantes a un cliente"""
    purchase_id: str
    customer_email: EmailStr
    diamonds: List[str]  # Lista de números de 6 cifras
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    plan: str
    amount_paid: int

class InventoryStats(BaseModel):
    """Estadísticas de inventario"""
    total_diamonds: int = 1000000
    sold_diamonds: int
    available_diamonds: int
    sold_percentage: float
    
class WebhookPayload(BaseModel):
    """Payload del webhook de BOLD"""
    payment_id: str
    reference: str
    status: str
    amount: dict
    payer_email: str
    created_at: str

# Planes disponibles
PAYMENT_PLANS = {
    PaymentPlanEnum.BASICO: PaymentPlan(
        id="basico",
        name="Plan Básico",
        price_cop=20000,
        diamonds_count=40,
        description="40 diamantes enumerados"
    ),
    PaymentPlanEnum.MEDIO: PaymentPlan(
        id="medio",
        name="Plan Medio",
        price_cop=50000,
        diamonds_count=100,
        description="100 diamantes enumerados"
    ),
    PaymentPlanEnum.PREMIUM: PaymentPlan(
        id="premium",
        name="Plan Premium",
        price_cop=100000,
        diamonds_count=200,
        description="200 diamantes enumerados"
    )
}
