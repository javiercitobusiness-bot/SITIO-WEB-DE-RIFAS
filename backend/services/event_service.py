"""
Servicio para gestión de eventos/dinámicas
"""
import logging
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import uuid

logger = logging.getLogger(__name__)

class EventService:
    """Servicio para gestionar eventos"""
    
    def __init__(self, db):
        self.db = db
        self.collection = db.events
        self.inventory_collection = db.event_inventory
    
    async def create_event(self, event_data: dict) -> dict:
        """Crear nuevo evento"""
        try:
            event_id = str(uuid.uuid4())[:8]
            now = datetime.now(timezone.utc)
            
            event = {
                "event_id": event_id,
                "name": event_data["name"],
                "description": event_data.get("description", ""),
                "prizes": event_data.get("prizes", []),
                "plans": event_data.get("plans", []),
                "total_numbers": event_data.get("total_numbers", 1000000),
                "sold_numbers": 0,
                "start_date": event_data["start_date"],
                "end_date": event_data["end_date"],
                "status": event_data.get("status", "draft"),
                "image_url": event_data.get("image_url"),
                "template_id": event_data.get("template_id"),
                "payment_gateway": event_data.get("payment_gateway", "bold"),
                # Display settings
                "show_prizes_section": event_data.get("show_prizes_section", True),
                "prizes_section_title": event_data.get("prizes_section_title", "Premios Increíbles"),
                "show_how_it_works": event_data.get("show_how_it_works", False),
                "how_it_works_title": event_data.get("how_it_works_title", "¿Cómo Funciona?"),
                "how_it_works_content": event_data.get("how_it_works_content", ""),
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }
            
            await self.collection.insert_one(event)
            
            # Inicializar inventario para este evento
            await self._initialize_event_inventory(event_id, event["total_numbers"])
            
            logger.info(f"Event created: {event_id} - {event['name']}")
            
            # Remove MongoDB _id before returning
            event.pop("_id", None)
            return event
            
        except Exception as e:
            logger.error(f"Error creating event: {str(e)}")
            raise
    
    async def _initialize_event_inventory(self, event_id: str, total_numbers: int):
        """Inicializar inventario de números para un evento"""
        try:
            # Verificar si ya existe inventario
            existing = await self.inventory_collection.find_one({"event_id": event_id})
            if existing:
                return
            
            # Crear documento de inventario
            inventory = {
                "event_id": event_id,
                "total_numbers": total_numbers,
                "sold_numbers": 0,
                "assigned_numbers": [],  # Lista de números asignados
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.inventory_collection.insert_one(inventory)
            logger.info(f"Inventory initialized for event {event_id}")
            
        except Exception as e:
            logger.error(f"Error initializing inventory: {str(e)}")
    
    async def get_event(self, event_id: str) -> Optional[dict]:
        """Obtener evento por ID"""
        event = await self.collection.find_one(
            {"event_id": event_id},
            {"_id": 0}
        )
        return event
    
    async def get_all_events(self) -> List[dict]:
        """Obtener todos los eventos"""
        cursor = self.collection.find({}, {"_id": 0}).sort("created_at", -1)
        events = await cursor.to_list(100)
        return events
    
    async def get_active_event(self) -> Optional[dict]:
        """Obtener el evento activo actual"""
        event = await self.collection.find_one(
            {"status": "active"},
            {"_id": 0}
        )
        return event
    
    async def update_event(self, event_id: str, update_data: dict) -> Optional[dict]:
        """Actualizar evento"""
        try:
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            # Remover campos None
            update_data = {k: v for k, v in update_data.items() if v is not None}
            
            result = await self.collection.find_one_and_update(
                {"event_id": event_id},
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                result.pop("_id", None)
                logger.info(f"Event updated: {event_id}")
                
            return result
            
        except Exception as e:
            logger.error(f"Error updating event: {str(e)}")
            raise
    
    async def delete_event(self, event_id: str) -> bool:
        """Eliminar evento"""
        try:
            result = await self.collection.delete_one({"event_id": event_id})
            
            # También eliminar inventario
            await self.inventory_collection.delete_one({"event_id": event_id})
            
            if result.deleted_count > 0:
                logger.info(f"Event deleted: {event_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting event: {str(e)}")
            raise
    
    async def set_active_event(self, event_id: str) -> bool:
        """Activar un evento (sin afectar otros eventos)"""
        try:
            # Solo activar el evento seleccionado, NO pausar los demás
            result = await self.collection.update_one(
                {"event_id": event_id},
                {"$set": {"status": "active", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error setting active event: {str(e)}")
            raise
    
    async def get_event_stats(self, event_id: str) -> dict:
        """Obtener estadísticas de un evento"""
        try:
            event = await self.get_event(event_id)
            if not event:
                return {}
            
            # Contar compras de este evento
            total_purchases = await self.db.purchases.count_documents({"event_id": event_id})
            approved_purchases = await self.db.purchases.count_documents({"event_id": event_id, "status": "APPROVED"})
            
            # Calcular ingresos
            pipeline = [
                {"$match": {"event_id": event_id, "status": "APPROVED"}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]
            revenue_result = await self.db.purchases.aggregate(pipeline).to_list(1)
            total_revenue = revenue_result[0]["total"] if revenue_result else 0
            
            # Obtener inventario
            inventory = await self.inventory_collection.find_one(
                {"event_id": event_id},
                {"_id": 0}
            )
            
            sold = inventory.get("sold_numbers", 0) if inventory else 0
            total = event.get("total_numbers", 1000000)
            
            return {
                "event_id": event_id,
                "event_name": event.get("name"),
                "status": event.get("status"),
                "total_purchases": total_purchases,
                "approved_purchases": approved_purchases,
                "total_revenue": total_revenue,
                "total_numbers": total,
                "sold_numbers": sold,
                "available_numbers": total - sold,
                "sold_percentage": (sold / total * 100) if total > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Error getting event stats: {str(e)}")
            return {}
    
    async def assign_numbers(self, event_id: str, count: int) -> List[str]:
        """Asignar números aleatorios de un evento"""
        import random
        
        try:
            inventory = await self.inventory_collection.find_one({"event_id": event_id})
            if not inventory:
                raise Exception("Event inventory not found")
            
            total = inventory.get("total_numbers", 1000000)
            assigned = set(inventory.get("assigned_numbers", []))
            available = total - len(assigned)
            
            if count > available:
                raise Exception(f"Not enough numbers. Available: {available}")
            
            # Generar números aleatorios no asignados
            digits = len(str(total - 1))
            new_numbers = []
            
            while len(new_numbers) < count:
                num = random.randint(0, total - 1)
                num_str = str(num).zfill(digits)
                if num_str not in assigned:
                    new_numbers.append(num_str)
                    assigned.add(num_str)
            
            # Actualizar inventario
            await self.inventory_collection.update_one(
                {"event_id": event_id},
                {
                    "$set": {"sold_numbers": len(assigned)},
                    "$push": {"assigned_numbers": {"$each": new_numbers}}
                }
            )
            
            # Actualizar contador en evento
            await self.collection.update_one(
                {"event_id": event_id},
                {"$set": {"sold_numbers": len(assigned)}}
            )
            
            return sorted(new_numbers)
            
        except Exception as e:
            logger.error(f"Error assigning numbers: {str(e)}")
            raise
