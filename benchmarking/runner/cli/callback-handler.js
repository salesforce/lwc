/* eslint-env node */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = 8001;
const ENDPOINT = 'callback';

class CallbackHandler {
    constructor(hostname = DEFAULT_HOSTNAME, port = DEFAULT_PORT) {
        this.server = null;

        this.hostname = hostname
        this.port = port;
    }

    get endpoint() {
        return `http://${this.hostname}:${this.port}/${ENDPOINT}`;
    }

    start(cb) {
        if (typeof cb !== 'function') {
            throw new TypeError('Expect a callback function as second parameter');
        }

        const app = express();

        app.use(cors());
        app.use(bodyParser.json());

        app.post(`/${ENDPOINT}`, ({body}, res) => {
            res.sendStatus(200);
            cb(body);
        });

        this.server = app.listen(this.port, () => {
            console.log(`Listening on callback url: ${this.endpoint}`);
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }
}

function getHandler(hostname, port) {
    return new CallbackHandler(hostname, port);
}

module.exports = {
    getHandler,
}
