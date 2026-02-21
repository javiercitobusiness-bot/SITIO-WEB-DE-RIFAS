from fastapi import FastAPI, APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import uuid
import hmac
import hashlib
import base64
import json
import jwt
from datetime import datetime, timezone, timedelta

# Importar modelos y servicios
from models import (
    PurchaseRequest, PurchaseResponse, PAYMENT_PLANS, 
    PaymentPlanEnum, InventoryStats
)
from models_events import EVENT_TEMPLATES
from services.bold_service import BOLDPaymentService
from services.email_service import EmailService
from services.inventory_service import InventoryService
from services.event_service import EventService
from services.payment_gateway_service import PaymentGatewayService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# BOLD Payment Configuration
BOLD_API_KEY = os.environ.get('BOLD_API_KEY', '2aKIUH7-NrRorUeb43a3jQFgG8vuqUVaoQkYeMJaMrM')
BOLD_SECRET_KEY = os.environ.get('BOLD_SECRET_KEY', 'JbuXbks5gC-yQZ_R9wzefw')
BOLD_API_BASE_URL = "https://integrations.api.bold.co"

# SendGrid Configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'soportedinamicadiamantes@gmail.com')

# Admin Configuration
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'diamantes2024')
JWT_SECRET = os.environ.get('JWT_SECRET', 'super-secret-jwt-key-diamantes')

# Dinámica Configuration
DINAMICA_NAME = "MARZO LLENO DE DIAMANTES"
PREMIO_PRINCIPAL = 100000000
REPECHAJE = 50000000
TOTAL_PREMIOS = 150000000
TOTAL_DIAMANTES = 1000000

# Inicializar servicios
bold_service = BOLDPaymentService(BOLD_API_KEY, BOLD_API_BASE_URL)
email_service = EmailService(SENDGRID_API_KEY, SENDER_EMAIL)
inventory_service = InventoryService(db)
event_service = EventService(db)
payment_gateway_service = PaymentGatewayService(db)

# Create the main app
app = FastAPI(title="Dinámica Diamantes API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize inventory on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing inventory...")
    await inventory_service.initialize_inventory()
    logger.info("Server started successfully")

@api_router.get("/")
async def root():
    return {
        "message": "Dinámica de Diamantes API",
        "dinamica": DINAMICA_NAME,
        "total_premios": TOTAL_PREMIOS
    }

@api_router.get("/plans")
async def get_plans():
    """Obtener planes disponibles"""
    return [
        {
            "id": plan.id,
            "name": plan.name,
            "price": plan.price_cop,
            "diamonds_count": plan.diamonds_count,
            "description": plan.description,
            "currency": "COP"
        }
        for plan in PAYMENT_PLANS.values()
    ]

@api_router.get("/inventory/stats")
async def get_inventory_stats():
    """Obtener estadísticas del inventario"""
    try:
        stats = await inventory_service.get_inventory_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting inventory stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting inventory stats")

