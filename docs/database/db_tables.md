# Documentación de tablas

> Nota: los estados de pedido y pago **no son enums nativos de PostgreSQL**; se
> implementan como `varchar(20)` con `choices` de Django. Los valores válidos se
> listan en la sección de Enums.

## Enums

**order_state** (varchar(20) + Django choices): `pending`, `preparing`, `ready`, `picked_up`, `rejected`, `cancelled`  
**payment_status** (varchar(20) + Django choices): `pending`, `paid`  
**product_stock.state** (integer + Django IntegerChoices): `-1` sin control, `0` agotado, `1` con stock

---

## Schools

Instituciones educativas registradas en el sistema.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único de la institución educativa. |
| admin | bigint | \-  | FK, NULL | Usuario administrador principal de la escuela (opcional; `PROTECT`). |
| full_name | varchar(200) | \-  | NOT NULL | Nombre oficial completo de la institución. |
| short_name | varchar(50) | \-  | NOT NULL | Nombre corto o abreviatura utilizada dentro del sistema. |
| domain_address | varchar(100) | \-  | UNIQUE, NULL | Dominio institucional normalizado (minúsculas, sin espacios), ej. ut-tijuana.edu.mx. |
| address | text | \-  | \-  | Dirección física principal de la escuela. |
| active | boolean | true | NOT NULL | Indica si la escuela puede utilizar el sistema. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 users (admin) - 1:M branches - 1:M users (school_id) - M:M companies vía company_schools | \- (id) PK - (domain_address) UNIQUE "schools_domain_address_idx" |

---

## Companies

Empresas propietarias de una o más sucursales.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único de la empresa. |
| name | varchar(150) | \-  | NOT NULL | Nombre comercial de la empresa. |
| owner_id | bigint | \-  | NOT NULL, FK | Usuario propietario o administrador principal (`CASCADE`). |
| active | boolean | true | NOT NULL | Indica si la empresa está activa. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 users (owner_id) - 1:M branches - M:M schools vía company_schools | \- (id) PK |

---

## Company_schools

Tabla de unión (M:M) que vincula una compañía con las escuelas donde puede operar. Una compañía puede operar en varias escuelas y una escuela puede tener varias compañías. Solo se pueden crear sucursales con compañías vinculadas a la escuela.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único del vínculo. |
| company_id | bigint | \-  | NOT NULL, FK | Compañía vinculada (`CASCADE`). |
| school_id | bigint | \-  | NOT NULL, FK | Escuela vinculada (`CASCADE`). |
| active | boolean | true | NOT NULL | Indica si la compañía puede operar en la escuela. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del vínculo. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del vínculo. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 companies (company_id) - M:1 schools (school_id) | \- (id) PK - (company_id, school_id) UNIQUE "unique_company_school" - (school_id, active) INDEX "company_sch_school__c2bd5a_idx" - (company_id, active) INDEX "company_sch_company_8a6f3d_idx" |

---

## Branches

Sucursales operadas por una empresa dentro de una escuela.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único de la sucursal. |
| name | varchar(100) | \-  | NOT NULL | Nombre de la sucursal. |
| company_id | bigint | \-  | NOT NULL, FK | Empresa propietaria de la sucursal (`CASCADE`). |
| school_id | bigint | \-  | NOT NULL, FK | Escuela a la que pertenece la sucursal (`PROTECT`). |
| location | text | \-  | \-  | Descripción de la ubicación física dentro de la escuela (ej. Edificio B, planta baja). |
| schedule | varchar(100) | \-  | \-  | Horario de atención de la sucursal. |
| image | varchar(2048) | \-  | \-  | Imagen de la sucursal (se almacena convertida a WEBP). |
| active | boolean | true | NOT NULL | Indica si la sucursal se encuentra operando. |
| accepting_orders | boolean | true | NOT NULL | Indica si la sucursal acepta pedidos en este momento. |
| min_anticipation_minutes | int | 30 | NOT NULL | Anticipación mínima (en minutos) para pedidos anticipados. |
| max_anticipation_hours | int | 24 | NOT NULL | Antelación máxima (en horas) para pedidos anticipados. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 companies (company_id) - M:1 schools (school_id) - 1:M product_stocks - 1:M orders - 1:M users (branch_id) | \- (id) PK - (company_id) INDEX - (school_id, active) INDEX "branches_school__57be82_idx" |

---

## Users

