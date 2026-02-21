"""
Servicio para envío de emails con SendGrid
"""
import logging
from typing import List
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

logger = logging.getLogger(__name__)

class EmailService:
    """Servicio para envío de emails"""
    
    def __init__(self, api_key: str, sender_email: str):
        self.api_key = api_key
        self.sender_email = sender_email
        self.client = SendGridAPIClient(api_key) if api_key else None
    
    async def send_diamonds_email(
        self,
        recipient_email: str,
        recipient_name: str,
        diamonds: List[str],
        plan_name: str,
        amount_paid: int
    ) -> bool:
        """
        Enviar email con los diamantes asignados
        
        Args:
            recipient_email: Email del destinatario
            recipient_name: Nombre del destinatario
            diamonds: Lista de números de diamantes
            plan_name: Nombre del plan comprado
            amount_paid: Monto pagado
            
        Returns:
            bool: True si se envió correctamente
        """
        if not self.client:
            logger.warning("SendGrid not configured, email not sent")
            # En desarrollo, solo logueamos los diamantes
            logger.info(f"MOCK EMAIL to {recipient_email}:")
            logger.info(f"Diamonds: {diamonds}")
            return True
        
        try:
            # Formatear lista de diamantes
            diamonds_list = "\n".join([f"💎 {d}" for d in diamonds])
            
            # Crear contenido del email
            subject = f"¡Tus Diamantes de MARZO LLENO DE DIAMANTES! 💎"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="color: white; margin: 0;">💎 ¡Gracias por participar! 💎</h1>
                    <p style="color: #e0e7ff; font-size: 18px;">MARZO LLENO DE DIAMANTES</p>
                </div>
                
                <div style="padding: 30px; background: #f9fafb; border-radius: 10px; margin-top: 20px;">
                    <h2 style="color: #1f2937;">Hola {recipient_name},</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        ¡Tu compra del <strong>{plan_name}</strong> ha sido confirmada!
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                        <h3 style="color: #667eea; margin-top: 0;">Tus Diamantes Enumerados:</h3>
                        <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
                            (Ordenados de menor a mayor)
                        </p>
                        <div style="font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.8; color: #1f2937;">
                            {diamonds_list}
                        </div>
                    </div>
                    
                    <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1e40af; margin-top: 0;">📊 Detalles de tu Compra</h3>
                        <p style="margin: 5px 0;"><strong>Plan:</strong> {plan_name}</p>
                        <p style="margin: 5px 0;"><strong>Diamantes:</strong> {len(diamonds)}</p>
                        <p style="margin: 5px 0;"><strong>Monto:</strong> ${amount_paid:,} COP</p>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #92400e; margin-top: 0;">🏆 Premios Totales: $150,000,000 COP</h3>
                        <ul style="color: #78350f; line-height: 1.8;">
                            <li>💰 <strong>Premio Principal:</strong> $100,000,000 COP</li>
                            <li>🎁 <strong>Repechaje:</strong> $50,000,000 COP</li>
                            <li>✨ <strong>3 Premios Diarios</strong></li>
                        </ul>
                    </div>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #166534; margin-top: 0;">✅ Participación Automática</h3>
                        <p style="color: #15803d;">
                            Tus diamantes participan automáticamente en todos los sorteos diarios 
                            y en el gran sorteo final. ¡Mucha suerte! 🍀
                        </p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        Guarda este email, aquí están tus diamantes enumerados.
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                    <p>MARZO LLENO DE DIAMANTES - Dinámica de Diamantes Enumerados</p>
                    <p>Este es un correo automático, por favor no respondas.</p>
                </div>
            </body>
            </html>
            """
            
            # Crear email
            message = Mail(
                from_email=Email(self.sender_email, "Marzo Lleno de Diamantes"),
                to_emails=To(recipient_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            # Enviar
            response = self.client.send(message)
            logger.info(f"Email sent to {recipient_email}, status: {response.status_code}")
            
            return response.status_code == 202
            
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False
