# Sviluppo di un sistema backend per la gestione di parcheggi e transiti
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
  
# Indice

- [Obiettivi di progetto](#obiettivi-di-progetto)
- [Struttura del progetto ](#struttura-del-progetto)
- [Architettura dei servizi](#architettura-dei-servizi)
  - [Diagramma E-R](#diagramma-er)
- [Pattern utilizzati](#pattern-utilizzati)
- [Diagrammi UML](#diagrammi-uml)
  - [Diagramma dei casi d'uso](#diagramma-dei-casi-duso)
  - [Diagrammi delle sequenze](#diagrammi-delle-sequenze)
- [API Routes](#api-routes)
- [Configurazione e uso](#configurazione-e-uso)
- [Strumenti utilizzati](#strumenti-utilizzati)
- [Sviluppi futuri](#curiosità-e-sviluppi-futuri)
- [Autori](#autori)


# Obiettivi di progetto
L’obiettivo del progetto è realizzare un sistema backend, sviluppato in TypeScript, per la gestione completa dei parcheggi e dei relativi transiti veicolari, basato su Node.js, Express, Sequelize e Postgres coome RDBMS esterno. Il sistema deve calcolare il costo dei parcheggi a partire dai passaggi dei veicoli tra varchi di ingresso e uscita, tenendo conto di tipologia di veicolo, fasce orarie e giorno della settimana (festivo/feriale).​

Il backend deve consentire la gestione dei parcheggi, dei varchi (standard con upload immagine + OCR, e smart con JSON), delle tariffe e dei transiti tramite operazioni CRUD esposte via API REST autenticate con JWT. In fase di inserimento di un transito deve essere verificata la capacità residua del parcheggio e, se necessario, generata automaticamente la fattura associata all’utente, che potrà essere successivamente pagata tramite apposita rotta.​

Sono inoltre richieste rotte per consultare lo stato dei transiti per una o più targhe in un intervallo temporale, con output in formato JSON o PDF, nel rispetto dei vincoli di visibilità tra operatore e automobilista. Devono essere fornite statistiche di utilizzo e fatturato per parcheggio, anche filtrate per intervallo temporale e fascia oraria, e funzionalità per verificare e scaricare le fatture (incluso un PDF con QR code). 
  
# Struttura del progetto
Di seguito è riportata la struttura delle directory principali del progetto:

```plaintext
📦ProgrammazioneAvanzata
┣📜.env
┣📜.gitignore
┣📜.sequelizerc
┣📜docker-compose.yml
┣📜Dockerfile
┣📜entrypoint.sh
┣📜jest.config.js
┣📜package-lock.json
┣📜package.json
┣📜tsconfig.json
┣📜README.md
┣ 📂postman
┗ 📂src
   ┣ 📂@types
   ┣ 📂config
   ┣ 📂controllers
   ┣ 📂dao
   ┣ 📂database
   ┣ 📂dto
   ┣ 📂enum
   ┣ 📂errors
   ┣ 📂img
   ┣ 📂json
   ┣ 📂middlewares
   ┣ 📂models
   ┣ 📂routes
   ┣ 📂secrets
   ┣ 📂services
   ┣ 📂utils
   ┣ 📂validation
   ┣ 📂__tests__
   ┣ 📜app.ts
   ┗ 📜server.ts     
```

# Architettura dei servizi
L’infrastruttura è composta da due container principali, back-end e database relazionale, orchestrati via Docker Compose.

Il back-end è stato sviluppato utilizzando Node.js con il framework Express e si occupa di gestire tutte le funzionalità principali necessarie a realizzare le specifiche di progetto. Come database è stato scelto Postgres.

**Componenti principali**

**Server (Node.js + Express)**
L’applicazione espone un backend RESTful sviluppato in Node.js con Express, organizzato in controller, service e DAO. Il server gestisce tutte le operazioni di business: autenticazione utenti (automobilisti e operatori), gestione di parcheggi e varchi, inserimento e consultazione dei transiti, generazione di fatture e statistiche. L’accesso alle rotte protette è regolato da JWT, con middleware dedicati per autenticazione, autorizzazione per ruolo e validazione dei payload.

Database (PostgreSQL)
I dati sono memorizzati in un’istanza PostgreSQL, esposta come container separato e accessibile dal backend tramite Sequelize. Le principali entità modellate sono:

- Parkings: dati identificativi del parcheggio, indirizzo e capacità per tipologia di veicolo.

- Gates: varchi di `in`/`out`/`bidirectional` (`standard` o `smart`) associati a un parcheggio.

- Users: automobilisti e operatori, con ruolo e saldo token per le chiamate autenticate.

- Transits: passaggi (`in`/`out`) dei veicoli attraverso i varchi, con data/ora e targa.

- Rates: tariffe per parcheggio, tipologia veicolo, fascia oraria e giorno (`weekday`/`weekend`).

- Invoices: fatture generate sui transiti, con importo, stato (`paid`/`unpaid`/`expired`) e PDF associato.

## Diagramma ER
Di seguito è riportato lo schema delle tabelle generato da DBeaver:

<img width="615" height="815" alt="db" src="https://github.com/user-attachments/assets/496ac1ad-0fa1-47a5-810d-193067bbd93b" />

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

## Wrapper (Async Handler)

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

- **EnsureExist**: si occupa di vedere se l'`id` che viene passato nella richiesta esista davvero. In ingresso prende il `Service` corrispondente. Grazie a questo middleware il `Controller` ha già l'id della richiesta e (nel caso di richieste semplici come la Get di un singolo oggetto), può restituirlo direttamente senza ripetere la pipeline di ricerca.

``` typescript  
interface ReadService<T> {
  getById(id: string): Promise<T | null>;
}

/**
 * Middleware Factory per verificare l'esistenza di una risorsa.
 * Se esiste, la salva in res.locals.entity
 * Se non esiste, lancia NotFoundError
 */
export const ensureExists = (service: ReadService<any>, resourceName: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const entity = await service.getById(id);
    if (!entity) {
      throw new NotFoundError(resourceName, id);
    }

    // Salviamo l'entità trovata in res.locals per passarla al controller
    // "entity" è un nome generico, nel controller lo recupereremo da qui
    res.locals.entity = entity;
    
    next();
  });
};
```

```typescript 
/**
 * Parking ripreso dalla richiesta
 */
getById = asyncHandler(async (req: Request, res: Response) => {
    const parking = res.locals.entity as ParkingDAO; 
    return res.status(StatusCodes.OK).json(parking);
  });
```

- **Validate**: si occupa di validare in modo centralizzato la richiesta e i suoi parametri, garantendo che arrivino al service già nel formato e nel dominio atteso. In questo modo si eliminano gran parte dei controlli “manuali” nei service e si semplificano le operazioni di creazione (POST) e aggiornamento (PUT) degli oggetti, permettendo anche payload più ricchi rispetto al minimo richiesto dalle specifiche.​ **Zod** viene utilizzato per definire schemi riutilizzabili (DTO di input) che descrivono forma, tipo e vincoli dei dati; per ogni schema è possibile marcare campi come opzionali, obbligatori o vietati, ad esempio impedendo che l’id venga passato o modificato dall’utente.


``` typescript  
/**
 * Schema di validazione per il login
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email richiesta' })
    .email('Formato email non valido'),
  
  password: z
    .string({ required_error: 'Password richiesta' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
```


- **TokenMiddleware**: scala esattamente un token per richiesta (modificabile). Anche se il sistema dovesse generare un errore il token viene scalato.

- **ErrorsMiddleware**: cattura qualsiasi eccezione e la trasforma in risposta HTTP, usando le `AppError` generate dalla factory.



# Diagrammi UML

## Diagramma dei casi d'uso

### Operatore

``` mermaid
flowchart TB
    %% Attori
    Operatore["Operatore"]

    %% Casi d'uso - Operatore
    loginOperator
    CRUDParkings
    CRUDGates
    CRUDRates
    CRUDTransits
    transitsHistory
    statsAllParkings
    statsSingleParking
    manageInvoices
    invoicePdf

    %% Relazioni Operatore → casi d'uso
    Operatore --> loginOperator
    Operatore --> CRUDParkings
    Operatore --> CRUDGates
    Operatore --> CRUDRates
    Operatore --> CRUDTransits
    Operatore --> transitsHistory
    Operatore --> statsAllParkings
    Operatore --> statsSingleParking
    Operatore --> manageInvoices
    Operatore --> invoicePdf

```

---

### Automobilista

```  mermaid
flowchart TB
    %% Attori
    Automobilista["Automobilista"]

 %% Casi d'uso - Automobilista
    loginDriver
    ownTransits
    ownTransitsHistory
    ownInvoices
    invoicePdf
    invoicePay

 %% Relazioni Automobilista → casi d'uso
    Automobilista --> loginDriver
    Automobilista --> ownTransits
    Automobilista --> ownTransitsHistory
    Automobilista --> ownInvoices
    Automobilista --> invoicePdf
    Automobilista --> invoicePay
```

---

### Gate (varco standard / smart)

```  mermaid
flowchart TB
    %% Attori
    GateStd["Varco_standard"]
    GateSmart["Varco_smart"]

%% Casi d'uso - Gate (standard / smart)
    createTransitStd
    createTransitSmart
    checkCapacity
    manageParkingSession
    generateInvoice

 %% Relazioni Gate → casi d'uso
    GateStd --> createTransitStd
    GateSmart --> createTransitSmart

    createTransitStd --> checkCapacity
    createTransitSmart --> checkCapacity

    checkCapacity --> manageParkingSession
    manageParkingSession --> generateInvoice
```

## Diagrammi delle sequenze


``` mermaid
sequenceDiagram
actor Client
participant App
participant AuthMW as AuthMiddleware
participant ValidateMW as Validate(invoiceId)
participant ExistsMW as EnsureExists(Invoice)
participant TokenMW as consumeTokenCredit
participant Controller as InvoiceController
participant Service as InvoiceService
participant DAO_Inv as InvoiceDAO
participant DAO_Park as ParkingDAO
participant DAO_User as UserDAO
participant PdfGen as PdfGenerator
participant NFErr as NotFoundError
participant ErrMW as errorHandler


Client->>App: GET /invoice/{id}/pdf
App->>+AuthMW: authenticateToken(req,res,next)
AuthMW-->>App: req.user impostato

App->>+TokenMW: consumeTokenCredit(req,res,next)
TokenMW-->>App: token scalato

App->>+ValidateMW: validate(invoiceIdSchema, 'params')
ValidateMW-->>App: params validati

App->>+ExistsMW: ensureExists(InvoiceService,'Invoice')
ExistsMW-->>App: invoice esistente (o errore)

App->>+Controller: downloadPayment(req,res,next)
Controller->>+Service: generateInvoicePdf(invoiceId, user.id)

alt fattura trovata
    Service->>+DAO_Inv: getByUserId(invoiceId, userId)
    DAO_Inv-->>-Service: Invoice
    Service->>+DAO_Park: findById(invoice.parkingId)
    DAO_Park-->>-Service: Parking
    Service->>+DAO_User: findById(invoice.userId)
    DAO_User-->>-Service: User
    Service->>+PdfGen: createPayment(dto)
    PdfGen-->>-Service: pdfBuffer
    Service-->>-Controller: pdfBuffer
    Controller-->>App: res.status(200).contentType(pdf).send(pdfBuffer)
    App-->>Client: 200 OK + application/pdf
else fattura non trovata / non appartenente all'utente
    Service->>+NFErr: new NotFoundError("Fattura", invoiceId)
    NFErr-->>-Service: NotFoundError
    Service-->>Controller: throw NotFoundError
    Controller-->>ErrMW: next(error)
    ErrMW-->>App: HTTP error response (es. 404)
    App-->>Client: 404 Not Found (o errore coerente)
end
```

### POST /transit/gate/{gateId}

``` mermaid
sequenceDiagram
actor GateClient as Gate (STANDARD/SMART)
participant App
participant AuthMW as AuthMiddleware
participant TokenMW as consumeTokenCredit
participant GateMW as Validate+EnsureExists)
participant Upload as Multer(upload)
participant Controller as TransitController
participant Service as TransitService
participant DAO_Gate as GateDAO
participant DAO_Park as ParkingDAO
participant DAO_Veh as VehicleDAO
participant DAO_Tran as TransitDAO
participant Utils as TransitUtils
participant OCR as OcrService
participant InvSvc as InvoiceService
participant ErrMW as errorHandler

    GateClient->>App: POST /transit/gate/{gateId} (+ file o JSON)

App->>+AuthMW: authenticateToken(req,res,next)
AuthMW-->>App: req.user impostato

App->>+TokenMW: consumeTokenCredit(req,res,next)
TokenMW-->>App: token scalato

App->>+GateMW: validate(gateIdSchema) + ensureExists(GateService,"Gate")
GateMW-->>App: gate valido/esistente

alt gate STANDARD
    App->>+Upload: upload.single("file")
    Upload-->>App: req.file popolato (buffer immagine)
else gate SMART
    App->>App: nessun upload, usa solo req.body JSON
end

App->>+Controller: createFromGate(req,res,next)
Controller->>+Service: createFromGate(gateId, req.file, req.body)

Service->>+DAO_Gate: findById(gateId)
DAO_Gate-->>-Service: gate
Service->>+DAO_Park: findById(gate.parkingId)
DAO_Park-->>-Service: parking

alt gate STANDARD
    Service->>Service: verifica presenza file immagine
    Service->>OCR: ocr(tmpImagePath)
    OCR-->>Service: detectedPlate
else gate SMART
    Service->>Service: legge plate da body (plate / licensePlate / vehicle.plate)
end

Service->>Service: normalizza targa (trim, uppercase, rimuovi spazi)

Service->>+DAO_Veh: findByPlate(normalizedPlate)
DAO_Veh-->>-Service: vehicle o null

alt vehicle non trovato
    Service-->>ErrMW: throw NotFoundError("Vehicle")
    ErrMW-->>App: HTTP errore (es. 404)
    App-->>GateClient: errore
else vehicle trovato
    Service->>+Utils: determineTransitTypeForGate(transitDAO, parking.id, vehicle.plate, gate.direction)
    Utils-->>-Service: newType (IN o OUT)

    alt sequenza non valida (due IN, due OUT, parcheggio diverso)
        Service-->>ErrMW: throw OperationNotAllowedError / DuplicateTransitError
        ErrMW-->>App: HTTP errore (es. 409/400)
        App-->>GateClient: errore
    else sequenza valida
        Service->>Utils: ensureCapacityForIn(parking, vehicle, newType)
        Service->>+DAO_Tran: create({ parkingId, gateId, vehicleId, type:newType, date:now,... })
        DAO_Tran-->>-Service: createdTransit

        Service->>+Utils: updateParkingCapacityAfterTransit(parkingDAO, parking, vehicle, newType)
        Utils-->>Service: capacità aggiornata

        alt newType == OUT
            Service->>+InvSvc: CreateInvoiceForExit(createdTransit, vehicle)
            InvSvc-->>-Service: (fattura creata)
        end

        Service-->>-Controller: createdTransit
        Controller-->>App: res.status(201).json(createdTransit)
        App-->>GateClient: 201 Created + JSON transito
    end
end
```

### NE BASTANO 4 PRINCIPALI


# API Routes

| Verbo HTTP | Endpoint                                             | Descrizione                                                   | Autenticazione JWT |
|------------|------------------------------------------------------|---------------------------------------------------------------|:--------------------:|
| POST       | /login                                               | Login utente driver, restituisce JWT                          | ❌                 |
| POST       | /login                                               | Login operatore, restituisce JWT                              | ❌                 |
| GET        | /parking                                             | Elenco di tutti i parcheggi                                   | ✅                 |
| GET        | /parking/{parkingId}                                 | Dettaglio di un singolo parcheggio                            | ✅                 |
| POST       | /parking                                             | Creazione di un nuovo parcheggio                              | ✅                 |
| PUT        | /parking/{parkingId}                                 | Aggiornamento dati di un parcheggio                           | ✅                 |
| DELETE     | /parking/{parkingId}                                 | Eliminazione di un parcheggio                                 | ✅                 |
| GET        | /gate                                                | Elenco di tutti i varchi                                      | ✅                 |
| GET        | /gate/{gateId}                                       | Dettaglio di un singolo varco                                 | ✅                 |
| POST       | /gate                                                | Creazione di un nuovo varco                                   | ✅                 |
| PUT        | /gate/{gateId}                                       | Aggiornamento dati di un varco                                | ✅                 |
| DELETE     | /gate/{gateId}                                       | Eliminazione di un varco                                      | ✅                 |
| GET        | /gate/{gateId}/transits                              | Elenco transiti associati a un varco          | ✅                 |
| GET        | /transit                                             | Elenco di tutti i transiti                                    | ✅                 |
| GET        | /transit/{transitId}                                 | Dettaglio di un singolo transito                              | ✅                 |
| POST       | /transit/gate/{gateId}                               | Creazione transito da varco standard (upload immagine targa) o varco smart (taga come json) | ✅                 |
| PUT        | /transit/{transitId}                                 | Aggiornamento dati di un transito                             | ✅                 |
| DELETE     | /transit                                             | Eliminazione di un transito                                   | ✅                 |
| GET        | /transit/history                                     | Storico transiti (filtri per targa, periodo, formato JSON/PDF)| ✅                 |
| GET        | /rate/{rateId}                                       | Dettaglio di una tariffa                                      | ✅                 |
| GET        | /rate                                                | Elenco di tutte le tariffe                                    | ✅                 |
| POST       | /rate                                                | Creazione di una nuova tariffa                                | ✅                 |
| PUT        | /rate/{rateId}                                       | Aggiornamento di una tariffa                                  | ✅                 |
| DELETE     | /rate/{rateId}                                       | Eliminazione di una tariffa                                   | ✅                 |
| GET        | /stats/                                              | Statistiche globali per tutti i parcheggi in formato JSON/PDF                     | ✅                 |
| GET        | /stats/{parkingId}                  | Statistiche per singolo parcheggio in formato JSON/PDF        | ✅                 |
| GET        | /invoice                                             | Elenco delle fatture dell’utente                              | ✅                 |
| GET        | /invoice/{invoiceId}                                 | Dettaglio di una fattura                                      | ✅                 |
| GET        | /invoice/{invoiceId}/pdf                             | Download PDF/bollettino fattura                               | ✅                 |
| PUT        | /invoice/{invoiceId}                                 | Simulazione pagamento fattura                                 | ✅                 |
| GET        | /xmas                                | Easter (Christmas) egg                                 | 🎅🏻🎄☃️                 |




# POST /login

**Parametri**

| Posizione          | Nome       | Tipo     | Descrizione                    | Obbligatorio |
|:------------------:|:----------:|:--------:|:------------------------------:|:------------:|
| Body (JSON)        | `email`    | `string` | Indirizzo email dell’utente    | ✅           |
| Body (JSON)        | `password` | `string` | Password dell’utente           | ✅           |

**Esempio di richiesta**

```

POST /login HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT opzionale>

```

``` json

{
"email": "mario.rossi@email.com",
"password": "password123"
}

```

**Esempio di risposta**

``` json

{
    "success": true,
    "message": "Login effettuato con successo",
    "data": {
        "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFkODJjZmI1LTRiMDgtNDkwNC1iYTkwLTg3ZjRlMGZhOTZiMiIsImVtYWlsIjoibWFyaW8ucm9zc2lAZW1haWwuY29tIiwicm9sZSI6ImRyaXZlciIsImlhdCI6MTc2NTY0NjQ0OSwiZXhwIjoxNzY1NzMyODQ5LCJpc3MiOiJwYXJraW5nLXN5c3RlbSIsInN1YiI6IjFkODJjZmI1LTRiMDgtNDkwNC1iYTkwLTg3ZjRlMGZhOTZiMiJ9.ZWzEvBPnLdVI9juOJaHUxgq57WxNkZDYL7ztNApMZls0hysWQkmdC6UF75qdIN6UdZDQeSy8esCPl5TIYNXrWKSpi6O02bTbFlDeJxX77m_nUicuJ_x2T-K3a7MEHddzamvvmmAHrcf1IUmdK-LfOo6qhnDpQ5kgMMw6PsCcYwoDIF98cLVtM7aiSPFM79YXqgYMkQMqs7MqigJfptq-WI9C92tdtIimshg-aPQj9E68Wfn-12htKhi_bi_MrYG-opNQPRPxPodiEDYogJDy8G8FNfYvHOLGY-naGqgFo0IKO2yP7tkt66IzJCrZrSEAB6d5T6RqIFPkK-ckSuU_9EWulkjQr1BL13AJhMnAu5cSc1ayLG74KrhSvIQGO7cjYhbMCBh-8zLJX9h9ulUCqe2HFEVnNUJVseebnxKM3Rh_nVnmTqgP5fn2Qi-6Er9gTsLwcMhDzVY45RfI3Rd8jLBwt08wNBHBrtTS3SSrvX7pwEGE8Ovkp2tuNt-naMet8WrHa_CJhRABg3NQUphgGMKIxafCr56rKJrl4i1tKVE4kR66gbprDxAwj1AzmkgH3sys-4fPTtCpOlJHJVLCsR7cHBBx7BIuB9_UXcMgS1Jm7GdzgwyFTsci6OtWtZUi7vVAHV_nxECi3pMzDTLe7LDCdNHnRqVIK1REl7V1Cyk",
        "user": {
            "id": "1d82cfb5-4b08-4904-ba90-87f4e0fa96b2",
            "email": "mario.rossi@email.com",
            "role": "driver",
            "name": "Mario",
            "surname": "Rossi",
            "tokens": 99
        }
    }
}

```

---

# GET /parking/

**Parametri**

| Posizione   | Nome | Tipo | Descrizione                          | Obbligatorio |
|:-----------:|:----:|:----:|:------------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore   | ✅ |

**Esempio di richiesta**

```

GET /parking/ HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json
[
    {
        "id": "8fad5960-4edd-4400-a705-921c70aba06e",
        "name": "Downtown Parking",
        "address": "Via Roma 15, Milan",
        "carCapacity": 10,
        "motorcycleCapacity": 5,
        "truckCapacity": 2,
        "carCapacityRemain": 10,
        "motorcycleCapacityRemain": 5,
        "truckCapacityRemain": 2,
        "createdAt": "2025-12-14T12:19:13.597Z",
        "updatedAt": "2025-12-14T12:19:13.597Z"
    },
    {
        "id": "113e13c5-1eae-444c-b79b-754e6cdf221e",
        "name": "Station Parking",
        "address": "Piazza Garibaldi 3, Milan",
        "carCapacity": 10,
        "motorcycleCapacity": 2,
        "truckCapacity": 0,
        "carCapacityRemain": 10,
        "motorcycleCapacityRemain": 2,
        "truckCapacityRemain": 0,
        "createdAt": "2025-12-14T12:19:13.597Z",
        "updatedAt": "2025-12-14T12:19:13.597Z"
    }
]
```

---

# GET /parking/{parkingId}

**Parametri**

| Posizione   | Nome         | Tipo     | Descrizione                   | Obbligatorio |
|:-----------:|:------------:|:--------:|:-----------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore        | ✅           |
| Path        | `parkingId`  | `string` | UUID del parcheggio           | ✅           |

**Esempio di richiesta**

``` 

GET /parking/8fad5960-4edd-4400-a705-921c70aba06e HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json
{
        "id": "8fad5960-4edd-4400-a705-921c70aba06e",
        "name": "Downtown Parking",
        "address": "Via Roma 15, Milan",
        "carCapacity": 10,
        "motorcycleCapacity": 5,
        "truckCapacity": 2,
        "carCapacityRemain": 10,
        "motorcycleCapacityRemain": 5,
        "truckCapacityRemain": 2,
        "createdAt": "2025-12-14T12:19:13.597Z",
        "updatedAt": "2025-12-14T12:19:13.597Z"
    },

```

---

# POST /parking

**Parametri**

| Posizione   | Nome                  | Tipo      | Descrizione                          | Obbligatorio |
|:-----------:|:---------------------:|:---------:|:------------------------------------:|:------------:|
| Header      | `Authorization`       | `string`  | Token JWT operatore                  | ✅           |
| Body (JSON) | `name`                | `string`  | Nome del parcheggio                  | ✅           |
| Body (JSON) | `address`             | `string`  | Indirizzo del parcheggio             | ✅           |
| Body (JSON) | `carCapacity`         | `number`  | Capacità auto                        | ✅           |
| Body (JSON) | `motorcycleCapacity`  | `number`  | Capacità moto                        | ✅           |
| Body (JSON) | `truckCapacity`       | `number`  | Capacità camion                      | ✅           |

**Esempio di richiesta**

```

POST /parking HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

```

``` json

{
"name": "Big Mega Ultra Parcheggio Enorme",
"address": "Via delle meraviglie",
"carCapacity": 999,
"motorcycleCapacity": 999,
"truckCapacity": 999
}

```

**Esempio di risposta**

``` json
{
    "id": "10b41556-9bf2-46fc-9a59-363412a7b53f",
    "name": "Big Mega Ultra Parcheggio Enorme",
    "address": "Via delle meraviglie",
    "carCapacity": 999,
    "motorcycleCapacity": 999,
    "truckCapacity": 999,
    "carCapacityRemain": 999,
    "motorcycleCapacityRemain": 999,
    "truckCapacityRemain": 999,
    "updatedAt": "2025-12-13T17:34:57.443Z",
    "createdAt": "2025-12-13T17:34:57.443Z"
}
```

---

# PUT /parking/{parkingId}

**Parametri**

| Posizione   | Nome         | Tipo     | Descrizione                         | Obbligatorio |
|:-----------:|:------------:|:--------:|:-----------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore               | ✅           |
| Path        | `parkingId`  | `string` | UUID del parcheggio                  | ✅           |
| Body (JSON) | `name`       | `string` | Nuovo nome (o altri campi aggiornabili) | ✅/parziale |

**Esempio di richiesta**

```

PUT /parking/8fad5960-4edd-4400-a705-921c70aba06e HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

```

``` json

{
"name": "Parcheggio Fighissimo"
}

```

**Esempio di risposta**

``` json
{
        "id": "8fad5960-4edd-4400-a705-921c70aba06e",
        "name": "Parcheggio Fighissimo",
        "address": "Via Roma 15, Milan",
        "carCapacity": 10,
        "motorcycleCapacity": 5,
        "truckCapacity": 2,
        "carCapacityRemain": 10,
        "motorcycleCapacityRemain": 5,
        "truckCapacityRemain": 2,
        "createdAt": "2025-12-14T12:19:13.597Z",
        "updatedAt": "2025-12-14T12:19:13.597Z"
    }
```

---

# DELETE /parking/{parkingId}

**Parametri**

| Posizione   | Nome         | Tipo     | Descrizione           | Obbligatorio |
|:-----------:|:------------:|:--------:|:---------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore | ✅           |
| Path        | `parkingId`  | `string` | UUID del parcheggio   | ✅           |

**Esempio di richiesta**

```

DELETE /parking/aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8 HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json

{
    "message": "Parcheggio eliminato con successo"
}

```

---

# GET /gate/

**Parametri**

| Posizione   | Nome           | Tipo     | Descrizione           | Obbligatorio |
|:-----------:|:--------------:|:--------:|:---------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore | ✅           |

**Esempio di richiesta**

```

GET /gate/ HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json
[
    {
        "id": "c8ebf662-ec73-4a9b-8889-49f738034825",
        "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
        "type": "standard",
        "direction": "in",
        "createdAt": "2025-12-12T16:34:57.396Z",
        "updatedAt": "2025-12-12T16:34:57.396Z"
    },
    {
        "id": "7a0ad62a-26d1-41e3-8936-f9a076605830",
        "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
        "type": "standard",
        "direction": "out",
        "createdAt": "2025-12-12T16:34:57.396Z",
        "updatedAt": "2025-12-12T16:34:57.396Z"
    },

```

---

# GET /gate/{gateId}

**Parametri**

| Posizione   | Nome    | Tipo     | Descrizione           | Obbligatorio |
|:-----------:|:-------:|:--------:|:---------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore | ✅           |
| Path        | `gateId`| `string` | UUID del varco        | ✅           |

**Esempio di richiesta**

```

GET /gate/6e819899-1e3e-4656-a512-3032ffc8df4a HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json
{
    "id": "c8ebf662-ec73-4a9b-8889-49f738034825",
    "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
    "type": "standard",
    "direction": "in",
    "createdAt": "2025-12-12T16:34:57.396Z",
    "updatedAt": "2025-12-12T16:34:57.396Z"
}
```

---

# POST /gate/

**Parametri**

| Posizione   | Nome        | Tipo      | Descrizione                           | Obbligatorio |
|:-----------:|:-----------:|:---------:|:-------------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore                 | ✅           |
| Body (JSON) | `parkingId` | `string`  | UUID del parcheggio                   | ✅           |
| Body (JSON) | `type`      | `string`  | Tipo varco (`standard` \| `smart`)    | ✅           |
| Body (JSON) | `direction` | `string`  | Direzione (`in`, `out`, `bidirectional`)       | ✅           |

**Esempio di richiesta**

```

POST /gate/ HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

```

``` json
{
"parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
"type": "smart",
"direction": "in"
}
```

**Esempio di risposta**

Con id esistente:
``` json
{
    "id": "40001b67-c394-41f2-9d21-9340f29b7b93",
    "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
    "type": "smart",
    "direction": "in",
    "updatedAt": "2025-12-13T17:50:01.883Z",
    "createdAt": "2025-12-13T17:50:01.883Z"
}
```

Con id inesistente dal middleware EnsureExist:
``` json
{
    "success": false,
    "statusCode": 404,
    "message": "Parking con identificativo 6fd5f327-82d3-4d48-8bc4-e68cb09ddb75 non trovato"
}
```

---

# PUT /gate/{gateId}

**Parametri**

| Posizione   | Nome    | Tipo      | Descrizione                         | Obbligatorio |
|:-----------:|:-------:|:---------:|:-----------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore             | ✅           |
| Path        | `gateId`| `string`  | UUID del varco                      | ✅           |
| Body (JSON) | `type`  | `string`  | Nuovo tipo varco                    | ✅/parziale  |

**Esempio di richiesta**

```

PUT /gate/40001b67-c394-41f2-9d21-9340f29b7b93 HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

```

``` json
{
"type": "standard"
}
```

**Esempio di risposta**

``` json
{
    "id": "40001b67-c394-41f2-9d21-9340f29b7b93",
    "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
    "type": "standard",
    "direction": "in",
    "createdAt": "2025-12-13T17:50:01.883Z",
    "updatedAt": "2025-12-13T17:53:46.808Z"
}
```

---

# DELETE /gate/{gateId}

**Parametri**

| Posizione   | Nome    | Tipo     | Descrizione           | Obbligatorio |
|:-----------:|:-------:|:--------:|:---------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore | ✅           |
| Path        | `gateId`| `string` | UUID del varco        | ✅           |

Il funzionamento è analogo alle delete precedenti.

---

# GET /gate/{gateId}/transits



**Parametri**

| Posizione   | Nome    | Tipo     | Descrizione               | Obbligatorio |
|:-----------:|:-------:|:--------:|:-------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore | ✅           |
| Path        | `gateId`| `string` | UUID del varco            | ✅           |

**Esempio di richiesta**

```

GET /gate/7a0ad62a-26d1-41e3-8936-f9a076605830/transits HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json
[
    {
        "id": "3676c23b-79c5-4a3b-ba55-3fc0921bb62a",
        "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
        "gateId": "7a0ad62a-26d1-41e3-8936-f9a076605830",
        "vehicleId": "FV181EX",
        "type": "out",
        "date": "2025-11-13T20:18:57.396Z",
        "detectedPlate": "FV181EX",
        "createdAt": "2025-11-13T20:18:57.396Z",
        "updatedAt": "2025-11-13T20:18:57.396Z"
    },
    {
        "id": "bbc3cdd2-a92b-41e4-be40-490992eb980f",
        "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
        "gateId": "7a0ad62a-26d1-41e3-8936-f9a076605830",
        "vehicleId": "AA000AA",
        "type": "out",
        "date": "2025-11-15T14:30:57.396Z",
        "detectedPlate": "AA000AA",
        "createdAt": "2025-11-15T14:30:57.396Z",
        "updatedAt": "2025-11-15T14:30:57.396Z"
    },
```

> Nota: gateId è sempre lo stesso

---

# GET /transit/

**Parametri**

| Posizione   | Nome           | Tipo     | Descrizione           | Obbligatorio |
|:-----------:|:--------------:|:--------:|:---------------------:|:------------:|
| Header      | `Authorization`| `string` | Token JWT operatore   | ✅           |

**Esempio di richiesta**

```

GET /transit/ HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json

[
    {
        "id": "eb4e2ca3-e069-4dfc-96d0-f8c62623fa08",
        "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
        "gateId": "e77cbc6c-2f85-4d44-a4c8-fe59d01a9b57",
        "vehicleId": "GA129KM",
        "type": "in",
        "date": "2025-12-12T23:23:23.000Z",
        "detectedPlate": "GA129KM",
        "createdAt": "2025-12-12T17:30:26.188Z",
        "updatedAt": "2025-12-12T17:32:17.194Z"
    },
    {
        "id": "f2939cbb-15ea-4b7f-be08-1f6a7c4d624d",
        "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
        "gateId": "e77cbc6c-2f85-4d44-a4c8-fe59d01a9b57",
        "vehicleId": "GA129KM",
        "type": "out",
        "date": "2025-12-12T17:30:24.056Z",
        "detectedPlate": "GA129KM",
        "createdAt": "2025-12-12T17:30:24.056Z",
        "updatedAt": "2025-12-12T17:30:24.056Z"
    },
```

---

# GET /transit/{transitId}

**Parametri**

| Posizione   | Nome       | Tipo     | Descrizione          | Obbligatorio |
|:-----------:|:----------:|:--------:|:--------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore | ✅         |
| Path        | `transitId`| `string` | UUID del transito    | ✅           |

Analogo alle get precedenti.

---

# POST /transit/gate/{gateId}

Il varco standard manda l'immagine allegata. L'OCR si occuperà poi dalla gestione.
il varco smart (smart poichè viene considerato già avente nella telecamera l'OCR) manda unicamente il json della targa.

**Parametri**

| Posizione   | Nome    | Tipo    | Descrizione                               | Obbligatorio |
|:-----------:|:-------:|:-------:|:-----------------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore/varco           | ✅           |
| Path        | `gateId`| `string`| UUID del varco                             | ✅           |
| Body (form-data) | `file` | `file`  | Immagine contenente la targa del veicolo SOLO PER STANDARD | ✅           |
| Body (form-data) | `plate` | `string`  | Targa del veicolo SOLO PER SMART | ✅| 

**Esempio di richiesta**

```

POST /transit/gate/7a0ad62a-26d1-41e3-8936-f9a076605830 HTTP/1.1
Authorization: Bearer <JWT>
Content-Type: multipart/form-data; 

```

``` typescript

form-data con campo "file"

//oppure

{
    "plate": "GA129KM"
}

```
<img width="795" height="252" alt="image" src="https://github.com/user-attachments/assets/ba966732-1882-4849-af54-7b5e6ca8a057" />

L'OCR gestirà automaticamente il riconoscimento dei caratteri nella targa.

**Esempio di risposta**

Nel caso il gate sia standard:
``` json
{
    "id": "1b786f60-2dc3-47bb-87f0-1a9e62ae981c",
    "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
    "gateId": "7a0ad62a-26d1-41e3-8936-f9a076605830",
    "vehicleId": "FV181EX",
    "type": "out",
    "date": "2025-12-13T18:07:37.831Z",
    "detectedPlate": "FV181EX",
    "updatedAt": "2025-12-13T18:07:37.831Z",
    "createdAt": "2025-12-13T18:07:37.831Z"
}
```

Nel caso provassimo ad immettere un varco smart come identificativo ci verrà notificato:

``` json
{
    "success": false,
    "statusCode": 422,
    "message": "Per gate SMART è richiesto un JSON con la targa (plate)"
}
```

In questo caso è stato generato un transito in uscita poichè il veicolo risultava già nel parcheggio e perchè il tipo di gate permetteva solo transiti di tipo out. Nel caso si riprovasse a generarne un'altro:

``` json
{
    "success": false,
    "statusCode": 422,
    "message": "Non puoi registrare due uscite consecutive per questo veicolo"
}
```

 In caso provassimo a fare un nuovo transit con l'id di un varco standard bidirezionale o in in verrà generato un nuovo transito in ingresso.

``` json
{
    "id": "74d1bc67-412f-4327-9a28-28b4de6724fb",
    "parkingId": "457e1a07-cdeb-43ea-b30d-7672fb73d06e",
    "gateId": "50437974-a130-43aa-b08e-64c366196247",
    "vehicleId": "FV181EX",
    "type": "in",
    "date": "2025-12-13T18:36:58.777Z",
    "detectedPlate": "FV181EX",
    "updatedAt": "2025-12-13T18:36:58.777Z",
    "createdAt": "2025-12-13T18:36:58.777Z"
}
```

Nel caso ci sia un transito in in un altro parcheggio:
``` json
{
    "success": false,
    "statusCode": 422,
    "message": "Il veicolo risulta già all'interno di un altro parcheggio: può uscire solo da quel parcheggio"
}

```


---

# PUT /transit/{transitId}

**Parametri**

| Posizione   | Nome       | Tipo      | Descrizione                    | Obbligatorio |
|:-----------:|:----------:|:---------:|:------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore        | ✅           |
| Path        | `transitId`| `string`  | UUID del transito              | ✅           |
| Body (JSON) | `date`     | `string`  | Data/ora transito YYYY-MM-DDHH-MM-SS        | ✅ |

**Esempio di richiesta**

```

PUT /transit/eb4e2ca3-e069-4dfc-96d0-f8c62623fa08 HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

```

``` json
{
"date": "2025-12-12 23:23:23"
}
```

> Nota: è possibile modificare solo transiti che sono in ingresso e non hanno il corrispettivo transito in uscita. La scelta è stata fatta per motivi di praticità poichè non richiesto nelle specifiche di progetto e perchè avrebbe complicato la logica successiva. In ogni modo lo si lascia per sviluppi futuri. Vedi *delete* per l'esempio.

---

# DELETE /transit/{transitId}

**Parametri**

| Posizione   | Nome           | Tipo     | Descrizione                         | Obbligatorio |
|:-----------:|:--------------:|:--------:|:-----------------------------------:|:------------:|
| Header      | `Authorization`| `string` | Token JWT operatore                 | ✅           |
| Body (JSON) |  `transitId`    | `string` | Identificativo del transito da cancellare | ✅ |

L'unica eccezione dalle precedenti è che si può cancellare unicamente un transito di tipo IN, come riportato in *update*.

``` json
{
    "success": false,
    "statusCode": 403,
    "message": "Puoi modificare e/o cancellare solo transiti di tipo IN"
}
```

---

# GET /transit/history

**Parametri**

| Posizione   | Nome     | Tipo     | Descrizione                                          | Obbligatorio |
|:-----------:|:--------:|:--------:|:----------------------------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore o driver                  | ✅           |
| Query       | `plates` | `string` | Una o più targhe (ripetibile)                        | ❌           |
| Query       | `format` | `string` | Formato output (`json` \| `pdf`)                     | ❌           |
| Query       | `from`   | `string` | Data inizio intervallo (YYYY-MM-DD)                  | ❌           |
| Query       | `to`     | `string` | Data fine intervallo (YYYY-MM-DD)                    | ❌           |

**Esempio di richiesta**

```

GET /transit/history?plates=FV181EX&plates=AA000AA&format=json&from=2025-12-01&to=2025-12-9 HTTP/1.1
Authorization: Bearer <JWT>

```

```

// nessun body richiesto

```

**Esempio di risposta**

``` json
[
    {
        "date": "2025-12-16T10:32:59.744Z",
        "vehicleId": "FV181EX",
        "transitType": "out",
        "gateId": "2eb6cfbd-ffd2-4d92-b739-9822f82e0a64",
        "vehicleType": "car"
    },
    {
        "date": "2025-12-16T10:32:01.300Z",
        "vehicleId": "FV181EX",
        "transitType": "in",
        "gateId": "91c81543-44e1-4571-9b3c-7c8825089b14",
        "vehicleType": "car"
    },
```
<img width="1475" height="865" alt="image" src="https://github.com/user-attachments/assets/be2c113a-ddfd-444c-966a-ae1bca8b94a3" />

Nel caso avessimo fatto l'accesso con un utente specifico e proviamo a fare la stessa cosa aggiungendo una targa non di sua appartenenza avremo:
<img width="1493" height="502" alt="image" src="https://github.com/user-attachments/assets/50460485-fb08-48ee-8383-ffda56d0fb04" />

---

# GET /rate

**Parametri**

| Posizione   | Nome           | Tipo     | Descrizione           | Obbligatorio |
|:-----------:|:--------------:|:--------:|:---------------------:|:------------:|
| Header      | `Authorization`| `string` | Token JWT operatore   | ✅           |

**Esempio di richiesta**

```

GET /rate HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

```json
[
    {
        "id": "bb962a68-8630-4931-ae30-82d84fa93435",
        "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
        "vehicleType": "car",
        "dayType": "weekday",
        "price": 6,
        "hourStart": "08:00:00",
        "hourEnd": "20:00:00",
        "createdAt": "2025-12-13T21:21:24.787Z",
        "updatedAt": "2025-12-13T21:21:24.787Z"
    },
    {
        "id": "61becb87-2019-448c-a270-24a35ff71bed",
        "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
        "vehicleType": "truck",
        "dayType": "weekday",
        "price": 20,
        "hourStart": "08:00:00",
        "hourEnd": "20:00:00",
        "createdAt": "2025-12-13T21:22:19.006Z",
        "updatedAt": "2025-12-13T21:22:19.006Z"
    }
]
```

---

# GET /rate/{rateId}

**Parametri**

| Posizione   | Nome    | Tipo     | Descrizione        | Obbligatorio |
|:-----------:|:-------:|:--------:|:------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore | ✅       |
| Path        | `rateId`| `string` | UUID della tariffa | ✅           |

Il funzionamento rimane molto simile alle get singole descritte sopra.

# POST /rate

**Parametri**

| Posizione   | Nome          | Tipo      | Descrizione                          | Obbligatorio |
|:-----------:|:-------------:|:---------:|:------------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore                | ✅           |
| Body (JSON) | `vehicleType` | `string`  | Tipo veicolo (`car`, `motorcycle`, `truck`)     | ✅           |
| Body (JSON) | `parkingId`   | `string`  | UUID parcheggio                      | ✅           |
| Body (JSON) | `dayType`     | `string`  | Tipologia giorno (`weekday` o `weekend`) | ✅ |
| Body (JSON) | `price`       | `number`  | Prezzo orario/unitario               | ✅           |
| Body (JSON) | `hourStart`   | `string`  | Ora inizio fascia (HH:mm)           | ✅           |
| Body (JSON) | `hourEnd`     | `string`  | Ora fine fascia (HH:mm)             | ✅           |

**Esempio di richiesta**

```

POST /rate HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

```

```json
{
    "vehicleType":"truck",
    "parkingId":"aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
    "dayType":"weekday",
    "price": 20,
    "hourStart": "08:00",
    "hourEnd": "20:00"
}
```

**Esempio di risposta**

```json
{
    "id": "61becb87-2019-448c-a270-24a35ff71bed",
    "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
    "vehicleType": "truck",
    "dayType": "weekday",
    "price": 20,
    "hourStart": "08:00:00",
    "hourEnd": "20:00:00",
    "updatedAt": "2025-12-13T21:22:19.006Z",
    "createdAt": "2025-12-13T21:22:19.006Z"
}
```

---

# PUT /rate/{rateId}

**Parametri**

| Posizione   | Nome    | Tipo      | Descrizione                   | Obbligatorio |
|:-----------:|:-------:|:---------:|:-----------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore      | ✅           |
| Path        | `rateId`| `string`  | UUID della tariffa            | ✅           |
| Body       | `price` | `number` | Costo orario                       | ❌           |
| Body       | `vehicleType` | `string` | `car`,`truck` o `motorcycle`                    | ❌           |
| Body       | `hourStart`   | `string` | Ora inizio intervallo (hh:mm:ss)            | ❌           |
| Body       | `hourEnd`     | `string` | Ora fine intervallo (hh:mm:ss)                               | ❌           |

hourStart": "08:00:00",
        "": "20:00:00",

**Esempio di richiesta**

```

PUT /rate/a027d669-00d8-4115-9bab-05ccc44fe00a HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

```

``` json
{
    "price": 30
}
```

**Esempio di risposta**

``` json
{
    "message": "Tariffa aggiornata con successo",
    "data": {
        "id": "a027d669-00d8-4115-9bab-05ccc44fe00a",
        "parkingId": "30131540-a5b2-459f-9056-1917b84afba7",
        "vehicleType": "motorcycle",
        "dayType": "weekday",
        "price": 30,
        "hourStart": "08:00:00",
        "hourEnd": "20:00:00",
        "createdAt": "2025-12-14T12:32:28.062Z",
        "updatedAt": "2025-12-14T12:33:19.866Z"
    }
}
```

---

# DELETE /rate/{rateId}

**Parametri**

| Posizione   | Nome    | Tipo     | Descrizione        | Obbligatorio |
|:-----------:|:-------:|:--------:|:------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore | ✅       |
| Path        | `rateId`| `string` | UUID della tariffa | ✅           |

Funzionamento uguale alle precedenti delete.

---

# GET /stats/

**Parametri**

| Posizione   | Nome           | Tipo     | Descrizione             | Obbligatorio |
|:-----------:|:--------------:|:--------:|:-----------------------:|:------------:|
| Header      | `Authorization`| `string` | Token JWT operatore     | ✅           |
| Query       | `from`    | `Date` | Formato YYYY/MM/DD        |❌           |
| Query       | `to`    | `Date` | Formato YYYY/MM/DD        | ❌          |
| Query       | `format`    | `string` | Formato output (`json` \| `pdf`)        | ❌           |
**Esempio di richiesta**

```

GET /stats/?from=2025/11/1&format=json HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json
[
    {
        "parkingId": "30131540-a5b2-459f-9056-1917b84afba7",
        "parkingName": "Downtown Parking",
        "from": "2025-11-01T00:00:00.000Z",
        "to": "2025-12-14T12:42:08.845Z",
        "totalRevenue": 3178.69,
        "paidRevenue": 1999.64,
        "capacity": {
            "total": 17
        },
        "avgFreeSlots": {
            "bySlot": [
                {
                    "slot": "00-02",
                    "avgFreeSlots": 16.17
                },
                {
                    "slot": "02-04",
                    "avgFreeSlots": 16.28
                },
                {
                    "slot": "04-06",
                    "avgFreeSlots": 16.42
                },
                {
                    "slot": "06-08",
                    "avgFreeSlots": 16.45
                },
                {
                    "slot": "08-10",
                    "avgFreeSlots": 16.38
                },
                {
                    "slot": "10-12",
                    "avgFreeSlots": 16.26
                },
                {
                    "slot": "12-14",
                    "avgFreeSlots": 16.28
                },
                {
                    "slot": "14-16",
                    "avgFreeSlots": 16.31
                },
                {
                    "slot": "16-18",
                    "avgFreeSlots": 16.19
                },
                {
                    "slot": "18-20",
                    "avgFreeSlots": 16.22
                },
                {
                    "slot": "20-22",
                    "avgFreeSlots": 16.46
                },
                {
                    "slot": "22-24",
                    "avgFreeSlots": 16.39
                }
            ],
            "overall": 16.32
        }
    },
```
O in formato pdf:

<img width="903" height="872" alt="image" src="https://github.com/user-attachments/assets/e58f36ce-c82c-4e37-b370-4c8349c26f6b" />


---

# GET /stats/{parkingId}

**Parametri**

| Posizione   | Nome        | Tipo     | Descrizione                             | Obbligatorio |
|:-----------:|:-----------:|:--------:|:---------------------------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT operatore                 | ✅           |
| Path        | `parkingId` | `string` | UUID del parcheggio                     | ✅           |
| Query       | `format`    | `string` | Formato output (`json` \| `pdf`)        | ❌          |

**Esempio di richiesta**

```

GET stats/aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8?format=pdf&from=2025-12-12 HTTP/1.1
Authorization: Bearer <JWT>

```

``` typescript

// nessun body richiesto

```

**Esempio di risposta**

``` json
{
    "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
    "parkingName": "Parcheggio Fighissimo",
    "from": "2025-12-12T00:00:00.000Z",
    "to": "2025-12-13T21:40:55.360Z",
    "totalRevenue": 140.94,
    "paidRevenue": 0,
    "invoiceCount": 2,
    "invoiceCountByStatus": {
        "paid": 0,
        "unpaid": 2,
        "expired": 0
    },
    "transits": {
        "total": 5,
        "byType": {
            "in": 3,
            "out": 2
        },
        "byVehicleType": {
            "car": 5
        },
        "bySlot": [
            {
                "slot": "16-18",
                "total": 3,
                "in": 2,
                "out": 1
            },
            {
                "slot": "18-20",
                "total": 1,
                "in": 0,
                "out": 1
            },
            {
                "slot": "22-24",
                "total": 1,
                "in": 1,
                "out": 0
            }
        ],
        "list": [
            {
                "id": "705e67ed-b5d6-4299-a3cb-1313c7c70922",
                "parkingId": "aee42b3c-6d9e-49d8-ac18-0c9c627a2cc8",
                "gateId": "c8ebf662-ec73-4a9b-8889-49f738034825",
                "vehicleId": "FV181EX",
                "type": "in",
                "date": "2025-12-12T17:14:41.957Z",
                "detectedPlate": "FV181EX",
                "createdAt": "2025-12-12T17:14:41.957Z",
                "updatedAt": "2025-12-12T17:14:41.957Z"
            },
```

Oppure in formato pdf:
<img width="942" height="862" alt="image" src="https://github.com/user-attachments/assets/3b8538ac-7efb-4228-8f79-3dd76bb062aa" />


---

# GET /invoice

**Parametri**

| Posizione   | Nome           | Tipo     | Descrizione                      | Obbligatorio |
|:-----------:|:--------------:|:--------:|:--------------------------------:|:------------:|
| Header      | `Authorization`| `string` | Token JWT utente (driver/op)     | ✅           |
| Query  | `status`       | `string` | Filtro per stato pagamento (`paid`, `unpaid`, `expired`)       | ❌           |

**Esempio di richiesta**

```

GET /invoice/?status=paid HTTP/1.1
Authorization: Bearer <JWT>

```
**Esempio di risposta**
L'operatore può vedere tutte le fatture. Altrimenti, il guidatore, solo le proprie.
``` json
[
    {
        "id": "34025bf8-65de-46a3-9b31-660cdd92f692",
        "userId": "1d82cfb5-4b08-4904-ba90-87f4e0fa96b2",
        "parkingId": "457e1a07-cdeb-43ea-b30d-7672fb73d06e",
        "entryTransitId": "811af189-4ffd-4f99-bcf9-c1a3d98fc91f",
        "exitTransitId": "517117da-41db-47b6-ac5a-4eb73ec1470f",
        "amount": 4.66,
        "status": "paid",
        "createdAt": "2025-12-12T14:09:57.396Z",
        "dueDate": "2025-12-13T14:09:57.396Z",
        "updatedAt": "2025-12-12T14:09:57.396Z"
    },
    {
        "id": "9774866b-bc4a-4353-adf2-b25674035121",
        "userId": "d89a76e4-d3e0-42e3-b920-d63153838906",
        "parkingId": "457e1a07-cdeb-43ea-b30d-7672fb73d06e",
        "entryTransitId": "7b79c4cc-ccfb-4e79-88ef-83665f1417bf",
        "exitTransitId": "e99ed70d-f97b-4d78-9dd5-f998cc721090",
        "amount": 10.42,
        "status": "paid",
        "createdAt": "2025-12-11T19:21:57.396Z",
        "dueDate": "2025-12-12T19:21:57.396Z",
        "updatedAt": "2025-12-11T19:21:57.396Z"
    },
```
> Nota: gli id utente sono diversi. (Login Operator)


``` json
[
    {
        "id": "34025bf8-65de-46a3-9b31-660cdd92f692",
        "userId": "1d82cfb5-4b08-4904-ba90-87f4e0fa96b2",
        "parkingId": "457e1a07-cdeb-43ea-b30d-7672fb73d06e",
        "entryTransitId": "811af189-4ffd-4f99-bcf9-c1a3d98fc91f",
        "exitTransitId": "517117da-41db-47b6-ac5a-4eb73ec1470f",
        "amount": 4.66,
        "status": "paid",
        "createdAt": "2025-12-12T14:09:57.396Z",
        "dueDate": "2025-12-13T14:09:57.396Z",
        "updatedAt": "2025-12-12T14:09:57.396Z"
    },
    {
        "id": "21638d3e-ccd3-4018-8472-1db8d004aee8",
        "userId": "1d82cfb5-4b08-4904-ba90-87f4e0fa96b2",
        "parkingId": "457e1a07-cdeb-43ea-b30d-7672fb73d06e",
        "entryTransitId": "601774df-c447-4325-b087-3e89d6ac98d5",
        "exitTransitId": "83f1bdd0-10ad-4604-9fb3-425423db9de1",
        "amount": 18.39,
        "status": "paid",
        "createdAt": "2025-12-09T20:44:57.396Z",
        "dueDate": "2025-12-10T20:44:57.396Z",
        "updatedAt": "2025-12-09T20:44:57.396Z"
    },
```
> Nota: gli id utente sono uguali. (Login driver)
---

# GET /invoice/{invoiceId}

**Parametri**

| Posizione   | Nome       | Tipo     | Descrizione         | Obbligatorio |
|:-----------:|:----------:|:--------:|:-------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT utente | ✅         |
| Path        | `invoiceId`| `string` | UUID della fattura  | ✅           |

La richiesta è simile alle precedenti.
```json
{
    "id": "34025bf8-65de-46a3-9b31-660cdd92f692",
    "userId": "1d82cfb5-4b08-4904-ba90-87f4e0fa96b2",
    "parkingId": "457e1a07-cdeb-43ea-b30d-7672fb73d06e",
    "entryTransitId": "811af189-4ffd-4f99-bcf9-c1a3d98fc91f",
    "exitTransitId": "517117da-41db-47b6-ac5a-4eb73ec1470f",
    "amount": 4.66,
    "status": "paid",
    "createdAt": "2025-12-12T14:09:57.396Z",
    "dueDate": "2025-12-13T14:09:57.396Z",
    "updatedAt": "2025-12-12T14:09:57.396Z"
}
```

 Anche qui solo l'operatore può vedere tutte le fatture. Altrimenti verrà visualizzato il messaggio:

```json
{
    "success": false,
    "statusCode": 403,
    "message": "Non sei autorizzato a vedere o pagare questa fattura"
}
```

---

# GET /invoice/{invoiceId}/pdf

**Parametri**

| Posizione   | Nome       | Tipo     | Descrizione         | Obbligatorio |
|:-----------:|:----------:|:--------:|:-------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT utente | ✅         |
| Path        | `invoiceId`| `string` | UUID della fattura  | ✅           |

<img width="894" height="851" alt="image" src="https://github.com/user-attachments/assets/6de796e0-bc50-470b-ade5-3be891cd9bc3" />

---

# PUT /invoice/{invoiceId}

**Parametri**

| Posizione   | Nome       | Tipo     | Descrizione         | Obbligatorio |
|:-----------:|:----------:|:--------:|:-------------------:|:------------:|
| Header      | `Authorization` | `string` | Token JWT utente | ✅         |
| Path        | `invoiceId`| `string` | UUID della fattura  | ✅           |

**Esempio di richiesta**

```

PUT /invoice/{invoiceId} HTTP/1.1
Authorization: Bearer <JWT>

```
**Esempio di risposta**

``` json
{
    "success": true,
    "message": "Fattura pagata con successo"
}
```
>Nota: la fattura può essere pagata sia dall'operatore che dal proprietario.

``` json
{
    "success": false,
    "statusCode": 403,
    "message": "La fattura risulta già pagata"
}
```

Come per il caso precedente, se un Driver prova a pagare una fattura di cui non è proprietario verrà generato l'errore sopra riportato.

## Token insufficienti
Il seguente errore verrà visualizzato se l'operatore o il driver finisce i token. Non è stata implementata nessuna tecnica per il refresh o per l'aggiunta.
``` json
{
    "success": false,
    "statusCode": 402,
    "message": "Token insufficienti. Disponibili: 0, richiesti: 1"
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
- `PA.postman_environment.json`: contine le variabili ambiente utilizzate nelle rotte
- `PA.postman_collection.json`: contiene la collecion di rotte relative all'applicazione.

Quando si vogliono stoppare i container è preferibile farlo con:
```
docker compose down -v
```
evitando problemi al successivo riavvio.

# Jest Test
Sono stati implementati 5 Jest test. Per lanciarli basta digitare:
```
npm test
```


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

# Curiosità e sviluppi futuri

Numerose parti di codice potevano sicuramente essere scritte meglio. Soprattutto la parte di gestione del database è stata affidata completamente a Sequelize. Sarebbe stata buona norma utilizzare `Redis` per il caching delle risposte. 

Nel progetto è stato scelto di utilizzare direttamente i model di Sequelize come rappresentazione delle entità persistite, senza introdurre uno strato separato di “domain model puro” distinto dalle entità ORM. Questa scelta è stata guidata dal desiderio di mantenere l’infrastruttura semplice e lineare, evitando una duplicazione sistematica delle classi (domain object + model Sequelize) che avrebbe richiesto mapper bidirezionali espliciti tra i due mondi.

In un approccio più spinto verso la programmazione a oggetti/DDD, un’entità come `Parking` non conoscerebbe solo gli identificativi dei `Gate`, ma esporrebbe una vera collezione di oggetti `Gate` (es. `parking.gates: Gate[]`), indipendentemente dal modo in cui le chiavi esterne sono modellate nel database. Nel nostro caso, invece, la relazione è espressa nello stile ORM classico: i gate possiedono il `parkingId`, e sono i DAO/Service a restituire array di gate associati a un parcheggio, spostando l’aggregazione logica a livello di query e di metodi di accesso, piuttosto che nel modello di dominio stesso.

Durante la progettazione sono state valutate soluzioni alternative, tra cui l’uso di decoratori `@Table`, `@Column` e simili offerti da librerie come `sequelize-typescript`, per mappare classi TypeScript maggiormente orientate al dominio su tabelle relazionali in modo più dichiarativo. Questa strada, pur interessante per una futura evoluzione del progetto, avrebbe introdotto un ulteriore livello di astrazione (domain entity ↔ model ORM) senza portare benefici proporzionati nel contesto dell’esame, aumentando la complessità di mapping e manutenzione del codice.

Per tali motivi si è preferito mantenere un approccio “active record” pulito e coerente con Sequelize, delegando ai DAO e ai service la costruzione di strutture dati più ricche (ad esempio array di entità correlate) quando necessario, e rimandando a sviluppi futuri l’eventuale introduzione di un vero domain model separato e di mapper dedicati tra oggetti di dominio e model ORM.

Un ulteriore sviluppo futuro potrebbe essere aggiungere un vero sistema di pagamento, dopo un'attenta revisione e correzione dell'intero codice.
  
# Autori

| Immagine | Cognome e nome | E-mail istituzionale |
|:----------:|:---------:|:-----------:|
|[<img src="https://github.com/SbattellaMattia.png" width="48" height="48" style="border-radius:50/%;" alt="Mattia Sbattella" />](https://github.com/SbattellaMattia)       | [Mattia Sbattella](https://github.com/SbattellaMattia) | s1120571@studenti.univpm.it     |
| [<img src="https://github.com/diba01.png" width="48" height="48" style="border-radius:50/%;" alt="Simone Di Battista" />](https://github.com/diba01)| [Simone Di Battista](https://github.com/diba01)  | s1120038@studenti.univpm.it     |
