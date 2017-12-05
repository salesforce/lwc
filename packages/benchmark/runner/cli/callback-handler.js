import path from 'path';
import https from 'https';

import pem from 'pem';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import {
    HANDLER_ACK_ENDPOINT,
    HANDLER_ERROR_ENDPOINT,
    HANDLER_RESULTS_ENDPOINT,
} from '../shared/config';

const CONNECTION_TIMEOUT = 10 * 1000;
const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 8000;
const DIST_FOLDER = path.join(__dirname, '../../dist');

function loggerMiddleware(req, res, next) {
    console.log(`[callback-handler] ${req.method} - ${req.originalUrl}`);
    next();
}

function createExpressServer(cb) {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());
    app.use(loggerMiddleware);
    app.use(express.static(DIST_FOLDER));

    app.post(HANDLER_ERROR_ENDPOINT, ({ body }, res) => {
        res.sendStatus(200);
        const err = new Error(body.message);
        err.stack = body.stack;
        cb(err);
    });

    app.post(HANDLER_RESULTS_ENDPOINT, ({ body }, res) => {
        res.sendStatus(200);
        cb(null, body);
    });

    const ackTimeout = setTimeout(() => {
        const err = new Error(`Browser has not acknowledged after ${CONNECTION_TIMEOUT} ms`);
        cb(err);
    }, CONNECTION_TIMEOUT);

    app.post(HANDLER_ACK_ENDPOINT, (_, res) => {
        res.sendStatus(200);
        clearTimeout(ackTimeout);
    });

    return app
}

class CallbackHandler {
    constructor(host = DEFAULT_HOST, port = DEFAULT_PORT) {
        this.server = null;

        this.host = host;
        this.port = port;
        this.ackTimeout = null;
    }

    get hostname() {
        return `https://${this.host}:${this.port}`;
    }

    start(cb) {
        if (typeof cb !== 'function') {
            throw new TypeError('Expect a callback function as second parameter');
        } else if (this.server) {
            throw new Error('Callback handler is already running');
        }

        pem.createCertificate({
            day: 1,
            selfSigned: true
        }, (err, keys) => {
            if (err) {
                return cb(err);
            }

            var app = createExpressServer(cb);
            var server = https.createServer({
                key: keys.serviceKey,
                cert: keys.certificate
            }, app);

            server.listen(DEFAULT_PORT, () => (
                console.log(`callback handler running at ${this.hostname}`)
            ));
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
