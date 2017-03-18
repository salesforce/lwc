/* eslint-env node */

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = 8000;
const ENDPOINT = 'callback';
const DIST_FOLDER = path.join(__dirname, '../../dist');

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
        } else if (this.server) {
            throw new Error('Callback handler is already running');
        }

        const app = express();

        app.use(cors());
        app.use(bodyParser.json());

        app.use((req, res, next) => {
            console.log(`[callback-handler] ${req.method} - ${req.originalUrl}`);
            next();
        })

        app.use(express.static(DIST_FOLDER));

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

export default function handlerFactory(hostname, port) {
    return new CallbackHandler(hostname, port);
}
