/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const storages = [];

// stub for an AuraStorage object
// https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/storage/AuraStorage.js
class Storage {
    constructor(config) {
        this.name = config.name;
        this.persistent = config.persistent || false;
        this.secure = config.secure || false;
        this.maxSize = config.maxSize || 1000 * 1024;
        this.expiration = config.expiration || 10;
        this.debugLogging = config.debugLogging || false;
        this.clearOnInit = config.clearOnInit || false;
        this.version = config.version || '';
        this.autoRefreshInterval = config.autoRefreshInterval || 30;

        this.storage = new Map();
    }

    getName() {
        return this.name;
    }

    getSize() {
        return 0;
    }

    getMaxSize() {
        return this.maxSize;
    }

    clear() {
        return new Promise(resolve => {
            this.storage.clear();
            resolve();
        });
    }

    get(key) {
        return this.getAll([key]).then(items => {
            return items[key];
        });
    }

    inFlightOperations() {
        return 0;
    }

    getAll(keys) {
        return new Promise(resolve => {
            const ret = {};
            if (!keys) {
                this.storage.forEach((value, key) => {
                    ret[key] = value;
                });
            } else {
                keys.forEach(key => {
                    ret[key] = this.storage.get(key);
                });
            }
            resolve(ret);
        });
    }

    set(key, value) {
        const values = {};
        values[key] = value;
        return this.setAll(values);
    }

    setAll(values) {
        return new Promise(resolve => {
            Object.keys(values).forEach(key => {
                this.storage.set(key, values[key]);
            });
            resolve();
        });
    }

    remove(key) {
        return this.removeAll([key]);
    }

    removeAll(keys) {
        return new Promise(resolve => {
            keys.forEach(key => {
                this.storage.delete(key);
            });
            resolve();
        });
    }

    suspendSweeping() {
        // no-op
    }

    resumeSweeping() {
        // no-op
    }

    isPersistent() {
        return this.persistent;
    }

    isSecure() {
        return this.secure;
    }

    getVersion() {
        return this.version;
    }

    getExpiration() {
        return this.expiration;
    }
}

// stub for AuraStorageService exposed via modules in Aura
// https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/AuraExportsStorage.js
module.exports = {
    getStorage(name) {
        return storages[name];
    },
    getStorages() {
        return Object.assign({}, storages);
    },
    initStorage(config) {
        if (typeof config !== 'object' || config === null || Array.isArray(config)) {
            throw new Error('config must be an object');
        }
        if (!(typeof config.name === 'string') || !config.name) {
            throw new Error('name must be a non-empty string');
        }
        const store = new Storage(config);
        storages[config.name] = store;
        return store;
    },
    deleteStorage(name) {
        delete storages[name];
        return Promise.resolve();
    },
};
