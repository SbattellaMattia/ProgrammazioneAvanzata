
import { Sequelize, Dialect} from 'sequelize';
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
     * Restituisce l'istanza di Sequelize, creando una nuova connessione se non esiste già.
     * @returns L'istanza di Sequelize.
     */
    public static getInstance(): Sequelize {
        if (!DatabaseConnection.instance) {

            const dialect = (process.env.DB_DIALECT || 'postgres') as Dialect;
            DatabaseConnection.instance = new Sequelize({
                dialect,
                host: process.env.DB_HOST || 'db',
                port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME || 'parkingdb',
                logging: false, 
            });
        }
        return DatabaseConnection.instance;
    }
}

export default DatabaseConnection;
