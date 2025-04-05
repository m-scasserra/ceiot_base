const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const sanitizeHtml = require("sanitize-html");
const { getPGClient, getMongoDB, startDatabase } = require("./db/index.js");

// Import ruotes
const deviceRoutes = require("./routes/devices");
const measurementRoutes = require('./routes/measurements');

// Routes prefixes
const API_PREFIX = "/api";
const WEB_PREFIX = "/web";
const API_VERSION = "/v1";

dotenv.config();


const render = require("./render.js");

// API Server

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("spa/static"));

app.use(`${API_PREFIX}${API_VERSION}`, deviceRoutes.apiRouter);
app.use(`${WEB_PREFIX}`, deviceRoutes.webRouter);
app.use(`${API_PREFIX}${API_VERSION}`, measurementRoutes.apiRouter);

app.post("/device", async function (req, res) {
    deviceRoutes.addDevice(req, res);
});

app.get("/device", async function (req, res) {
    res.redirect(
        `${API_PREFIX}${API_VERSION}/device`,
    );
});

app.post("/deleteDevice", async function (req, res) {
    deviceRoutes.deleteDevice(req, res);
});

app.put("/updateDevice", async function (req, res) {
    deviceRoutes.updateDevice(req, res);
});

app.get("/measurement", async function (req, res) {
    res.redirect(
        `${API_PREFIX}${API_VERSION}/measurement`,
    );
});

app.post("/measurement", async function (req, res) {
    measurementRoutes.addMeasurement(req, res);
});

app.get("/term/device/:id", async function (req, res){
    var red = "\x1b[31m";
    var green = "\x1b[32m";
    var blue = "\x1b[33m";
    var reset = "\x1b[0m";
    var template = "Device name " + red + "   {{name}}" + reset + "\n" +
        "       id   " + green + "       {{ id }} " + reset + "\n" +
        "       key  " + blue + "  {{ key }}" + reset + "\n";

    const pgClient = await getPGClient();
    var device = pgClient.query(
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

const main = async () => {
    try {
        await startDatabase();
    } catch (error) {
        console.error("Error starting the DBs:", error);
    }

    app.listen(process.env.APP_PORT || 8080, () => {
        console.log(`Listening at ${process.env.APP_PORT || 8080}`);
    });
};

main().catch((error) => {
    console.error("Error starting the server:", error);
});
