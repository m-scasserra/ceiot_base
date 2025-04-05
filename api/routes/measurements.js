const express = require("express");
const { getPGClient, getMongoDB } = require("../db");
const apiRouter = express.Router();
const webRouter = express.Router();

const collectionName = "measurements";

const addMeasurement = async (req, res) => {
    try {
        if (
            !req.body.id || !req.body.key || req.body.t === undefined ||
            req.body.h === undefined
        ) {
            return res.status(400).send("Missing required fields");
        }

        const temp = Number(req.body.t);
        const humidity = Number(req.body.h);
        if (isNaN(temp) || isNaN(humidity)) {
            return res.status(400).send("Invalid temperature or humidity");
        }

        const timestamp = new Date();
        console.log(
            `Device id: ${req.body.id}\tkey: ${req.body.key}\ttemperature: ${temp}\thumidity: ${humidity}\tdate: ${timestamp}`,
        );

        let database = await getMongoDB();
        const { insertedId } = await database.collection(collectionName)
            .insertOne({
                deviceId: req.body.id,
                temp,
                humidity,
                timestamp,
            });
        res.status(201).send("Received measurement into " + insertedId);
    } catch (error) {
        console.error("Error inserting measurement:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};

const getMeasurements = async (req, res) => {
    try {
        let database = await getMongoDB();
        res.send(await database.collection(collectionName).find({}).toArray());
    } catch (error) {
        console.error("Error reading measurements:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};

apiRouter.get("/measurement", getMeasurements);

apiRouter.post("/measurement", addMeasurement);

module.exports = {
    apiRouter,
    webRouter,
    addMeasurement,
    getMeasurements,
};
