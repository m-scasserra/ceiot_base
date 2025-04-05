import { getMongoDB, getPGClient, startDatabase } from "./index.js";

const collectionName = "measurements";

let pgClient = null;
let mongoDB = null;

async function insertMeasurement(message) {
    const { insertedId } = await mongoDB.collection(collectionName).insertOne(
        message,
    );
    return insertedId;
}

async function main() {
    await startDatabase();

    pgClient = await getPGClient();
    mongoDB = await getMongoDB();

    await mongoDB.collection(collectionName).deleteMany({});
    await insertMeasurement({ id: "00", t: "18", h: "78" });
    await insertMeasurement({ id: "00", t: "19", h: "77" });
    await insertMeasurement({ id: "00", t: "17", h: "77" });
    await insertMeasurement({ id: "01", t: "17", h: "77" });

    pgClient.query("DROP TABLE IF EXISTS devices");
    pgClient.query("DROP TABLE IF EXISTS users");
    pgClient.query(
        "CREATE TABLE devices (device_id VARCHAR, name VARCHAR, key VARCHAR)",
    );
    pgClient.query(
        "INSERT INTO devices VALUES ('00', 'Fake Device 00', '123456')",
    );
    pgClient.query(
        "INSERT INTO devices VALUES ('01', 'Fake Device 01', '234567')",
    );
    pgClient.query(
        "CREATE TABLE users (user_id VARCHAR, name VARCHAR, key VARCHAR)",
    );
    pgClient.query("INSERT INTO users VALUES ('1','Ana','admin123')");
    pgClient.query("INSERT INTO users VALUES ('2','Beto','user123')");
}

main();
