# Dinámica de Diamantes - Product Requirements Document

## Descripción del Producto
Aplicación full-stack para venta de boletos de rifa/lotería numerados (diamantes). Los usuarios compran planes de diamantes, pagan a través de BOLD o Mercado Pago, y reciben sus números por email y en pantalla.

## Stack Tecnológico
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Motor (MongoDB async)
- **Base de Datos**: MongoDB
- **Integraciones**: BOLD (pagos), Mercado Pago (pagos), SendGrid (emails)

## Funcionalidades Implementadas

### Panel de Administración
- [x] Dashboard con estadísticas de ventas (ingresos, compras, diamantes vendidos)
- [x] Botón "Sincronizar Inventario" para recalcular estadísticas
- [x] Gestión de eventos (crear, editar, activar, eliminar)
- [x] Gestión de compras con opción de procesar manualmente
- [x] Gestión de clientes con opción de eliminar
- [x] Búsqueda de ganadores por número de diamante
- [x] Códigos de descuento (porcentaje)
- [x] Códigos de influencers (diamantes extra)
- [x] Gestión de testimonios
- [x] Configuración del sitio
- [x] Cambio de contraseña

### Flujo de Compra
- [x] Selección de plan de diamantes
- [x] Formulario de checkout con datos del cliente
- [x] Validación de códigos de descuento e influencer
- [x] Selección de pasarela de pago (BOLD/Mercado Pago)
- [x] Redirección a pasarela de pago
- [x] Página de éxito con visualización de diamantes
- [x] Descarga de imagen con números
- [x] Email de confirmación con diamantes
- [x] **NUEVO**: Código de prueba TESTDEMO para testing

### Frontend Público
- [x] Página principal con evento activo
- [x] Sección de premios
- [x] **MEJORADO**: Sección "Cómo Funciona" con explicación de 3 tipos de sorteo
- [x] Testimonios de ganadores
- [x] Botón flotante "Comprar"
- [x] **NUEVO**: Header con enlaces a Premios, Planes y Cómo Funciona
- [x] **MEJORADO**: Vista móvil responsive

## Credenciales de Prueba
- **Admin**: `/admin` - Usuario: `admin`, Contraseña: `diamantes2024`
- **Código descuento**: `RECUPERA80` (80% off)
- **Código de prueba**: `TESTDEMO` (simula compra completa sin contar en inventario)

## URLs de la Aplicación
- **Preview**: https://lottery-payment-test.preview.emergentagent.com
- **Producción**: https://www.dinamicadiamantes.com

## Configuración de Producción
- `PAYMENT_REDIRECT_URL`: https://www.dinamicadiamantes.com/compra-exitosa

---

## Changelog

### 2026-03-04
- **NUEVO**: Sección "Cómo Funciona" rediseñada estilo landing page
  - Explicación de 3 tipos de sorteo: Diario, Repechaje, Gran Premio Final
  - Explicación visual del cálculo del número ganador
  - Sección de número inverso
  - Calendario de sorteos
  - Premios inmediatos
- **NUEVO**: Enlace "Cómo Funciona" agregado al header
- **MEJORADO**: Vista móvil completamente responsive
- **NUEVO**: Código de prueba `TESTDEMO` para testing de flujo completo
  - Genera diamantes de prueba (prefijo T)
  - Envía email de confirmación
  - No afecta el inventario real

### 2026-02-27
- **FIX**: Corregido botón "Sincronizar Inventario" - ahora actualiza todas las colecciones de MongoDB correctamente
- **MEJORA**: Endpoint `/api/verify-and-process/{reference}` mejorado para verificar estado directamente con la pasarela
- **MEJORA**: Se guarda `payment_link_id` para verificación directa con BOLD

---

## Backlog Priorizado

### P0 - Crítico
- [ ] Validar flujo de compra en producción (requiere prueba real)
- [ ] Verificar configuración de webhooks en producción

### P1 - Alta Prioridad
- [ ] Autenticación de dominio SendGrid (DKIM) - Requiere acción del usuario en GoDaddy
- [ ] Analytics de visitantes en tiempo real (solicitado por usuario)

### P2 - Media Prioridad
- [ ] Pasarelas adicionales: Nequi, Daviplata, PSE, Efecty/Baloto
- [ ] Página de Términos y Condiciones
- [ ] Contador regresivo para eventos

### P3 - Baja Prioridad
- [ ] Notificaciones SMS (Twilio)
- [ ] Autenticación de dos factores (2FA)

### Refactorización
- [ ] Dividir AdminLayout.js (~2100 líneas) en componentes más pequeños
- [ ] Unificar CreateEventModal y EditEventModal en un solo componente
