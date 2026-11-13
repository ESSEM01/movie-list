# Movie List - Full Stack Application

Applicazione full-stack per la gestione di una lista di film preferiti.

## Stack Tecnologico

### Frontend (client/)
- **React 19** con TypeScript
- **Vite** per build e dev server
- **React Router v7** per routing
- **Context API** per state management

### Backend (server/)
- **AdonisJS 6** framework
- **TypeScript** nativo
- **Lucid ORM** per database
- **MariaDB/MySQL** database

## Struttura Progetto

```
movie-list/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── css/
│   ├── package.json
│   └── vite.config.ts
├── server/              # AdonisJS backend
│   ├── app/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   └── Middleware/
│   ├── database/
│   ├── start/
│   ├── config/
│   └── package.json
└── package.json         # Workspace root
```

## Setup Iniziale

### Prerequisiti
- Node.js >= 18
- npm >= 8
- MariaDB/MySQL server

### Installazione

```bash
# Installa tutte le dipendenze (client + server)
npm run install:all

# Oppure installa manualmente
npm install
cd client && npm install
cd ../server && npm install
```

### Configurazione Database

1. Crea un database MariaDB:
```sql
CREATE DATABASE movielist;
```

2. Configura `.env` in `server/`:
```env
DB_CONNECTION=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB_NAME=movielist
```

3. Esegui le migrations:
```bash
cd server
node ace migration:run
```

## Sviluppo

### Avvia entrambi i server

```bash
# Dalla root - avvia client (5173) + server (3333) insieme
npm run dev
```

### Avvia separatamente

```bash
# Solo frontend (porta 5173)
npm run dev:client

# Solo backend (porta 3333)
npm run dev:server
```

## Build Produzione

```bash
# Build completo (client + server)
npm run build

# Build separati
npm run build:client
npm run build:server
```

La build del client finisce in `server/public/`: in produzione il server Adonis serve sia le API (`/api/...`) sia il client dallo stesso indirizzo.

## Deploy

Render (piano free) + TiDB Cloud Starter: vedi [DEPLOY.md](DEPLOY.md). La configurazione Render e in [`render.yaml`](render.yaml).

## API Endpoints

Base URL: `http://localhost:3333/api`

### Autenticazione
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login

### Favorites
- `GET /api/favorites` - Lista preferiti (auth required)
- `POST /api/favorites` - Aggiungi preferito (auth required)
- `DELETE /api/favorites/:movieId` - Rimuovi preferito (auth required)

## Scripts Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia client + server in sviluppo |
| `npm run dev:client` | Solo frontend dev server |
| `npm run dev:server` | Solo backend dev server |
| `npm run build` | Build produzione completo |
| `npm run install:all` | Installa dipendenze workspace |

## Note Tecniche

- **CORS**: Il server accetta richieste da `http://localhost:5173` in sviluppo
- **Authentication**: JWT-based con bearer token
- **Database**: Lucid ORM con migrations per schema management
- **Type Safety**: TypeScript strict mode su entrambi i progetti

## Licenza

MIT
