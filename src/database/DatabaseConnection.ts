
import { Sequelize, Dialect} from 'sequelize';
import { dbConfig } from '../config/config';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @module DatabaseConnection
 * @description Configura e stabilisce la connessione a un database Postgres utilizzando Sequelize
 * e le variabili d'ambiente definite nel file `.env`.
 */
class DatabaseConnection {
    private static instance: Sequelize;

    private constructor() {}

    /**
     * Restituisce l'istanza singleton di Sequelize per la connessione al database.
     * Se l'istanza non esiste, la crea utilizzando la configurazione definita in `dbConfig`.
     *
     * @returns {Sequelize} L'istanza di Sequelize per la connessione al database.
     */
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

export default DatabaseConnection;
