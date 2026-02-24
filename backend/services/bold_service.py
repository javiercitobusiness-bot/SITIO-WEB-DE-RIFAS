"""
Servicio para integración con BOLD Payment Gateway
"""
import httpx
import logging
import os
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class BOLDPaymentService:
    """Servicio para manejar pagos con BOLD"""
    
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        # URL de redirección después del pago
        self.redirect_url = os.environ.get('PAYMENT_REDIRECT_URL', 'https://www.dinamicadiamantes.com/compra-exitosa')
        
    def _get_headers(self) -> Dict[str, str]:
        """Headers con autenticación"""
        return {
            "Authorization": f"x-api-key {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def create_payment_link(
        self,
        amount: int,
        description: str,
        customer_email: str,
        reference: str,
        customer_name: str = "",
        expiration_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Crear link de pago con BOLD
        
        Args:
            amount: Monto en COP (pesos colombianos)
            description: Descripción del pago
            customer_email: Email del cliente
            reference: Referencia única del pago
            customer_name: Nombre del cliente
            expiration_hours: Horas hasta que expire el link
            
        Returns:
            Dict con datos del payment link creado
        """
        try:
            url = f"{self.base_url}/online/link/v1"
            headers = self._get_headers()
            
            from datetime import datetime, timedelta, timezone
            now = datetime.now(timezone.utc)
            expiration_dt = now + timedelta(hours=expiration_hours)
            # BOLD requires nanoseconds, not milliseconds
            expiration_date = int(expiration_dt.timestamp() * 1e9)
            
            logger.info(f"Expiration timestamp (nanoseconds): {expiration_date}")
            
            payload = {
                "amount_type": "CLOSE",
                "amount": {
                    "currency": "COP",
                    "total_amount": amount,
                    "tip_amount": 0
                },
                "description": description,
                "payer_email": customer_email,
                "payment_methods": ["CREDIT_CARD", "PSE", "NEQUI"],
                "reference": reference,
                "expiration_date": expiration_date,
                "redirect_url": self.redirect_url
            }
            
            if customer_name:
                payload["metadata"] = {"customer_name": customer_name}
            
            logger.info(f"Redirect URL configured: {self.redirect_url}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
            
            data = response.json()
            logger.info(f"Payment link created: {reference}")
            logger.info(f"BOLD Response: {data}")
            
            return data.get("payload", {})
            
        except httpx.HTTPError as e:
            logger.error(f"Error creating payment link: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.text}")
            raise
    
    async def get_payment_status(self, payment_link_id: str) -> Dict[str, Any]:
        """Obtener estado de un payment link"""
        try:
            url = f"{self.base_url}/online/link/v1/{payment_link_id}"
            headers = self._get_headers()
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
            
            return response.json()
            
        except httpx.HTTPError as e:
            logger.error(f"Error getting payment status: {str(e)}")
            raise
