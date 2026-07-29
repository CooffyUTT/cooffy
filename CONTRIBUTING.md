# Contributing

Guía de contribución para el equipo. Cada requerimiento funcional (RF) se trabaja como un issue padre; el encargado lo desglosa en subtareas y cada subtarea se resuelve con un PR atómico.

## Asignación de RFs

Cada miembro del equipo es **encargado** de uno o más RFs definidos en [`docs/requerimientos.md`](docs/requerimientos.md). El encargado:

- Es dueño del issue principal del RF.
- Define y documenta las subtareas necesarias.
- Coordina revisiones de los PRs que aborden su RF.

La asignación actual se encuentra en cada archivo de detalle bajo [`docs/requeriments/`](docs/requeriments/) (campo `Responsable`).

## Flujo de trabajo

```
RF (issue padre) → Subtareas (checklist en el issue) → PR por subtarea → Review → Merge a develop
```

### 1. Crear el issue del RF

- Un issue por RF con título `RF-XX: Descripción`.
- Incluir en la descripción un checklist con las subtareas previstas.

### 2. Subtareas y ramas

Cada subtarea se resuelve en una rama con el prefijo que corresponda:

| Prefijo | Uso |
|---------|-----|
| `feature/` | Subtarea que implementa funcionalidad nueva |
| `fix/` | Corrección de bugs |
| `docs/` | Cambios en documentación |
| `chore/` | Configuración, dependencias, tooling |
| `refactor/` | Mejora interna sin cambiar comportamiento |
| `test/` | Agregar o modificar pruebas |

**Nomenclatura de rama:** `<prefijo>/rf-XX-breve-descripcion`  
Ejemplos: `feature/rf-01-login-endpoint`, `fix/rf-01-token-expiry`, `chore/rf-05-product-seed`

### 3. PR por subtarea

- Un PR resuelve **una sola subtarea**. No mezcles múltiples funcionalidades en un PR.
- El título sigue [Conventional Commits](#conventional-commits).
- En la descripción, referencia el issue padre con `Closes #<issue>` o `Relates to #<issue>`.

### 4. Revisión y merge

- De preferencia una aprobación del encargado del RF (o de otro miembro si el encargado es el autor).
- Merge a `develop`. No hacer merge directo a `main`.
- Eliminar la rama después del merge.

## Trabajo fuera de RFs

No todo requiere un issue de RF. Se aceptan PRs directos para:

- Correcciones de bugs no relacionados a una tarea activa (`fix/`).
- Mejoras de documentación (`docs/`).
- Tooling, CI, o configuración (`chore/`).
- Refactors menores (`refactor/`).

Estos PRs siguen las mismas reglas de rama, formato de commit y revisión. Si el cambio es significativo, abre un issue simple para discusión previa.

## Conventional Commits

Commits y títulos de PR usan el formato:

```
<tipo>: <descripción breve>

[cuerpo opcional]
```

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Solo documentación |
| `chore:` | Dependencias, config, tooling |
| `refactor:` | Cambio interno sin afectar funcionalidad |
| `test:` | Agregar o modificar tests |
| `style:` | Formato, punto y coma, etc. |

## Configuración del entorno

Seguir [`README.md`](README.md#-setup). En resumen:

```bash
cp .env.example .env
pnpm init:all
```

Comandos diarios desde la raíz del repo (no hacer `cd backend` manualmente):

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Backend + frontend juntos |
| `pnpm back` | Solo backend (Django runserver) |
| `pnpm front` | Solo frontend (Next.js dev) |
| `pnpm back:manage <cmd>` | Proxy a `manage.py` |
| `pnpm --dir frontend lint` | ESLint en frontend |

## Convenciones de código

- **Backend:** Django 6 + DRF. Apps en `backend/apps/`. No crear `backend/.env`; usar `.env` raíz. Comandos via `pnpm back:*`.
- **Frontend:** Next.js 16 App Router. Usar alias `@/*` para imports. Componentes shadcn/ui vía CLI, no a mano.
- **Ambos:** Ver [`AGENTS.md`](AGENTS.md) para detalles específicos de tooling, modelo de usuario, seeds, y gotchas del proyecto.