@api_router.post("/purchase", response_model=PurchaseResponse)
async def create_purchase(request: PurchaseRequest):
    """Crear nueva compra y generar link de pago BOLD"""
    try:
        if request.plan not in PAYMENT_PLANS:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        plan = PAYMENT_PLANS[request.plan]
        reference = f"{plan.id}_{uuid.uuid4().hex[:12]}"
        
        stats = await inventory_service.get_inventory_stats()
        if stats["available_diamonds"] < plan.diamonds_count:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough diamonds available. Available: {stats['available_diamonds']}"
            )
        
        payment_data = await bold_service.create_payment_link(
            amount=plan.price_cop,
            description=f"{DINAMICA_NAME} - {plan.name}",
            customer_email=request.customer_email,
            reference=reference,
            customer_name=request.customer_name
        )
        
        await db.purchases.insert_one({
            "reference": reference,
            "plan": plan.id,
            "customer_name": request.customer_name,
            "customer_email": request.customer_email,
            "customer_phone": request.customer_phone,
            "amount": plan.price_cop,
            "diamonds_count": plan.diamonds_count,
            "status": "PENDING",
            "payment_link": payment_data.get("url", ""),
            "created_at": payment_data.get("created_at")
        })
        
        logger.info(f"Purchase created: {reference} for {request.customer_email}")
        
        return PurchaseResponse(
            payment_link=payment_data.get("url", ""),
            payment_reference=reference,
            plan=plan.name,
            diamonds_count=plan.diamonds_count,
            amount=plan.price_cop,
            currency="COP"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating purchase: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating purchase: {str(e)}")

def verify_bold_signature(received_signature: str, request_body: bytes, secret_key: str) -> bool:
    """Verificar firma del webhook de BOLD"""
    try:
        body_base64 = base64.b64encode(request_body).decode('utf-8')
        calculated_hash = hmac.new(
            secret_key.encode('utf-8'),
            body_base64.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(calculated_hash, received_signature)
    except Exception as e:
        logger.error(f"Signature verification error: {str(e)}")
        return False

@api_router.post("/webhook/bold")
async def handle_bold_webhook(request: Request):
    """Webhook para recibir confirmaciones de pago de BOLD"""
    try:
        body = await request.body()
        received_signature = request.headers.get("x-bold-signature")
        
        if not received_signature:
            logger.warning("Missing x-bold-signature header")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Missing signature"}
            )
        
        if not verify_bold_signature(received_signature, body, BOLD_SECRET_KEY):
            logger.warning("Invalid webhook signature")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error": "Invalid signature"}
            )
        
        payload = json.loads(body)
        payment_status = payload.get("payment_status", payload.get("status"))
        reference = payload.get("metadata", {}).get("reference") or payload.get("reference")
        
        logger.info(f"Webhook received - Reference: {reference}, Status: {payment_status}")
        
        if payment_status == "APPROVED":
            purchase = await db.purchases.find_one({"reference": reference})
            
            if not purchase:
                logger.error(f"Purchase not found: {reference}")
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Purchase not found"}
                )
            
            if purchase.get("status") == "APPROVED":
                logger.info(f"Purchase already processed: {reference}")
                return JSONResponse(
                    status_code=status.HTTP_200_OK,
                    content={"status": "already_processed"}
                )
            
            diamonds = await inventory_service.assign_diamonds(purchase["diamonds_count"])
            
            await db.diamond_assignments.insert_one({
                "reference": reference,
                "customer_email": purchase["customer_email"],
                "customer_name": purchase["customer_name"],
                "diamonds": diamonds,
                "plan": purchase["plan"],
                "amount_paid": purchase["amount"],
                "assigned_at": payload.get("created_at")
            })
            
            await db.purchases.update_one(
                {"reference": reference},
                {"$set": {"status": "APPROVED", "diamonds_assigned": True}}
            )
            
            await email_service.send_diamonds_email(
                recipient_email=purchase["customer_email"],
                recipient_name=purchase["customer_name"],
                diamonds=diamonds,
                plan_name=PAYMENT_PLANS[purchase["plan"]].name,
                amount_paid=purchase["amount"]
            )
            
            logger.info(f"Payment processed successfully: {reference}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"status": "received"}
        )
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal server error"}
        )

