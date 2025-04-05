const express = require("express");
const { getPGClient, getMongoDB } = require("../db");
const apiRouter = express.Router();
const webRouter = express.Router();
const render = require("../render.js");

apiRouter.get("/device", async (req, res) => {
    try {
        const pgClient = await getPGClient();
        const devices = await pgClient.query("SELECT * FROM devices");
        res.json(devices.rows);
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const addDevice = async (req, res) => {
    if (!req.body.id || !req.body.n || !req.body.k) {
        return res.status(400).send("Missing fields");
    }

    try {
        const pgClient = await getPGClient();

        var result = await pgClient.query(
            "SELECT * FROM devices WHERE device_id = $1",
            [
                req.body.id,
            ],
        );
        if (result.rows.length > 0) {
            return res.status(409).send("Device already exists");
        }
        console.log(
            "Adding device id    : " + req.body.id +
                " name        : " + req.body.n +
                " key         : " + req.body.k,
        );
        await pgClient.query("INSERT INTO devices VALUES ($1, $2, $3)", [
            req.body.id,
            req.body.n,
            req.body.k,
        ]);
        res.status(201).send("Recieved new device");
    } catch (error) {
        console.error("Error creating device:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};

apiRouter.post("/json-device", async (req, res) => {
    if (!req.body.id || !req.body.n || !req.body.k) {
        return res.status(400).send("Missing fields");
    }

    try {
        const pgClient = await getPGClient();

        var result = await pgClient.query(
            "SELECT * FROM devices WHERE device_id = $1",
            [
                req.body.id,
            ],
        );
        if (result.rows.length > 0) {
            return res.status(409).send("Device already exists");
        }
        console.log(
            "Adding device id: " + req.body.id +
                "\tname: " + req.body.n +
                "\tkey: " + req.body.k,
        );

        await pgClient.query("INSERT INTO devices VALUES ($1, $2, $3)", [
            req.body.id,
            req.body.n,
            req.body.k,
        ]);
        res.status(201).send({ message: "Recieved new device" });
    } catch (error) {
        console.error("Error creating device:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
});

const deleteDevice = async (req, res) => {
    if (!req.body.id || !req.body.k) {
        return res.status(400).send("Missing fields");
    }
    try {
        const pgClient = await getPGClient();

        var result = await pgClient.query(
            "SELECT * FROM devices WHERE device_id = $1 AND key = $2",
            [req.body.id, req.body.k],
        );
        if (result.rows.length == 0) {
            return res.status(404).send("Device not found");
        }
        console.log("Deleting device id: " + req.body.id);
        await pgClient.query("DELETE FROM devices WHERE device_id = $1", [
            req.body.id,
        ]);
        return res.status(202).send("Device deleted");
    } catch (error) {
        console.error("Error deleting device:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};

const updateDevice = async (req, res) => {
    if (!req.body.oldid || !req.body.oldk) {
        return res.status(400).send("Missing fields");
    }
    try {
        const pgClient = await getPGClient();

        var result = await pgClient.query(
            "SELECT * FROM devices WHERE device_id = $1 AND key = $2",
            [req.body.oldid, req.body.oldk],
        );
        if (result.rows.length == 0) {
            return res.status(404).send("Device not found");
        }
        if (req.body.newid == null) {
            req.body.newid = req.body.oldid;
        }
        if (req.body.newk == null) {
            req.body.newk = req.body.oldk;
        }
        if (req.body.newn == null) {
            req.body.newn = req.body.oldn;
        }

        console.log(
            "Updating device id: " + req.body.oldid + " to id: " +
                req.body.newid + " name: " + req.body.newn + " key: " +
                req.body.newk,
        );
        await pgClient.query(
            "UPDATE devices SET device_id = $1, name = $2, key = $3 WHERE device_id = $4",
            [
                req.body.newid,
                req.body.newn,
                req.body.newk,
                req.body.oldid,
            ],
        );

        return res.status(200).send("Device updated");
    } catch (error) {
        console.error("Error updating device:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};

webRouter.get("/device", async (req, res) => {
    try {
        const pgClient = await getPGClient();
        const result = await pgClient.query("SELECT * FROM devices");

        const devices = result.rows.map(
            function (device) {
                console.log(device);
                return "<tr><td><a href=/web/device/" +
                    device.device_id + ">" +
                    device.device_id + "</a>" + "</td><td>" +
                    device.name + "</td><td>" +
                    device.key + "</td></tr>";
            },
        );

        res.send(
            "<html>" +
                "<head><title>Sensores</title></head>" +
                "<body>" +
                '<table border="1">' +
                "<tr><th>id</th><th>name</th><th>key</th></tr>" +
                devices +
                "</table>" +
                "</body>" +
                "</html>",
        );
    } catch (error) {
        console.error("Error fetching devices:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
});

webRouter.get("/device/:id", async (req, res) => {
    try {
        var template = "<html>" +
            "<head><title>Sensor {{name}}</title></head>" +
            "<body>" +
            "<h1>{{ name }}</h1>" +
            "id  : {{ id }}<br/>" +
            "Key : {{ key }}" +
            "</body>" +
            "</html>";

        const pgClient = await getPGClient();

        var result = await pgClient.query(
            "SELECT * FROM devices WHERE device_id = $1",
            [req.params.id],
        );
        if (result.rows.length == 0) {
            return res.status(404).send("Device not found");
        }


        console.log(result.rows[0]);
        res.send(
            render(template, {
                id: result.rows[0].device_id,
                key: result.rows[0].key,
                name: result.rows[0].name,
            }),
        );
    } catch (error) {
        console.error("Error fetching device:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
});

apiRouter.post("/device", addDevice);
apiRouter.delete("/deletedevice", deleteDevice);
apiRouter.put("/updateDevice", updateDevice);

module.exports = {
    apiRouter,
    webRouter,
    addDevice,
    deleteDevice,
    updateDevice,
};