Representa a toda persona con acceso al sistema. El modelo extiende `AbstractBaseUser` + `PermissionsMixin` de Django, lo que habilita el sistema de autenticación nativo.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único del usuario. |
| user | varchar(254) | \-  | UNIQUE, NOT NULL | Nombre de usuario o correo institucional utilizado para iniciar sesión (`USERNAME_FIELD`). |
| password | varchar(128) | \-  | NOT NULL | Contraseña hasheada (Django la gestiona automáticamente). |
| name | varchar(100) | \-  | NOT NULL | Nombre del usuario. |
| lastname | varchar(100) | \-  | \-  | Apellidos del usuario. |
| school_id | bigint | \-  | FK, NULL | Escuela a la que pertenece el usuario (`SET_NULL`). |
| branch_id | bigint | \-  | FK, NULL | Sucursal a la que pertenece el usuario (`SET_NULL`). |
| active | boolean | true | NOT NULL | Indica si la cuenta está habilitada. |
| is_staff | boolean | false | NOT NULL | Permite acceso al admin de Django. |
| is_superuser | boolean | false | NOT NULL | Otorga todos los permisos sin asignación explícita (heredado de `PermissionsMixin`). |
| last_login | timestamp | \-  | \-  | Último inicio de sesión (heredado de `AbstractBaseUser`). |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 schools (school_id) - M:1 branches (branch_id) - 1:M companies (owner_id) - 1:M schools (admin) - 1:M orders (client_id, sin FK en BD) - M:M auth_group vía auth_user_groups - M:M auth_permission vía auth_user_user_permissions | \- (id) PK - (user) UNIQUE |

---

## Roles y permisos (Django auth)

En lugar de implementar tablas propias de roles y permisos, se optó por usar el sistema de autenticación y autorización nativo de Django (`django.contrib.auth`), que ya provee grupos, permisos y sus relaciones. Las tablas son gestionadas automáticamente por Django y se crean con la migración inicial.

### auth_group (Grupos)

Equivalente al concepto de "roles". Un grupo agrupa permisos y puede asignarse a múltiples usuarios. Ejemplo de uso actual: al registrarse, el usuario se asigna al grupo `"cliente"` (`Group.objects.get_or_create(name="cliente")`).

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | int | \-  | PK, NOT NULL | Identificador único del grupo. |
| name | varchar(150) | \-  | UNIQUE, NOT NULL | Nombre del grupo (ej. cliente, cocinero, administrador). |

### auth_permission (Permisos)

Permisos individuales. Django los genera automáticamente para cada modelo registrado (add, change, delete, view). También pueden crearse permisos personalizados vía `Meta.permissions` en los modelos.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | int | \-  | PK, NOT NULL | Identificador único del permiso. |
| name | varchar(255) | \-  | NOT NULL | Nombre descriptivo del permiso. |
| codename | varchar(100) | \-  | NOT NULL | Código interno (ej. add_product, change_order). |
| content_type_id | int | \-  | FK, NOT NULL | Modelo al que aplica el permiso. |

### Tablas de relación (M:M)

### auth_group_permissions

| Nombre | Dato | Restricción | Comentario |
| --- | --- | --- | --- |
| group_id | int | PK, NOT NULL, FK | Grupo. |
| permission_id | int | PK, NOT NULL, FK | Permiso. |

### auth_user_groups

| Nombre | Dato | Restricción | Comentario |
| --- | --- | --- | --- |
| user_id | bigint | PK, NOT NULL, FK | Usuario. |
| group_id | int | PK, NOT NULL, FK | Grupo. Ej: usuario asignado al grupo `cliente`. |

### auth_user_user_permissions

| Nombre | Dato | Restricción | Comentario |
| --- | --- | --- | --- |
| user_id | bigint | PK, NOT NULL, FK | Usuario. |
| permission_id | int | PK, NOT NULL, FK | Permiso. |

---

## Categories

Categorías utilizadas para organizar los productos del menú.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id | bigint | \- | PK, NOT NULL | Identificador único de la categoría. |
| name | varchar(80) | \- | UNIQUE, NOT NULL | Nombre de la categoría. |
| active | boolean | true | NOT NULL | Indica si la categoría está activa. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- 1:M products (category_id) | \- (id) PK - (name) UNIQUE |

---

## Products

