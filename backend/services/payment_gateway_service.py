"""
Servicio para gestión de configuraciones de pasarelas de pago
Soporta múltiples cuentas por tipo de pasarela
"""
import logging
from typing import List, Optional, Dict
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)

class PaymentGatewayService:
    """Servicio para gestionar configuraciones de pasarelas de pago"""
    
    # Definición de tipos de pasarelas soportadas
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
        "nequi": {
            "name": "Nequi",
            "description": "Pagos con Nequi",
            "country": "Colombia",
            "required_fields": [
                {"key": "api_key", "label": "API Key", "type": "password"},
                {"key": "secret_key", "label": "Secret Key", "type": "password"}
            ],
            "docs_url": "https://conecta.nequi.com"
        },
        "daviplata": {
            "name": "Daviplata",
            "description": "Pagos con Daviplata",
            "country": "Colombia",
            "required_fields": [
                {"key": "api_key", "label": "API Key", "type": "password"}
            ],
            "docs_url": "https://daviplata.com"
        }
    }
    
    def __init__(self, db):
        self.db = db
        self.collection = db.payment_gateways
    
    async def get_all_gateways(self) -> List[Dict]:
        """Obtener todas las cuentas de pasarelas configuradas"""
        cursor = self.collection.find({}, {"_id": 0}).sort("priority", 1)
        gateways = await cursor.to_list(100)
        
        # Agregar info del tipo de pasarela
        for gateway in gateways:
            gateway_type = gateway.get("gateway_type", gateway.get("gateway_id"))
            if gateway_type in self.SUPPORTED_GATEWAYS:
                info = self.SUPPORTED_GATEWAYS[gateway_type]
                gateway["type_name"] = info["name"]
                gateway["type_description"] = info["description"]
        
        return gateways
    
    async def get_supported_types(self) -> List[Dict]:
        """Obtener los tipos de pasarelas soportadas"""
        return [
            {
                "id": gw_id,
                "name": info["name"],
                "description": info["description"],
                "country": info["country"],
                "required_fields": info["required_fields"],
                "docs_url": info["docs_url"]
            }
            for gw_id, info in self.SUPPORTED_GATEWAYS.items()
        ]
    
    async def get_active_gateways(self) -> List[Dict]:
        """Obtener pasarelas activas ordenadas por prioridad"""
        cursor = self.collection.find(
            {"is_active": True},
            {"_id": 0, "credentials": 0}
        ).sort("priority", 1)
        
        gateways = await cursor.to_list(100)
        
        for gateway in gateways:
            gateway_type = gateway.get("gateway_type")
            if gateway_type in self.SUPPORTED_GATEWAYS:
                gateway["type_name"] = self.SUPPORTED_GATEWAYS[gateway_type]["name"]
        
        return gateways
    
    async def add_gateway(self, gateway_type: str, display_name: str, credentials: Dict, priority: int = 0) -> Dict:
        """Agregar nueva cuenta de pasarela"""
        try:
            if gateway_type not in self.SUPPORTED_GATEWAYS:
                raise ValueError(f"Tipo de pasarela no soportada: {gateway_type}")
            
            gateway_id = f"{gateway_type}_{uuid.uuid4().hex[:8]}"
            now = datetime.now(timezone.utc)
            
            gateway = {
                "gateway_id": gateway_id,
                "gateway_type": gateway_type,
                "display_name": display_name,
                "credentials": credentials,
                "is_active": True,
                "priority": priority,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }
            
            await self.collection.insert_one(gateway)
            gateway.pop("_id", None)
            gateway.pop("credentials", None)
            
            logger.info(f"Gateway added: {gateway_id} ({display_name})")
            return gateway
            
        except Exception as e:
            logger.error(f"Error adding gateway: {str(e)}")
            raise
    
    async def update_gateway(self, gateway_id: str, update_data: Dict) -> bool:
        """Actualizar cuenta de pasarela"""
        try:
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            # Si hay credenciales, solo actualizar las que tienen valor real
            if "credentials" in update_data:
                existing = await self.collection.find_one({"gateway_id": gateway_id})
                if existing:
                    existing_creds = existing.get("credentials", {})
                    new_creds = update_data["credentials"]
                    for key, value in new_creds.items():
                        if value and not value.startswith("••••"):
                            existing_creds[key] = value
                    update_data["credentials"] = existing_creds
            
            result = await self.collection.update_one(
                {"gateway_id": gateway_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating gateway: {str(e)}")
            return False
    
    async def delete_gateway(self, gateway_id: str) -> bool:
        """Eliminar cuenta de pasarela"""
        try:
            result = await self.collection.delete_one({"gateway_id": gateway_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting gateway: {str(e)}")
            return False
    
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
    
    async def update_priority(self, gateway_id: str, priority: int) -> bool:
        """Actualizar prioridad de una pasarela"""
        try:
            result = await self.collection.update_one(
                {"gateway_id": gateway_id},
                {"$set": {"priority": priority, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating priority: {str(e)}")
            return False
    
    async def reorder_gateways(self, gateway_ids: List[str]) -> bool:
        """Reordenar pasarelas según el orden de la lista"""
        try:
            for idx, gateway_id in enumerate(gateway_ids):
                await self.collection.update_one(
                    {"gateway_id": gateway_id},
                    {"$set": {"priority": idx}}
                )
            return True
        except Exception as e:
            logger.error(f"Error reordering gateways: {str(e)}")
            return False
    
    async def get_gateway_credentials(self, gateway_id: str) -> Optional[Dict]:
        """Obtener credenciales reales de una pasarela (uso interno)"""
        config = await self.collection.find_one(
            {"gateway_id": gateway_id, "is_active": True},
            {"_id": 0}
        )
        return config if config else None
    
    async def get_gateway_by_type(self, gateway_type: str) -> Optional[Dict]:
        """Obtener la primera pasarela activa de un tipo específico"""
        config = await self.collection.find_one(
            {"gateway_type": gateway_type, "is_active": True},
            {"_id": 0}
        )
        return config if config else None
