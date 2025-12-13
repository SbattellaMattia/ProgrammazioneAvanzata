# Sviluppo di un sistema backend per la gestione di parcheggi
<div align="center">
  <img src="https://www.eltrasistemi.com/images/cms/skins/eltra/images/cms/pages/entry-pay-exit.svg" alt="Logo del progetto" width="400"/>
</div>

######
[![Postgres](https://img.shields.io/badge/Made%20with-postgres-%23316192.svg?style=plastic&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NPM](https://img.shields.io/badge/Made%20with-NPM-%23CB3837.svg?style=plastic&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![NodeJS](https://img.shields.io/badge/Made%20with-node.js-6DA55F?style=plastic&logo=node.js&logoColor=white)](https://nodejs.org/en)
[![Express.js](https://img.shields.io/badge/Made%20with-express.js-%23404d59.svg?style=plastic&logo=express&logoColor=%2361DAFB)](https://expressjs.com/it/)
[![JWT](https://img.shields.io/badge/Made%20with-JWT-black?style=plastic&logo=JSON%20web%20tokens)](https://jwt.io/)
[![TypeScript](https://img.shields.io/badge/Made%20with-typescript-%23007ACC.svg?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sequelize](https://img.shields.io/badge/Made%20with-Sequelize-52B0E7?style=plastic&logo=Sequelize&logoColor=white)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Made%20with-docker-%230db7ed.svg?style=plastic&logo=docker&logoColor=white)](https://www.docker.com/)
[![Postman](https://img.shields.io/badge/Made%20with-Postman-FF6C37?style=plastic&logo=postman&logoColor=white)](https://www.postman.com/)
[![Tesseract](https://img.shields.io/badge/Made%20with-Tesseract-230db7?style=plastic&logo=google&logoColor=white)](https://www.npmjs.com/package/node-tesseract-ocr/)


Il presente progetto è stato realizzato per l’esame di Programmazione Avanzata (A.A. 2024/2025) presso il corso di Laurea Magistrale in Ingegneria Informatica e Automazione (LM-32) dell’Università Politecnica delle Marche. 
  


## Indice

- [Obiettivi di progetto](#obiettivi-di-progetto)
- [Struttura del progetto ](#struttura-del-progetto)
  - [Architettura dei servizi](#architettura-dei-servizi)
  - [Pattern utilizzati](#pattern-utilizzati)
  - [Diagrammi UML](#diagrammi-uml)
    - [Diagramma dei casi d'uso](#diagramma-dei-casi-duso)
    - [Diagramma E-R](#diagramma-e-r)
    - [Diagrammi delle sequenze](#diagrammi-delle-sequenze)
- [API Routes](#api-routes)
- [Configurazione e uso](#configurazione-e-uso)
- [Strumenti utilizzati](#strumenti-utilizzati)
- [Autori](#autori)


# Obiettivi di progetto

  
# Struttura del progetto
Di seguito è riportata la struttura delle directory del progetto:

```plaintext

```

# Architettura dei servizi
Il sistema di gestione delle dei parcheggi è basato su un'architettura client-server. Il back-end è stato sviluppato utilizzando Node.js con il framework Express e si occupa di gestire tutte le funzionalità principali necessarie a realizzare le specifiche di progetto.

**Componenti principali**

//DA VEDERE

# Pattern utilizzati

Per assicurare un’architettura flessibile, manutenibile e facilmente estendibile, il progetto adotta diversi pattern architetturali e di design, adattati al contesto di un backend Node.js/Express con TypeScript, Sequelize e JWT.

## Model–Service–Controller (adattamento MVC)

Nel progetto è stato adottato un **MVC “modificato”**, sostituendo la tradizionale *View* con un **Service Layer** dedicato alla logica applicativa, così da mantenere i controller il più sottili possibile. In aggiunta, è stato pensato uno **Schema Validation Layer** per la validazione dei parametri della richiesta.

- **Model**: rappresenta le entità del dominio (parcheggi, posti auto, utenti, transiti, prenotazioni, ecc.) tramite i model Sequelize.

- **Controller**: espone le API REST (route Express), si occupa di parsing della request (params, query, body), validazioni leggere e delega al service corrispondente senza contenere logica di business complessa.

- **Service**: incapsula le regole di business e l’orchestrazione tra DAO, provider esterni (es. OCR Tesseract) e componenti infrastrutturali, restituendo ai controller risultati già “pronti” per la serializzazione HTTP.

- **Schema Validation Layer**: definisce schemi (z.object, z.string, ecc.) che descrivono la forma dei Models o dei DTO (request body, query params, payload JWT). Ogni richiesta passa dagli *schema* prima di arrivare alla business logic (vedi middleware **validate**).

Questa separazione migliora testabilità (test sui service senza passare dallo strato HTTP) e facilita l’evoluzione delle API mantenendo stabile la logica core nel layer di servizio.

## Data Access Object (DAO)

Per l’accesso ai dati è stato introdotto esplicitamente un **DAO Layer**, scelto in alternativa a un pattern **Repository**. Trovandoci esattamente tra i modelli di Sequelize e i Service entrambe le scelte sarebbero state perfettamente compatibili.

Infatti in fase di progettazione è stata valutata la possibilità di usare **DAO + Repository** o solo Repository; si è deciso di **non "duplicare" i layer** e di preferire un **DAO stretto sul modello di persistenza**:

- Il **DAO** lavora a diretto contatto con Sequelize (query, transazioni, opzioni `where`, `include`, `order`, `limit` ecc.), fornendo metodi specifici per il dominio.
- Lo **strato più vicino alla business logic** resta il service: la scelta di evitare un ulteriore repository evita un “doppio mapping” (DAO → Repository → Service) che, in un progetto di queste dimensioni, avrebbe aggiunto complessità senza reali benefici.

In questo modo, il DAO incapsula i dettagli dell’ORM e offre un’astrazione sufficiente per cambiare implementazione (o ottimizzare query) senza impattare i service, mentre le regole di business rimangono concentrate in un solo livello superiore.

Nel nostro progetto è stata astratta anche una classe DAO.ts che permette di specidicare una volta sola i metodi più generici dei modelli tipizzati grazie alle **`generics <T>`**:

```typescript
export abstract class DAO<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.executeQuery(
      async () => await this.model.findByPk(id),
      'findById'
    );
  }
  ...

```
Aggiungendo anche qualche metodo personalizzato per ricercare e filtrare insieme.
```typescript
...

async findInDateRange(
    dateField: keyof T['_attributes'],
    from?: Date,
    to?: Date,
    additionalWhere: WhereOptions<T> = {}
  ): Promise<T[]> {
    return this.executeQuery(async () => {
      
      const whereClause: any = { ...additionalWhere };

      if (from || to) {
        whereClause[dateField] = {};
        if (from) whereClause[dateField][Op.gte] = from; 
        if (to) whereClause[dateField][Op.lte] = to;  
      }

      const options: FindOptions = {
        where: whereClause,
        order: [[dateField as string, 'DESC']]
      };

      return await this.model.findAll(options);
    }, 'findInDateRange');
  }
```
> Da notare come ```dateField: keyof T['_attributes']``` garantisca che sia un'attributo del modello.

## Singleton

Per la gestione della **connessione al database** (istanza Sequelize) è stato utilizzato il **Singleton Pattern**. 

- La classe di infrastruttura (es. `Database`) espone un metodo statico `getInstance()` che inizializza l’istanza alla prima chiamata e la riusa per tutte le richieste successive.
- Il costruttore è reso non direttamente utilizzabile dall’esterno (privato), così da forzare il passaggio dal factory statico.

Questo approccio evita multiple connessioni concorrenti, garantisce un unico punto di configurazione semplificando l’iniezione della dipendenza nei DAO.

```typescript
class DatabaseConnection {
    private static instance: Sequelize;

    private constructor() {}

    public static getInstance(): Sequelize {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new Sequelize({
                dialect: dbConfig.dialect,
                host: dbConfig.host,
                port: dbConfig.port,
                username: dbConfig.username,
                password: dbConfig.password,
                database: dbConfig.database,
                logging: dbConfig.logging,
            });
        }
        return DatabaseConnection.instance;
    }
}
```

## Async Handler (Wrapper)

Per evitare boilerplate con `try/catch` ripetuti in tutti i controller è stato introdotto un **wrapper per gli handler asincroni** (`asyncHandler`), che rappresenta un piccolo **pattern di Higher-Order Function** applicato ai middleware Express.

- Il wrapper riceve un handler asincrono `(req, res, next) => Promise<any>` e restituisce una funzione che gestisce `Promise.resolve` che verrà presa dal Middleware che gestisce gli errori.

- In questo modo i controller/rest-handler possono essere scritti come funzioni async “pulite” senza blocchi di gestione errori duplicati; la responsabilità di trasformare l’errore in risposta HTTP viene centralizzata nell’error middleware e nelle factory di errori.

Questo pattern è concettualmente assimilabile a un **decorator/wrapper** intorno agli handler Express, focalizzato sulla gestione uniforme degli errori asincroni.

``` typescript  
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## Factory (AppErrors personalizzati)

La gestione degli errori applicativi fa uso di una **Factory per errori personalizzati**, che crea istanze di una gerarchia di `AppError` con metadata coerenti (HTTP status, codice interno, messaggio, tipo).

- Una `ErrorFactory` espone metodi statici come `BadRequest`, `Unauthorized`, `Forbidden`, ciascuno dei quali costruisce un oggetto errore tipizzato con status code, messaggio e dettagli aggiuntivi.
- Controller e service non istanziano direttamente errori grezzi, ma invocano la factory (), migliorando coerenza e tracciabilità.

Il middleware globale di errore riconosce questi AppError, mappa lo status HTTP corretto e serializza una risposta JSON uniforme per tutto il backend.

``` typescript  
export class NotFoundError extends AppError {
  constructor(resource: string = 'Risorsa', identifier?: string | number) {
    const message = identifier ? (`${resource} con identificativo ${identifier} non trovato`): (`${resource} non trovato`);
    super(message, StatusCodes.NOT_FOUND);
  }

...

throw new NotFoundError('Utente', id);

...
```

## Chain of Responsibility (middleware Express)

La pipeline HTTP è modellata come una **Chain of Responsibility** tramite lo stack di middleware Express, dove ogni middleware rappresenta un handler nella catena che può:

1. Gestire completamente la richiesta (e terminare la risposta), oppure
2. Effettuare controlli/modifiche e delegare al successivo con `next()`.

Nel progetto la catena viene utilizzata per gestire step ortogonali sulla richiesta:

- **AuthMiddleware**: si occupa dell' estrazione e validazione del JWT caricando l’utente corrente nel `Request` context.

- **RoleMiddleware**: si occupa di controllare il ruolo dell'utente che sta effettuando la richiesta. Se non ha i diritti per la specifica rotta viene lanciato l'errore.

- **InvalidRouteMiddleware**: si occupa di controllare se la richiesta matcha con una rotta esistente.

- **TokenMiddleware**: scala esattamente un token per richiesta (modificabile). Anche se il sistema dovesse generare un errore il token viene scalato.

- **ErrorsMiddleware**: cattura qualsiasi eccezione e la trasforma in risposta HTTP, usando le `AppError` generate dalla factory.

- **EnsureExist**: si occupa di vedere se l'`id` che viene passato nella richiesta esista davvero. In ingresso prende il `Service` corrispondente. Grazie a questo middleware il `Controller` ha già l'id della richiesta e (nel caso di richieste semplici come la Get di un singolo oggetto), può restituirlo direttamente senza ripetere la pipeline di ricerca.

- **Validate**: si occupa di validare in modo centralizzato la richiesta e i suoi parametri, garantendo che arrivino al service già nel formato e nel dominio atteso. In questo modo si eliminano gran parte dei controlli “manuali” nei service e si semplificano le operazioni di creazione (POST) e aggiornamento (PUT) degli oggetti, permettendo anche payload più ricchi rispetto al minimo richiesto dalle specifiche.​ **Zod** viene utilizzato per definire schemi riutilizzabili (DTO di input) che descrivono forma, tipo e vincoli dei dati; per ogni schema è possibile marcare campi come opzionali, obbligatori o vietati, ad esempio impedendo che l’id venga passato o modificato dall’utente.



# Diagrammi UML
# Diagramma dei casi d'uso


# Diagramma E-R


# Diagrammi delle sequenze
## NE BASTANO 4 PRINCIPALI

# API Routes
| Verbo HTTP | Endpoint | Descrzione | Autenticazione JWT |
|:----------:|:--------:|:-----------:|:------------------:|
| POST| `/login`|Autenticazione dell'utente tramite email e password. | ❌ |
| GET| `/parking`| Recupero di tutti i parcheggi. | ✅ |
| GET| `/parking:id`| Recupero dello specifico parcheggio. | ✅ |


# POST /login
**Parametri**
| Posizione | Nome    | Tipo     | Descrizione  |Obbligatorio  |
|:---------:|:-------:|:--------:|:------------:|:------------:|
|Richiesta nel body|  `email`| `string`|Indirizzo email dell'utente| ✅ |
|Richiesta nel body|  `password`| `string`|Password dell'utente| ✅ |

**Esempio di richiesta**

```http
GET /login HTTP/1.1
Content-Type: application/json
```
```json
{
  "email": "luigi@example.com",
  "password": "luigi"
}
```
**Esempio di risposta**
```json
{
  "token":  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMwMzlhMGI3LTk2ZTktNGYyNC04YmQwLWU3ZmVlOWZlNmYyNSIsInJvbGUiOiJvcGVyYXRvcmUiLCJpYXQiOjE3NDkzMTAwOTUsImV4cCI6MTc0OTMxMzY5NX0.lU2POutp8peqHHCHTQEO90Fcu3bmurHJmki_fbjhiyb4c3vpycbnQmmKtTrSPQAwco4z0xyf5G8sOzwLWgspx81NCLCgxkuTpvQyhE76TcRrSHIH5BhDFv2pDvUKkWy1Q7oZ4o_0bKc0r0gRyTbOhDYw_wVkdrXZJkUpu0hGgUnlaNubrdHi7qoCOVPkaEfgOr5EvHdxCFGseZa-RMva17YhR0o85W54aJSvuBgyye-Fd7-MP8shXOzqBgrBoMSLRHSSAtk-m00b_dLNQYu_1Lbk2LJTbbHZo1LBsIF7lldMKtPPLqkaVZKpPOCwCrIKFyOvv5K0uCHeRmvQ15VqqiyQKyH7pYwaYPfiuyKvqzOAkOW3Kwf2LqOepWlk5iyk3ZlF6ZGKb6HVrR6dw2mxYB39YSDIXITBe1YVMQmq2bPJS7-kcRfY2m3Cm6mdtgC4SQjcSezqC27EsbyqgCQckrm7wr2ENbFZNCtVzsKVsTDTdTiHdK8oKDrcWjGZX6Oyv_j4zJZgZNrTe2L1l4p2Yt0d1Z6ZI3gLzhfJja3un8feERHwcgozrTGsKSrMLemN17U6oGhj2k-pK4PUJsC_GAaX_98hAjkxSsLSpQZ4_6-907bU1jwn0B-SOnkqA2kyRRCxlXMdtBfa5vcIRJP9R5zRR14RSBCHPBdeSt_-GSk",
  "message": "Login successful"
}
```


# Configurazione e uso
Per eseguire correttamente l'applicazione, è necessario seguire alcuni passaggi preliminari. Innanzitutto, bisogna aver installato **Docker** e **Postman**.
### Passo 1
Il primo passo è la clonazione della repository Github tramite il seguente comando:
```
git clone https://github.com/SbattellaMattia/ProgrammazioneAvanzata.git
```
### Passo 2
Una volta clonato il repository, si deve creare il file `.env` contenente le variabili necessarie per configurare l'applicazione.
```
# PostgreSQL configuration
DB_USERNAME= {USERNAME}
DB_PASSWORD= {PASSWORD}
DB_NAME= {NOME DB}
DB_HOST= {HOST DB}
DB_PORT= {PORTA DB}
DB_DIALECT= {DIALECT}

# App environment 
NODE_ENV=development
PORT= {PORTA NODE}

# JWT configuration
PRIVATE_KEY_PATH=/usr/src/app/secrets/jwtRS256.key
PUBLIC_KEY_PATH=/usr/src/app/secrets/jwtRS256.key.pub
```


### Passo 3

Successivamente, a partire dalla la directory principale del progetto, si può avviare l'applicazione eseguendo:

```
docker compose up -d --build
```
L’applicazione sarà in ascolto all’indirizzo `http://localhost:3000` .
All'avvio verranno generate in automatico sia le migration che il seeder del database.
Se non presenti, le chiavi sono generate automaticamente nella cartella `secrets`. 
Si possono testare le rotte utilizzando l'utente operatore:
```
email: op@op.com
password: password123
```
oppure l'utente automobilista:
```
email: mario.rossi@email.com
password: password123
```
Per testare le rotte dell'applicazione si utilizza Postman, attraverso i file che si trovano nella directory `postman`:
- `PRIMO`: contine le variabili ambiente utilizzate nelle rotte
- `SECONDO`: contiene la collecion di rotte relative all'applicazione.

Quando si vogliono stoppare i container è preferibile farlo con:
```
docker compose down -v
```
evitando problemi al successivo riavvio.

# Strumenti utilizzati
- **Node.js**: Runtime utilizzato per eseguire il codice JavaScript sul lato server.
- **TypeScript**: Linguaggio utilizzato per aggiungere tipizzazione statica a JavaScript, migliorando la manutenibilità del codice.
- **Express**: Framework per applicazioni web Node.js, utilizzato per creare il server e gestire le API.
- **PostgreSQL**: Database relazionale utilizzato per memorizzare le informazioni relative a tutto il sistema.
- **Sequelize**: ORM (Object-Relational Mapping) utilizzato per interagire con il database PostgreSQL tramite models.
- **JWT (JSON Web Tokens)**: Utilizzato per l’autenticazione degli utenti tramite token.
- **Docker**: Strumento per la containerizzazione, utilizzato per creare ambienti di sviluppo e produzione isolati.
- **docker-compose**: Strumento utilizzato per definire e gestire applicazioni multi-contenitore Docker.
- **Postman**: Strumento per testare le API, utilizzato per verificare il corretto funzionamento delle rotte create.
- **DBeaver**: Strumento per la gestione e l’interazione con il database PostgreSQL, utile per visualizzare e manipolare i dati.
- **Tesseract**: OCR (Optical Character Recognition), utilizzato per leggere targhe da immagini.

  
# Autori
[<img src="https://github.com/SbattellaMattia.png" width="48" height="48" style="border-radius:50/%;" alt="Mattia Sbattella" />](https://github.com/SbattellaMattia)
[<img src="https://github.com/diba01.png" width="48" height="48" style="border-radius:50/%;" alt="Simone Di Battista" />](https://github.com/diba01)

- [Mattia Sbattella](https://github.com/SbattellaMattia) 
- [Simone Di Battista](https://github.com/diba01)

