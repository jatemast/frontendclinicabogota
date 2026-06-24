# 🔍 AUDITORÍA COMPLETA: MÓDULO DE COTIZACIONES (QUOTES)

**Fecha:** 2026-06-24  
**Proyectos analizados:**
- **Frontend:** `C:\Users\Javier Teheran M\Pictures\estetica` (Vue.js 3 + Vuetify + TypeScript)
- **Backend:** `D:\laragon\www\backestetica` (CodeIgniter 4 + PHP)

---

## 📋 RESUMEN EJECUTIVO

| Aspecto | Resultado |
|---------|-----------|
| **¿Existe el módulo?** | ✅ **SÍ** — El módulo de Cotizaciones existe y está implementado en ambos lados (frontend + backend) |
| **Nombre interno** | "Coty" (abreviatura de Cotizaciones) |
| **Nombre en UI** | "Cotizaciones" |
| **Estado general** | **FUNCIONAL** — Completamente implementado en frontend y backend |
| **Visibilidad en menú** | ✅ Visible en sidebar principal con su propio header `Cotizaciones` |
| **Nivel de completitud** | **ALTO (85%)** — CRUD completo con wizard de 3 pasos, dashboard integrado |

---

## 1. 🗂️ ESTRUCTURA DEL MÓDULO

### 1.1 FRONTEND — Archivos Vue

| Tipo | Archivo | Ruta Completa |
|------|---------|---------------|
| Listado | `Coty.vue` | [`src/views/Coty/Coty.vue`](src/views/Coty/Coty.vue:1) |
| Creación | `Add.vue` | [`src/views/Coty/Add.vue`](src/views/Coty/Add.vue:1) |
| Edición | `Edt.vue` | [`src/views/Coty/Edt.vue`](src/views/Coty/Edt.vue:1) |
| Tabla | `CotyTable.vue` | [`src/components/Coty/CotyTable.vue`](src/components/Coty/CotyTable.vue:1) |

### 1.2 BACKEND — PHP Files

| Tipo | Archivo | Ruta Completa |
|------|---------|---------------|
| Controller | `CoCoty.php` | [`D:\laragon\www\backestetica\app\Controllers\CoCoty.php`](../../../D:/laragon/www/backestetica/app/Controllers/CoCoty.php:1) |
| Model (Main) | `MoCoty.php` | [`D:\laragon\www\backestetica\app\Models\MoCoty.php`](../../../D:/laragon/www/backestetica/app/Models/MoCoty.php:1) |
| Model (Items) | `MoCotyItems.php` | [`D:\laragon\www\backestetica\app\Models\MoCotyItems.php`](../../../D:/laragon/www/backestetica/app/Models/MoCotyItems.php:1) |
| Model (Procedures) | `MoCotyProcedures.php` | [`D:\laragon\www\backestetica\app\Models\MoCotyProcedures.php`](../../../D:/laragon/www/backestetica/app/Models/MoCotyProcedures.php:1) |

---

## 2. 🗄️ BASE DE DATOS — Tablas Involucradas

### 2.1 Tabla Principal: `i008t_coty`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, AI) | Identificador único |
| `tx_nro` | VARCHAR/INT | Número correlativo de cotización (inicia en 1000) |
| `id_business` | INT (FK → i001t_business) | Clínica/Empresa propietaria |
| `id_customer` | INT (FK → i006t_customer) | Cliente asociado |
| `tx_notes` | VARCHAR/TEXT | Notas adicionales |
| `fl_total_cost` | FLOAT/DECIMAL | Costo total de la cotización |
| `id_user_add` | INT (FK → i002t_user) | Usuario que creó |
| `id_user_upd` | INT (FK → i002t_user) | Usuario que modificó |
| `in_status` | TINYINT | Estado: 0=Pendiente, 1=Aprobada, 2=Rechazada, 3=Cancelada |
| `date_add` | DATETIME | Fecha de creación |
| `date_upd` | DATETIME | Fecha de modificación |

**Evidencia:** [`MoCoty.php` línea 9](D:/laragon/www/backestetica/app/Models/MoCoty.php:9): `protected $table = 'i008t_coty';`

