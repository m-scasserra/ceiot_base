import { getMongoDB, getPGClient, startDatabase } from "./index.js";
import { addMeasurement } from "../routes/measurements.js";
const collectionName = "measurements";

let pgClient = null;
let mongoDB = null;

const mockRequest = (body) => ({
    body
});

const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.send = (message) => {
        res.body = message;
        console.log("Response:", res.statusCode, message);
        return res;
    };
    return res;
};

async function main() {
    await startDatabase();

    pgClient = await getPGClient();
    mongoDB = await getMongoDB();

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

    await mongoDB.collection(collectionName).deleteMany({});

    await addMeasurement(mockRequest({
        id: "00",
        key: "123456",
        t: "18",
        h: "78"
    }), mockResponse());

    await addMeasurement(mockRequest({
        id: "00",
        key: "123456",
        t: "19",
        h: "77"
    }), mockResponse());

    await addMeasurement(mockRequest({
        id: "00",
        key: "123456",
        t: "17",
        h: "77"
    }), mockResponse());

    await addMeasurement(mockRequest({
        id: "01",
        key: "234567",
        t: "17",
        h: "77"
    }), mockResponse());


}

main();
