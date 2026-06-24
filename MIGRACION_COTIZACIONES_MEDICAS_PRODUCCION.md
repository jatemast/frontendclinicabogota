# 🏥 Módulo de Cotizaciones Médicas Profesionales - SQL para Producción

> **Sistema:** backestetica (CodeIgniter 4)  
> **Base de datos:** clinica2026  
> **Versión:** 2.0.0  
> **Fecha:** 2026-06-24  
> **Motor:** MySQL 8.0+ / MariaDB 10.3+

---

## 📋 Resumen de Cambios

Este documento contiene todos los scripts SQL necesarios para desplegar el nuevo módulo de cotizaciones médicas profesionales en producción. La actualización transforma el módulo básico de cotizaciones en un sistema experto orientado exclusivamente al sector salud (clínicas estéticas, cirugía plástica, medicina estética, hospitales y centros médicos).

### Archivos modificados en este despliegue:

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `alter_schema_cotizaciones_medicas.sql` | SQL | Script de migración de base de datos |
| `app/Models/MoCoty.php` | Backend | Modelo principal de cotizaciones |
| `app/Models/MoCotyItems.php` | Backend | Modelo de ítems detallados |
| `app/Controllers/CoCoty.php` | Backend | Controlador de cotizaciones |
| `app/Config/Routes.php` | Backend | Nuevas rutas API |
| `src/views/Coty/Add.vue` | Frontend | Vista de creación (5 pasos) |
| `src/views/Coty/Edt.vue` | Frontend | Vista de edición (5 pasos) |
| `src/components/Coty/CotyTable.vue` | Frontend | Tabla de listado |
| `src/api/endpoints.ts` | Frontend | Endpoints actualizados |

---

## 🗄️ 1. SCRIPT SQL DE MIGRACIÓN

Ejecutar en orden sobre la base de datos `clinica2026`:

```sql
-- ============================================================
-- MIGRACIÓN: Módulo de Cotizaciones Médicas Profesionales
-- Ejecutar COMPLETO en una sola transacción
-- ============================================================

START TRANSACTION;

-- ============================================================
-- 1. ACTUALIZAR TABLA DE NEGOCIO (Clínica) - Campos de encabezado
-- ============================================================
ALTER TABLE `i001t_business`
    ADD COLUMN IF NOT EXISTS `tx_nit` VARCHAR(30) COLLATE utf8mb4_general_ci NULL AFTER `tx_name` COMMENT 'NIT / Registro mercantil',
    ADD COLUMN IF NOT EXISTS `tx_address` VARCHAR(255) COLLATE utf8mb4_general_ci NULL AFTER `tx_logo` COMMENT 'Dirección física de la clínica',
    ADD COLUMN IF NOT EXISTS `tx_phone` VARCHAR(50) COLLATE utf8mb4_general_ci NULL AFTER `tx_owner_phone` COMMENT 'Teléfono principal',
    ADD COLUMN IF NOT EXISTS `tx_whatsapp` VARCHAR(50) COLLATE utf8mb4_general_ci NULL AFTER `tx_phone` COMMENT 'WhatsApp de contacto',
    ADD COLUMN IF NOT EXISTS `tx_email` VARCHAR(100) COLLATE utf8mb4_general_ci NULL AFTER `tx_whatsapp` COMMENT 'Email corporativo',
    ADD COLUMN IF NOT EXISTS `tx_city` VARCHAR(100) COLLATE utf8mb4_general_ci NULL AFTER `tx_email` COMMENT 'Ciudad de operación';

-- ============================================================
-- 2. ACTUALIZAR TABLA DE COTIZACIONES (i008t_coty)
-- ============================================================
ALTER TABLE `i008t_coty`
    ADD COLUMN IF NOT EXISTS `tx_cotizacion_nro` VARCHAR(30) COLLATE utf8mb4_general_ci NULL AFTER `tx_nro` COMMENT 'Número formateado COT-XXXX',
    ADD COLUMN IF NOT EXISTS `tx_diagnostico` VARCHAR(500) COLLATE utf8mb4_general_ci NULL AFTER `tx_notes` COMMENT 'Diagnóstico o motivo de consulta',
    ADD COLUMN IF NOT EXISTS `fl_subtotal` DECIMAL(12,2) NULL AFTER `fl_total_cost` COMMENT 'Subtotal antes de descuentos e impuestos',
    ADD COLUMN IF NOT EXISTS `fl_descuento_porcentaje` DECIMAL(5,2) NULL DEFAULT 0.00 COMMENT 'Porcentaje de descuento',
    ADD COLUMN IF NOT EXISTS `fl_descuento_valor` DECIMAL(12,2) NULL DEFAULT 0.00 COMMENT 'Valor del descuento',
    ADD COLUMN IF NOT EXISTS `fl_iva_porcentaje` DECIMAL(5,2) NULL DEFAULT 0.00 COMMENT 'Porcentaje de IVA (0 = exento sector salud)',
    ADD COLUMN IF NOT EXISTS `fl_iva_valor` DECIMAL(12,2) NULL DEFAULT 0.00 COMMENT 'Valor del IVA',
    ADD COLUMN IF NOT EXISTS `fl_anticipo_porcentaje` DECIMAL(5,2) NULL DEFAULT 0.00 COMMENT 'Porcentaje de anticipo requerido',
    ADD COLUMN IF NOT EXISTS `fl_anticipo_valor` DECIMAL(12,2) NULL DEFAULT 0.00 COMMENT 'Valor del anticipo',
    ADD COLUMN IF NOT EXISTS `tx_forma_pago` VARCHAR(100) COLLATE utf8mb4_general_ci NULL COMMENT 'Efectivo, Transferencia, Tarjeta, Mixto',
    ADD COLUMN IF NOT EXISTS `in_validez_dias` INT NULL DEFAULT 15 COMMENT 'Días de validez de la cotización',
    ADD COLUMN IF NOT EXISTS `tx_condiciones_medicas` TEXT COLLATE utf8mb4_general_ci NULL COMMENT 'Condiciones médicas y legales',
    ADD COLUMN IF NOT EXISTS `tx_observaciones_clinicas` TEXT COLLATE utf8mb4_general_ci NULL COMMENT 'Recomendaciones preoperatorias',
    ADD COLUMN IF NOT EXISTS `id_doctor` INT NULL AFTER `id_user_upd` COMMENT 'Médico responsable que firma',
    ADD COLUMN IF NOT EXISTS `tx_firma_doctor` LONGTEXT COLLATE utf8mb4_general_ci NULL COMMENT 'Firma digital del médico (base64)',
    MODIFY COLUMN `in_status` TINYINT NOT NULL DEFAULT '0' COMMENT '0:Pendiente, 1:Aprobada, 2:Rechazada, 3:Vencida, 4:Convertida a HC',
    ADD COLUMN IF NOT EXISTS `date_vencimiento` DATE NULL AFTER `date_upd` COMMENT 'Fecha de vencimiento de la cotización';

ALTER TABLE `i008t_coty` ADD INDEX IF NOT EXISTS `idx_status_coty` (`in_status`);
ALTER TABLE `i008t_coty` ADD INDEX IF NOT EXISTS `idx_cotizacion_nro` (`tx_cotizacion_nro`);
ALTER TABLE `i008t_coty` ADD INDEX IF NOT EXISTS `idx_doctor_coty` (`id_doctor`);
ALTER TABLE `i008t_coty` ADD CONSTRAINT `fk_id_doctor-i008t` FOREIGN KEY (`id_doctor`) REFERENCES `i002t_user` (`id`) ON DELETE SET NULL;

-- ============================================================
-- 3. REDISEÑAR TABLA DE ÍTEMS (c008t_items)
-- ============================================================

-- Respaldo de tabla antigua
RENAME TABLE `c008t_items` TO `c008t_items_old_backup`;

-- Nueva tabla de ítems detallados
CREATE TABLE `c008t_items` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `id_coty` INT NOT NULL COMMENT 'FK a i008t_coty',
    `id_business` INT NOT NULL COMMENT 'FK a negocio',
    `tx_codigo` VARCHAR(50) COLLATE utf8mb4_general_ci NULL COMMENT 'Código opcional del servicio (CUPS/CPT)',
    `tx_servicio` VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre del procedimiento/servicio médico',
    `tx_descripcion` TEXT COLLATE utf8mb4_general_ci NULL COMMENT 'Descripción detallada',
    `nu_cantidad` INT NOT NULL DEFAULT 1 COMMENT 'Cantidad',
    `fl_valor_unitario` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Valor unitario',
    `fl_subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Subtotal = cantidad * valor_unitario',
    `tx_categoria` VARCHAR(100) COLLATE utf8mb4_general_ci NULL COMMENT 'Categoría: Consulta, Procedimiento, Anestesia, etc.',
    `nu_orden` INT NOT NULL DEFAULT 0 COMMENT 'Orden de aparición en la cotización',
    `id_user_add` INT NOT NULL,
    `date_add` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_id_coty-c008t_items_v2` (`id_coty`),
    KEY `fk_id_business-c008t_items_v2` (`id_business`),
    KEY `fk_id_user_add-c008t_items_v2` (`id_user_add`),
    CONSTRAINT `fk_id_coty-c008t_items_v2` FOREIGN KEY (`id_coty`) REFERENCES `i008t_coty` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_id_business-c008t_items_v2` FOREIGN KEY (`id_business`) REFERENCES `i001t_business` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_id_user_add-c008t_items_v2` FOREIGN KEY (`id_user_add`) REFERENCES `i002t_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Ítems detallados de cotización médica';