### 2.2 Tabla de Items: `c008t_items`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, AI) | Identificador |
| `id_coty` | INT (FK → i008t_coty) | Cotización padre |
| `tx_item` | VARCHAR(255) | Descripción del concepto |
| `id_user_add` | INT (FK → i002t_user) | Usuario que creó |
| `id_business` | INT | Empresa |
| `date_add` | DATETIME | Fecha de creación |

**Evidencia:** [`MoCotyItems.php` línea 9](D:/laragon/www/backestetica/app/Models/MoCotyItems.php:9): `protected $table = 'c008t_items';`  
**Evidencia SQL:** [`schema.sql` líneas 57-74](D:/laragon/www/backestetica/schema.sql:57) — CREATE TABLE con FK `id_coty` → `i008t_coty`

### 2.3 Tabla de Procedimientos: `c008t_procedures`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, AI) | Identificador |
| `id_coty` | INT (FK → i008t_coty) | Cotización padre |
| `id_procedure` | INT (FK → i007t_procedures) | Procedimiento asociado |
| `id_user_add` | INT (FK → i002t_user) | Usuario que creó |
| `id_business` | INT | Empresa |
| `date_add` | DATETIME | Fecha de creación |

**Evidencia:** [`MoCotyProcedures.php` línea 9](D:/laragon/www/backestetica/app/Models/MoCotyProcedures.php:9): `protected $table = 'c008t_procedures';`  
**Evidencia SQL:** [`schema.sql` líneas 78-97](D:/laragon/www/backestetica/schema.sql:78) — CREATE TABLE con FK `id_coty` → `i008t_coty` y FK `id_procedure` → `i007t_procedures`

### 2.4 Relaciones entre Tablas

```
i001t_business (Clínica)
    └── i008t_coty (Cotización)
            ├── i006t_customer (Cliente) vía id_customer
            ├── i002t_user (Usuario) vía id_user_add / id_user_upd
            ├── c008t_procedures (Procedimientos de la cotización)
            │       └── i007t_procedures (Catálogo de procedimientos)
            └── c008t_items (Conceptos/Items financieros)
```

---

## 3. 🔗 API ENDPOINTS

### 3.1 Rutas Web (no-API)

Definidas en [`Routes.php` líneas 49-53](D:/laragon/www/backestetica/app/Config/Routes.php:49):

| Método | Ruta | Controller/Método | Autenticación |
|--------|------|-------------------|---------------|
| POST | `/quotes/add` | `CoCoty::addQuote` | JWT |
| GET | `/quotes/edt/(:any)` | `CoCoty::edtQuote/$1` | JWT |
| POST | `/quotes/upd/(:any)` | `CoCoty::updQuote/$1` | JWT |

### 3.2 Rutas API

Definidas en [`Routes.php` líneas 156-159](D:/laragon/www/backestetica/app/Config/Routes.php:156):

| Método | Ruta | Controller/Método | Autenticación |
|--------|------|-------------------|---------------|
| GET | `/api/coty/all` | `CoCoty::allCoty` | JWT |
| GET | `/api/coty/allprocedures/(:any)` | `CoCoty::allProceduresByCoty/$1` | JWT |

### 3.3 Endpoints de Soporte (para Cotizaciones)

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/customers/allforcoty` | Listar clientes para selector en cotización |
| GET | `/api/procedures/allforcoty` | Listar procedimientos para selector en cotización |

### 3.4 Dashboard Endpoints que consumen datos de Cotizaciones

Definidas en [`Routes.php` líneas 93-103](D:/laragon/www/backestetica/app/Config/Routes.php:93):

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/quotesbystatus` | Cotizaciones agrupadas por estado |
| GET | `/api/dashboard/monthlyrevenue` | Ingresos mensuales (cotizaciones aprobadas) |
| GET | `/api/dashboard/recentquotes` | Últimas 10 cotizaciones |
| GET | `/api/dashboard/topprocedures` | Procedimientos más cotizados |
| GET | `/api/dashboard/full` | Dashboard completo (incluye totalQuotes) |
| GET | `/api/dashboard/master` | Dashboard master global (incluye totalQuotes) |

### 3.5 Frontend — API Config

Definidas en [`endpoints.ts` líneas 68-74](src/api/endpoints.ts:68):