@api_router.post("/test-email")
async def test_email(email: str):
    """Endpoint de prueba para enviar email"""
    try:
        test_diamonds = [f"{i:06d}" for i in sorted([123456, 234567, 345678, 456789, 567890])]
        
        success = await email_service.send_diamonds_email(
            recipient_email=email,
            recipient_name="Usuario de Prueba",
            diamonds=test_diamonds,
            plan_name="Plan de Prueba",
            amount_paid=20000
        )
        
        if success:
            return {"status": "success", "message": f"Email enviado a {email}"}
        else:
            return {"status": "error", "message": "Error al enviar email"}
            
    except Exception as e:
        logger.error(f"Error testing email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Admin functions
def create_admin_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_admin_token(token: str) -> bool:
    try:
        jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return True
    except:
        return False

async def get_current_admin(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    
    token = auth_header.split(" ")[1]
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Token inválido")
    
    return True

@api_router.post("/admin/login")
async def admin_login(request: Request):
    try:
        body = await request.json()
        username = body.get("username", "")
        password = body.get("password", "")
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            token = create_admin_token(username)
            return {"token": token, "message": "Login exitoso"}
        else:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in admin login: {str(e)}")
        raise HTTPException(status_code=500, detail="Error en login")

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    await get_current_admin(request)
    
    try:
        total_purchases = await db.purchases.count_documents({})
        approved_purchases = await db.purchases.count_documents({"status": "APPROVED"})
        pending_purchases = await db.purchases.count_documents({"status": "PENDING"})
        
        pipeline = [
            {"$match": {"status": "APPROVED"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        revenue_result = await db.purchases.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        inventory_stats = await inventory_service.get_inventory_stats()
        
        plan_pipeline = [
            {"$match": {"status": "APPROVED"}},
            {"$group": {"_id": "$plan", "count": {"$sum": 1}, "revenue": {"$sum": "$amount"}}}
        ]
        plan_stats = await db.purchases.aggregate(plan_pipeline).to_list(10)
        
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_pipeline = [
            {"$match": {"status": "APPROVED", "created_at": {"$gte": today_start.isoformat()}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
        ]
        today_result = await db.purchases.aggregate(today_pipeline).to_list(1)
        today_revenue = today_result[0]["total"] if today_result else 0
        today_count = today_result[0]["count"] if today_result else 0
        
        return {
            "total_purchases": total_purchases,
            "approved_purchases": approved_purchases,
            "pending_purchases": pending_purchases,
            "total_revenue": total_revenue,
            "today_revenue": today_revenue,
            "today_purchases": today_count,
            "inventory": inventory_stats,
            "plan_stats": plan_stats
        }
    except Exception as e:
        logger.error(f"Error getting admin stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas")

@api_router.get("/admin/purchases")
async def get_admin_purchases(request: Request, skip: int = 0, limit: int = 50):
    await get_current_admin(request)
    
    try:
        cursor = db.purchases.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
        purchases = await cursor.to_list(limit)
        total = await db.purchases.count_documents({})
        
        return {
            "purchases": purchases,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Error getting purchases: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo compras")

@api_router.get("/admin/customers")
async def get_admin_customers(request: Request):
    await get_current_admin(request)
    
    try:
        pipeline = [
            {"$group": {
                "_id": "$customer_email",
                "name": {"$first": "$customer_name"},
                "phone": {"$first": "$customer_phone"},
                "total_purchases": {"$sum": 1},
                "total_spent": {"$sum": {"$cond": [{"$eq": ["$status", "APPROVED"]}, "$amount", 0]}},
                "total_diamonds": {"$sum": {"$cond": [{"$eq": ["$status", "APPROVED"]}, "$diamonds_count", 0]}}
            }},
            {"$sort": {"total_spent": -1}}
        ]
        customers = await db.purchases.aggregate(pipeline).to_list(100)
        
        return {"customers": customers}
    except Exception as e:
        logger.error(f"Error getting customers: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo clientes")

@api_router.get("/admin/diamonds/{email}")
async def get_customer_diamonds(request: Request, email: str):
    await get_current_admin(request)
    
    try:
        assignments = await db.diamond_assignments.find(
            {"customer_email": email}, 
            {"_id": 0}
        ).to_list(100)
        
        return {"assignments": assignments}
    except Exception as e:
        logger.error(f"Error getting customer diamonds: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo diamantes")

# Event endpoints
@api_router.get("/admin/events/templates")
async def get_event_templates(request: Request):
    await get_current_admin(request)
    
    templates = []
    for template_id, template in EVENT_TEMPLATES.items():
        templates.append({
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "icon": template.icon,
            "default_total_numbers": template.default_total_numbers,
            "default_prizes": [p.dict() for p in template.default_prizes],
            "default_plans": [p.dict() for p in template.default_plans]
        })
    
    return {"templates": templates}

@api_router.get("/admin/events")
async def get_all_events(request: Request):
    await get_current_admin(request)
    
    try:
        events = await event_service.get_all_events()
        return {"events": events}
    except Exception as e:
        logger.error(f"Error getting events: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo eventos")

@api_router.get("/admin/events/{event_id}")
async def get_event(request: Request, event_id: str):
    await get_current_admin(request)
    
    try:
        event = await event_service.get_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        
        stats = await event_service.get_event_stats(event_id)
        return {"event": event, "stats": stats}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting event: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo evento")

@api_router.post("/admin/events")
async def create_event(request: Request):
    await get_current_admin(request)
    
    try:
        body = await request.json()
        
        template_id = body.get("template_id")
        if template_id and template_id in EVENT_TEMPLATES:
            template = EVENT_TEMPLATES[template_id]
            if "prizes" not in body or not body["prizes"]:
                body["prizes"] = [p.dict() for p in template.default_prizes]
            if "plans" not in body or not body["plans"]:
                body["plans"] = [p.dict() for p in template.default_plans]
            if "total_numbers" not in body:
                body["total_numbers"] = template.default_total_numbers
        
        event = await event_service.create_event(body)
        return {"event": event, "message": "Evento creado exitosamente"}
    except Exception as e:
        logger.error(f"Error creating event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creando evento: {str(e)}")

@api_router.put("/admin/events/{event_id}")
async def update_event(request: Request, event_id: str):
    await get_current_admin(request)
    
    try:
        body = await request.json()
        event = await event_service.update_event(event_id, body)
        
        if not event:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        
        return {"event": event, "message": "Evento actualizado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error actualizando evento: {str(e)}")

@api_router.delete("/admin/events/{event_id}")
async def delete_event(request: Request, event_id: str):
    await get_current_admin(request)
    
    try:
        success = await event_service.delete_event(event_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        
        return {"message": "Evento eliminado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error eliminando evento: {str(e)}")

@api_router.post("/admin/events/{event_id}/activate")
async def activate_event(request: Request, event_id: str):
    await get_current_admin(request)
    
    try:
        success = await event_service.set_active_event(event_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        
        return {"message": "Evento activado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error activando evento: {str(e)}")

@api_router.get("/admin/events/{event_id}/stats")
async def get_event_stats(request: Request, event_id: str):
    await get_current_admin(request)
    
    try:
        stats = await event_service.get_event_stats(event_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting event stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas")

# Payment gateway endpoints
@api_router.get("/admin/payment-gateways")
async def get_all_payment_gateways(request: Request):
    await get_current_admin(request)
    
    try:
        gateways = await payment_gateway_service.get_all_gateways()
        return {"gateways": gateways}
    except Exception as e:
        logger.error(f"Error getting payment gateways: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo pasarelas")

@api_router.get("/admin/payment-gateways/configured")
async def get_configured_payment_gateways(request: Request):
    await get_current_admin(request)
    
    try:
        gateways = await payment_gateway_service.get_configured_gateways()
        return {"gateways": gateways}
    except Exception as e:
        logger.error(f"Error getting configured gateways: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo pasarelas configuradas")

@api_router.get("/admin/payment-gateways/{gateway_id}")
async def get_payment_gateway_config(request: Request, gateway_id: str):
    await get_current_admin(request)
    
    try:
        config = await payment_gateway_service.get_gateway_config(gateway_id)
        return {"config": config}
    except Exception as e:
        logger.error(f"Error getting gateway config: {str(e)}")
        raise HTTPException(status_code=500, detail="Error obteniendo configuración")

@api_router.post("/admin/payment-gateways/{gateway_id}")
async def save_payment_gateway_config(request: Request, gateway_id: str):
    await get_current_admin(request)
    
    try:
        body = await request.json()
        credentials = body.get("credentials", {})
        is_active = body.get("is_active", True)
        
        success = await payment_gateway_service.save_gateway_config(
            gateway_id, credentials, is_active
        )
        
        if success:
            return {"message": "Configuración guardada exitosamente"}
        else:
            raise HTTPException(status_code=500, detail="Error guardando configuración")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving gateway config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@api_router.put("/admin/payment-gateways/{gateway_id}/toggle")
async def toggle_payment_gateway(request: Request, gateway_id: str):
    await get_current_admin(request)
    
    try:
        body = await request.json()
        is_active = body.get("is_active", False)
        
        success = await payment_gateway_service.toggle_gateway(gateway_id, is_active)
        
        if success:
            return {"message": f"Pasarela {'activada' if is_active else 'desactivada'}"}
        else:
            raise HTTPException(status_code=404, detail="Pasarela no encontrada")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling gateway: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@api_router.delete("/admin/payment-gateways/{gateway_id}")
async def delete_payment_gateway_config(request: Request, gateway_id: str):
    await get_current_admin(request)
    
    try:
        success = await payment_gateway_service.delete_gateway_config(gateway_id)
        
        if success:
            return {"message": "Configuración eliminada"}
        else:
            raise HTTPException(status_code=404, detail="Configuración no encontrada")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting gateway config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Public endpoints
@api_router.get("/event/active")
async def get_public_active_event():
    try:
        event = await event_service.get_active_event()
        if not event:
            return {"event": None}
        
        return {
            "event": {
                "id": event.get("event_id"),
                "name": event.get("name"),
                "description": event.get("description"),
                "prizes": event.get("prizes"),
                "plans": event.get("plans"),
                "total_numbers": event.get("total_numbers"),
                "sold_numbers": event.get("sold_numbers"),
                "start_date": event.get("start_date"),
                "end_date": event.get("end_date"),
                "image_url": event.get("image_url")
            }
        }
    except Exception as e:
        logger.error(f"Error getting active event: {str(e)}")
        return {"event": None}

@api_router.get("/events/past")
async def get_past_events():
    try:
        cursor = db.events.find(
            {"status": {"$in": ["finished", "paused"]}},
            {"_id": 0, "event_id": 1, "name": 1, "description": 1, "end_date": 1, "sold_numbers": 1}
        ).sort("end_date", -1).limit(10)
        
        events = await cursor.to_list(10)
        return {"events": events}
    except Exception as e:
        logger.error(f"Error getting past events: {str(e)}")
        return {"events": []}

# Site Settings endpoints
@api_router.get("/admin/settings")
async def get_site_settings(request: Request):
    await get_current_admin(request)
    
    try:
        settings = await db.site_settings.find_one({}, {"_id": 0})
        return {"settings": settings}
    except Exception as e:
        logger.error(f"Error getting settings: {str(e)}")
        return {"settings": None}

@api_router.post("/admin/settings")
async def save_site_settings(request: Request):
    await get_current_admin(request)
    
    try:
        body = await request.json()
        
        await db.site_settings.update_one(
            {},
            {"$set": body},
            upsert=True
        )
        
        return {"message": "Configuración guardada exitosamente"}
    except Exception as e:
        logger.error(f"Error saving settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Error guardando configuración")

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
