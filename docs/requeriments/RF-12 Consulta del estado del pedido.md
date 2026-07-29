# RF-12 Consulta del estado del pedido

Responsable: @Gutierrez Palomares Luis Alberto  
Prioridad: media  
Actor: Cliente (Alumno)

## Descripción

El requerimiento funcional **RF-12 Consulta del estado del pedido** tiene como propósito permitir que el usuario cliente pueda consultar el estado actual de un pedido previamente registrado dentro del sistema, con el fin de dar seguimiento a su proceso de preparación y conocer el momento adecuado para recogerlo en la cafetería.

Para cumplir con esta funcionalidad, el sistema deberá considerar los siguientes aspectos:

- **Consulta del pedido:** El sistema permitirá al cliente visualizar el estado actual de los pedidos que haya realizado previamente, mostrando únicamente la información correspondiente a su cuenta.
- **Seguimiento del pedido:** El cliente podrá consultar el progreso de su pedido durante las diferentes etapas del proceso de preparación, permitiéndole conocer el avance hasta su entrega.
- **Visualización de información:** El sistema mostrará información relevante del pedido, como los productos adquiridos, la fecha y hora en que fue registrado y el estado actual del pedido.
- **Tiempo estimado de preparación:** El sistema mostrará un tiempo estimado para que el cliente tenga una referencia aproximada de cuándo su pedido estará listo para ser recogido.
- **Actualización del estado:** La información presentada deberá mantenerse sincronizada con el estado registrado por el personal de la cafetería, de manera que el cliente consulte siempre el progreso más reciente de su pedido.

## Flujo

1. El usuario realiza su compra
2. Se habilita la sección del estado del pedido
3. El usuario puede revisar el estado del pedido
4. El usuario observa los cambios en tiempo real
5. Una vez el estado del pedido llegue a “listo“, el usuario puede pasar a recoger sus productos

## Dependencias y restricciones

Depende de:

- RF-10 Registro de pedidos

Restricciones:

- RN-13 Los pedidos seguirán únicamente la secuencia de estados definida por el sistema.
