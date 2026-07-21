import { Coffee, Croissant, Cookie, Utensils } from "lucide-react";

/**
 * Datos de ejemplo para la pantalla del menú.
 * Se separan aquí (fuera del componente visual) para que el layout
 * quede limpio y sea fácil reemplazar esto por datos reales del
 * backend (Django) más adelante, sin tocar el diseño.
 */

// Categorías del menú. El "id" se usa para filtrar los productos.
export const CATEGORIES = [
  { id: "coffee", name: "Café", icon: Coffee },
  { id: "breakfast", name: "Desayuno", icon: Croissant },
  { id: "snacks", name: "Bocadillos", icon: Cookie },
  { id: "lunch", name: "Comida", icon: Utensils },
];

// Productos de ejemplo (placeholder). Cada uno pertenece a una categoría.
export const PRODUCTS = [
  {
    id: 1,
    name: "Caramel Macchiato",
    price: 4.5,
    description: "Espresso intenso con leche cremosa y un toque de caramelo.",
    category: "coffee",
    tag: "Opción vegana",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8JmSFAQJ4gECn2fi0GPQBXugfeF5xL8LDAeKCm1jbNOxCEo218CcraepK28dQmJSlez8g9EDHeP9XT4LpjmxbKep1jyMmIV5hG9mCMGp7a0MLySxy6szDAn32V-qZAdbTr7ZjW3h2IZNhAMHdINB7UlMYugJ27faQtjxrnS-fBD8-F9ax-apaSiHCYjD5XUwGvMlWoefZ3J3VG4Hv6hpnEz73mxfd9xF6_ZJ1Pp3iL8NFCtcsVPC6p1pq-XlsKsxq-WeXOOXn0s",
  },
  {
    id: 2,
    name: "Classic Cortado",
    price: 3.75,
    description: "Partes iguales de espresso y leche vaporizada, en perfecto equilibrio.",
    category: "coffee",
    tag: "Especialidad de la casa",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBy4QtO7MpYEJmGHVtlIBBav4B11eKe3gefa9VthkfhtqpP86oFkRlVAAhJN6uwzM0l5C6MJ2VaIQjrSkm1Aqy4lVpNxmPrZPsxyny604U8BfkpY75wWsezVSzIE0NgP80lPhv5uNBeFY-ruLBdgUcTkMJ820zHwmm49jLYejb1Ok1HizOSQXCBHY4hyXX1q7I1urxL6Gc495l1EwuNV0tlkiwOH0j-wVt2Y0Gr_LfYzruSWKo4sjExx0NFQNpZsKlJi6Qu9RDQ8cc",
  },
  {
    id: 3,
    name: "Avocado Smash",
    price: 8.2,
    description: "Pan de masa madre con aguacate fresco, hojuelas de chile y huevo pochado.",
    category: "breakfast",
    tag: "Más vendido",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYnS9yu9-7BMZ8QRVpJWGvDA990GfiIP3Oqd1yoiOuWul-yasgmbzucbmQBUut2m4dmjimDZ66QVtIWOgm-tRQORjSCF6vaM9jFbUUKeDYMj4HQgCKO35ezGXW-rVtwlmBQDt9Yw912AQuF29HMo4OxtYReSfOc-kh89Bh0rNbSKlW-HYRAsXnaWohrDPsiL7kEkx1ftmYzqJkRhvkKNCvWNwGKl285M6pIu0DRYqKfiICIvV4bFEhMVvj8aeRZCZYu_vPLGx52qk",
  },
];
