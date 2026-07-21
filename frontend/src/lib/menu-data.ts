/**
 * Datos de ejemplo para la pantalla del menú del comedor.
 * Se separan aquí (fuera del componente visual) para que el layout
 * quede limpio y sea fácil reemplazar esto por datos reales del
 * backend (Django) más adelante, sin tocar el diseño.
 *
 * A propósito no se usan íconos ni fotos de relleno: mientras no
 * haya fotos reales de los platillos, el menú se apoya solo en
 * texto (como un menú impreso), en vez de poner imágenes genéricas.
 */

// "todos" es una categoría especial que sirve para mostrar el menú completo.
export const CATEGORIES = [
  { id: "todos", name: "Todos" },
  { id: "desayuno", name: "Desayuno" },
  { id: "comida", name: "Comida" },
  { id: "snacks", name: "Snacks" },
  { id: "postres", name: "Postres" },
  { id: "bebidas", name: "Bebidas" },
];

export const PRODUCTS = [
  {
    id: 1,
    name: "Chilaquiles verdes",
    price: 45,
    description: "Totopos bañados en salsa verde, con pollo deshebrado y crema.",
    category: "desayuno",
    tag: "Favorito",
  },
  {
    id: 2,
    name: "Hot cakes",
    price: 35,
    description: "Tres hot cakes esponjosos con miel y mantequilla.",
    category: "desayuno",
    tag: "Clásico",
  },
  {
    id: 3,
    name: "Torta de milanesa",
    price: 55,
    description: "Milanesa de pollo empanizada, con jitomate, lechuga y aguacate.",
    category: "comida",
    tag: "Más pedido",
  },
  {
    id: 4,
    name: "Ensalada de pollo",
    price: 60,
    description: "Pechuga a la plancha, mezcla de lechugas, jitomate cherry y vinagreta.",
    category: "comida",
    tag: "Ligero",
  },
  {
    id: 5,
    name: "Papas gajo",
    price: 30,
    description: "Porción de papas gajo horneadas con especias, salsa incluida.",
    category: "snacks",
    tag: "Para compartir",
  },
  {
    id: 6,
    name: "Gelatina de mosaico",
    price: 20,
    description: "Gelatina casera de varios sabores, en vasito individual.",
    category: "postres",
    tag: "Casero",
  },
  {
    id: 7,
    name: "Café americano",
    price: 25,
    description: "Café de grano recién preparado, disponible caliente o frío.",
    category: "bebidas",
    tag: "Recomendado",
  },
  {
    id: 8,
    name: "Agua fresca de horchata",
    price: 20,
    description: "Preparada en casa cada mañana, sin conservadores.",
    category: "bebidas",
    tag: "Natural",
  },
];
