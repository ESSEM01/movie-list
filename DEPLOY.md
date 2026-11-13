# Deploy su Render con TiDB Cloud

Questa guida mette online Movie List gratis, con:

- **Render** (piano free): un solo web service. Il server AdonisJS risponde su `/api/...` e serve anche il client React dallo stesso indirizzo.
- **TiDB Cloud Starter**: database compatibile MySQL, gratuito, raggiungibile su internet con TLS.

La configurazione di Render e gia nel file [`render.yaml`](render.yaml) (un "Blueprint"): non devi scrivere comandi di build, solo inserire qualche valore.

Tempo stimato: 20-30 minuti.

## Cosa ti serve

- La repo su GitHub, con `render.yaml` sul branch che vuoi pubblicare (di solito `main`).
- Un account [TiDB Cloud](https://tidbcloud.com) (puoi entrare con Google o GitHub).
- Un account [Render](https://render.com) collegato al tuo GitHub.
- Una chiave API di TMDB: <https://www.themoviedb.org/settings/api>. Va bene sia la "API Key" (v3) sia il "Read Access Token" (v4).

## 1. Crea il database su TiDB Cloud

1. Entra in TiDB Cloud e apri la pagina **My TiDB**.
2. Crea una nuova istanza di tipo **Starter** (gratuita).
   - Cloud provider: **AWS**.
   - Regione: una europea, per esempio **Frankfurt (eu-central-1)**. Render girera a Francoforte: database e server vicini rendono l'app piu veloce.
   - Dai un nome all'istanza (es. `movie-list`) e conferma. Dopo qualche secondo l'istanza e pronta.
3. Clicca sul nome dell'istanza, poi su **Connect** in alto a destra. Nella finestra che si apre controlla che:
   - **Connection Type** sia `Public`;
   - **Connect With** sia `General`.
4. Se non hai ancora una password, clicca **Generate Password**. Copiala subito in un posto sicuro (un password manager): TiDB non te la mostrera piu.
5. Dalla stessa finestra annota:
   - **Host**: qualcosa come `gateway01.eu-central-1.prod.aws.tidbcloud.com`;
   - **Port**: `4000`;
   - **User**: ha un prefisso davanti, per esempio `2aBcDeFgHiJkLmN.root`. Copialo **tutto**, prefisso e punto compresi: senza prefisso il login fallisce.
6. Crea il database dell'app. Apri il **SQL Editor** dell'istanza (nel menu a sinistra) ed esegui:

   ```sql
   CREATE DATABASE movie_list;
   ```

   Le tabelle non vanno create a mano: le crea l'app al primo avvio (migration).

> Non serve scaricare il certificato CA: TiDB Cloud Starter usa un certificato firmato da un'autorita pubblica, che Node.js riconosce da solo. Basta che il TLS sia attivo, e `render.yaml` lo attiva gia con `DB_SSL=true`.

## 2. Crea il servizio su Render

1. Nella dashboard di Render clicca **New** > **Blueprint**.
2. Collega il tuo account GitHub (se non l'hai gia fatto) e scegli la repo `movie-list`.
3. Scegli il branch che contiene `render.yaml` (di solito `main`) e dai un nome al Blueprint.
4. Render legge `render.yaml` e mostra il servizio `movie-list` (web service, piano free, regione Frankfurt). Ti chiede i valori che non sono nel file perche segreti o personali:

   | Variabile | Cosa inserire |
   |---|---|
   | `DB_HOST` | l'host copiato da TiDB (passo 1.5) |
   | `DB_USER` | l'utente completo di prefisso, es. `2aBcDeFgHiJkLmN.root` |
   | `DB_PASSWORD` | la password generata su TiDB |
   | `DB_DATABASE` | `movie_list` |
   | `TMDB_API_KEY` | la tua chiave TMDB |

   Le altre variabili sono gia impostate dal file: `NODE_ENV`, `NODE_VERSION`, `HOST`, `LOG_LEVEL`, `SESSION_DRIVER`, `LIMITER_STORE`, `DB_CONNECTION`, `DB_SSL`, `DB_PORT`. `APP_KEY` viene generata da Render in automatico; `PORT` la decide Render.

5. Conferma con **Apply** (o **Deploy Blueprint**). Parte il primo deploy.

## 3. Il primo deploy

Nella pagina del servizio, scheda **Logs**, vedrai in ordine:

1. **Build** (qualche minuto): installazione delle dipendenze, build del client React, build del server. Finisce con `Build successful`.
2. **Avvio**: prima le migration sul database, con righe come `migrated database/migrations/..._create_users_table` e `Migrated in ... ms`; poi `started HTTP server on 0.0.0.0:10000`.
3. Render controlla `/api/health`. Quando risponde, il servizio diventa **Live**.

L'indirizzo pubblico e in alto nella pagina del servizio, tipo `https://movie-list-xxxx.onrender.com`. Aprilo, registrati e prova ad aggiungere un film ai preferiti.

Per controllare a mano che il server risponda: `https://movie-list-xxxx.onrender.com/api/health` deve mostrare `{"hello":"Movie List API","version":"1.0.0"}`.

Ogni push sul branch collegato fa partire un nuovo deploy in automatico.

### Se qualcosa va storto

- **Il deploy fallisce durante le migration** con errori di connessione: ricontrolla `DB_HOST`, `DB_USER` (con il prefisso!) e `DB_PASSWORD` in **Environment** sulla pagina del servizio, poi **Manual Deploy** > **Deploy latest commit**.
- **`Unknown database 'movie_list'`**: manca il passo 1.6.
- **La pagina si apre ma i film non compaiono**: controlla `TMDB_API_KEY`.

## 4. Cosa aspettarsi dal piano free

- **Il servizio si addormenta.** Dopo 15 minuti senza visite Render lo spegne. La visita successiva lo risveglia, ma serve circa un minuto: il primo caricamento e lento, i successivi sono normali.
- **Il rate limit riparte da zero a ogni riavvio.** I contatori dei tentativi di login (limiter `memory`) stanno nella memoria del processo, quindi si azzerano quando il servizio si addormenta, si riavvia o viene rideployato.
- **Le sessioni invece sopravvivono ai riavvii.** Con `SESSION_DRIVER=cookie` la sessione e salvata, cifrata con `APP_KEY`, nel cookie del browser, non nel server: finche `APP_KEY` non cambia gli utenti restano collegati (fino alla scadenza di 2 ore). Se rigeneri `APP_KEY` tutti dovranno rifare login.
- **Il disco non e persistente**: tutto quello che conta sta su TiDB, quindi non perdi dati.
- **Il piano free di TiDB Cloud Starter** ha una quota mensile gratuita di storage e di richieste, ampiamente sufficiente per un progetto personale.

## Verifica facoltativa: IP dietro il proxy di Render

Il limite di tentativi di login e calcolato per indirizzo IP, letto dall'header `X-Forwarded-For` che aggiunge il proxy di Render (vedi `trustProxy` in `server/config/app.ts`). Per controllare che un client non possa scegliersi l'IP da solo, da un terminale con bash:

```bash
URL=https://movie-list-xxxx.onrender.com
for i in $(seq 1 22); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "$URL/api/auth/login" \
    -H 'Content-Type: application/json' \
    -H "X-Forwarded-For: 203.0.113.$i" \
    -d "{\"email\":\"prova$i@example.com\",\"password\":\"sbagliata\"}"
done
```

- Se le ultime righe sono `429`: tutto bene, il server usa il tuo IP reale e ignora quello inventato.
- Se sono tutte `401`: il proxy conserva l'header inviato dal client e il limite per IP si puo aggirare. Segnalalo: va cambiata l'impostazione `trustProxy`.
