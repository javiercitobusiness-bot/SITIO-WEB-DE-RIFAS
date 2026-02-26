"""
Servicio para integración con Mercado Pago
"""
import mercadopago
import logging
import os
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class MercadoPagoService:
    """Servicio para manejar pagos con Mercado Pago"""
    
    def __init__(self):
        self.access_token = os.environ.get('MERCADOPAGO_ACCESS_TOKEN', '')
        self.sdk = mercadopago.SDK(self.access_token)
        self.redirect_url = os.environ.get('PAYMENT_REDIRECT_URL', 'https://www.dinamicadiamantes.com/compra-exitosa')
        
    async def create_payment_link(
        self,
        amount: int,
        description: str,
        customer_email: str,
        reference: str,
        customer_name: str = None
    ) -> Dict[str, Any]:
        """Crear link de pago con Mercado Pago"""
        try:
            preference_data = {
                "items": [
                    {
                        "title": description,
                        "quantity": 1,
                        "currency_id": "COP",
                        "unit_price": amount
                    }
                ],
                "payer": {
                    "email": customer_email,
                    "name": customer_name or ""
                },
                "external_reference": reference,
                "back_urls": {
                    "success": self.redirect_url,
                    "failure": self.redirect_url,
                    "pending": self.redirect_url
                },
                "auto_return": "approved",
                "statement_descriptor": "DINAMICA DIAMANTES"
            }
            
            logger.info(f"Creating MercadoPago preference for {reference}")
            
            preference_response = self.sdk.preference().create(preference_data)
            preference = preference_response.get("response", {})
            
            if preference.get("init_point"):
                logger.info(f"MercadoPago payment link created: {preference.get('id')}")
                return {
                    "url": preference.get("init_point"),
                    "preference_id": preference.get("id"),
                    "created_at": preference.get("date_created")
                }
            else:
                logger.error(f"MercadoPago error: {preference_response}")
                raise Exception("No se pudo crear el link de pago")
                
        except Exception as e:
            logger.error(f"Error creating MercadoPago payment: {str(e)}")
            raise
    
    async def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Obtener estado de un pago"""
        try:
            payment_response = self.sdk.payment().get(payment_id)
            payment = payment_response.get("response", {})
            
            return {
                "id": payment.get("id"),
                "status": payment.get("status"),
                "status_detail": payment.get("status_detail"),
                "external_reference": payment.get("external_reference"),
                "amount": payment.get("transaction_amount")
            }
        except Exception as e:
            logger.error(f"Error getting MercadoPago payment status: {str(e)}")
            raise
