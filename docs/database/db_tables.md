# Documentación de tablas

## Enums

**order_state**: `pending`, `progress`, `ready`, `picked_up`, `scheduled`, `cancelled`  
**payment_state**: `pending`, `processing`, `paid`, `failed`, `cancelled`, `refunded`

---

## Schools

Instituciones educativas registradas en el sistema.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL, AUTO_INCREMENT | Identificador único de la institución educativa. |
| admin | bigint | \-  | NOT NULL, FK | Usuario administrador principal de la escuela. |
| full_name | varchar(200) | \-  | UNIQUE, NOT NULL | Nombre oficial completo de la institución. |
| short_name | varchar(50) | \-  | UNIQUE, NOT NULL | Nombre corto o abreviatura utilizada dentro del sistema. |
| address | text | \-  | \-  | Dirección física principal de la escuela. |
| active | boolean | true | NOT NULL | Indica si la escuela puede utilizar el sistema. |

| Relaciones | Índices |
| --- | --- |
| \- 1:1 users (admin) - 1:M branches - 1:M users (school_id) | \- (id) PK - (full_name) UNIQUE - (short_name) UNIQUE |

---

## Companies

Empresas propietarias de una o más sucursales.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único de la empresa. |
| name | varchar(150) | \-  | NOT NULL | Nombre comercial de la empresa. |
| owner_id | bigint | \-  | NOT NULL, FK | Usuario propietario o administrador principal. |
| active | boolean | true | NOT NULL | Indica si la empresa está activa. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- 1:1 users (owner_id) - 1:M branches | \- (id) PK |

---

## Branches

Sucursales operadas por una empresa dentro de una escuela.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL, AUTO_INCREMENT | Identificador único de la sucursal. |
| name | varchar(100) | \-  | NOT NULL | Nombre de la sucursal. |
| company_id | bigint | \-  | NOT NULL, FK | Empresa propietaria de la sucursal. |
| school_id | bigint | \-  | NOT NULL, FK | Escuela a la que pertenece la sucursal. |
| active | boolean | true | NOT NULL | Indica si la sucursal se encuentra operando. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |
| location | text | \-  | \-  | Descripción de la ubicación física dentro de la escuela (ej. Edificio B, planta baja). |

| Relaciones | Índices |
| --- | --- |
| \- M:1 companies (company_id) - M:1 schools (school_id) - 1:M product_stocks - 1:M orders | \- (id) PK - (company_id) INDEX "index_2_1" - (school_id, active) INDEX "index_3" |

---

## Users

Representa a toda persona con acceso al sistema.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único del usuario. |
| user | varchar(254) | \-  | NOT NULL | Nombre de usuario o correo institucional utilizado para iniciar sesión. |
| password_hash | varchar(255) | \-  | NOT NULL | Contraseña almacenada de forma segura mediante hash. |
| name | varchar(100) | \-  | NOT NULL | Nombre del usuario. |
| lastname | varchar(100) | \-  | \-  | Apellidos del usuario. |
| school_id | bigint | \-  | FK  | Sucursal (escuela) a la que pertenece el usuario. |
| active | boolean | true | NOT NULL | Indica si la cuenta está habilitada. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- 1:1 companies (owner_id) - 1:1 schools (admin) - M:1 schools (school_id) - 1:M orders (client_id) - 1:M user_roles | \- (id) PK - (school_id, user) UNIQUE "index_2" |

---

## Roles

Roles disponibles dentro del sistema.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | int | \-  | PK, NOT NULL | Identificador único del rol. |
| name | varchar(50) | \-  | UNIQUE, NOT NULL | Nombre del rol. |
| active | boolean | true | NOT NULL | Indica si el rol está disponible para asignación. |

| Relaciones | Índices |
| --- | --- |
| \- 1:M role_permissions - 1:M user_roles | \- (id) PK - (name) UNIQUE |

---

## Permissions

Permisos que pueden ser asignados a los roles.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | int | \-  | PK, NOT NULL | Identificador único del permiso. |
| name | varchar(100) | \-  | UNIQUE, NOT NULL | Nombre descriptivo del permiso. |

| Relaciones | Índices |
| --- | --- |
| \- 1:M role_permissions | \- (id) PK - (name) UNIQUE |

---

## Role_permissions

Relación entre roles y permisos.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| role_id | int | \-  | PK, NOT NULL, FK | Rol que recibe el permiso. |
| permission_id | int | \-  | PK, NOT NULL, FK | Permiso asignado al rol. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 roles (role_id) - M:1 permissions (permission_id) | \- (role_id, permission_id) PK |

---

## User_roles

Relación entre usuarios y roles.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| role_id | int | \-  | PK, NOT NULL, FK | Rol asignado. |
| user_id | bigint | \-  | PK, NOT NULL, FK | Usuario que recibe el rol. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 roles (role_id) - M:1 users (user_id) | \- (role_id, user_id) PK |

