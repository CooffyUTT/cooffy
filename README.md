<div align="center">

<img src="docs/cup-name-logo.svg" alt="Cooffy Logo" width="200" />

**Sistema Gestor de Comedores Escolares**

*"Menos fila, menos hambre."*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-REST-092E20?logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker)](https://www.docker.com/)
</div>

# 📖 Descripción

Cooffy es un servicio web que conecta a **estudiantes y personal** con el **área de cocina** de una cafetería escolar. Permite realizar pedidos anticipados antes del receso, eliminando las filas y reduciendo la presión operativa en cocina. El sistema es responsive y accesible desde computadora, tablet o teléfono.

# ⚡ Funcionalidades principales

- **Pedidos anticipados** — Los estudiantes piden su comida antes del receso
- **Gestión de menús** — Platillos con foto, descripción, precio y promociones
- **Carrito de compra** — El cliente arma su pedido y elige método de pago (tarjeta o efectivo)
- **Seguimiento de órdenes** — Trazabilidad en tiempo real: *En espera → En preparación → Terminado → Entregado*
- **Control de inventario** — Capacidad máxima por platillo; se deshabilita al agotarse
- **Dashboard administrativo** — Métricas de ventas, pedidos y platillos más vendidos por sucursal
- **Gestión multi-sucursal** — Administración centralizada de sucursales, usuarios y roles

# 🚀 Setup

## Requisitos

- Node.js ≥ 20
- pnpm ≥ 9
- Python ≥ 3.12
- Docker y Docker Compose

## Instalación

```bash
# Clonar el repo
git clone https://github.com/tu-usuario/cooffy.git
cd cooffy

# Variables de entorno
cp .env.example .env

# Frontend
cd frontend
pnpm install
pnpm dev          # http://localhost:3000

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://localhost:8000
```

## Postgres con Docker

```bash
docker-compose up -d
```

---

# 📁 Estructura

```
cooffy/
├── frontend/          # Next.js + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/       # Páginas y layouts (App Router)
│   │   ├── components/# Componentes React (shadcn/ui)
│   │   └── lib/       # Utilidades compartidas
│   └── public/        # Archivos estáticos
├── backend/           # API REST con Django + DRF
├── docker/            # Configuración de contenedores
├── docs/              # Documentación
└── docker-compose.yml
```

