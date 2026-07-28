# RF-05 Gestión del menú

Responsable: @Jabes Llamas Zamudio

Prioridad: Alta  
Actor: Gerente y supervisor

## Descripción

El Gerente y Supervisor podrán administrar el menú de la sucursal, permitiendo agregar, editar, habilitar, deshabilitar y eliminar productos, así como modificar su información (nombre, descripción, precio y fotografía), con la finalidad de mantener actualizado el catálogo disponible para los clientes.

## Flujo

1. Usuario entra al panel de menús
2. Usuario selecciona el producto el cual desea modificar
3. Usuario observa todos los campos los cuales son modificables
4. Usuario modifica el atributo
5. Usuario confirma el cambio
6. Usuario observa el producto ya modificado

## Dependencias y restricciones

Depende de:

- RF-01 Autenticación de usuarios.
- RF-03 Gestión de sucursales.

Restricciones:

- RN-08 Un producto deshabilitado no podrá agregarse a nuevos pedidos ni mostrarse como disponible en el menú.
- RN-09 Un producto podrá marcarse como promoción únicamente mientras permanezca activo.
- RN-22 Los cambios realizados deberán registrar la fecha y hora de la última modificación.
- RN-23 El usuario únicamente podrá administrar la información de las sucursales para las que tenga autorización.

## Tareas

|     |     |     |
| --- | --- | --- |
| Nombre | Descripción | Prioridad |
| Diseño de la interfaz del menú | Diseñar la pantalla para administrar el catálogo de productos | Alta |
| Registrar producto | Permitir crear un nuevo producto con nombre, descripción, precio y fotografía. | Alta |
| Listado de productos | Mostrar todos los productos registrados de la sucursal | Alta |
| Editar producto | Permitir modificar la información de un producto existente | Alta |
| Eliminar producto | Permitir eliminar un producto | Alta |
| Habilitar/Deshabilitar producto | Permitir activar o desactivar la disponibilidad de un producto | Alta |
| Validación de información | Verificar que los campos obligatorios y el precio sean válidos | Alta |
| Control de permisos | Validar que únicamente Gerentes y Supervisores autorizados puedan administrar los productos de su sucursal | Alta |