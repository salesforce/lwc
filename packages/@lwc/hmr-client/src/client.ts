/* eslint-disable no-console */ // Until we have a UI for displaying HMR messages
import { UpdateHandler, getActiveModulePaths, updateHandler } from './api';
import {
    Connection,
    HMR_Data,
    HMR_Data_Init,
    HMR_Data_Module_Update,
    HMR_Data_Update,
} from './connection';

function initCallback() {
    const activePaths = getActiveModulePaths();
    const initData: HMR_Data_Init = { type: 'init', data: { activePaths: activePaths } };
    if (activePaths.length) {
        setInterval(() => {
            hmrClient.send(initData);
        }, 5000);
    }
}

const pendingHandlers: Map<string, UpdateHandler> = new Map();
function messageCallback(data: HMR_Data) {
    switch (data.type!) {
        // Some paths were updated
        case 'update': {
            const moduleUpdate = data as HMR_Data_Update;
            moduleUpdate.data.forEach(({ modulePath }) => {
                const handler = updateHandler(modulePath);
                if (handler) {
                    // Possibly use the module hash as key and allow overlapping handlers for same path.
                    pendingHandlers.set(modulePath, handler);
                    hmrClient.fetchModule(modulePath);
                }
            });
            break;
        }
        // In coming hot module
        case 'module-update': {
            const hotModules = data as HMR_Data_Module_Update;
            hotModules.data.forEach(({ modulePath, src }) => {
                const handler = pendingHandlers.get(modulePath)!;
                // eslint-disable-next-line no-eval
                const evaledModule = eval(src);
                handler(evaledModule);
            });
            break;
        }
        case 'module-delete':
            // A module was deleted
            // reload page?
            break;
        case 'error':
            console.log('LWC dev server encountered an error, reloading page');
            window.location.reload();
            break;
    }
}

const hmrClient = new Connection();
hmrClient.init('http', 'localhost', '8080');
hmrClient.initializeConnection(initCallback, messageCallback);
window.addEventListener('onbeforeunload', () => {
    hmrClient.close();
});