-- ============================================================
-- 4. AGREGAR CAMPO DE FIRMA A USUARIOS
-- ============================================================
ALTER TABLE `i002t_user`
    ADD COLUMN IF NOT EXISTS `tx_signature` LONGTEXT COLLATE utf8mb4_general_ci NULL AFTER `tx_certifications` COMMENT 'Firma digital del profesional (base64)';

-- ============================================================
-- 5. CREAR TABLA DE CONFIGURACIÓN DE COTIZACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS `i012t_coty_config` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `id_business` INT NOT NULL,
    `tx_prefijo` VARCHAR(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'COT-' COMMENT 'Prefijo del número de cotización',
    `nu_proximo_nro` INT NOT NULL DEFAULT 1 COMMENT 'Próximo número secuencial',
    `tx_condiciones_medicas_default` TEXT COLLATE utf8mb4_general_ci NULL COMMENT 'Condiciones médicas por defecto',
    `tx_condiciones_legales_default` TEXT COLLATE utf8mb4_general_ci NULL COMMENT 'Condiciones legales por defecto',
    `in_validez_default_dias` INT NOT NULL DEFAULT 15 COMMENT 'Validez por defecto en días',
    `fl_anticipo_default` DECIMAL(5,2) NULL DEFAULT 50.00 COMMENT 'Porcentaje de anticipo por defecto',
    `fl_iva_default` DECIMAL(5,2) NULL DEFAULT 0.00 COMMENT 'IVA por defecto (0 = exento)',
    `in_mostrar_codigos` TINYINT NOT NULL DEFAULT 1 COMMENT 'Mostrar columna de códigos en PDF',
    `in_mostrar_logo` TINYINT NOT NULL DEFAULT 1 COMMENT 'Mostrar logo en PDF',
    `tx_pie_pagina` VARCHAR(255) COLLATE utf8mb4_general_ci NULL COMMENT 'Texto del pie de página',
    `id_user_add` INT NOT NULL,
    `date_add` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_upd` DATETIME NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_id_business-i012t` (`id_business`),
    CONSTRAINT `fk_id_business-i012t` FOREIGN KEY (`id_business`) REFERENCES `i001t_business` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_id_user_add-i012t` FOREIGN KEY (`id_user_add`) REFERENCES `i002t_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Configuración de cotizaciones por clínica';

-- ============================================================
-- 6. INSERTAR CONFIGURACIÓN POR DEFECTO PARA CLÍNICAS EXISTENTES
-- ============================================================
INSERT INTO `i012t_coty_config` (`id_business`, `tx_prefijo`, `nu_proximo_nro`, `tx_condiciones_medicas_default`, `tx_condiciones_legales_default`, `id_user_add`)
SELECT 
    id, 
    'COT-', 
    1,
    'Los valores pueden variar según valoración médica final.\nNo incluye complicaciones no previstas durante el procedimiento.\nRequiere evaluación prequirúrgica previa para confirmación del procedimiento.\nEl paciente declara haber sido informado de los riesgos y beneficios del procedimiento.',
    'Esta cotización constituye un estimado de costos y no representa un contrato vinculante.\nLos precios están sujetos a cambios sin previo aviso.\nLa realización del procedimiento está sujeta a la aprobación médica tras la valoración prequirúrgica.\nEl paciente autoriza el uso de sus datos personales conforme a la ley de protección de datos vigente.',
    (SELECT MIN(id) FROM i002t_user WHERE id_business = i001t_business.id)
FROM i001t_business
WHERE NOT EXISTS (SELECT 1 FROM i012t_coty_config WHERE i012t_coty_config.id_business = i001t_business.id);

COMMIT;

-- ============================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================================
-- Verificar columnas nuevas en i008t_coty:
-- SELECT COLUMN_NAME, COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'clinica2026' AND TABLE_NAME = 'i008t_coty' 
-- AND COLUMN_NAME IN ('tx_cotizacion_nro','tx_diagnostico','fl_subtotal','fl_descuento_porcentaje','tx_condiciones_medicas');

-- Verificar nueva tabla c008t_items:
-- SELECT COUNT(*) FROM c008t_items;
-- DESCRIBE c008t_items;

-- Verificar tabla de configuración:
-- SELECT * FROM i012t_coty_config;
```

---

## 📊 2. DIAGRAMA DE ESTRUCTURA DE COTIZACIÓN

```
┌──────────────────────────────────────────────────────┐
│                 i001t_business (Clínica)              │
│  tx_name, tx_nit, tx_logo, tx_address, tx_phone,     │
│  tx_whatsapp, tx_email, tx_city, tx_owner            │
└────────────────────────┬─────────────────────────────┘
                         │ 1:N
                         ▼
┌──────────────────────────────────────────────────────┐
│               i008t_coty (Cotización)                 │
│  tx_cotizacion_nro (COT-0001), tx_diagnostico,       │
│  fl_subtotal, fl_descuento_*, fl_iva_*,              │
│  fl_anticipo_*, tx_forma_pago, in_validez_dias,      │
│  tx_condiciones_medicas, tx_observaciones_clinicas,  │
│  id_doctor ──────► i002t_user (Médico)               │
│  id_customer ────► i006t_customer (Paciente)         │
└──────────┬────────────────────────────┬──────────────┘
           │ 1:N                        │ 1:N
           ▼                            ▼
┌─────────────────────┐    ┌──────────────────────────┐
│  c008t_items (Ítems) │    │ c008t_procedures (Proc)  │
│  tx_codigo (CUPS)    │    │ id_procedure → i007t     │
│  tx_servicio         │    └──────────────────────────┘
│  tx_descripcion      │
│  nu_cantidad         │    ┌──────────────────────────┐
│  fl_valor_unitario   │    │  i012t_coty_config       │
│  fl_subtotal         │    │  Configuración x Clínica │
│  tx_categoria        │    └──────────────────────────┘
└─────────────────────┘
```

---

## 🔌 3. NUEVOS ENDPOINTS API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `api/coty/all` | Listar cotizaciones con datos de cliente |
| `POST` | `quotes/add` | Crear nueva cotización médica |
| `GET` | `quotes/edt/{id}` | Obtener cotización para edición |
| `GET` | `quotes/print/{id}` | Obtener cotización para impresión/PDF |
| `POST` | `quotes/upd/{id}` | Actualizar cotización existente |
| `POST` | `quotes/status/{id}` | Cambiar estado (aprobar/rechazar/vencer) |
| `GET` | `quotes/doctors` | Listar médicos del negocio |
| `GET` | `quotes/config` | Obtener configuración de cotizaciones |

### Payload de creación (`POST quotes/add`):

```json
{
  "id_customer": "1",
  "tx_diagnostico": "Paciente femenina de 34 años...",
  "tx_notes": "Notas adicionales",
  "items": [
    {
      "tx_codigo": "99213",
      "tx_servicio": "Consulta médica especializada",
      "tx_descripcion": "Valoración prequirúrgica completa",
      "nu_cantidad": 1,
      "fl_valor_unitario": 150000,
      "tx_categoria": "Consulta"
    },
    {
      "tx_codigo": "",
      "tx_servicio": "Mamoplastia de aumento",
      "tx_descripcion": "Implantes 350cc perfil alto",
      "nu_cantidad": 1,
      "fl_valor_unitario": 8500000,
      "tx_categoria": "Procedimiento"
    }
  ],
  "subtotal": 8650000,
  "total_cost": 8650000,
  "descuento_porcentaje": 0,
  "descuento_valor": 0,
  "iva_porcentaje": 0,
  "iva_valor": 0,
  "anticipo_porcentaje": 50,
  "anticipo_valor": 4325000,
  "tx_forma_pago": "Transferencia Bancaria",
  "in_validez_dias": 15,
  "tx_condiciones_medicas": "Los valores pueden variar...",
  "tx_observaciones_clinicas": "Evitar AINES 2 semanas antes...",
  "id_doctor": "3"
}
```

---

## ⚠️ 4. NOTAS DE DESPLIEGUE

1. **Respaldo previo obligatorio**: Hacer backup completo de la base de datos antes de ejecutar la migración.
2. **Verificar `c008t_items_old_backup`**: La tabla antigua se renombra. Conservar hasta confirmar migración exitosa.
3. **Configuración por clínica**: El script inserta automáticamente configuración por defecto para cada clínica existente.
4. **Compatibilidad**: El nuevo frontend requiere los nuevos campos. Desplegar backend + frontend simultáneamente.
5. **Datos existentes**: Las cotizaciones antiguas mantienen sus datos. Los nuevos campos quedarán en NULL para registros previos.

---

## 📝 5. ESTRUCTURA DE LA COTIZACIÓN MÉDICA (9 Secciones)

La cotización generada incluye:

1. **Encabezado** - Nombre clínica, NIT, dirección, teléfono, email, logo, ciudad, fecha, número COT-XXXX
2. **Datos del paciente** - Nombre, documento, edad, teléfono, email
3. **Diagnóstico / Motivo de consulta** - Descripción del caso clínico
4. **Detalle de cotización** - Tabla con: Código, Servicio, Descripción, Cantidad, Valor Unitario, Subtotal
5. **Resumen de costos** - Subtotal, Descuentos, IVA, Total General, Anticipo
6. **Condiciones de pago** - % Anticipo, Forma de pago, Validez en días
7. **Condiciones médicas y legales** - Texto personalizable por clínica
8. **Observaciones clínicas** - Recomendaciones preoperatorias
9. **Firma** - Médico responsable, Registro médico, Firma digital
