# RF-11 Gestión de pagos

Responsable: @Jabes Llamas Zamudio

Prioridad: Media/Alta  
Actor: Cliente

## Descripción

El cliente podrá seleccionar el método de pago de su preferencia al confirmar su pedido. El sistema permitirá realizar pagos electrónicos (Mockup) o seleccionar el pago en efectivo. En ambos casos se generará un comprobante con un número de pedido el cual le permitirá identificar el pedido al momento de recogerlo. Cuando el pago sea en efectivo, el personal de caja confirmará el pago antes de entregar el pedido

## Flujo

1. Cliente confirma su pedido
2. El sistema muestra los métodos de pago disponibles
3. Cliente selecciona el método de pago
4. Si el pago es electrónico, el sistema procesa la transacción
5. Si el pago es en efectivo, el sistema registra el pedido como Pendiente de pago
6. El sistema genera un comprobante con el número de pedido
7. Cliente presenta el comprobante al recoger su pedido
8. Si el pago es en efectivo, el cajero confirma el pago
9. El sistema cambia el estado del pedido a Pagado
10. El empleado entrega el pedido al cliente

## Dependencias y restricciones

Depende de:

- RF-01 Autenticación de usuarios
- RF-10 Registro de pedidos
- RF-07 Gestión de pedidos

Restricciones:

- RN-18 Todo pedido deberá registrar el método de pago seleccionado por el cliente
- RN-19 Un pedido únicamente podrá marcarse como pagado una vez confirmado el pago correspondiente
- RN-20 Todo pedido pagado generará automáticamente un comprobante de compra
- RN-22 Los cambios realizados deberán registrar la fecha y hora de la última modificación

