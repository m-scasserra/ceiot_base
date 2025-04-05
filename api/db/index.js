const { MongoClient } = require("mongodb");
const { Client } = require("pg");
const dotenv = require("dotenv");

let PGClient = null;
let mongoDBClient = null;
let mongoDB = null;

async function startDatabase() {
    dotenv.config();
    if (!mongoDBClient) {
        console.log("MongoDB client not initialized");
        try {
            const mongoHost = process.env.MONGO_HOST;
            const mongoPort = process.env.MONGO_PORT;

            if (!mongoHost || !mongoPort) {
                throw new Error(
                    "Missing required environment variables: MONGO_HOST and MONGO_PORT",
                );
            }

            const uri =
                `mongodb://${mongoHost}:${mongoPort}/?maxPoolSize=20&w=majority`;

            mongoDBClient = await MongoClient.connect(uri);
            console.log("Successfully connected to MongoDB");

            mongoDB = mongoDBClient.db();
            console.log("MongoDB database selected");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
    }

    if (!PGClient) {
        console.log("PostgreSQL client not initialized");
        try {
            PGClient = new Client({
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                host: process.env.POSTGRES_HOST,
                port: process.env.POSTGRES_PORT,
                database: process.env.POSTGRES_DB,
            });
            await PGClient.connect();
            console.log("Successfully connected to PostgreSQL");
        } catch (error) {
            console.error("Error connecting to PostgreSQL:", error);

            if (mongoDBClient) {
                await mongoDBClient.close();
                console.log("MongoDB client closed");
            }

            throw error;
        }
    }
}

async function getMongoDB() {
    if (!mongoDB) await startDatabase();
    return mongoDB;
}
async function getPGClient() {
    if (!PGClient) await startDatabase();
    return PGClient;
}

async function closeConnections() {
    if (mongoDBClient) {
        await mongoDBClient.close();
        console.log("MongoDB connection closed");
        mongoDBClient = null;
        mongoDB = null;
    }

    if (PGClient) {
        await PGClient.end();
        console.log("PostgreSQL connection closed");
        PGClient = null;
    }
}

async function insertMeasurement(message) {
    if (!mongoDB) {
        console.error("MongoDB client not initialized");
        await startDatabase();
    }
    try {
        const { insertedId } = await mongoDB.collection(collectionName)
            .insertOne(
                message,
            );
    } catch (error) {
        console.error("Error inserting measurement:", error);
        throw error;
    }

    return insertedId;
}

module.exports = {
    startDatabase,
    getMongoDB,
    getPGClient,
    closeConnections
};
