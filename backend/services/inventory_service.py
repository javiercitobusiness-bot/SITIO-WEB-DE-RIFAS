"""
Servicio para gestión de inventario de diamantes
"""
import logging
import random
from typing import List, Set
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

class InventoryService:
    """Servicio para gestionar inventario de 1M diamantes"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.total_diamonds = 1000000  # 000000 - 999999
    
    async def initialize_inventory(self):
        """Inicializar inventario si no existe"""
        try:
            # Verificar si ya existe el inventario
            inventory = await self.db.inventory.find_one({"_id": "main"})
            
            if not inventory:
                logger.info("Initializing inventory...")
                await self.db.inventory.insert_one({
                    "_id": "main",
                    "total": self.total_diamonds,
                    "sold": 0,
                    "available": self.total_diamonds,
                    "sold_percentage": 0.0
                })
                logger.info("Inventory initialized")
            
        except Exception as e:
            logger.error(f"Error initializing inventory: {str(e)}")
    
    async def get_inventory_stats(self) -> dict:
        """Obtener estadísticas del inventario"""
        try:
            inventory = await self.db.inventory.find_one({"_id": "main"})
            
            if not inventory:
                await self.initialize_inventory()
                inventory = await self.db.inventory.find_one({"_id": "main"})
            
            return {
                "total_diamonds": inventory["total"],
                "sold_diamonds": inventory["sold"],
                "available_diamonds": inventory["available"],
                "sold_percentage": inventory["sold_percentage"]
            }
            
        except Exception as e:
            logger.error(f"Error getting inventory stats: {str(e)}")
            return {
                "total_diamonds": self.total_diamonds,
                "sold_diamonds": 0,
                "available_diamonds": self.total_diamonds,
                "sold_percentage": 0.0
            }
    
    async def assign_diamonds(self, count: int) -> List[str]:
        """
        Asignar diamantes únicos del inventario
        
        Args:
            count: Cantidad de diamantes a asignar
            
        Returns:
            Lista de números de diamantes ordenados de menor a mayor
        """
        try:
            # Obtener diamantes ya vendidos
            sold_diamonds_docs = await self.db.sold_diamonds.find({}, {"diamond": 1}).to_list(None)
            sold_set: Set[int] = {int(doc["diamond"]) for doc in sold_diamonds_docs}
            
            # Generar números disponibles
            available = [i for i in range(self.total_diamonds) if i not in sold_set]
            
            if len(available) < count:
                raise ValueError(f"Not enough diamonds available. Requested: {count}, Available: {len(available)}")
            
            # Seleccionar números aleatorios
            selected_numbers = random.sample(available, count)
            
            # Ordenar de menor a mayor
            selected_numbers.sort()
            
            # Formatear a 6 dígitos
            diamonds = [f"{num:06d}" for num in selected_numbers]
            
            # Guardar como vendidos
            sold_docs = [{"diamond": d} for d in diamonds]
            await self.db.sold_diamonds.insert_many(sold_docs)
            
            # Actualizar inventario
            await self.db.inventory.update_one(
                {"_id": "main"},
                {
                    "$inc": {"sold": count, "available": -count},
                    "$set": {
                        "sold_percentage": round(
                            ((await self.db.sold_diamonds.count_documents({})) / self.total_diamonds) * 100,
                            2
                        )
                    }
                }
            )
            
            logger.info(f"Assigned {count} diamonds")
            return diamonds
            
        except Exception as e:
            logger.error(f"Error assigning diamonds: {str(e)}")
            raise
    
    async def get_sold_count(self) -> int:
        """Obtener cantidad de diamantes vendidos"""
        return await self.db.sold_diamonds.count_documents({})
