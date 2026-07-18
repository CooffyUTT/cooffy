# RF-08 Consulta del menú

Responsable: @Gutierrez Palomares Luis Alberto  
Prioridad: alta  
Actor: Cliente (Alumno)

## Descripción

El requerimiento funcional **RF-08 Consulta del menú** tiene como propósito permitir que el usuario cliente pueda visualizar el menú actualizado de la cafetería desde la aplicación.

Para cumplir con esta funcionalidad, el sistema deberá considerar los siguientes aspectos:

- **Visualización del menú:** El sistema mostrará al cliente el catálogo de productos disponibles correspondientes a la sucursal seleccionada.
- **Información actualizada:** Los productos deberán obtenerse directamente desde la base de datos cada vez que se consulte el menú, con el objetivo de garantizar que la información presentada sea la más reciente y evitar inconsistencias con otros módulos del sistema, como el área de cocina.
- **Búsqueda y filtrado:** El usuario podrá utilizar diferentes filtros para localizar productos de forma rápida y sencilla, mejorando la experiencia de navegación.
- **Vista previa de productos:** El menú ofrecerá una vista resumida que permitirá mostrar la mayor cantidad posible de productos en pantalla, incluyendo información esencial como nombre, imagen y precio.
- **Vista detallada del producto:** Al seleccionar un producto, el sistema mostrará una vista con información más completa, como descripción, ingredientes, precio, disponibilidad y cualquier otro dato relevante para el cliente.
- **Agregar al carrito:** Tanto en la vista previa como en la vista detallada, el sistema deberá proporcionar un botón que permita agregar el producto al carrito de compras.

## Objetivo

El objetivo del requerimiento es poder mostrar todo el menú al cliente de manera eficiente y visualmente sencilla para poder seguir con el flujo de la compra de un producto, que sería con el paso del carrito.

## Flujo

1. Cliente inicia sesión dentro del sistema
2. Cliente es redirigido a la sección del menú
3. Cliente puede filtrar los productos
4. Cliente puede buscar producto especifico
5. Cliente puede entrar a los detalles del producto
6. Cliente añade el producto al carrito

## Dependencias

- RF - 01 Autenticación de usuarios
- RF - 05 Gestión del menú
- RF - 06 Gestión de disponibilidad de productos

## Restricciones

Para que este requerimiento funcional funcione se deben de contar con las siguientes condiciones:

- El usuario debe de estar logueado en el sistema para que pueda ver el menú.

## Reglas de negocio

- RN-08 Un producto deshabilitado no podrá agregarse a nuevos pedidos ni mostrarse como disponible en el menú.
- RN-09 Un producto podrá marcarse como promoción únicamente mientras permanezca activo.

| Nombre | Descripción | Prioridad |
| --- | --- | --- |
| Creación del end point para poder obtener los productos | Generar un end point con el cual se hace la comunicación del front end y back end para obtener la información de los alimentos | alta |
| Layout de las pantallas | Generar el diseño de la pantallas | alta |
| Realización de los diseños de los complementos de la pantalla | Realización de: productCard, banners, promociones, buscador | media |
| Buscador | Implementación funcional del buscador de la sección del menú | baja |
| Consultación de disponibilidad | Ver la disponibilidad de los productos y que en base a estos se muestren o no en el apartado del menú, o indicarle al usuario que el producto no esta disponible | media |
| Rendimiento | Optimización de la sección | alta |
| Consulta de ofertas | Consultar el que un producto tenga oferta y que se muestre en la sección del menú | media |