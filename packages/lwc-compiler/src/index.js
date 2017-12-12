import * as path from 'path';

import bundle from './bundle';
import transformFile from './transform';

import { MODES, ALL_MODES, isCompat, isProd } from './modes';
import { zipObject, isUndefined, isString } from './utils';

import fsModuleResolver from './module-resolvers/fs';
import inMemoryModuleResolver from './module-resolvers/in-memory';
import minifyPlugin from "./rollup-plugins/minify";
import compatPlugin from "./rollup-plugins/compat";

const DEFAULT_NAMESPACE = 'x';

const DEFAULT_COMPILE_OPTIONS = {
    format: 'es',
    mode: MODES.DEV,
    mapNamespaceFromPath: false,
    resolveProxyCompat: {
        independent: 'proxy-compat',
    },
};

const DEFAULT_TRANSFORM_OPTIONS = {
    mode: MODES.DEV,
};

export function compile(entry, options = {}) {
    if (isUndefined(entry) || !isString(entry)) {
        throw new Error(
            `Expected a string for entry. Received instead ${entry}`,
        );
    }

    entry = normalizeEntryPath(entry);
    options = Object.assign({ entry }, DEFAULT_COMPILE_OPTIONS, options);

    const acceptedModes = Object.keys(MODES).map(mode => MODES[mode]);
    if (!acceptedModes.includes(options.mode)) {
        throw new Error(
            `Expected a mode in ${acceptedModes.join(
                ', ',
            )}. Received instead ${options.mode}`,
        );
    }

    // Extract component namespace and name and add it to option
    // TODO: rename the componentName and componentNamespace APIs, to moduleName and moduleNamespace,
    //       not all the modules are components.
    const { name, namespace, normalizedName } = getNormalizedName(
        entry,
        options,
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
        return bundle(entry, options);
    } else {
        // Compile the bundle in all modes at the same time

        // TODO: should this be exposed at the compiler level or should the caller call the compiler in all the modes ?
        //       Because the caller has probalby a better understanding of the current architecture, it can leverage multiple
        //       processor at the same time!
        return Promise.all(
            ALL_MODES.map(mode =>
                compile(entry, Object.assign({}, options, { mode })),
            ),
        ).then(results => {
            return zipObject(ALL_MODES, results);
        });
    }
}

export function transform(src, id, options) {
    if (!isString(src)) {
        throw new Error(`Expect a string for source. Received ${src}`);
    }

    if (!isString(id)) {
        throw new Error(`Expect a string for id. Received ${id}`);
    }

    if (
        isUndefined(options) ||
        !isString(options.moduleName) ||
        !isString(options.moduleNamespace)
    ) {
        throw new Error(
            `Expects an option with a moduleName and moduleNamespace string property. Instead received ${options}`,
        );
    }

    options = Object.assign({}, DEFAULT_TRANSFORM_OPTIONS, options);

    return transformFile(src, id, options);
}

export function transformBundle(src, options) {
    const mode = options.mode;

    if (isProd(mode)) {
        const plugin = minifyPlugin(options);
        const result = plugin.transformBundle(src);
        src = result.code;
    }

    return src;
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
function getNormalizedName(
    fileName,
    { componentName, componentNamespace, mapNamespaceFromPath },
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