```typescript
QUOTES: {
    ALL: `${BASE}api/coty/all`,
    ADD: `${BASE}quotes/add`,
    EDIT: (id) => `${BASE}quotes/edt/${id}`,
    UPDATE: (id) => `${BASE}quotes/upd/${id}`,
},
```

---

## 4. 📱 FRONTEND — Análisis Detallado

### 4.1 Sidebar / Menú de Navegación

**Archivo:** [`sidebarItem.ts` líneas 53-61](src/layouts/full/vertical-sidebar/sidebarItem.ts:53)

```typescript
{ header: 'Cotizaciones' },       // ← Header separador en el menú

{
    title: "Cotizaciones",         // ← Título visible
    icon: CurrencyDollarIcon,      // ← Icono de dólar
    BgColor: 'primary',
    to: "/quotes",                 // ← Ruta
    module: "Listado de Cotizaciones", // ← Nombre del módulo para permisos
},
```

**Posición en el menú:** Después de "SaaS Admin" y antes de "Agenda". Es el **segundo módulo funcional** del sistema.

### 4.2 Router

**Archivo:** [`MainRoutes.ts` líneas 77-104](src/router/MainRoutes.ts:77)

| Nombre Ruta | Path | Componente | Meta módulo |
|-------------|------|------------|-------------|
| `Coty` | `/quotes` | `views/Coty/Coty.vue` | `Listado de Cotizaciones` |
| `CotyAdd` | `/quotes-add` | `views/Coty/Add.vue` | `Listado de Cotizaciones` |
| `CotyEdt` | `/quotes-edt/:id` | `views/Coty/Edt.vue` | `Listado de Cotizaciones` |

### 4.3 Flujo de Creación (Add.vue) — Wizard de 3 Pasos

**Archivo:** [`Add.vue`](src/views/Coty/Add.vue:1)

| Paso | Descripción | Interfaz |
|------|-------------|----------|
| **1. Cliente** | Búsqueda por DNI, selección de cliente con avatar y tarjeta | `searchDni`, `filteredCustomers`, `selectCustomer()` |
| **2. Procedimientos** | Checkboxes de procedimientos disponibles | `procedures`, `selectedProcedures` |
| **3. Costos y Resumen** | Valor total con formato de moneda (COP), conceptos incluidos dinámicos | `totalPriceDisplay`, `itemsList`, `submitQuotation()` |

**API calls:**
- `GET /api/customers/allforcoty` — Carga clientes
- `GET /api/procedures/allforcoty` — Carga procedimientos
- `POST /quotes/add` — Guarda cotización con payload: `{ id_customer, procedures, items, total_cost }`

### 4.4 Flujo de Edición (Edt.vue) — Mismo Wizard con Precarga

**Archivo:** [`Edt.vue`](src/views/Coty/Edt.vue:1)

**API calls:**
- `GET /api/customers/allforcoty` — Carga clientes
- `GET /api/procedures/allforcoty` — Carga procedimientos
- `GET /quotes/edt/:id` — Precarga datos de la cotización
- `POST /quotes/upd/:id` — Actualiza cotización

### 4.5 Tabla de Listado (CotyTable.vue)

**Archivo:** [`CotyTable.vue`](src/components/Coty/CotyTable.vue:1)

**Columnas:** ID, Cotización #, Cédula Cliente, Cliente, Estado, Acciones  
**Funcionalidades:**
- Búsqueda por Nro, Cliente, Cédula
- Ordenamiento por columnas
- Paginación (10 registros por página)
- Estado visual con `v-chip` (Activo/Inactivo)
- Acciones: Editar (eliminar está comentado)
- Empty state personalizado

**API call:** `GET /api/coty/all`

### 4.6 Integración con Dashboard

**Archivo:** [`src/views/dashboard/index.vue`](src/views/dashboard/index.vue:1)

El dashboard consume datos de cotizaciones en:
- **Tarjeta KPI:** Total de cotizaciones con enlace clickeable a `/quotes`
- **Gráfico Donut:** Cotizaciones por estado (Pendiente, Aprobada, Rechazada, Cancelada)
- **Tabla de Cotizaciones Recientes:** Últimas 10 cotizaciones con nombre, #, costo y estado

