"""
Servicio para gestión de configuraciones de pasarelas de pago
"""
import logging
from typing import List, Optional, Dict
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class PaymentGatewayService:
    """Servicio para gestionar configuraciones de pasarelas de pago"""
    
    # Definición de pasarelas soportadas
    SUPPORTED_GATEWAYS = {
        "bold": {
            "name": "BOLD",
            "description": "Pasarela de pago colombiana",
            "country": "Colombia",
            "required_fields": [
                {"key": "api_key", "label": "API Key", "type": "password"},
                {"key": "secret_key", "label": "Secret Key", "type": "password"}
            ],
            "docs_url": "https://developers.bold.co"
        },
        "mercadopago": {
            "name": "Mercado Pago",
            "description": "Pagos en toda Latinoamérica",
            "country": "Latinoamérica",
            "required_fields": [
                {"key": "access_token", "label": "Access Token", "type": "password"},
                {"key": "public_key", "label": "Public Key", "type": "text"}
            ],
            "docs_url": "https://www.mercadopago.com.co/developers"
        },
        "stripe": {
            "name": "Stripe",
            "description": "Pagos internacionales",
            "country": "Internacional",
            "required_fields": [
                {"key": "secret_key", "label": "Secret Key", "type": "password"},
                {"key": "publishable_key", "label": "Publishable Key", "type": "text"}
            ],
            "docs_url": "https://stripe.com/docs"
        },
        "paypal": {
            "name": "PayPal",
            "description": "Pagos internacionales",
            "country": "Internacional",
            "required_fields": [
                {"key": "client_id", "label": "Client ID", "type": "text"},
                {"key": "client_secret", "label": "Client Secret", "type": "password"}
            ],
            "docs_url": "https://developer.paypal.com"
        },
        "wompi": {
            "name": "Wompi",
            "description": "Pasarela de Bancolombia",
            "country": "Colombia",
            "required_fields": [
                {"key": "public_key", "label": "Public Key", "type": "text"},
                {"key": "private_key", "label": "Private Key", "type": "password"},
                {"key": "events_key", "label": "Events Key", "type": "password"}
            ],
            "docs_url": "https://docs.wompi.co"
        },
        "epayco": {
            "name": "ePayco",
            "description": "Pasarela colombiana",
            "country": "Colombia",
            "required_fields": [
                {"key": "public_key", "label": "Public Key", "type": "text"},
                {"key": "private_key", "label": "Private Key", "type": "password"},
                {"key": "p_cust_id", "label": "Customer ID", "type": "text"}
            ],
            "docs_url": "https://docs.epayco.co"
        }
    }
    
    def __init__(self, db):
        self.db = db
        self.collection = db.payment_gateways
    
    async def get_all_gateways(self) -> List[Dict]:
        """Obtener todas las pasarelas con su estado de configuración"""
        gateways = []
        
        for gateway_id, gateway_info in self.SUPPORTED_GATEWAYS.items():
            # Buscar configuración guardada
            config = await self.collection.find_one(
                {"gateway_id": gateway_id},
                {"_id": 0}
            )
            
            gateways.append({
                "id": gateway_id,
                "name": gateway_info["name"],
                "description": gateway_info["description"],
                "country": gateway_info["country"],
                "required_fields": gateway_info["required_fields"],
                "docs_url": gateway_info["docs_url"],
                "is_configured": config is not None and config.get("is_active", False),
                "is_active": config.get("is_active", False) if config else False
            })
        
        return gateways
    
    async def get_configured_gateways(self) -> List[Dict]:
        """Obtener solo las pasarelas configuradas y activas"""
        cursor = self.collection.find(
            {"is_active": True},
            {"_id": 0, "credentials": 0}  # No devolver credenciales
        )
        configs = await cursor.to_list(100)
        
        result = []
        for config in configs:
            gateway_id = config.get("gateway_id")
            if gateway_id in self.SUPPORTED_GATEWAYS:
                info = self.SUPPORTED_GATEWAYS[gateway_id]
                result.append({
                    "id": gateway_id,
                    "name": info["name"],
                    "description": info["description"]
                })
        
        return result
    
    async def get_gateway_config(self, gateway_id: str) -> Optional[Dict]:
        """Obtener configuración de una pasarela (sin credenciales sensibles)"""
        config = await self.collection.find_one(
            {"gateway_id": gateway_id},
            {"_id": 0}
        )
        
        if config and "credentials" in config:
            # Ocultar valores de credenciales, solo mostrar que están configuradas
            masked_credentials = {}
            for key in config["credentials"]:
                value = config["credentials"][key]
                if value:
                    masked_credentials[key] = "••••••••" + value[-4:] if len(value) > 4 else "••••"
                else:
                    masked_credentials[key] = ""
            config["credentials"] = masked_credentials
        
        return config
    
    async def save_gateway_config(self, gateway_id: str, credentials: Dict, is_active: bool = True) -> bool:
        """Guardar o actualizar configuración de una pasarela"""
        try:
            if gateway_id not in self.SUPPORTED_GATEWAYS:
                raise ValueError(f"Pasarela no soportada: {gateway_id}")
            
            now = datetime.now(timezone.utc)
            
            # Verificar si ya existe
            existing = await self.collection.find_one({"gateway_id": gateway_id})
            
            if existing:
                # Actualizar solo los campos que tienen valor
                update_credentials = existing.get("credentials", {})
                for key, value in credentials.items():
                    if value and not value.startswith("••••"):
                        update_credentials[key] = value
                
                await self.collection.update_one(
                    {"gateway_id": gateway_id},
                    {
                        "$set": {
                            "credentials": update_credentials,
                            "is_active": is_active,
                            "updated_at": now.isoformat()
                        }
                    }
                )
            else:
                # Crear nuevo
                await self.collection.insert_one({
                    "gateway_id": gateway_id,
                    "credentials": credentials,
                    "is_active": is_active,
                    "created_at": now.isoformat(),
                    "updated_at": now.isoformat()
                })
            
            logger.info(f"Gateway config saved: {gateway_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving gateway config: {str(e)}")
            raise
    
    async def toggle_gateway(self, gateway_id: str, is_active: bool) -> bool:
        """Activar/desactivar una pasarela"""
        try:
            result = await self.collection.update_one(
                {"gateway_id": gateway_id},
                {
                    "$set": {
                        "is_active": is_active,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error toggling gateway: {str(e)}")
            return False
    
    async def delete_gateway_config(self, gateway_id: str) -> bool:
        """Eliminar configuración de una pasarela"""
        try:
            result = await self.collection.delete_one({"gateway_id": gateway_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting gateway config: {str(e)}")
            return False
    
    async def get_gateway_credentials(self, gateway_id: str) -> Optional[Dict]:
        """Obtener credenciales reales de una pasarela (uso interno)"""
        config = await self.collection.find_one(
            {"gateway_id": gateway_id, "is_active": True},
            {"_id": 0, "credentials": 1}
        )
        return config.get("credentials") if config else None
