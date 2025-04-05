const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { Client } = require("pg");
const dotenv = require("dotenv");
const sanitizeHtml = require("sanitize-html");

// Importar rutas
const deviceRoutes = require("./routes/devices");

// Prefijos de ruta
const API_PREFIX = "/api";
const WEB_PREFIX = "/web";
const API_VERSION = "/v1";

dotenv.config();

const client = new Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
});

const render = require("./render.js");
// Measurements database setup and access

let database = null;
const collectionName = "measurements";

async function startDatabase() {
    dotenv.config();
    const uri =
        `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/?maxPoolSize=20&w=majority`;

    const connection = await MongoClient.connect(uri, {
        useNewUrlParser: true,
    });
    database = connection.db();
}

async function getDatabase() {
    if (!database) await startDatabase();
    return database;
}

async function insertMeasurement(message) {
    const { insertedId } = await database.collection(collectionName).insertOne(
        message,
    );
    return insertedId;
}

async function getMeasurements() {
    return await database.collection(collectionName).find({}).toArray();
}

// API Server

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("spa/static"));

app.use(`${API_PREFIX}${API_VERSION}`, deviceRoutes.apiRouter);
app.use(`${WEB_PREFIX}`, deviceRoutes.webRouter);

const PORT = process.env.APP_PORT || 8080;

app.post("/device", function (req, res) {
    deviceRoutes.addDevice(req, res);
});

app.get("/device", async function (req, res) {
    res.redirect(
        `${API_PREFIX}${API_VERSION}/device`,
    );
});

app.post("/deleteDevice", function (req, res) {
    deviceRoutes.deleteDevice(req, res);
});

app.put("/updateDevice", function (req, res) {
    deviceRoutes.updateDevice(req, res);
});


app.get("/term/device/:id", function (req, res) {
    var red = "\x1b[31m";
    var green = "\x1b[32m";
    var blue = "\x1b[33m";
    var reset = "\x1b[0m";
    var template = "Device name " + red + "   {{name}}" + reset + "\n" +
        "       id   " + green + "       {{ id }} " + reset + "\n" +
        "       key  " + blue + "  {{ key }}" + reset + "\n";

    var device = client.query(
        "SELECT * FROM devices WHERE device_id = $1",
        req.params.id,
    );

    console.log(device);
    res.send(
        render(template, {
            id: device[0].device_id,
            key: device[0].key,
            name: device[0].name,
        }),
    );
});

app.get("/measurement", async (req, res) => {
    res.send(await getMeasurements());
});

app.post("/measurement", function (req, res) {
    console.log(
        "device id: " + req.body.id +
            "\tkey: " + req.body.key +
            "\ttemperature: " + req.body.t +
            "\thumidity: " + req.body.h,
    );

    const { insertedId } = insertMeasurement({
        id: req.body.id,
        t: req.body.t,
        h: req.body.h,
    });
    res.send("received measurement into " + insertedId);
});

startDatabase().then(async () => {
    const addAdminEndpoint = require("./admin.js");
    addAdminEndpoint(app, render);

    await client.connect();
    await database.collection(collectionName).deleteMany({});
    await insertMeasurement({ id: "00", t: "18", h: "78" });
    await insertMeasurement({ id: "00", t: "19", h: "77" });
    await insertMeasurement({ id: "00", t: "17", h: "77" });
    await insertMeasurement({ id: "01", t: "17", h: "77" });
    console.log("mongo measurement database Up");

    client.query("DROP TABLE devices");
    client.query("DROP TABLE users");
    client.query(
        "CREATE TABLE devices (device_id VARCHAR, name VARCHAR, key VARCHAR)",
    );
    client.query(
        "INSERT INTO devices VALUES ('00', 'Fake Device 00', '123456')",
    );
    client.query(
        "INSERT INTO devices VALUES ('01', 'Fake Device 01', '234567')",
    );
    client.query(
        "CREATE TABLE users (user_id VARCHAR, name VARCHAR, key VARCHAR)",
    );
    client.query("INSERT INTO users VALUES ('1','Ana','admin123')");
    client.query("INSERT INTO users VALUES ('2','Beto','user123')");

    console.log("sql device database up");

    app.listen(PORT, () => {
        console.log(`Listening at ${PORT}`);
    });
});
