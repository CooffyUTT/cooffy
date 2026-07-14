# Especificación de requesitos

# RF-01 Autenticación de usuarios

## Descripción

El sistema permitirá autenticar a los usuarios mediante sus credenciales y conceder acceso únicamente a las funcionalidades correspondientes a su rol.

## Actores

- Cliente
- Encargado
- Personal de cocina
- Gerente

## Precondiciones

- El usuario debe existir.
- La cuenta debe estar activa.

## Flujo principal

1. El usuario abre la pantalla de inicio de sesión.
2. Ingresa sus credenciales.
3. El sistema valida la información.
4. Se identifica el rol.
5. Se muestra el panel correspondiente.

## Flujos alternos

- Credenciales incorrectas.
- Cuenta deshabilitada.

## Postcondiciones

Existe una sesión autenticada.

## Reglas

- RN-01
- RN-02
- RN-03

## Criterios

- No permite acceder con contraseña incorrecta.
- Redirige al panel correcto.
- No permite acceder a módulos sin permisos.

---

# RF-05 Gestión del menú

## Descripción

El sistema permitirá administrar el catálogo de productos de una sucursal.

## Actores

- Encargado

## Precondiciones

- Usuario autenticado.
- Permiso de administración.

## Flujo principal

1. Abrir módulo del menú.
2. Registrar o seleccionar un producto.
3. Capturar información.
4. Guardar cambios.
5. Actualizar el catálogo.

## Información administrada

- Nombre
- Descripción
- Precio
- Imagen
- Estado
- Promoción
- Disponibilidad

## Flujos alternos

- Producto duplicado.
- Precio inválido.

## Reglas

- RN-08
- RN-09

## Criterios

- Puede crear productos.
- Puede modificarlos.
- Puede deshabilitarlos.
- Los cambios aparecen en el menú del cliente.

---

# RF-06 Gestión de disponibilidad

Este RF merece documento aparte porque tiene muchas reglas.

## Descripción

El sistema permitirá controlar la disponibilidad de venta de cada producto.

## Incluye

- capacidad máxima
- disponibilidad
- límite por pedido

## Flujo

1. El encargado configura límites.
2. El sistema controla las ventas.
3. Al alcanzar el límite el producto deja de venderse.

## Reglas

- RN-10
- RN-11
- RN-12

## Criterios

- No permite vender arriba del límite.
- El producto desaparece automáticamente.
- Se vuelve disponible cuando corresponda.

---

# RF-07 Gestión de pedidos

Probablemente será el documento más largo.

## Descripción

El sistema permitirá administrar el ciclo completo de los pedidos dentro de la sucursal.

## Actores

- Encargado
- Personal de cocina

## Incluye

- visualizar pedidos
- aceptar
- rechazar
- pausar recepción
- cambiar estado

## Flujo principal

1. Llega un pedido.
2. Se muestra en el panel.
3. El encargado lo acepta.
4. Cocina inicia preparación.
5. Cocina marca terminado.
6. Se entrega.

## Flujos alternos

- Pedido rechazado.
- Recepción pausada.
- Producto agotado.

## Estados

```mermaid
flowchart LR
  Pendiente --> Aceptado --> 1[En preparación] --> Listo --> Entregado
```

## Reglas

- RN-13
- RN-14
- RN-15
- RN-16
- RN-17

## Criterios

- Sólo pueden hacerse cambios válidos de estado.
- El cliente observa el cambio inmediatamente.
- Los pedidos rechazados no regresan al flujo.

---

# RF-08 Consulta del menú

Este puede ser muy corto.

## Incluye

- lista de productos
- búsqueda
- promociones
- disponibilidad

## Reglas

- RN-08
- RN-09

---

# RF-09 Gestión del carrito

## Incluye

- agregar
- eliminar
- modificar cantidad
- calcular subtotal

## Reglas

- RN-07
- RN-12

---

# RF-10 Registro de pedidos

Este merece documento propio.

## Incluye

- confirmar carrito
- generar pedido
- asignar número
- registrar fecha
- registrar sucursal

## Reglas

- RN-04
- RN-05
- RN-06
- RN-21
- RN-24

---

# RF-11 Gestión de pagos

## Incluye

- seleccionar método
- registrar pago
- generar comprobante

## Reglas

- RN-18
- RN-19
- RN-20

---

# RF-12 Consulta del estado del pedido

Muy sencillo.

## Incluye

- estado actual
- historial de estados
- actualización automática

## Reglas

- RN-13