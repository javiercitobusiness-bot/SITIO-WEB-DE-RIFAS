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
- [x] **Pestaña "Vista" para configurar secciones del frontend dinámicamente**
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

## Credenciales de Prueba
- **Admin:** `/admin` - Usuario: `admin`, Contraseña: `diamantes2024`
- **Código de prueba:** `TESTDEMO` (compras de prueba sin afectar inventario)

## Último Bug Corregido (2025-12)
**Pestaña "Vista" del Admin:** Los cambios de visualización ahora se guardan y reflejan correctamente en el frontend.

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
│   ├── server.py                 # Endpoints principales
│   └── services/
│       ├── event_service.py      # Lógica de eventos
│       ├── bold_service.py       # Integración BOLD
│       ├── mercadopago_service.py
│       └── email_service.py
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.js           # Página pública principal
        │   ├── PaymentSuccess.js
        │   └── AdminLayout.js    # Panel de administración
        └── components/
            ├── PrizeInfo.js      # Sección de premios
            └── CheckoutModal.jsx
```

## Endpoints API Clave
- `GET /api/events/available` - Eventos públicos con configuración de visualización
- `PUT /api/admin/events/{id}` - Actualizar evento (incluye campos de vista)
- `POST /api/purchase` - Crear compra
- `POST /api/verify-and-process/{ref}` - Verificar y procesar pago
- `POST /api/admin/sync-inventory` - Sincronizar inventario

## Notas de Despliegue
- Dominio de producción: `dinamicadiamantes.com`
- Variables de entorno críticas: `BOLD_API_KEY`, `SENDGRID_API_KEY`, `MONGO_URL`
- SendGrid requiere autenticación de dominio (DKIM/DMARC) para evitar spam
