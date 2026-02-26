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
ADMIN_RECOVERY_EMAIL = "javiercito.business@gmail.com"

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

# Códigos de descuento
DISCOUNT_CODES = {
    "RECUPERA80": {"discount_percent": 80, "max_uses": 1, "used": 0}
}

@api_router.post("/validate-discount")
async def validate_discount(request: Request):
    """Validar código de descuento"""
    body = await request.json()
    code = body.get("code", "").upper()
    
    if code in DISCOUNT_CODES:
        discount = DISCOUNT_CODES[code]
        if discount["used"] < discount["max_uses"]:
            return {"valid": True, "discount_percent": discount["discount_percent"]}
    
    return {"valid": False}

@api_router.post("/purchase", response_model=PurchaseResponse)
async def create_purchase(request: PurchaseRequest):
    """Crear nueva compra y generar link de pago BOLD"""
    try:
        if request.plan not in PAYMENT_PLANS:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        plan = PAYMENT_PLANS[request.plan]
        reference = f"{plan.id}_{uuid.uuid4().hex[:12]}"
        
        # Aplicar descuento si hay código válido
        final_amount = plan.price_cop
        discount_applied = 0
        
        if request.discount_code:
            code = request.discount_code.upper()
            if code in DISCOUNT_CODES:
                discount = DISCOUNT_CODES[code]
                if discount["used"] < discount["max_uses"]:
                    discount_applied = discount["discount_percent"]
                    final_amount = int(plan.price_cop * (100 - discount_applied) / 100)
                    DISCOUNT_CODES[code]["used"] += 1
                    logger.info(f"Discount {code} applied: {discount_applied}% off")
        
        stats = await inventory_service.get_inventory_stats()
        if stats["available_diamonds"] < plan.diamonds_count:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough diamonds available. Available: {stats['available_diamonds']}"
            )
        
        payment_data = await bold_service.create_payment_link(
            amount=final_amount,
            description=f"{DINAMICA_NAME} - {plan.name}" + (f" (Descuento {discount_applied}%)" if discount_applied else ""),
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
            "amount": final_amount,
            "original_amount": plan.price_cop,
            "discount_code": request.discount_code if discount_applied else None,
            "discount_percent": discount_applied,
            "diamonds_count": plan.diamonds_count,
            "status": "PENDING",
            "payment_link": payment_data.get("url", ""),
            "created_at": payment_data.get("created_at")
        })
        
        logger.info(f"Purchase created: {reference} for {request.customer_email}, amount: {final_amount}")
        
        return PurchaseResponse(
            payment_link=payment_data.get("url", ""),
            payment_reference=reference,
            plan=plan.name,
            diamonds_count=plan.diamonds_count,
            amount=final_amount,
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
        logger.info(f"Webhook received - Raw body: {body[:500]}")
        
        # Log all headers for debugging
        headers_dict = dict(request.headers)
        logger.info(f"Webhook headers: {headers_dict}")
        
        payload = json.loads(body)
        logger.info(f"Webhook payload parsed: {payload}")
        
        # Obtener status y reference de diferentes posibles ubicaciones
        payment_status = payload.get("payment_status") or payload.get("status") or payload.get("transaction", {}).get("status")
        reference = payload.get("reference") or payload.get("metadata", {}).get("reference") or payload.get("transaction", {}).get("reference")
        
        logger.info(f"Webhook - Reference: {reference}, Status: {payment_status}")
        
        if payment_status in ["APPROVED", "approved", "SUCCESSFUL", "successful"]:
            purchase = await db.purchases.find_one({"reference": reference})
            
            if not purchase:
                # Intentar buscar por referencia parcial
                logger.warning(f"Purchase not found with exact reference: {reference}")
                if reference:
                    purchase = await db.purchases.find_one({"reference": {"$regex": reference}})
                
                if not purchase:
                    logger.error(f"Purchase definitely not found: {reference}")
                    return JSONResponse(
                        status_code=status.HTTP_200_OK,
                        content={"status": "purchase_not_found", "reference": reference}
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
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"status": "error_logged", "error": str(e)}
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

@api_router.post("/verify-and-process/{reference}")
async def verify_and_process_payment(reference: str):
    """Verificar pago con BOLD y procesar automáticamente"""
    try:
        logger.info(f"Verifying payment for reference: {reference}")
        
        # Buscar la compra
        purchase = await db.purchases.find_one({"reference": {"$regex": reference}})
        
        if not purchase:
            logger.warning(f"Purchase not found: {reference}")
            return {"status": "not_found"}
        
        if purchase.get("status") == "APPROVED":
            # Ya procesada, obtener diamantes asignados
            assignment = await db.diamond_assignments.find_one({"reference": purchase["reference"]})
            return {
                "status": "already_processed",
                "diamonds": assignment.get("diamonds", []) if assignment else [],
                "customer_name": purchase.get("customer_name"),
                "plan": purchase.get("plan"),
                "amount": purchase.get("amount")
            }
        
        # Procesar la compra
        diamonds = await inventory_service.assign_diamonds(purchase["diamonds_count"])
        
        await db.diamond_assignments.insert_one({
            "reference": purchase["reference"],
            "customer_email": purchase["customer_email"],
            "customer_name": purchase["customer_name"],
            "diamonds": diamonds,
            "plan": purchase["plan"],
            "amount_paid": purchase["amount"],
            "assigned_at": datetime.now(timezone.utc).isoformat()
        })
        
        await db.purchases.update_one(
            {"reference": purchase["reference"]},
            {"$set": {"status": "APPROVED", "diamonds_assigned": True}}
        )
        
        # Intentar enviar email (no bloquea si falla)
        try:
            await email_service.send_diamonds_email(
                recipient_email=purchase["customer_email"],
                recipient_name=purchase["customer_name"],
                diamonds=diamonds,
                plan_name=PAYMENT_PLANS[purchase["plan"]].name,
                amount_paid=purchase["amount"]
            )
        except Exception as email_error:
            logger.error(f"Email failed but diamonds assigned: {email_error}")
        
        logger.info(f"Payment auto-processed: {purchase['reference']}")
        return {
            "status": "processed",
            "diamonds": diamonds,
            "customer_name": purchase.get("customer_name"),
            "plan": purchase.get("plan"),
            "amount": purchase.get("amount")
        }
        
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        return {"status": "error", "message": str(e)}

@api_router.post("/admin/process-pending-payments")
async def process_pending_payments(request: Request):
    """Procesar manualmente todas las compras pendientes"""
    await get_current_admin(request)
    
    try:
        pending = await db.purchases.find({"status": "PENDING"}).to_list(100)
        processed = 0
        
        for purchase in pending:
            # Asignar diamantes
            diamonds = await inventory_service.assign_diamonds(purchase["diamonds_count"])
            
            # Guardar asignación
            await db.diamond_assignments.insert_one({
                "reference": purchase["reference"],
                "customer_email": purchase["customer_email"],
                "customer_name": purchase["customer_name"],
                "diamonds": diamonds,
                "plan": purchase["plan"],
                "amount_paid": purchase["amount"],
                "assigned_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Actualizar compra
            await db.purchases.update_one(
                {"reference": purchase["reference"]},
                {"$set": {"status": "APPROVED", "diamonds_assigned": True}}
            )
            
            # Enviar email
            await email_service.send_diamonds_email(
                recipient_email=purchase["customer_email"],
                recipient_name=purchase["customer_name"],
                diamonds=diamonds,
                plan_name=PAYMENT_PLANS[purchase["plan"]].name,
                amount_paid=purchase["amount"]
            )
            
            processed += 1
            logger.info(f"Manually processed: {purchase['reference']}")
        
        return {"processed": processed, "message": f"Se procesaron {processed} compras pendientes"}
    except Exception as e:
        logger.error(f"Error processing pending: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/process-single-payment/{reference}")
async def process_single_payment(request: Request, reference: str):
    """Procesar una compra específica por referencia"""
    await get_current_admin(request)
    
    try:
        purchase = await db.purchases.find_one({"reference": reference})
        if not purchase:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        
        if purchase.get("status") == "APPROVED":
            return {"message": "Esta compra ya fue procesada"}
        
        diamonds = await inventory_service.assign_diamonds(purchase["diamonds_count"])
        
        await db.diamond_assignments.insert_one({
            "reference": purchase["reference"],
            "customer_email": purchase["customer_email"],
            "customer_name": purchase["customer_name"],
            "diamonds": diamonds,
            "plan": purchase["plan"],
            "amount_paid": purchase["amount"],
            "assigned_at": datetime.now(timezone.utc).isoformat()
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
        
        return {"message": "Compra procesada exitosamente", "diamonds": len(diamonds)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing single payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/search-diamond/{number}")
async def search_diamond(request: Request, number: str):
    """Buscar quién compró un número específico"""
    await get_current_admin(request)
    
    try:
        assignment = await db.diamond_assignments.find_one(
            {"diamonds": number},
            {"_id": 0}
        )
        
        if assignment:
            return {
                "found": True,
                "diamond": number,
                "customer_name": assignment.get("customer_name"),
                "customer_email": assignment.get("customer_email"),
                "plan": assignment.get("plan"),
                "amount_paid": assignment.get("amount_paid"),
                "assigned_at": assignment.get("assigned_at")
            }
        
        return {"found": False, "diamond": number}
        
    except Exception as e:
        logger.error(f"Error searching diamond: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/add-gateway")
async def add_payment_gateway(request: Request):
    """Agregar nueva pasarela de pago"""
    await get_current_admin(request)
    
    body = await request.json()
    
    gateway = {
        "name": body.get("name"),
        "type": body.get("type"),
        "api_key": body.get("api_key"),
        "secret_key": body.get("secret_key", ""),
        "active": body.get("active", True),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_gateways.insert_one(gateway)
    
    return {"status": "success", "message": "Pasarela agregada"}

@api_router.get("/admin/gateways")
async def get_gateways(request: Request):
    """Obtener todas las pasarelas configuradas"""
    await get_current_admin(request)
    
    gateways = await db.payment_gateways.find({}, {"_id": 0}).to_list(20)
    return {"gateways": gateways}

@api_router.delete("/admin/gateway/{name}")
async def delete_gateway(request: Request, name: str):
    """Eliminar pasarela"""
    await get_current_admin(request)
    
    await db.payment_gateways.delete_one({"name": name})
    return {"status": "success"}

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
        
        # Check against database first, then fallback to env vars
        admin_config = await db.admin_config.find_one({"type": "credentials"})
        
        if admin_config:
            stored_username = admin_config.get("username", ADMIN_USERNAME)
            stored_password = admin_config.get("password", ADMIN_PASSWORD)
        else:
            stored_username = ADMIN_USERNAME
            stored_password = ADMIN_PASSWORD
        
        if username == stored_username and password == stored_password:
            token = create_admin_token(username)
            return {"token": token, "message": "Login exitoso"}
        else:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in admin login: {str(e)}")
        raise HTTPException(status_code=500, detail="Error en login")

@api_router.post("/admin/change-password")
async def change_admin_password(request: Request):
    await get_current_admin(request)
    
    try:
        body = await request.json()
        current_password = body.get("current_password", "")
        new_password = body.get("new_password", "")
        
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 8 caracteres")
        
        # Get current password
        admin_config = await db.admin_config.find_one({"type": "credentials"})
        stored_password = admin_config.get("password", ADMIN_PASSWORD) if admin_config else ADMIN_PASSWORD
        
        if current_password != stored_password:
            raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
        
        # Update password in database
        await db.admin_config.update_one(
            {"type": "credentials"},
            {"$set": {
                "type": "credentials",
                "username": ADMIN_USERNAME,
                "password": new_password,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        return {"message": "Contraseña actualizada exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al cambiar contraseña")

@api_router.post("/admin/request-password-reset")
async def request_password_reset(request: Request):
    try:
        body = await request.json()
        email = body.get("email", "")
        
        # Only allow recovery to the registered email
        if email.lower() != ADMIN_RECOVERY_EMAIL.lower():
            # Don't reveal if email is wrong for security
            return {"message": "Si el correo es válido, recibirás instrucciones para restablecer tu contraseña"}
        
        # Generate reset token
        reset_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # Store reset token
        await db.admin_config.update_one(
            {"type": "password_reset"},
            {"$set": {
                "type": "password_reset",
                "token": reset_token,
                "expires_at": expires_at.isoformat(),
                "used": False
            }},
            upsert=True
        )
        
        # Send email with reset link
        reset_link = f"https://dinamicadiamantes.com/admin/reset-password?token={reset_token}"
        
        email_sent = await email_service.send_password_reset_email(
            email=ADMIN_RECOVERY_EMAIL,
            reset_link=reset_link
        )
        
        if email_sent:
            logger.info(f"Password reset email sent to {ADMIN_RECOVERY_EMAIL}")
        else:
            logger.warning(f"Failed to send password reset email")
        
        return {"message": "Si el correo es válido, recibirás instrucciones para restablecer tu contraseña"}
    except Exception as e:
        logger.error(f"Error requesting password reset: {str(e)}")
        return {"message": "Si el correo es válido, recibirás instrucciones para restablecer tu contraseña"}

@api_router.post("/admin/reset-password")
async def reset_password(request: Request):
    try:
        body = await request.json()
        token = body.get("token", "")
        new_password = body.get("new_password", "")
        
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 8 caracteres")
        
        # Verify token
        reset_config = await db.admin_config.find_one({"type": "password_reset", "token": token, "used": False})
        
        if not reset_config:
            raise HTTPException(status_code=400, detail="Token inválido o expirado")
        
        # Check expiration
        expires_at = datetime.fromisoformat(reset_config["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Token expirado")
        
        # Update password
        await db.admin_config.update_one(
            {"type": "credentials"},
            {"$set": {
                "type": "credentials",
                "username": ADMIN_USERNAME,
                "password": new_password,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        # Mark token as used
        await db.admin_config.update_one(
            {"type": "password_reset", "token": token},
            {"$set": {"used": True}}
        )
        
        return {"message": "Contraseña restablecida exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al restablecer contraseña")

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
                "image_url": event.get("image_url"),
                "price_per_number": event.get("price_per_number", 500),
                "symbol_type": event.get("symbol_type", "diamond"),
                "lottery_name": event.get("lottery_name")
            }
        }
    except Exception as e:
        logger.error(f"Error getting active event: {str(e)}")
        return {"event": None}

@api_router.get("/events/available")
async def get_available_events():
    """Get all active events for public display"""
    try:
        cursor = db.events.find(
            {"status": "active"},
            {"_id": 0}
        ).sort("start_date", 1)
        
        events = await cursor.to_list(20)
        
        # Format events for frontend
        formatted_events = []
        for event in events:
            formatted_events.append({
                "id": event.get("event_id"),
                "name": event.get("name"),
                "description": event.get("description"),
                "prizes": event.get("prizes", []),
                "plans": event.get("plans", []),
                "total_numbers": event.get("total_numbers"),
                "sold_numbers": event.get("sold_numbers", 0),
                "start_date": event.get("start_date"),
                "end_date": event.get("end_date"),
                "image_url": event.get("image_url"),
                "price_per_number": event.get("price_per_number", 500),
                "symbol_type": event.get("symbol_type", "diamond"),
                "lottery_name": event.get("lottery_name")
            })
        
        return {"events": formatted_events}
    except Exception as e:
        logger.error(f"Error getting available events: {str(e)}")
        return {"events": []}

@api_router.get("/events/past")
async def get_past_events():
    try:
        cursor = db.events.find(
            {"status": {"$in": ["finished", "paused"]}, "show_in_history": {"$ne": False}},
            {"_id": 0, "event_id": 1, "name": 1, "description": 1, "end_date": 1, "sold_numbers": 1, "image_url": 1}
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
