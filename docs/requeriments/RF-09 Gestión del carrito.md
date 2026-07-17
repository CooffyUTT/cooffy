# RF-09 Gestión del carrito

Responsable: @Genesis  
Prioridad: Media

Actor: Cliente

---

## Descripción

El sistema permitirá al cliente gestionar los productos seleccionados antes de confirmar su pedido. El usuario podrá agregar platillos desde el menú, modificar las cantidades, eliminar productos y consultar el subtotal actualizado de su compra en tiempo real. El carrito servirá como una etapa previa al registro del pedido.

---

## Flujo

1. El cliente inicia sesión en la aplicación.
2. Consulta el menú disponible de la sucursal.
3. Selecciona uno o más productos para agregarlos al carrito.
4. El sistema valida la disponibilidad del producto y el límite permitido por pedido.
5. El cliente puede modificar la cantidad de los productos agregados o eliminarlos del carrito.
6. El sistema actualiza automáticamente el subtotal del pedido.
7. El cliente revisa la información del carrito.
8. El cliente confirma el carrito y continúa al módulo de registro del pedido.

---

## Dependencias y restricciones

Depende de:

- [RF-10](RF-10%20Registro%20de%20pedidos.md) Registro de pedidos
- [RF-11](RF-11%20Gesti%C3%B3n%20de%20pagos.md) Gestion de pagos

**RESTRICCIONES**

- El cliente únicamente podrá agregar productos que se encuentren disponibles.
- No se permitirá exceder el límite máximo establecido por producto.
- El sistema no permitirá continuar con la compra si el usuario posee un pedido activo.
- El subtotal deberá actualizarse automáticamente al modificar el contenido del carrito.
- Los cambios realizados en el inventario deberán reflejarse en los productos disponibles para agregar al carrito.

## Tareas

| Nombre | Descripcion | Prioridad |
| --- | --- | --- |
| Crear modelo del carrito | Implementar los modelos necesarios para almacenar el carrito y sus productos asociados. |     |

Lo siento chavales me dio sueño :’’u