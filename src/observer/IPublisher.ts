import { IObserver } from './ISubscriber';

/**
 * Interfaccia per il Publisher.
 * 
 * Il Subject mantiene una lista di Observer e li notifica
 * quando il suo stato cambia.
 * 
 * @template T Tipo di dato che viene notificato agli Observer
 * 
 * @example
 * ```
 * class UserManager implements ISubject<User> {
 *   private observers: Set<IObserver<User>> = new Set();
 *   
 *   attach(observer: IObserver<User>): void {
 *     this.observers.add(observer);
 *   }
 *   
 *   // ... altri metodi
 * }
 * ```
 */
export interface ISubject<T = unknown> {
  /**
   * Registra un nuovo observer.
   * 
   * @param observer - Observer da aggiungere
   * @returns Funzione per rimuovere l'observer (unsubscribe)
   */
  attach(observer: IObserver<T>): () => void;

  /**
   * Rimuove un observer.
   * 
   * @param observer - Observer da rimuovere
   * @returns true se rimosso, false se non trovato
   */
  detach(observer: IObserver<T>): boolean;

  /**
   * Rimuove tutti gli observer.
   */
  detachAll(): void;

  /**
   * Notifica tutti gli observer registrati.
   * 
   * @param data - Dati da passare agli observer
   * @returns Promise che si risolve quando tutti gli observer hanno elaborato
   */
  notify(data: T): Promise<void>;

  /**
   * Numero di observer attualmente registrati.
   */
  readonly observerCount: number;
}