Productos disponibles para ser vendidos en el menú.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único del producto. |
| name | varchar(120) | \-  | NOT NULL | Nombre mostrado al cliente. |
| price | numeric(10,2) | \-  | NOT NULL, CHECK (price > 0) | Precio de venta actual. |
| category_id | bigint | \- | FK, NULL | Categoría a la que pertenece el producto (`PROTECT`). |
| active | boolean | true | NOT NULL | Determina si el producto puede ser solicitado. |
| max_per_order | int | \-  | CHECK (max_per_order IS NULL OR max_per_order > 0) | Cantidad máxima permitida por pedido. |
| image | varchar(2048) | \-  | \-  | Imagen del producto (se almacena convertida a WEBP). |
| description | text | \-  | \-  | Descripción visible para el cliente. |
| modifiers | varchar(50)\[\] | \-  | \-  | Ingredientes u opciones que pueden excluirse del producto. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 categories (category_id) - 1:M product_stocks - 1:M order_products (item_id, sin FK en BD) | \- (id) PK - (category_id) INDEX |

---

## Product_stocks

Control de disponibilidad de productos por sucursal. Usa clave primaria compuesta.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| branch_id | bigint | \-  | PK, NOT NULL, FK | Sucursal donde se controla el stock (`CASCADE`). |
| product_id | bigint | \-  | PK, NOT NULL, FK | Producto asociado al stock (`CASCADE`). |
| stock | int | -1 | NOT NULL, CHECK (stock IN (-1, 0, 1)) | Estado: -1 sin control activado, 0 agotado, 1 con stock. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del stock. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 branches (branch_id) - M:1 products (product_id) | \- (branch_id, product_id) PK |

---

## Payment_methods

Métodos de pago aceptados por el sistema.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único del método de pago. |
| name | varchar(50) | \-  | UNIQUE, NOT NULL | Nombre del método de pago. |
| is_digital | boolean | \-  | NOT NULL | Indica si requiere procesamiento electrónico. |
| active | boolean | true | NOT NULL | Determina si el método está disponible. |

| Relaciones | Índices |
| --- | --- |
| \- 1:M orders | \- (id) PK - (name) UNIQUE |

---

## Orders

Pedidos realizados por los clientes. Las referencias a sucursal y cliente se
guardan como ids planos (sin FK en la BD).

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único del pedido. |
| order_number | bigint | \-  | NOT NULL | Número consecutivo visible para operación y cliente. |
| date | date | \-  | NOT NULL | Fecha operativa del pedido. |
| branch_id | bigint | 1 | NOT NULL | Sucursal responsable del pedido (id plano, sin FK). |
| client_id | bigint | \-  | NOT NULL | Cliente que realizó el pedido (id plano, sin FK). |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Momento en que se registró el pedido. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |
| prepared_at | timestamp | \-  | \-  | Momento en que el pedido fue marcado como listo. |
| picked_up_at | timestamp | \-  | \-  | Momento en que el cliente recibió el pedido. |
| scheduled_pickup_at | timestamp | \-  | \-  | Cuando es apartado, fecha y hora programada para recoger el pedido. |
| total | numeric(10,2) | 0 | NOT NULL | Importe total del pedido. |
| state | varchar(20) | 'pending' | NOT NULL | Estado actual del pedido (ver `order_state`). |
| payment_method | bigint | \-  | NOT NULL, FK | Método de pago seleccionado (`PROTECT`). |
| payment_status | varchar(20) | 'pending' | NOT NULL | Estado actual del pago (ver `payment_status`). |
| comment | text | \-  | \-  | Comentarios extras del usuario del pedido. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 payment_methods (payment_method) - 1:M order_products. (branch_id y client_id son ids planos, sin FK) | \- (id) PK - (order_number, date, branch_id) UNIQUE "unique_order_number_per_branch_date" |

---

## Order_products

Productos incluidos dentro de un pedido.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id | bigint | \- | PK, NOT NULL | Identificador único del registro. |
| order_id | bigint | \-  | NOT NULL, FK | Pedido al que pertenece el producto (`CASCADE`). |
| item_id | bigint | \-  | NOT NULL | Producto solicitado (id plano, sin FK). |
| quantity | int | 1   | NOT NULL | Cantidad solicitada. |
| price | numeric(10,2) | 0 | NOT NULL | Precio unitario registrado al momento de la compra. |
| excluded_modifiers | jsonb | [] | \-  | Opciones que el cliente solicitó excluir (JSON array). |

| Relaciones | Índices |
| --- | --- |
| \- M:1 orders (order_id). (item_id es id plano, sin FK) | \- (id) PK |