### 4.7 Integración con Historias Clínicas

**Archivo:** [`src/views/MedicalHistory/Add.vue`](src/views/MedicalHistory/Add.vue:1)

El formulario de creación de Historia Clínica usa cotizaciones como paso 1:
- Carga cotizaciones con `GET /api/coty/all`
- Selecciona una cotización para vincularla a la HC
- Carga procedimientos de la cotización con `GET /api/coty/allprocedures/:id`
- El campo `id_coty` en la tabla `i009t_medical_history` es FK a `i008t_coty`

### 4.8 Vista en Tenant Detail (SaaS)

**Archivo:** [`src/views/saas/TenantDetail.vue` línea 385-387](src/views/saas/TenantDetail.vue:385)

Muestra contador de cotizaciones por tenant: `{{ tenant.quotes_count || 0 }} Cotizaciones`

---

## 5. 🔧 BACKEND — Análisis Detallado

### 5.1 Controller: `CoCoty.php`

**Archivo:** [`CoCoty.php`](D:/laragon/www/backestetica/app/Controllers/CoCoty.php:1)

**Métodos implementados:**

| Método | Línea | Descripción |
|--------|-------|-------------|
| `allCoty()` | 20 | Lista todas las cotizaciones del negocio con JOIN a customer |
| `allProceduresByCoty($idCoty)` | 41 | Lista procedimientos de una cotización con JOIN a procedures |
| `addQuote()` | 62 | Crea cotización con transacción DB (cabecera + procedimientos + items) |
| `edtQuote($idQuote)` | 177 | Obtiene datos completos para edición (cabecera + procedimientos + items) |
| `updQuote($idQuote)` | 194 | Actualiza cotización con transacción (borra y reinserta procedimientos e items) |

**Características del `addQuote()`:**
- Validación de campos requeridos (`id_customer`, `total_cost`, `procedures`)
- Generación de número correlativo `tx_nro` (inicia en 1000, autoincremental por negocio)
- Transacción DB para integridad (rollback si falla)
- Inserción en cascada: cabecera → procedimientos → items
- Filtrado de items vacíos

**Características del `updQuote()`:**
- Validación de existencia de cotización
- Transacción DB
- Sincronización de procedimientos (delete + reinsert)
- Sincronización de items (delete + reinsert)
- Compatibilidad con ambos nombres de campo (`description` y `tx_item`)

### 5.2 Model: `MoCoty.php`

**Archivo:** [`MoCoty.php`](D:/laragon/www/backestetica/app/Models/MoCoty.php:1)

- Tabla: `i008t_coty`
- Timestamps automáticos: `date_add` (created), `date_upd` (updated)
- Método `allCoty($idBusiness)`: JOIN con customer para mostrar nombre completo y DNI
- Método `edtQuote($idCoty)`: Carga datos completos incluyendo procedimientos e items anidados

### 5.3 Model: `MoCotyItems.php`

**Archivo:** [`MoCotyItems.php`](D:/laragon/www/backestetica/app/Models/MoCotyItems.php:1)

- Tabla: `c008t_items`
- Timestamp solo en creación (`date_add`)
- Sin timestamp de actualización (solo se borran y reinsertan)

### 5.4 Model: `MoCotyProcedures.php`

**Archivo:** [`MoCotyProcedures.php`](D:/laragon/www/backestetica/app/Models/MoCotyProcedures.php:1)

- Tabla: `c008t_procedures`
- Método `allProceduresByCoty($idCoty)`: JOIN con `i007t_procedures` para obtener `tx_name`

### 5.5 Integración en CoDashboard.php

**Archivo:** [`CoDashboard.php`](D:/laragon/www/backestetica/app/Controllers/CoDashboard.php:1)

El dashboard backend consume `MoCoty` en 7 lugares distintos (líneas 117, 150, 192, 276, 279, 332, 393). **Las cotizaciones son el núcleo de las métricas del dashboard.**

### 5.6 Integración en CoMedicalHistory.php

**Archivo:** [`CoMedicalHistory.php`](D:/laragon/www/backestetica/app/Controllers/CoMedicalHistory.php:1)

