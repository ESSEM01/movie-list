# AI Coding Instructions - Movie List Full Stack

## Architecture Overview

**Monorepo Structure:** Frontend (React) + Backend (AdonisJS)

### Frontend (client/)
- **Tech Stack:** React 19 + TypeScript + Vite + React Router v7
- **State:** Context API for global state management
- **API Client:** Fetch-based service layer connecting to AdonisJS backend

### Backend (server/)
- **Tech Stack:** AdonisJS 6 + TypeScript + Lucid ORM + MariaDB
- **Auth:** JWT-based authentication
- **API:** RESTful endpoints for favorites and user management

**Data Flow:**
```
Client Browser
  └─> React Components
      └─> useMovieContext / API Services
          └─> HTTP Requests (fetch)
              └─> AdonisJS Controllers
                  └─> Lucid Models
                      └─> MariaDB Database
```

## Key Files & Responsibilities

### Frontend (client/)
| File | Purpose |
|------|---------|
| [client/src/App.tsx](client/src/App.tsx) | Router setup + MovieProvider wrapper |
| [client/src/contexts/MovieContext.tsx](client/src/contexts/MovieContext.tsx) | Favorites state + API integration |
| [client/src/services/api.ts](client/src/services/api.ts) | TMDB API + Backend API client |
| [client/src/components/MovieCard.tsx](client/src/components/MovieCard.tsx) | Reusable movie display |
| [client/src/pages/Home.tsx](client/src/pages/Home.tsx) | Movie discovery |
| [client/src/pages/Favorites.tsx](client/src/pages/Favorites.tsx) | User favorites from backend |

### Backend (server/)
| File | Purpose |
|------|---------|
| [server/start/routes.ts](server/start/routes.ts) | API endpoint definitions |
| [server/app/Controllers/](server/app/Controllers/) | Request handlers (Auth, Favorites) |
| [server/app/Models/](server/app/Models/) | Lucid ORM models (User, Favorite) |
| [server/database/migrations/](server/database/migrations/) | Database schema migrations |
| [server/config/cors.ts](server/config/cors.ts) | CORS configuration for client |

## Project-Specific Patterns

### 1. Context Usage (Not Redux/Zustand)
- **Initialize state** from localStorage in `useState` lazy initializer (not in useEffect)
- **Sync to localStorage** only via useEffect with dependency on state
- **Error handling:** `useMovieContext` throws if used outside MovieProvider
- Example: See [src/contexts/MovieContext.tsx](src/contexts/MovieContext.tsx#L14-L21)

### 2. Movie Type Definition
```typescript
type Movie = { 
  id: number
  title: string
  release_date: string
  poster_path?: string
  url?: string 
}
```
Used in both context and page components. Keep consistent across files.

### 3. Component Structure
- **Pages** ([src/pages](src/pages)) handle data fetching, loading/error states
- **Components** ([src/components](src/components)) are presentational, consume context via `useMovieContext()`
- **CSS modules** organized by component in [src/css](src/css) with naming: `ComponentName.css`

### 4. API Integration Pattern
- Export async functions from [src/services/api.ts](src/services/api.ts) with consistent naming
- TMDB API key embedded (non-sensitive, public API)
- Always encode search queries: `encodeURIComponent(query)`
- Return `data.results` array from API responses

### 5. Styling Approach
- **CSS files** (not CSS-in-JS) paired with components
- Common styles in [src/css/index.css](src/css/index.css)
- Utility: `className={`favorite-btn ${favorite ? "active" : ""}`}` pattern for conditional styles

## Build & Development Workflows

### Workspace Scripts (root package.json)
- `npm run dev` — Start both client (5173) + server (3333) concurrently
- `npm run dev:client` — Frontend only (Vite dev server)
- `npm run dev:server` — Backend only (AdonisJS watch mode)
- `npm run build` — Build both projects for production
- `npm run install:all` — Install all workspace dependencies

### Frontend Scripts (client/)
- `npm run dev` — Vite dev server with HMR
- `npm run build` — TypeScript check + production build
- `npm run lint` — ESLint check

### Backend Scripts (server/)
- `npm run dev` — AdonisJS with auto-reload (`node ace serve --watch`)
- `npm run build` — Compile TypeScript to build/
- `node ace migration:run` — Run database migrations
- `node ace make:controller Name` — Generate controller
- `node ace make:model Name` — Generate model + migration

### Important Notes
- **Ports:** Client (5173), Server (3333) - configured in CORS
- **Database:** Migrations required before first run
- **Environment:** Both client and server need `.env` files
- **Type Safety:** TypeScript strict mode across the monorepo

## Common Tasks

### Add a New API Endpoint
1. Create/update controller in [server/app/Controllers](server/app/Controllers)
2. Define route in [server/start/routes.ts](server/start/routes.ts)
3. Update frontend API client in [client/src/services/api.ts](client/src/services/api.ts)
4. Add authentication middleware if needed: `.middleware('auth')`

### Add a New Frontend Feature
1. Add function to [client/src/services/api.ts](client/src/services/api.ts) following existing patterns
2. Import in page component (e.g., [client/src/pages/Home.tsx](client/src/pages/Home.tsx))
3. Handle loading/error states consistently
4. Create CSS file in [client/src/css](client/src/css) if needed

### Database Changes
1. Create migration: `cd server && node ace make:migration migration_name`
2. Edit migration file in [server/database/migrations](server/database/migrations)
3. Run migration: `node ace migration:run`
4. Update Lucid model in [server/app/Models](server/app/Models)

### Modify Favorites State
- **Backend:** Update [FavoritesController](server/app/Controllers/FavoritesController.ts) and routes
- **Frontend:** Always update via `MovieContext` methods: `addToFavorites()`, `removeFromFavorites()`, `isFavorite()`
- **API Integration:** Fetch from backend instead of localStorage

### Add New Page
1. Create in [client/src/pages](client/src/pages) following [client/src/pages/Home.tsx](client/src/pages/Home.tsx) structure
2. Add Route in [client/src/App.tsx](client/src/App.tsx)
3. Link in [client/src/components/NavBar.tsx](client/src/components/NavBar.tsx)
4. Use `useMovieContext()` if favorites needed

## Constraints & Conventions
- **Monorepo structure** — Use npm workspaces for dependency management
- **Backend persistence** — MariaDB via Lucid ORM (no more localStorage)
- **Authentication** — JWT-based, middleware protected routes
- **TMDB API free tier** — Respect rate limits for movie data
- **TypeScript strict mode** — Define types explicitly across both projects
- **CORS configured** — Client (5173) ↔ Server (3333) in development
