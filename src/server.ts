import app from "./app";

/**
 * Definisce la porta su cui il server sarà in esecuzione.
 * Utilizza il valore della variabile d'ambiente `PORT` oppure, in assenza, utilizza la porta 3000.
 *
 * @constant {number|string} port
 */
const PORT = process.env.PORT || 3000;

/**
 * Avvia il server Express e lo mette in ascolto sulla porta specificata.
 * Stampa un messaggio di log per indicare che il server è in esecuzione.
 * @param {number|string} PORT - La porta su cui il server ascolterà le richieste.
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});