import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Carica le variabili d'ambiente dal file .env.
 */
dotenv.config();

/**
 * Percorsi delle chiavi per la firma JWT.
 * @constant PRIVATE_KEY_PATH - Il percorso della chiave privata per la firma JWT.
 * @constant PUBLIC_KEY_PATH - Il percorso della chiave pubblica per la verifica della firma JWT.
 */
// Percorsi delle chiavi
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH || path.join(__dirname, 'jwtRS256.key');

const PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH || path.join(__dirname, 'jwtRS256.key.pub');

/**
 * Lettura della chiave privata e pubblica per la firma JWT.
 * * @constant privateKey - La chiave privata per la firma JWT.
 * * @constant publicKey - La chiave pubblica per la verifica della firma JWT.
 */
export const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
export const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');