---

## Products

Productos disponibles para ser vendidos en el menú.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único del producto. |
| name | varchar(120) | \-  | NOT NULL | Nombre mostrado al cliente. |
| price | numeric(10,2) | \-  | NOT NULL, CHECK (price > 0) | Precio de venta actual. |
| active | boolean | true | NOT NULL | Determina si el producto puede ser solicitado. |
| max_per_order | int | \-  | CHECK (max_per_order IS NULL OR max_per_order > 0) | Cantidad máxima permitida por pedido. |
| image | varchar(2048) | \-  | \-  | URL de la imagen del producto. |
| description | text | \-  | \-  | Descripción visible para el cliente. |
| modifiers | varchar(50)\[\] | \-  | \-  | Ingredientes u opciones que pueden excluirse del producto. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Fecha de creación del registro. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del registro. |

| Relaciones | Índices |
| --- | --- |
| \- 1:M product_stocks - 1:M order_products (item_id) | \- (id) PK |

---

## Product_stocks

Control de disponibilidad de productos por sucursal.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| branch_id | bigint | \-  | PK, NOT NULL, FK | Sucursal donde se controla el stock. |
| product_id | bigint | \-  | PK, NOT NULL, FK | Producto asociado al stock. |
| stock | int | 0   | NOT NULL, CHECK (stock >= 0) | Cantidad disponible del producto. |
| updated_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Última actualización del stock. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 branches (branch_id) - M:1 products (product_id) | \- (branch_id, product_id) PK |

---

## Payment_methods

Métodos de pago aceptados por el sistema.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | int | \-  | PK, NOT NULL | Identificador único del método de pago. |
| name | varchar(50) | \-  | UNIQUE, NOT NULL | Nombre del método de pago. |
| is_digital | boolean | \-  | NOT NULL | Indica si requiere procesamiento electrónico. |
| active | boolean | true | NOT NULL | Determina si el método está disponible. |

| Relaciones | Índices |
| --- | --- |
| \- 1:M orders | \- (id) PK - (name) UNIQUE |

---

## Orders

Pedidos realizados por los clientes.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| id  | bigint | \-  | PK, NOT NULL | Identificador único del pedido. |
| order_number | bigint | \-  | NOT NULL | Número consecutivo visible para operación y cliente. |
| date | date | \-  | NOT NULL | Fecha operativa del pedido. |
| branch_id | bigint | \-  | NOT NULL, FK | Sucursal responsable del pedido. |
| client_id | bigint | \-  | NOT NULL, FK | Cliente que realizó el pedido. |
| created_at | timestamp | CURRENT_TIMESTAMP | NOT NULL | Momento en que se registró el pedido. |
| prepared_at | timestamp | \-  | \-  | Momento en que el pedido fue marcado como listo. |
| picked_up_at | timestamp | \-  | \-  | Momento en que el cliente recibió el pedido. |
| scheduled_pickup_at | timestamp | \-  | \-  | Cuando es apartado, fecha y hora programada para recoger el pedido. |
| total | numeric(10,2) | \-  | NOT NULL, CHECK (total >= 0) | Importe total del pedido. |
| state | order_state (enum) | 'pending' | NOT NULL | Estado actual del pedido. |
| payment_method | int | \-  | NOT NULL, FK | Método de pago seleccionado. |
| payment_status | payment_state (enum) | 'pending' | NOT NULL | Estado actual del pago. |
| comment | text | \-  | \-  | Comentarios extras del usuario del pedido. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 branches (branch_id) - M:1 users (client_id) - M:1 payment_methods (payment_method) - 1:M order_products | \- (id) PK - (client_id) INDEX "index_3_2" - (branch_id, state) INDEX "index_4" - (order_number, date, branch_id) UNIQUE "index_2_3" |

---

## Order_products

Productos incluidos dentro de un pedido.

| Nombre | Dato | Default | Restricción | Comentario |
| --- | --- | --- | --- | --- |
| order_id | bigint | \-  | PK, NOT NULL, FK | Pedido al que pertenece el producto. |
| item_id | bigint | \-  | PK, NOT NULL, FK | Producto solicitado. |
| quantity | int | 1   | NOT NULL, CHECK (quantity > 0) | Cantidad solicitada. |
| price | numeric(10,2) | \-  | NOT NULL, CHECK (price > 0) | Precio unitario registrado al momento de la compra. |
| excluded_modifiers | varchar(50)\[\] | \-  | \-  | Ingredientes u opciones que el cliente solicitó excluir. |

| Relaciones | Índices |
| --- | --- |
| \- M:1 orders (order_id) - M:1 products (item_id) | \- (order_id, item_id) PK |