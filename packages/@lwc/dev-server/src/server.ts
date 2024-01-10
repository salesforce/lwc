import fs from 'fs';
import path from 'path';
import { FSWatcher } from 'chokidar';

import { startWatch } from './watcher';
import {
    Connection,
    HMR_Data,
    HMR_Data_Error,
    HMR_Data_Fetch,
    HMR_Data_Init,
    HMR_Data_Update,
} from './connection';
import { compile } from './compile';
import { ModuleGraph } from './moduleGraph';

export interface ServerConfig {
    // Port at which the web socket will communicating from
    port: string;
    protocol: string;
    host: string;
    // Component paths to watch
    paths: string[];
}

export class LWCServer {
    watcher: FSWatcher | undefined;
    config: ServerConfig | undefined;
    connection: Connection | undefined;
    moduleGraph: ModuleGraph | undefined;
    startServer(config: ServerConfig) {
        this.config = config;
        this.watcher = startWatch(this.config.paths);
        this.connection = new Connection().init(
            this.config.protocol,
            this.config.host,
            this.config.port
        );
        this.connection.initializeConnection(() => {}, this.messageCallback);
        this.watcher.on('change', this.changeHandler);
        this.moduleGraph = new ModuleGraph();
    }

    stopServer() {
        this.watcher?.close();
        this.connection?.close;
    }

    changeHandler(filePath: string) {
        const changedFile = path.resolve(filePath);

        if (fs.lstatSync(changedFile).isFile()) {
            const modulePath = this.moduleGraph?.getModuleByFile(changedFile) ?? changedFile;
            if (modulePath) {
                const hotModule: HMR_Data_Update = { type: 'update', data: [{ modulePath }] };
                this.connection?.send(hotModule);
            }
        }
    }

    messageCallback(data: HMR_Data) {
        switch (data.type!) {
            case 'init': {
                const {
                    data: { activePaths },
                } = data as HMR_Data_Init;
                this.moduleGraph?.registerActivePaths(activePaths);
                break;
            }
            // In coming hot module
            case 'fetch': {
                const {
                    data: { modulePath },
                } = data as HMR_Data_Fetch;
                const moduleFilePath = this.moduleGraph?.getFileByModulePath(modulePath);
                if (!moduleFilePath) {
                    const error: HMR_Data_Error = {
                        type: 'error',
                        data: {
                            message: `Fetch of ${modulePath} failed as it does not exist on server`,
                        },
                    };
                    this.connection?.send(error);
                }
                const result = compile(fs.readFileSync(moduleFilePath!, 'utf8'), modulePath);
                if (result.warnings) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `Compiling ${moduleFilePath} failed and there are compiler warnings: ${JSON.stringify(
                            result.warnings
                        )}`
                    );
                }
                this.connection?.sendModule(modulePath, result.code);
                break;
            }
        }
    }
}
