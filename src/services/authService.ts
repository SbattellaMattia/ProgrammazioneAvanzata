import jwt from 'jsonwebtoken';
//import { privateKey, publicKey } from '../utils/jwt';
import { UserPayload } from '../@types/CustomUser';
//import { UserDAO } from '../dao/userDAO';
import { ErrorFactory } from '../factories/errorFactory';

/**
 * La classe `AuthService` gestisce tutta la logica relativa all'autenticazione degli utenti,
 * inclusa la validazione delle credenziali e la generazione e la verifica di token JWT.
 * 
 * Questo servizio è pensato per essere utilizzato dal controller dell'autenticazione (`AuthController`)
 * e delega la persistenza dei dati al livello `UserDAO`, in modo da separare le responsabilità.
 * 
 * Il token generato include nel payload informazioni minime (id utente, ruolo) 
 * ed è firmato con algoritmo RS256 usando chiavi pubblica/privata.
 * 
 * Questa classe viene utilizzata principalmente dal `AuthController` per gestire il login.
 */
export class AuthService {
 //constructor(private userDAO: UserDAO) {}

  /**Genera un token JWTfirmato digitalmente a partire da un payload utente.
   * 
   * Questo metodo viene solitamente invocato dopo un login riuscito, e serve per creare un token 
   * che l'utente potrà usare per autenticarsi nelle richieste future (es. rotte protette).
   * 
   * Il token ha una durata di validità di 1 ora (`expiresIn: '1h'`) e viene firmato con algoritmo RS256,
   * garantendo l'integrità e l'autenticità del contenuto.
   * 
   * Usato in `AuthService.login()` e ritornato al `AuthController`.
   * 
   * @param payload - Oggetto contenente le informazioni utente minime da inserire nel token, ad esempio l'id e il ruolo.
   * @returns Una stringa contenente il token JWT firmato.
   */
  //generateToken(payload: UserPayload): string {
    //return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
  //}

   /**
   * Verifica e decodifica un token JWT usando la chiave pubblica, assicurandosi che sia valido e non scaduto.
   * 
   * Questo metodo viene usato tipicamente all'interno di middleware di autenticazione, per controllare
   * che il token fornito nella richiesta sia corretto e che l'utente possa accedere a risorse protette.
   * 
   * In caso di token invalido, firmato con una chiave diversa o scaduto, verrà lanciata un'eccezione gestita da Express.
   * 
   * @param token - Il token JWT da verificare.
   * @returns {UserPayload} Il payload decodificato del token.
   * @throws {Error} Se il token non è valido o è scaduto.
   */
  verifyToken(token: string): UserPayload {
    return jwt.verify(token, 'publicKey', { algorithms: ['RS256'] }) as UserPayload;
  } // TODO(non è una stringaaaaaa)

  /**
   * Esegue la procedura di login per un utente dato email e password.
   * 
   * Questo metodo verifica che l'email esista nel database e che la password fornita corrisponda a quella salvata.
   * Se le credenziali sono corrette, viene generato un token JWT che rappresenta la sessione dell'utente.
   * 
   * In caso di email inesistente o password errata, viene lanciata un'eccezione specifica tramite `ErrorFactory`
   * 
   * @param email - L'email dell'utente
   * @param password - La password dell'utente.
   * @returns {Promise<string>} Il token JWT generato per l'utente.
   * @throws {Error} Se l'utente non esiste o la password è errata.
   */
  /*login = async (email: string, password: string): Promise<string> => {
    const user = await this.userDAO.findByEmail(email);
    if (!user) {
      throw ErrorFactory.entityNotFound('User');
    }
    if (user.password !== password) {
      throw ErrorFactory.unauthorized('Invalid password');
    }
    const payload: UserPayload = {
      id: user.id,
      role: user.role
    }
    return this.generateToken(payload);
  }*/
}