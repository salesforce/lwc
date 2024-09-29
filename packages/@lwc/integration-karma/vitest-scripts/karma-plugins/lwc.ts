/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'node:fs';
import path from 'node:path';
import { Plugin } from 'vitest/config';

// const PACKAGE_ROOT = path.resolve(__dirname, '../../');

export interface Config {
    dir: string;
}

export interface Context {
    dir: string;
    entries: fs.Dirent[];
}

function loadContext({ dir }: Config): Context {
    if (path.isAbsolute(dir)) {
        throw new Error('dir must be a relative path');
    }

    if (!fs.existsSync(dir)) {
        throw new Error(`dir does not exist: ${dir}`);
    }

    const stats = fs.statSync(dir);

    if (!stats.isDirectory()) {
        throw new Error(`dir must be a directory: ${dir}`);
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    if (!entries.length) {
        throw new Error(`dir is empty: ${dir}`);
    }

    return {
        dir,
        entries,
    };
}

export interface SpecFile {
    name: string;
    dirname: string;
    resolveModule(moduleImport: ModuleImport): string;
}

export interface ModuleFile {
    id: string;
    name: string;
    namespace: string;
    resolveModule(moduleImport: ModuleImport): string;
}

export interface ModuleImport {
    source: string;
    name: string;
    namespace: string;
}

export interface ModuleInstance extends ModuleImport {
    root: string;
    path: string;
}

export default function (config: Config): Plugin {
    const context = loadContext(config);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    context;

    function isSpecFile(name: string): SpecFile | undefined {
        if (!name.endsWith('.spec.js') && !name.endsWith('.spec.ts')) {
            return;
        }

        const dirname = path.dirname(name);

        return {
            name,
            dirname,
            resolveModule(moduleImport: ModuleImport) {
                const { namespace, name } = moduleImport;
                return path.resolve(this.dirname, namespace, name, name + '.js');
            },
        };
    }

    const isModuleFile = (filepath: string) => {
        if (['.js', '.ts'].some((ext) => filepath.endsWith(ext))) {
            const [namespace, name] = filepath.split('/').slice(-2);

            return {
                id: filepath,
                name,
                namespace,
                resolveModule(moduleImport: ModuleImport) {
                    const { namespace, name } = moduleImport;
                    return path.resolve(this.namespace, namespace, name, name + '.js');
                },
            } as ModuleFile;
        }
    };

    const isModuleImport = (source: string) => {
        const parts = source.split('/');

        if (parts.length !== 2) {
            return;
        }

        const [namespace, name] = parts;

        if (!namespace || !name) {
            return;
        }

        // const path = path.resolve(config.dir, namespace, name, name + '.js');

        return {
            source,
            namespace,
            name,
        } as ModuleImport;
    };

    return {
        name: 'vitest-plugin-lwc',
        resolveId(source, importer, _options) {
            if (!importer) {
                return;
            }

            const moduleImport = isModuleImport(source);

            if (!moduleImport) {
                return;
            }

            const specFile = isSpecFile(importer);

            if (specFile) {
                return specFile.resolveModule(moduleImport);
            }

            const moduleFile = isModuleFile(importer);

            if (moduleFile) {
                return moduleFile.resolveModule(moduleImport);
            }
        },
        load(id, _options) {
            if (isModuleFile(id)) {
                return fs.readFileSync(id, 'utf-8');
            }
        },
        transform(code, id, _options) {
            if (isModuleFile(id)) {
                return code;
            }
        },
    };
}
