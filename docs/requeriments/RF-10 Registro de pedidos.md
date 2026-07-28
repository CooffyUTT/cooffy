# RF-10 Registro de pedidos

Responsable: @Gutierrez Palomares Luis Alberto  
Prioridad: alta  
Actor: Cliente (Alumno)

## Descripción

El requerimiento funcional **RF-10 Registro de pedidos** tiene como propósito permitir que un usuario cliente registre un pedido dentro del sistema para que este pueda ser procesado por la cafetería correspondiente.

Para cumplir con esta funcionalidad, el sistema deberá considerar los siguientes aspectos:

- **Registro del pedido:** El sistema permitirá al cliente confirmar el pedido generado a partir de los productos seleccionados en su carrito de compras.
- **Captura de información:** Al momento de registrar el pedido, el sistema almacenará la información necesaria, incluyendo el cliente que realiza la compra, los productos seleccionados, la sucursal donde serán recogidos, el método de pago elegido, la fecha y la hora en que se realizó el registro.
- **Validación del pedido:** Antes de registrar el pedido, el sistema deberá verificar que este cumpla con las reglas de negocio establecidas, como la existencia de productos en el carrito, la disponibilidad de los productos y las demás restricciones definidas para el proceso de compra.
- **Generación del registro:** Una vez validadas todas las condiciones, el sistema creará el pedido dentro de la base de datos y le asignará un identificador único que permitirá su seguimiento durante todo el proceso.
- **Confirmación al cliente:** Después de registrar el pedido, el sistema generará un comprobante o resumen que incluirá información relevante, como el identificador del pedido, los productos solicitados, el importe total, el estado inicial del pedido y la confirmación de que el registro fue realizado correctamente.
- **Notificación a la cafetería:** Una vez registrado el pedido, este será enviado a la cafetería correspondiente para que el personal de cocina pueda visualizarlo e iniciar la preparación de los productos solicitados.

## Flujo

1. El cliente entra al carrito de compras
2. El cliente confirma lo que va a comprar
3. El cliente selecciona método de pago
4. El cliente obtiene un resumen de la compra
5. El cliente confirma la compra
6. El cliente obtiene su recibo

## Dependencias y restricciones

Depende de:

- RF-08 Consulta del menú
- RF-09 Gestión del carrito
- RF-11 Gestión de pagos

Restricciones:

- RN-10 Un cliente únicamente podrá tener un pedido activo por sucursal al mismo tiempo.
- RN-05 Un pedido no podrá modificarse una vez confirmado.
- RN-06 Todo pedido deberá pertenecer a una única sucursal.
- RN-21 El número de pedido deberá ser único dentro de cada sucursal y fecha de operación.
- RN-24 Los pedidos únicamente podrán contener productos pertenecientes a la misma sucursal donde fueron realizados.