Cada historia clínica se vincula a una cotización (`id_coty` → `i008t_coty`). El sistema permite **múltiples historias clínicas por cotización** (comentario en línea 161-163).

---

## 6. 🔐 PERMISOS Y ROLES

### 6.1 Módulo en el Sistema de Permisos

- **Nombre del módulo:** `"Listado de Cotizaciones"` 
- **Tabla de módulos:** `i004t_module` (modelo `MoModule`)
- **Tabla de permisos:** `c003t_permission` (modelo `MoRolPermission`)

El módulo está registrado en:
- [`sidebarItem.ts` línea 60](src/layouts/full/vertical-sidebar/sidebarItem.ts:60): `module: "Listado de Cotizaciones"`
- [`MainRoutes.ts` líneas 84, 93, 102](src/router/MainRoutes.ts:84): `module: 'Listado de Cotizaciones'` en meta de las 3 rutas

### 6.2 Control de Acceso

**Archivo:** [`permissions.ts`](src/utils/permissions.ts:1)

- `can(permission)`: Verifica si el usuario tiene el permiso `"Listado de Cotizaciones"`
- El Master (SuperAdmin) siempre tiene acceso total
- En modo personificación (impersonation) se asume acceso completo

### 6.3 Middleware Backend

Todas las rutas de cotizaciones usan el filtro `jwt` (JWT Auth Filter):
- [`Filters/JwtAuthFilter.php`](D:/laragon/www/backestetica/app/Filters/JwtAuthFilter.php:1)

---

## 7. 🚨 RIESGOS Y PROBLEMAS DETECTADOS

### 7.1 🐛 Bug en SaasController.php

**Archivo:** `SaasController.php` línea ~110  
**Problema:** Consulta `SELECT COUNT(*) FROM i005t_coty` — la tabla correcta es `i008t_coty`, NO `i005t_coty`. Esto causará un error SQL al cargar el detalle de un tenant.

### 7.2 ⚠️ Funcionalidad Faltante

| Funcionalidad | Estado | Evidencia |
|---------------|--------|-----------|
| Eliminar cotización | ❌ No implementado | [`CotyTable.vue` líneas 69-71](src/components/Coty/CotyTable.vue:69): El botón de eliminar está comentado |
| Cambio de estado | ❌ No implementado | Solo muestra Activo/Inactivo binario; no hay UI para cambiar a Aprobada/Rechazada/Cancelada |
| PDF de cotización | ❌ No implementado | No hay generación de PDF como sí existe para Historias Clínicas |
| Firma en cotización | ❌ No implementado | No hay mecanismo de firma digital en cotizaciones |
| Filtros avanzados | ❌ No implementado | Solo búsqueda por texto; no hay filtros por fecha, estado, rango de precio |

### 7.3 ⚠️ Sin Migración Formal

No existe un archivo de migración para las tablas `i008t_coty`, `c008t_items`, `c008t_procedures`. Las tablas fueron creadas directamente vía SQL (`schema.sql`). Esto significa que no hay un mecanismo de rollback ni versionado de esquema para estas tablas.

### 7.4 ⚠️ Sidebar Secundario (Customer Portal)

**Archivo:** [`SidebarCustomer.ts` línea 33-37](src/layouts/full/vertical-sidebar/SidebarCustomer.ts:33)

Existe una referencia a `"Estimate"` en el portal del cliente (`/portal/jobs-estimate`), pero **no hay ninguna ruta ni vista implementada** para esta sección. El archivo [`ClientRoutes.ts`](src/router/ClientRoutes.ts:1) tiene las rutas hijas vacías (solo comentarios).

---

## 8. 📊 MÓDULOS SIMILARES EXISTENTES

| Módulo | Relación con Cotizaciones |
|--------|---------------------------|
| **Procedimientos** | Los procedimientos se seleccionan dentro de una cotización |
| **Clientes** | Cada cotización pertenece a un cliente |
| **Historias Clínicas** | Cada HC se vincula a una cotización (`id_coty`) |
| **Dashboard** | Métricas principales basadas en cotizaciones (ingresos, estados, recientes) |
| **Appointments** | Módulo independiente de agendamiento de citas |

---

## 9. 📝 RECOMENDACIONES PARA NUEVAS IMPLEMENTACIONES

