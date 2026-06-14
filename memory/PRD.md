# Dinámica de Diamantes - PRD

## Problema Original
Aplicación full-stack para venta de boletos de rifa numerados ("diamantes") para eventos/sorteos.

## Stack Técnico
- **Frontend:** React, Tailwind CSS, Shadcn UI
- **Backend:** FastAPI, Motor (MongoDB async)
- **Database:** MongoDB
- **Integraciones:** BOLD (pagos), Mercado Pago (pagos), SendGrid (emails)

## Funcionalidades Implementadas

### Core
- [x] Sistema de eventos con múltiples activos simultáneamente
- [x] Compra de diamantes con planes personalizables
- [x] Integración BOLD y Mercado Pago
- [x] Asignación automática de números post-pago
- [x] Emails de confirmación con SendGrid
- [x] Códigos de descuento (%) y códigos influencer (diamantes extra)
- [x] Código de prueba TESTDEMO (100% descuento, no afecta inventario)

### Admin Panel
- [x] Dashboard con estadísticas de ventas
- [x] Gestión de eventos (crear, editar, activar/pausar/finalizar)
- [x] Gestión de premios con soporte para objetos (no solo dinero)
- [x] Gestión de planes de precios
- [x] Gestión de múltiples cuentas por pasarela de pago
- [x] Pestaña "Vista" para configurar secciones del frontend dinámicamente
- [x] **Nueva sección "Apariencia"** para personalizar:
  - Colores (primario, secundario, fondo)
  - Logo y nombre del sitio
  - Favicon
  - Imagen de fondo
  - Información del footer (email, teléfono, redes sociales)
- [x] Gestión de clientes con opción de eliminar
- [x] Buscar ganadores por número
- [x] Sincronizar inventario
- [x] Gestión de testimonios
- [x] Gestión de códigos influencers

### Frontend Público
- [x] Vista de lista de eventos
- [x] Vista de detalle de evento con premios y planes
- [x] Checkout con selección de pasarela
- [x] Página de éxito post-pago
- [x] Secciones dinámicas (Premios, Cómo Funciona) configurables desde admin
- [x] Botón flotante "Comprar"
- [x] Diseño mobile-first optimizado
- [x] Colores y logo dinámicos desde configuración de apariencia
- [x] Footer con datos de contacto configurables

## Credenciales de Prueba
- **Admin:** `/admin` - Usuario: `admin`, Contraseña: `diamantes2024`
- **Código de prueba:** `TESTDEMO` (compras de prueba sin afectar inventario)

## Últimos Cambios (Diciembre 2025)
1. **Sección "Apariencia"** en admin para personalizar colores, logo, favicon, imagen de fondo y footer
2. **Corrección de email** - Se eliminó sección de premios hardcodeada
3. **Pestaña "Vista"** funcionando correctamente para mostrar/ocultar secciones

## Tareas Pendientes

### P1 (Alta Prioridad)
- [ ] **Integración de Stripe** - Tercera pasarela de pago con checkout embebido
- [ ] **Analíticas en Tiempo Real** - Ver visitantes activos en admin

### P2 (Media Prioridad)
- [ ] **Página de Términos y Condiciones**
- [ ] **SMS Notifications** (Twilio)

### P3 (Baja Prioridad)
- [ ] **2FA para Admin Panel**

## Arquitectura de Archivos Clave
```
/app
├── backend/
│   ├── server.py                 # Endpoints principales + /api/appearance
│   └── services/
│       ├── event_service.py      # Lógica de eventos
│       ├── bold_service.py       # Integración BOLD
│       ├── mercadopago_service.py
│       └── email_service.py
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.js           # Página pública (usa appearance)
        │   ├── PaymentSuccess.js
        │   └── AdminLayout.js    # Panel de administración + AppearanceView
        └── components/
            ├── Header.js         # Header dinámico (usa appearance)
            ├── Footer.js         # Footer dinámico (usa appearance)
            ├── PrizeInfo.js      
            └── CheckoutModal.jsx
```

## Endpoints API Clave
- `GET /api/appearance` - Configuración de apariencia pública
- `GET /api/admin/appearance` - Obtener apariencia (admin)
- `POST /api/admin/appearance` - Guardar apariencia (admin)
- `GET /api/events/available` - Eventos públicos con configuración de visualización
- `PUT /api/admin/events/{id}` - Actualizar evento
- `POST /api/purchase` - Crear compra
- `POST /api/verify-and-process/{ref}` - Verificar y procesar pago
- `POST /api/admin/sync-inventory` - Sincronizar inventario

## Schema de Apariencia (MongoDB: site_appearance)
```json
{
  "site_name": "Dinámica de Diamantes",
  "logo_url": "",
  "favicon_url": "",
  "primary_color": "#06b6d4",
  "secondary_color": "#a855f7", 
  "background_color": "#020617",
  "background_image": "",
  "footer_email": "...",
  "footer_phone": "...",
  "footer_whatsapp": "...",
  "footer_instagram": "...",
  "footer_facebook": "...",
  "footer_tiktok": ""
}
```

## Notas de Despliegue
- Dominio de producción: `dinamicadiamantes.com`
- Variables de entorno críticas: `BOLD_API_KEY`, `SENDGRID_API_KEY`, `MONGO_URL`
- SendGrid requiere autenticación de dominio (DKIM/DMARC) para evitar spam
