/**
 * Interfaccia base per tutti gli Observer.
 * 
 * Un Observer riceve notifiche quando lo stato del Subject cambia.
 * 
 * @template T Tipo di dato che l'Observer riceve nelle notifiche
 * 
 * @example
 * ```
 * class EmailObserver implements IObserver<User> {
 *   update(data: User): void {
 *     console.log(`Invio email a ${data.email}`);
 *   }
 * }
 * ```
 */
export interface IObserver<T = unknown> {
  /**
   * Metodo chiamato dal Subject quando avviene un cambiamento.
   * 
   * @param data - Dati del cambiamento
   * @returns void o Promise<void> per operazioni asincrone
   */
  update(data: T): void | Promise<void>;

  /**
   * Identificatore univoco dell'observer (opzionale).
   * Utile per rimuovere observer specifici.
   */
  id?: string;
}

/**
 * Observer con gestione errori integrata.
 * Estende IObserver aggiungendo un handler per errori.
 */
export interface IObserverWithErrorHandling<T = unknown> extends IObserver<T> {
  /**
   * Gestisce gli errori che avvengono durante update().
   * 
   * @param error - Errore catturato
   * @param data - Dati che hanno causato l'errore
   */
  onError?(error: Error, data: T): void;
}