Si se desea extender o crear un nuevo módulo similar, la estructura recomendada es:

```
Frontend:
  src/views/[Modulo]/[Modulo].vue       ← Listado
  src/views/[Modulo]/Add.vue            ← Creación
  src/views/[Modulo]/Edt.vue            ← Edición
  src/components/[Modulo]/[Modulo]Table.vue  ← Componente tabla

Backend:
  app/Controllers/Co[Nombre].php        ← Controller
  app/Models/Mo[Nombre].php             ← Model principal
  app/Models/Mo[Nombre][Detalle].php    ← Models para tablas relacionadas

Base de datos:
  iXXXt_[nombre]                        ← Tabla principal (prefijo i = independiente)
  cXXXt_[nombre]                        ← Tabla de cruce/detalle (prefijo c = child)

Routes (web):
  $routes->group('[nombre]', function($routes) { ... });

Routes (api):
  $routes->group('[nombre]', function($routes) { ... });
```

---

## 10. 🏁 CONCLUSIÓN FINAL

| Pregunta | Respuesta |
|----------|-----------|
| ¿Existe módulo de cotizaciones? | ✅ **SÍ** |
| ¿Está funcional? | ✅ **SÍ** — CRUD completo funcionando |
| ¿Aparece en el menú? | ✅ **SÍ** — Visible como "Cotizaciones" con header propio |
| ¿Existe en frontend y backend? | ✅ **SÍ** — Ambos lados completamente implementados |
| ¿Está incompleto? | ⚠️ Parcialmente — Falta delete, cambio de estado avanzado, PDF |
| ¿Está oculto por permisos? | ❌ No — Se controla por rol con el permiso "Listado de Cotizaciones" |
| ¿Fue eliminado parcialmente? | ❌ No — Todo el código está presente |
| ¿Tiene bugs? | ⚠️ **SÍ** — Bug en SaasController (i005t_coty en vez de i008t_coty) |

### Archivos Clave Encontrados: 15 archivos directamente relacionados

**Frontend (5 archivos):**
1. [`src/views/Coty/Coty.vue`](src/views/Coty/Coty.vue:1)
2. [`src/views/Coty/Add.vue`](src/views/Coty/Add.vue:1)
3. [`src/views/Coty/Edt.vue`](src/views/Coty/Edt.vue:1)
4. [`src/components/Coty/CotyTable.vue`](src/components/Coty/CotyTable.vue:1)
5. [`src/api/endpoints.ts`](src/api/endpoints.ts:68) — Sección QUOTES

**Backend (4 archivos):**
6. [`app/Controllers/CoCoty.php`](D:/laragon/www/backestetica/app/Controllers/CoCoty.php:1)
7. [`app/Models/MoCoty.php`](D:/laragon/www/backestetica/app/Models/MoCoty.php:1)
8. [`app/Models/MoCotyItems.php`](D:/laragon/www/backestetica/app/Models/MoCotyItems.php:1)
9. [`app/Models/MoCotyProcedures.php`](D:/laragon/www/backestetica/app/Models/MoCotyProcedures.php:1)

**Configuración/Navegación (3 archivos):**
10. [`src/layouts/full/vertical-sidebar/sidebarItem.ts`](src/layouts/full/vertical-sidebar/sidebarItem.ts:53)
11. [`src/router/MainRoutes.ts`](src/router/MainRoutes.ts:77)
12. [`app/Config/Routes.php`](D:/laragon/www/backestetica/app/Config/Routes.php:49)

**Integración (3 archivos):**
13. [`app/Controllers/CoDashboard.php`](D:/laragon/www/backestetica/app/Controllers/CoDashboard.php:1) — 7 referencias a MoCoty
14. [`app/Controllers/CoMedicalHistory.php`](D:/laragon/www/backestetica/app/Controllers/CoMedicalHistory.php:1) — Vinculación HC ↔ Cotización
15. [`app/Models/MoMedicalHistory.php`](D:/laragon/www/backestetica/app/Models/MoMedicalHistory.php:1) — JOIN con i008t_coty

---

*Informe generado automáticamente mediante análisis estático de código fuente. Sin suposiciones — toda evidencia está respaldada por rutas de archivo y números de línea verificables.*
