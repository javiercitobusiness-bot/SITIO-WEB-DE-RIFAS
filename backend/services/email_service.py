"""
Servicio para envío de emails con SendGrid - CON DIAMANTES VISUALES
"""
import logging
from typing import List
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Asm, GroupId, GroupsToDisplay

logger = logging.getLogger(__name__)

class EmailService:
    """Servicio para envío de emails con diamantes visuales"""
    
    def __init__(self, api_key: str, sender_email: str):
        self.api_key = api_key
        self.sender_email = sender_email
        self.client = SendGridAPIClient(api_key) if api_key else None
    
    def _create_diamond_svg(self, number: str) -> str:
        """Crear SVG de diamante con número"""
        return f"""
        <svg width="80" height="80" viewBox="0 0 100 100" style="display: inline-block;">
            <defs>
                <linearGradient id="diamond-grad-{number}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#48CAE4;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#00B4D8;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0096C7;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="50,5 85,35 50,95 15,35" fill="url(#diamond-grad-{number})" stroke="#023047" stroke-width="2"/>
            <polygon points="50,5 65,20 50,35 35,20" fill="rgba(255,255,255,0.3)" stroke="#023047" stroke-width="0.5"/>
            <polygon points="15,35 35,20 50,35 30,60" fill="rgba(0,150,199,0.6)" stroke="#023047" stroke-width="0.5"/>
            <polygon points="85,35 65,20 50,35 70,60" fill="rgba(0,150,199,0.6)" stroke="#023047" stroke-width="0.5"/>
            <line x1="50" y1="35" x2="50" y2="95" stroke="#023047" stroke-width="1" opacity="0.3"/>
            <text x="50" y="50" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">{number}</text>
        </svg>
        """
    
    async def send_diamonds_email(
        self,
        recipient_email: str,
        recipient_name: str,
        diamonds: List[str],
        plan_name: str,
        amount_paid: int
    ) -> bool:
        """
        Enviar email con diamantes visuales (SVG)
        """
        if not self.client:
            logger.warning("SendGrid not configured, email not sent")
            logger.info(f"MOCK EMAIL to {recipient_email}:")
            logger.info(f"Diamonds: {diamonds}")
            return True
        
        try:
            # Crear grid de diamantes con SVG
            diamonds_grid = ""
            for i in range(0, len(diamonds), 6):
                row_diamonds = diamonds[i:i+6]
                row_html = " ".join([self._create_diamond_svg(d) for d in row_diamonds])
                diamonds_grid += f'<div style="text-align: center; margin: 10px 0;">{row_html}</div>'
            
            # Subject optimizado anti-SPAM
            subject = f"Tus {len(diamonds)} Diamantes - Marzo Lleno de Diamantes"
            
            html_content = f"""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Tus Diamantes</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">💎 ¡Gracias por Participar! 💎</h1>
                                        <p style="color: #e0e7ff; font-size: 16px; margin: 10px 0 0 0;">MARZO LLENO DE DIAMANTES</p>
                                    </td>
                                </tr>
                                
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 30px;">
                                        
                                        <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 15px 0;">Hola {recipient_name},</h2>
                                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                            ¡Tu compra del <strong>{plan_name}</strong> ha sido <strong style="color: #10b981;">confirmada exitosamente</strong>!
                                        </p>
                                        
                                        <!-- Diamonds Section -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                            <tr>
                                                <td>
                                                    <h3 style="color: #667eea; font-size: 20px; margin: 0 0 10px 0; text-align: center;">✨ Tus Diamantes Enumerados ✨</h3>
                                                    <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0 0 20px 0;">(Ordenados de menor a mayor)</p>
                                                    
                                                    {diamonds_grid}
                                                    
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Purchase Details -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                            <tr>
                                                <td>
                                                    <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 15px 0;">📊 Detalles de tu Compra</h3>
                                                    <p style="margin: 5px 0; color: #374151;"><strong>Plan:</strong> {plan_name}</p>
                                                    <p style="margin: 5px 0; color: #374151;"><strong>Diamantes:</strong> {len(diamonds)}</p>
                                                    <p style="margin: 5px 0; color: #374151;"><strong>Monto:</strong> ${amount_paid:,} COP</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Prizes -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                            <tr>
                                                <td>
                                                    <h3 style="color: #92400e; font-size: 18px; margin: 0 0 10px 0;">🏆 Premios Totales: $150,000,000 COP</h3>
                                                    <ul style="color: #78350f; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                                                        <li>💰 <strong>Premio Principal:</strong> $100,000,000 COP</li>
                                                        <li>🎁 <strong>Repechaje:</strong> $50,000,000 COP</li>
                                                        <li>✨ <strong>Premios Diarios</strong></li>
                                                    </ul>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Participation -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                            <tr>
                                                <td>
                                                    <h3 style="color: #166534; font-size: 18px; margin: 0 0 10px 0;">✅ Participación Automática</h3>
                                                    <p style="color: #15803d; line-height: 1.6; margin: 0;">
                                                        Tus diamantes participan automáticamente en todos los sorteos diarios y en el gran sorteo final. ¡Mucha suerte! 🍀
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
                                            <strong>Guarda este email</strong>, aquí están tus diamantes enumerados.
                                        </p>
                                        
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                                        <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">MARZO LLENO DE DIAMANTES</p>
                                        <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">Dinámica de Diamantes Enumerados</p>
                                        <p style="color: #9ca3af; font-size: 11px; margin: 15px 0 5px 0;">
                                            Has recibido este email porque realizaste una compra en nuestra dinámica.
                                        </p>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
            
            # Crear email con headers anti-SPAM
            message = Mail(
                from_email=Email(self.sender_email, "Marzo Lleno de Diamantes"),
                to_emails=To(recipient_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            # Headers anti-SPAM adicionales
            message.reply_to = Email(self.sender_email, "Soporte Dinámica Diamantes")
            
            # Categorías para tracking (ayuda con reputación)
            message.add_category("transactional")
            message.add_category("purchase-confirmation")
            
            # Custom args para tracking interno
            message.add_custom_arg("plan", plan_name)
            message.add_custom_arg("diamonds_count", str(len(diamonds)))
            
            # Enviar
            response = self.client.send(message)
            logger.info(f"Email sent to {recipient_email}, status: {response.status_code}")
            
            return response.status_code == 202
            
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

    async def send_password_reset_email(self, email: str, reset_link: str) -> bool:
        """Enviar email de recuperación de contraseña"""
        if not self.api_key:
            logger.warning("SendGrid API key not configured")
            return False
        
        try:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center">
                            <table width="500" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; padding: 40px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <h1 style="color: #1f2937; margin-bottom: 20px;">🔐 Restablecer Contraseña</h1>
                                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                                            Recibimos una solicitud para restablecer la contraseña de tu cuenta de administrador en <strong>Dinámica de Diamantes</strong>.
                                        </p>
                                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                                            Haz clic en el botón de abajo para crear una nueva contraseña:
                                        </p>
                                        <a href="{reset_link}" style="display: inline-block; margin: 20px 0; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                            Restablecer Contraseña
                                        </a>
                                        <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
                                            Este enlace expirará en 1 hora.
                                        </p>
                                        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                                            Si no solicitaste este cambio, ignora este correo.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=Email(self.sender_email, "Dinámica de Diamantes"),
                to_emails=email,
                subject="🔐 Restablecer Contraseña - Dinámica de Diamantes",
                html_content=html_content
            )
            
            response = self.client.send(message)
            logger.info(f"Password reset email sent to {email}, status: {response.status_code}")
            
            return response.status_code == 202
            
        except Exception as e:
            logger.error(f"Error sending password reset email: {str(e)}")
            return False
