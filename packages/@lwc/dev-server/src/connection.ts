/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
export type Module = any;

export interface HMR_Data_Fetch {
    type: 'fetch';
    data: { modulePath: string };
}

export interface HMR_Data_Update {
    type: 'update';
    data: [{ modulePath: string }];
}

export interface HMR_Data_Module_Update {
    type: 'module-update';
    data: [{ modulePath: string; src: string }];
}

export interface HMR_Data_Module_Delete {
    type: 'module-delete';
    data: [{ modulePath: string }];
}

export interface HMR_Data_Init {
    type: 'init';
    data: { activePaths: string[]; url: string };
}

export interface HMR_Data_Error {
    type: 'error';
    data: { message: string };
}

export type HMR_Data =
    | HMR_Data_Fetch
    | HMR_Data_Update
    | HMR_Data_Module_Update
    | HMR_Data_Module_Delete
    | HMR_Data_Error
    | HMR_Data_Init;

export class Connection {
    protocol: string = 'ws';
    host: string = 'localhost';
    port: number = 8080;
    socket: WebSocket | undefined;
    init(protocol: string, host: string, port: number): Connection {
        this.protocol = protocol;
        this.host = host;
        this.port = port;
        return this;
    }

    sendModule(modulePath: string, src: string): void {
        const hotModule: HMR_Data_Module_Update = {
            type: 'module-update',
            data: [{ modulePath, src }],
        };
        this.send(hotModule);
    }

    initializeConnection(initCallback: () => void, messageCallback: (data: HMR_Data) => void) {
        const httpServer = createServer();
        const wss = new WebSocketServer({ server: httpServer });
        wss.on('connection', (ws) => {
            initCallback();
            this.socket = ws;
            this.socket.addEventListener('message', ({ data }) => {
                if (data && typeof data === 'string') {
                    // When there is an update, handle the incoming message and request an updated module
                    messageCallback(JSON.parse(data));
                }
            });
        });
        httpServer.listen(this.port);
    }

    send(data: HMR_Data): void {
        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    close() {
        this.socket?.close();
    }
}
