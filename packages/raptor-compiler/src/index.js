import * as path from 'path';

import { MODES, ALL_MODES } from './modes';
import { compileBundle } from './compiler';
import { zipObject, isUndefined, isString } from './utils';

import fsModuleResolver from './module-resolvers/fs';
import inMemoryModuleResolver from './module-resolvers/in-memory';

const DEFAULT_NAMESPACE = 'x';

const DEFAULT_OPTIONS = {
    format: 'es',
    mode: MODES.DEV,
    mapNamespaceFromPath: false,
    resolveProxyCompat: {
        independent: 'proxy-compat',
    },
};

export function compile(entry, options = {}) {
    if (isUndefined(entry) || !isString(entry)) {
        throw new Error(
            `Expected a string for entry. Received instead ${entry}`
        );
    }

    entry = normalizeEntryPath(entry);
    options = Object.assign({ entry }, DEFAULT_OPTIONS, options);

    const acceptedModes = Object.keys(MODES).map(mode => MODES[mode]);
    if (!acceptedModes.includes(options.mode)) {
        throw new Error(
            `Expected a mode in ${acceptedModes.join(
                ', '
            )}. Received instead ${options.mode}`
        );
    }

    // Extract component namespace and name and add it to option
    // TODO: rename the componentName and componentNamespace APIs, to moduleName and moduleNamespace,
    //       not all the modules are components.
    const { name, namespace, normalizedName } = getNormalizedName(
        entry,
        options
    );
    options.moduleName = name;
    options.moduleNamespace = namespace;
    options.normalizedModuleName = normalizedName;

    // Add extra properties needed for the compilation
    // TODO: provide proper abstraction instead of stuffing the options object
    options.$metadata = {};
    options.moduleResolver = isUndefined(options.sources)
        ? fsModuleResolver()
        : inMemoryModuleResolver(options);

    if (options.mode !== MODES.ALL) {
        return compileBundle(entry, options);
    } else {
        // Compile the bundle in all modes at the same time

        // TODO: should this be exposed at the compiler level or should the caller call the compiler in all the modes ?
        //       Because the caller has probalby a better understanding of the current architecture, it can leverage multiple
        //       processor at the same time!
        return Promise.all(
            ALL_MODES.map(mode =>
                compile(entry, Object.assign({}, options, { mode }))
            )
        ).then(results => {
            return zipObject(ALL_MODES, results);
        });
    }
}

/**
 * Takes a module location and returns it's entry point:
 *  '/foo/bar' => '/foo/bar/bar'
 *  '/foo/bar/bar.js' => '/foo/bar/bar.js'
 *
 * @param {string} fileName
 */
function normalizeEntryPath(fileName) {
    fileName = path.normalize(fileName.replace(/\/$/, ''));
    const ext = path.extname(fileName);
    return ext
        ? fileName
        : path.join(fileName, fileName.split(path.sep).pop() + ext);
}

/**
 * Names and namespace mapping:
 * 'foo.js' => ns: default, name: foo
 * '.../foo/foo.js' => ns: default, name: foo
 * '.../myns/foo/foo.js' => ns: myns, name: foo
 *
 * @param {string} fileName
 * @param {boolean} mapNamespaceFromPath
 */
export function getNormalizedName(
    fileName,
    { componentName, componentNamespace, mapNamespaceFromPath }
) {
    const ext = path.extname(fileName);
    const parts = fileName.split(path.sep);

    const name = componentName || path.basename(parts.pop(), ext);

    let namespace;
    if (!isUndefined(componentNamespace)) {
        namespace = componentNamespace;
    } else {
        namespace = name.indexOf('-') === -1 ? DEFAULT_NAMESPACE : null;

        let tmpNs = parts.pop();
        if (tmpNs === name) {
            tmpNs = parts.pop();
        }
        // If mapping folder structure override namespace
        if (tmpNs && mapNamespaceFromPath) {
            namespace = tmpNs;
        }
    }

    return {
        name,
        namespace,
        normalizedName: [namespace, name].join('-'),
    };
}

export const version = '__VERSION__';
